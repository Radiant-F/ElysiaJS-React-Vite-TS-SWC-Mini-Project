import { Elysia, Static, t } from "elysia";
import { requireUser } from "../authGuard";
import {
  createTodo,
  deleteTodo,
  findTodoById,
  listTodos,
  updateTodo,
} from "../repositories/todoRepository";
import { validateTodoPatch } from "../todoRules";
import { HttpError } from "../httpError";

const createBody = t.Object({
  title: t.String({ minLength: 1 }),
  description: t.String({ minLength: 1 }),
});

const updateBody = t.Object({
  title: t.Optional(t.String({ minLength: 1 })),
  description: t.Optional(t.String({ minLength: 1 })),
  done: t.Optional(t.Boolean()),
});

const listQuery = t.Object({
  limit: t.Optional(t.Integer({ minimum: 1, maximum: 50 })),
  offset: t.Optional(t.Integer({ minimum: 0 })),
});

export const todoRoutes = new Elysia({ prefix: "/todos" })
  .post(
    "/",
    async (ctx) => {
      const user = await requireUser(ctx);
      const body = ctx.body as Static<typeof createBody>;
      const todo = await createTodo({
        userId: user.id,
        title: body.title,
        description: body.description,
      });
      return todo;
    },
    { body: createBody }
  )
  .get(
    "/",
    async (ctx) => {
      const user = await requireUser(ctx);
      const query = ctx.query as Static<typeof listQuery>;
      const limit = Math.min(query.limit ?? 10, 50);
      const offset = query.offset ?? 0;
      const todos = await listTodos(user.id, { limit, offset });
      return {
        items: todos,
        pagination: { limit, offset, count: todos.length },
      };
    },
    { query: listQuery }
  )
  .get("/:id", async (ctx) => {
    const user = await requireUser(ctx);
    const { id } = ctx.params as { id: string };
    const todo = await findTodoById(id);
    if (!todo) throw new HttpError(404, "Todo not found");
    if (todo.userId !== user.id) throw new HttpError(403, "Forbidden");
    return todo;
  })
  .patch(
    "/:id",
    async (ctx) => {
      const user = await requireUser(ctx);
      const { id } = ctx.params as { id: string };
      const body = ctx.body as Static<typeof updateBody>;
      const todo = await findTodoById(id);
      if (!todo) throw new HttpError(404, "Todo not found");
      if (todo.userId !== user.id) throw new HttpError(403, "Forbidden");

      if (
        body.title === undefined &&
        body.description === undefined &&
        body.done === undefined
      ) {
        throw new HttpError(400, "Nothing to update");
      }

      validateTodoPatch(todo, body);
      const updated = await updateTodo(id, body);
      return updated;
    },
    { body: updateBody }
  )
  .delete("/:id", async (ctx) => {
    const user = await requireUser(ctx);
    const { id } = ctx.params as { id: string };
    const todo = await findTodoById(id);
    if (!todo) throw new HttpError(404, "Todo not found");
    if (todo.userId !== user.id) throw new HttpError(403, "Forbidden");
    await deleteTodo(id);
    return { success: true };
  });
