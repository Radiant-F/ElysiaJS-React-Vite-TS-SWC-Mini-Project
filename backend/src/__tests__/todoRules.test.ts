import { describe, expect, test } from "bun:test";
import { applyTodoPatch } from "../todoRules";
import { TodoRecord } from "../types";

const baseTodo: TodoRecord = {
  id: "1",
  userId: "user-1",
  title: "Sample",
  description: "Desc",
  done: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("todo rules", () => {
  test("allows updating when not done", () => {
    const updated = applyTodoPatch(baseTodo, { title: "New" });
    expect(updated.title).toBe("New");
  });

  test("prevents updating title when done", () => {
    expect(() =>
      applyTodoPatch({ ...baseTodo, done: true }, { title: "New" })
    ).toThrowError();
  });

  test("allows unmarking when done", () => {
    const updated = applyTodoPatch(
      { ...baseTodo, done: true },
      { done: false }
    );
    expect(updated.done).toBe(false);
  });
});
