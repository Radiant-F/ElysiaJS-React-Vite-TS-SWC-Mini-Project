import { sql } from "../db";
import { UserRecord } from "../types";

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

export type UpdateUserInput = {
  id: string;
  name?: string;
  email?: string;
  passwordHash?: string;
  refreshTokenHash?: string | null;
};

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const id = crypto.randomUUID();
  const [user] = await sql<UserRecord[]>`
    INSERT INTO users (id, name, email, password_hash, refresh_token_hash)
    VALUES (${id}, ${input.name}, ${input.email}, ${input.passwordHash}, NULL)
    RETURNING id, name, email, password_hash as passwordHash, refresh_token_hash as refreshTokenHash, created_at as createdAt, updated_at as updatedAt;
  `;
  return user;
}

export async function findUserByEmail(
  email: string
): Promise<UserRecord | null> {
  const result = await sql<UserRecord[]>`
    SELECT id, name, email, password_hash as passwordHash, refresh_token_hash as refreshTokenHash, created_at as createdAt, updated_at as updatedAt
    FROM users
    WHERE email = ${email}
    LIMIT 1;
  `;
  return result[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const result = await sql<UserRecord[]>`
    SELECT id, name, email, password_hash as passwordHash, refresh_token_hash as refreshTokenHash, created_at as createdAt, updated_at as updatedAt
    FROM users
    WHERE id = ${id}
    LIMIT 1;
  `;
  return result[0] ?? null;
}

export async function updateUser(
  input: UpdateUserInput
): Promise<UserRecord | null> {
  const fields = [] as any[];
  if (input.name !== undefined) fields.push(sql`name = ${input.name}`);
  if (input.email !== undefined) fields.push(sql`email = ${input.email}`);
  if (input.passwordHash !== undefined)
    fields.push(sql`password_hash = ${input.passwordHash}`);
  if (input.refreshTokenHash !== undefined)
    fields.push(sql`refresh_token_hash = ${input.refreshTokenHash}`);

  if (fields.length === 0) {
    const existing = await findUserById(input.id);
    return existing;
  }

  const setClause = fields
    .slice(1)
    .reduce((acc, curr) => sql`${acc}, ${curr}`, fields[0]);

  const [user] = await sql<UserRecord[]>`
    UPDATE users
    SET ${setClause}, updated_at = NOW()
    WHERE id = ${input.id}
    RETURNING id, name, email, password_hash as passwordHash, refresh_token_hash as refreshTokenHash, created_at as createdAt, updated_at as updatedAt;
  `;
  return user ?? null;
}

export async function saveRefreshTokenHash(
  userId: string,
  refreshTokenHash: string | null
) {
  await sql`
    UPDATE users
    SET refresh_token_hash = ${refreshTokenHash}, updated_at = NOW()
    WHERE id = ${userId};
  `;
}

export async function deleteUser(id: string) {
  await sql`DELETE FROM users WHERE id = ${id};`;
}
