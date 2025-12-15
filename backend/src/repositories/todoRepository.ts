import { sql } from "../db";
import { Pagination, TodoRecord } from "../types";

export type CreateTodoInput = {
  userId: string;
  title: string;
  description: string;
};

export type UpdateTodoInput = {
  title?: string;
  description?: string;
  done?: boolean;
};

export async function createTodo(input: CreateTodoInput): Promise<TodoRecord> {
  const id = crypto.randomUUID();
  const [todo] = await sql<TodoRecord[]>`
    INSERT INTO todos (id, user_id, title, description)
    VALUES (${id}, ${input.userId}, ${input.title}, ${input.description})
    RETURNING id, user_id as userId, title, description, done, created_at as createdAt, updated_at as updatedAt;
  `;
  return todo;
}

export async function findTodoById(id: string): Promise<TodoRecord | null> {
  const result = await sql<TodoRecord[]>`
    SELECT id, user_id as userId, title, description, done, created_at as createdAt, updated_at as updatedAt
    FROM todos
    WHERE id = ${id}
    LIMIT 1;
  `;
  return result[0] ?? null;
}

export async function listTodos(
  userId: string,
  pagination: Pagination
): Promise<TodoRecord[]> {
  const { limit, offset } = pagination;
  return sql<TodoRecord[]>`
    SELECT id, user_id as userId, title, description, done, created_at as createdAt, updated_at as updatedAt
    FROM todos
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset};
  `;
}

export async function updateTodo(
  id: string,
  input: UpdateTodoInput
): Promise<TodoRecord | null> {
  const fields = [] as any[];
  if (input.title !== undefined) fields.push(sql`title = ${input.title}`);
  if (input.description !== undefined)
    fields.push(sql`description = ${input.description}`);
  if (input.done !== undefined) fields.push(sql`done = ${input.done}`);

  if (fields.length === 0) {
    return findTodoById(id);
  }

  const setClause = fields
    .slice(1)
    .reduce((acc, curr) => sql`${acc}, ${curr}`, fields[0]);

  const [todo] = await sql<TodoRecord[]>`
    UPDATE todos
    SET ${setClause}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, user_id as userId, title, description, done, created_at as createdAt, updated_at as updatedAt;
  `;
  return todo ?? null;
}

export async function deleteTodo(id: string) {
  await sql`DELETE FROM todos WHERE id = ${id};`;
}
