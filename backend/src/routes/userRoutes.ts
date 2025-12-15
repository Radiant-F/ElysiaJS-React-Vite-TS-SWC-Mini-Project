import { Elysia, Static, t } from "elysia";
import { requireUser } from "../authGuard";
import {
  deleteUser,
  findUserByEmail,
  updateUser,
} from "../repositories/userRepository";
import { hashPassword } from "../security";
import { HttpError } from "../httpError";

const updateBody = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  email: t.Optional(t.String({ format: "email" })),
  password: t.Optional(t.String({ minLength: 8 })),
});

export const userRoutes = new Elysia({ prefix: "/me" })
  .get(
    "/",
    async (ctx) => {
      const user = await requireUser(ctx);
      return { id: user.id, name: user.name, email: user.email };
    },
    {
      detail: { summary: "Get current user" },
    }
  )
  .patch(
    "/",
    async (ctx) => {
      const user = await requireUser(ctx);
      const body = ctx.body as Static<typeof updateBody>;

      if (!body.name && !body.email && !body.password) {
        throw new HttpError(400, "Nothing to update");
      }

      if (body.email && body.email !== user.email) {
        const other = await findUserByEmail(body.email);
        if (other && other.id !== user.id) {
          throw new HttpError(409, "Email already in use");
        }
      }

      const updated = await updateUser({
        id: user.id,
        name: body.name,
        email: body.email,
        passwordHash: body.password
          ? await hashPassword(body.password)
          : undefined,
        refreshTokenHash: body.password ? null : undefined,
      });

      return {
        id: updated!.id,
        name: updated!.name,
        email: updated!.email,
      };
    },
    { body: updateBody }
  )
  .delete(
    "/",
    async (ctx) => {
      const user = await requireUser(ctx);
      await deleteUser(user.id);
      return { success: true };
    },
    {
      detail: { summary: "Delete current user" },
    }
  );
