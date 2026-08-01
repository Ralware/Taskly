import Dexie from "dexie";

// Schema version — bump when altering table structure or indexes.
export const SCHEMA_VERSION = 2;

export const db = new Dexie("nucleus");

db.version(1).stores({
  tasks: "id, status, category_id, project_id, due_date, priority, pinned, favorite, created_at, updated_at, completed_at",
  categories: "id, name, created_at",
  revisions: "id, task_id, due_date, completed",
  notes: "id, updated_at, pinned",
  projects: "id, status, deadline, created_at",
  settings: "id",
});

// Goals and habits were retired in v2. The migration removes their local tables.
db.version(2).stores({
  tasks: "id, status, category_id, project_id, due_date, priority, pinned, favorite, created_at, updated_at, completed_at",
  categories: "id, name, created_at",
  revisions: "id, task_id, due_date, completed",
  notes: "id, updated_at, pinned",
  goals: null,
  projects: "id, status, deadline, created_at",
  habits: null,
  settings: "id",
});
