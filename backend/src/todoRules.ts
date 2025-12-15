import { TodoRecord } from "./types";

export type TodoPatch = {
  title?: string;
  description?: string;
  done?: boolean;
};

export function validateTodoPatch(todo: TodoRecord, patch: TodoPatch) {
  const wantsTitle = patch.title !== undefined;
  const wantsDescription = patch.description !== undefined;
  const wantsDone = patch.done !== undefined;

  if (todo.done) {
    if ((wantsTitle || wantsDescription) && patch.done !== false) {
      throw new Error("Done items can only be unchecked or deleted");
    }
  }

  if (!todo.done && wantsDone && patch.done === false) {
    // Allow unmark even if not done (no-op)
  }
}

export function applyTodoPatch(todo: TodoRecord, patch: TodoPatch): TodoRecord {
  validateTodoPatch(todo, patch);

  const updated: TodoRecord = {
    ...todo,
    title: patch.title ?? todo.title,
    description: patch.description ?? todo.description,
    done: patch.done ?? todo.done,
    updatedAt: new Date(),
  };

  return updated;
}
