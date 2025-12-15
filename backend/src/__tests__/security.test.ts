import { describe, expect, test } from "bun:test";
import {
  hashPassword,
  verifyPassword,
  hashToken,
  verifyTokenHash,
} from "../security";

describe("security helpers", () => {
  test("hash and verify password", async () => {
    const hash = await hashPassword("super-secret");
    expect(await verifyPassword("super-secret", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  test("hash and verify token", async () => {
    const token = "refresh-123";
    const hashed = await hashToken(token);
    expect(await verifyTokenHash(token, hashed)).toBe(true);
    expect(await verifyTokenHash("bad", hashed)).toBe(false);
  });
});
