// Local-first repository layer. Same interface as the old axios `api.*`,
// but every read/write goes to IndexedDB via Dexie. No HTTP. No backend.
import { db, SCHEMA_VERSION } from "@/db";

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now());
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso, days) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const DEFAULT_SETTINGS = {
  id: "default",
  theme: "dark",
  accent_color: "#D4FF00",
  default_view: "dashboard",
  revision_schedule: [1, 3, 7, 14, 30],
  notifications_enabled: true,
  auto_backup: true,
};

async function getSettings() {
  const stored = await db.settings.get("default");
  if (!stored || typeof stored !== "object") {
    await db.settings.put(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  }
  const settings = {
    ...DEFAULT_SETTINGS,
    ...stored,
    theme: stored.theme === "light" ? "light" : "dark",
    revision_schedule: Array.isArray(stored.revision_schedule)
      ? stored.revision_schedule.filter((days) => Number.isInteger(days) && days > 0)
      : DEFAULT_SETTINGS.revision_schedule,
  };
  return settings;
}

export const api = {
  // ---- tasks ----
  listTasks: async (params = {}) => {
    let list = await db.tasks.toArray();
    if (params.status) list = list.filter((t) => t.status === params.status);
    if (params.category_id) list = list.filter((t) => t.category_id === params.category_id);
    if (params.project_id) list = list.filter((t) => t.project_id === params.project_id);
    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q) ||
          (t.notes || "").toLowerCase().includes(q) ||
          (t.tags || []).some((x) => x.toLowerCase().includes(q))
      );
    }
    return list;
  },
  createTask: async (data) => {
    const task = {
      id: uid(),
      title: data.title,
      description: data.description || "",
      notes: data.notes || "",
      category_id: data.category_id || null,
      project_id: data.project_id || null,
      priority: data.priority || "medium",
      status: data.status || "pending",
      due_date: data.due_date || null,
      due_time: data.due_time || null,
      estimated_minutes: data.estimated_minutes || null,
      actual_minutes: data.actual_minutes || null,
      tags: data.tags || [],
      pinned: !!data.pinned,
      favorite: !!data.favorite,
      revision_enabled: !!data.revision_enabled,
      recurrence: data.recurrence || "none",
      created_at: now(),
      updated_at: now(),
      completed_at: null,
    };
    await db.tasks.put(task);
    return task;
  },
  updateTask: async (id, data) => {
    const existing = await db.tasks.get(id);
    if (!existing) throw new Error("Task not found");
    const patch = { ...existing, ...data, updated_at: now() };
    if (patch.status === "completed" && !existing.completed_at) patch.completed_at = now();
    if (patch.status !== "completed") patch.completed_at = null;
    await db.tasks.put(patch);
    return patch;
  },
  toggleTask: async (id) => {
    const t = await db.tasks.get(id);
    if (!t) throw new Error("not found");
    if (t.status === "completed") {
      const patch = { ...t, status: "pending", completed_at: null, updated_at: now() };
      await db.tasks.put(patch);
      return patch;
    }
    const patch = { ...t, status: "completed", completed_at: now(), updated_at: now() };
    await db.tasks.put(patch);
    // Recurrence
    if (t.recurrence && t.recurrence !== "none" && t.due_date) {
      const deltaDays = { daily: 1, weekly: 7, monthly: 30, yearly: 365 }[t.recurrence];
      await db.tasks.put({
        ...t,
        id: uid(),
        status: "pending",
        completed_at: null,
        due_date: addDays(t.due_date, deltaDays),
        created_at: now(),
        updated_at: now(),
      });
    }
    // Spaced revisions
    if (t.revision_enabled) {
      const s = await getSettings();
      const schedule = s.revision_schedule || [1, 3, 7, 14, 30];
      const base = new Date();
      for (const days of schedule) {
        const d = new Date(base);
        d.setDate(d.getDate() + days);
        await db.revisions.put({
          id: uid(),
          task_id: id,
          due_date: d.toISOString().slice(0, 10),
          interval_days: days,
          completed: false,
          completed_at: null,
          notes: "",
          created_at: now(),
        });
      }
    }
    return patch;
  },
  pinTask: async (id) => {
    const t = await db.tasks.get(id);
    const patch = { ...t, pinned: !t.pinned, updated_at: now() };
    await db.tasks.put(patch);
    return patch;
  },
  favoriteTask: async (id) => {
    const t = await db.tasks.get(id);
    const patch = { ...t, favorite: !t.favorite, updated_at: now() };
    await db.tasks.put(patch);
    return patch;
  },
  deleteTask: async (id) => {
    await db.tasks.delete(id);
    await db.revisions.where("task_id").equals(id).delete();
    return { deleted: 1 };
  },

  // ---- categories ----
  listCategories: () => db.categories.toArray(),
  createCategory: async (d) => {
    const c = { id: uid(), name: d.name, color: d.color || "#D4FF00", icon: d.icon || "Tag", created_at: now() };
    await db.categories.put(c);
    return c;
  },
  updateCategory: async (id, d) => {
    const c = await db.categories.get(id);
    const patch = { ...c, ...d };
    await db.categories.put(patch);
    return patch;
  },
  deleteCategory: async (id) => { await db.categories.delete(id); return { deleted: 1 }; },

  // ---- revisions ----
  listRevisions: async (params = {}) => {
    let list = await db.revisions.toArray();
    if (params.due_only) {
      const t = today();
      list = list.filter((r) => !r.completed && r.due_date <= t);
    }
    return list;
  },
  createRevision: async (d) => {
    const r = { id: uid(), completed: false, completed_at: null, notes: "", created_at: now(), ...d };
    await db.revisions.put(r);
    return r;
  },
  completeRevision: async (id, notes = "") => {
    const r = await db.revisions.get(id);
    const patch = { ...r, completed: true, completed_at: now(), notes };
    await db.revisions.put(patch);
    return patch;
  },
  deleteRevision: async (id) => { await db.revisions.delete(id); return { deleted: 1 }; },

  // ---- notes ----
  listNotes: () => db.notes.toArray(),
  createNote: async (d) => {
    const n = {
      id: uid(),
      title: d.title || "Untitled",
      content: d.content || "",
      is_journal: !!d.is_journal,
      journal_date: d.journal_date || null,
      pinned: !!d.pinned,
      created_at: now(),
      updated_at: now(),
    };
    await db.notes.put(n);
    return n;
  },
  updateNote: async (id, d) => {
    const n = await db.notes.get(id);
    const patch = { ...n, ...d, updated_at: now() };
    await db.notes.put(patch);
    return patch;
  },
  deleteNote: async (id) => { await db.notes.delete(id); return { deleted: 1 }; },

  // ---- projects ----
  listProjects: () => db.projects.toArray(),
  createProject: async (d) => {
    const p = {
      id: uid(),
      name: d.name,
      description: d.description || "",
      start_date: d.start_date || null,
      deadline: d.deadline || null,
      progress: d.progress ?? 0,
      status: d.status || "active",
      reference_link: d.reference_link || "",
      notes: d.notes || "",
      color: d.color || "#00E5FF",
      created_at: now(),
      updated_at: now(),
    };
    await db.projects.put(p);
    return p;
  },
  updateProject: async (id, d) => {
    const p = await db.projects.get(id);
    const patch = { ...p, ...d, updated_at: now() };
    await db.projects.put(patch);
    return patch;
  },
  deleteProject: async (id) => { await db.projects.delete(id); return { deleted: 1 }; },

  // ---- settings ----
  getSettings,
  updateSettings: async (d) => {
    const patch = { ...(await getSettings()), ...d, id: "default" };
    await db.settings.put(patch);
    return patch;
  },

  // ---- stats ----
  statsSummary: async () => {
    const all = await db.tasks.toArray();
    const revs = await db.revisions.toArray();
    const completed = all.filter((t) => t.status === "completed");
    const t = today();
    const dueToday = all.filter((x) => (x.due_date || "").startsWith(t) && x.status !== "completed");
    const overdue = all.filter((x) => x.due_date && x.due_date.slice(0, 10) < t && x.status !== "completed");
    const upcoming = all.filter((x) => x.due_date && x.due_date.slice(0, 10) > t && x.status !== "completed");
    const revisions_due = revs.filter((r) => !r.completed && r.due_date <= t).length;

    const doneDates = [...new Set(completed.filter((x) => x.completed_at).map((x) => x.completed_at.slice(0, 10)))].sort();
    const doneDateSet = new Set(doneDates);
    // current streak
    let current_streak = 0;
    let d = new Date();
    while (doneDateSet.has(d.toISOString().slice(0, 10))) {
      current_streak += 1;
      d.setDate(d.getDate() - 1);
    }
    // longest streak
    let longest_streak = 0, run = doneDates.length ? 1 : 0;
    for (let i = 1; i < doneDates.length; i++) {
      const prev = new Date(doneDates[i - 1]);
      const curr = new Date(doneDates[i]);
      if ((curr - prev) / 86400000 === 1) { run += 1; longest_streak = Math.max(longest_streak, run); }
      else run = 1;
    }
    longest_streak = Math.max(longest_streak, run);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const wa = weekAgo.toISOString().slice(0, 10);
    const weekly_completed = completed.filter((x) => (x.completed_at || "").slice(0, 10) >= wa).length;

    return {
      total: all.length,
      pending: all.filter((x) => x.status === "pending").length,
      in_progress: all.filter((x) => x.status === "in_progress").length,
      completed: completed.length,
      due_today: dueToday.length,
      upcoming: upcoming.length,
      overdue: overdue.length,
      revisions_due,
      productivity: all.length ? Math.round((completed.length / all.length) * 1000) / 10 : 0,
      current_streak,
      longest_streak,
      weekly_completed,
    };
  },
  statsTrend: async (days = 30) => {
    const all = await db.tasks.where("status").equals("completed").toArray();
    const completedByDate = new Map();
    all.forEach((task) => {
      const date = task.completed_at?.slice(0, 10);
      if (date) completedByDate.set(date, (completedByDate.get(date) || 0) + 1);
    });
    const out = [];
    const base = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(base); d.setDate(base.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ date: key, completed: completedByDate.get(key) || 0 });
    }
    return out;
  },
  statsByCategory: async () => {
    const [tasks, cats] = await Promise.all([db.tasks.toArray(), db.categories.toArray()]);
    const map = {};
    tasks.forEach((t) => {
      const cid = t.category_id || "uncategorized";
      (map[cid] ||= { total: 0, completed: 0 });
      map[cid].total += 1;
      if (t.status === "completed") map[cid].completed += 1;
    });
    const catMap = Object.fromEntries(cats.map((c) => [c.id, c]));
    return Object.entries(map).map(([cid, v]) => ({
      id: cid,
      name: catMap[cid]?.name || "Uncategorized",
      color: catMap[cid]?.color || "#71717A",
      ...v,
    }));
  },
  statsByPriority: async () => {
    const tasks = await db.tasks.toArray();
    return ["critical", "high", "medium", "low"].map((p) => {
      const items = tasks.filter((t) => t.priority === p);
      return { priority: p, total: items.length, completed: items.filter((x) => x.status === "completed").length };
    });
  },

  // ---- backup ----
  backupExport: async () => ({
    metadata: { app: "taskly", schema_version: SCHEMA_VERSION, exported_at: now() },
    schema_version: SCHEMA_VERSION,
    exported_at: now(),
    settings: await db.settings.get("default"),
    tasks: await db.tasks.toArray(),
    categories: await db.categories.toArray(),
    revisions: await db.revisions.toArray(),
    notes: await db.notes.toArray(),
    projects: await db.projects.toArray(),
  }),
  backupImport: async (payload, replace = true) => {
    if (!payload || typeof payload !== "object") throw new Error("Invalid backup file");
    const ver = payload.schema_version ?? payload.metadata?.schema_version ?? 1;
    if (ver > SCHEMA_VERSION) throw new Error(`Backup schema v${ver} is newer than app v${SCHEMA_VERSION}`);
    // Future: run migrations here if ver < SCHEMA_VERSION
    const tables = ["tasks", "categories", "revisions", "notes", "projects"];
    await db.transaction("rw", db.tasks, db.categories, db.revisions, db.notes, db.projects, db.settings, async () => {
      if (replace) for (const t of tables) await db[t].clear();
      for (const t of tables) if (Array.isArray(payload[t])) await db[t].bulkPut(payload[t]);
      if (payload.settings) await db.settings.put({ ...payload.settings, id: "default" });
    });
    return { imported: true };
  },
};
