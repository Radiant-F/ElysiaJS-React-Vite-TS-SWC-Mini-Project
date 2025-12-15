import { Elysia, Static, t } from "elysia";
import {
  createUser,
  findUserByEmail,
  findUserById,
  saveRefreshTokenHash,
} from "../repositories/userRepository";
import {
  hashPassword,
  hashToken,
  verifyPassword,
  verifyTokenHash,
} from "../security";
import { HttpError, assert } from "../httpError";
import { requireUser } from "../authGuard";

type JwtTool = {
  sign: (payload: Record<string, unknown>) => Promise<string>;
  verify: (token: string) => Promise<Record<string, unknown> | null>;
};

const registerBody = t.Object({
  name: t.String({ minLength: 1 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
});

const loginBody = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  rememberMe: t.Optional(t.Boolean()),
});

const refreshBody = t.Object({ refreshToken: t.String() });

type RegisterBody = Static<typeof registerBody>;
type LoginBody = Static<typeof loginBody>;
type RefreshBody = Static<typeof refreshBody>;

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/register",
    async (ctx) => {
      const { body, set } = ctx as {
        body: RegisterBody;
        set: { status?: number };
      };
      const { accessJwt, refreshJwt } = ctx as unknown as {
        accessJwt: JwtTool;
        refreshJwt: JwtTool;
      };
      const existing = await findUserByEmail(body.email);
      if (existing) {
        throw new HttpError(409, "Email already registered");
      }

      const passwordHash = await hashPassword(body.password);
      const user = await createUser({
        name: body.name,
        email: body.email,
        passwordHash,
      });

      const accessToken = await accessJwt.sign({ sub: user.id });
      const refreshTokenRaw = crypto.randomUUID();
      const refreshTokenHash = await hashToken(refreshTokenRaw);
      await saveRefreshTokenHash(user.id, refreshTokenHash);
      const refreshToken = await refreshJwt.sign({
        sub: user.id,
        token: refreshTokenRaw,
      });

      set.status = 201;
      return {
        user: { id: user.id, name: user.name, email: user.email },
        accessToken,
        refreshToken,
      };
    },
    {
      body: registerBody,
      response: {
        201: t.Object({
          user: t.Object({
            id: t.String(),
            name: t.String(),
            email: t.String(),
          }),
          accessToken: t.String(),
          refreshToken: t.String(),
        }),
      },
    }
  )
  .post(
    "/login",
    async (ctx) => {
      const { body } = ctx as { body: LoginBody };
      const { accessJwt, refreshJwt, rememberRefreshJwt } = ctx as unknown as {
        accessJwt: JwtTool;
        refreshJwt: JwtTool;
        rememberRefreshJwt: JwtTool;
      };
      const user = await findUserByEmail(body.email);
      assert(user, 401, "Invalid credentials");

      const ok = await verifyPassword(body.password, user!.passwordHash);
      assert(ok, 401, "Invalid credentials");

      const accessToken = await accessJwt.sign({ sub: user!.id });
      const refreshTokenRaw = crypto.randomUUID();
      const refreshTokenHash = await hashToken(refreshTokenRaw);
      await saveRefreshTokenHash(user!.id, refreshTokenHash);

      const issuer = body.rememberMe ? rememberRefreshJwt : refreshJwt;
      const refreshToken = await issuer.sign({
        sub: user!.id,
        token: refreshTokenRaw,
      });

      return {
        user: { id: user!.id, name: user!.name, email: user!.email },
        accessToken,
        refreshToken,
      };
    },
    { body: loginBody }
  )
  .post(
    "/refresh",
    async (ctx) => {
      const { body } = ctx as { body: RefreshBody };
      const { accessJwt, refreshJwt, rememberRefreshJwt } = ctx as unknown as {
        accessJwt: JwtTool;
        refreshJwt: JwtTool;
        rememberRefreshJwt: JwtTool;
      };
      const tokenString = body.refreshToken;
      const shortPayload = await refreshJwt.verify(tokenString);
      const longPayload = shortPayload
        ? null
        : await rememberRefreshJwt.verify(tokenString);

      const payload = shortPayload ?? longPayload;
      assert(payload, 401, "Invalid refresh token");

      const userId = payload!.sub as string;
      const rawRefresh = payload!.token as string;
      const user = await findUserById(userId);
      assert(user, 401, "Invalid refresh token");

      const isValid = await verifyTokenHash(rawRefresh, user!.refreshTokenHash);
      assert(isValid, 401, "Invalid refresh token");

      const rawNewRefresh = crypto.randomUUID();
      const newRefreshHash = await hashToken(rawNewRefresh);
      await saveRefreshTokenHash(userId, newRefreshHash);

      const issuer = longPayload ? rememberRefreshJwt : refreshJwt;
      const refreshToken = await issuer.sign({
        sub: userId,
        token: rawNewRefresh,
      });
      const accessToken = await accessJwt.sign({ sub: userId });

      return {
        accessToken,
        refreshToken,
      };
    },
    { body: refreshBody }
  )
  .post(
    "/logout",
    async (ctx) => {
      const user = await requireUser(ctx);
      await saveRefreshTokenHash(user.id, null);
      return { success: true };
    },
    {
      detail: { summary: "Logout and revoke refresh token" },
    }
  );
