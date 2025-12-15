import { HttpError } from "./httpError";
import { findUserById } from "./repositories/userRepository";

export type JwtTool = {
  sign: (payload: Record<string, unknown>) => Promise<string>;
  verify: (token: string) => Promise<Record<string, unknown> | null>;
};

export async function requireUser(ctx: any) {
  const accessJwt = (ctx as { accessJwt: JwtTool }).accessJwt;
  const headerSource = ctx.request?.headers ?? ctx.headers ?? new Headers();
  const authHeader =
    headerSource.get("authorization") ?? headerSource.get("Authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    throw new HttpError(401, "Missing or invalid authorization header");
  }
  const token = authHeader.split(" ")[1];
  const payload = await accessJwt.verify(token);
  if (!payload || !payload.sub) {
    throw new HttpError(401, "Invalid token");
  }

  const user = await findUserById(payload.sub as string);
  if (!user) {
    throw new HttpError(401, "User not found");
  }

  return user;
}
