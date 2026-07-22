import { create } from "zustand";
import { api } from "@/lib/api";

// Wrap async calls so a single failing endpoint never breaks the app
async function safe(promise, fallback) {
  try { return await promise; } catch { return fallback; }
}

export const useStore = create((set, get) => ({
  tasks: [],
  categories: [],
  revisions: [],
  notes: [],
  projects: [],
  settings: null,
  summary: null,
  loading: false,
  search: "",
  filter: "all",
  quickAddOpen: false,
  editingTaskId: null,

  setSearch: (q) => set({ search: q }),
  setFilter: (f) => set({ filter: f }),
  openQuickAdd: (id = null) => set({ quickAddOpen: true, editingTaskId: id }),
  closeQuickAdd: () => set({ quickAddOpen: false, editingTaskId: null }),

  loadAll: async () => {
    set({ loading: true });
    const [tasks, categories, revisions, notes, projects, settings, summary] =
      await Promise.all([
        safe(api.listTasks(), []),
        safe(api.listCategories(), []),
        safe(api.listRevisions(), []),
        safe(api.listNotes(), []),
        safe(api.listProjects(), []),
        safe(api.getSettings(), null),
        safe(api.statsSummary(), null),
      ]);
    set({ tasks, categories, revisions, notes, projects, settings, summary, loading: false });
  },

  refreshTasks: async () => {
    const [tasks, summary] = await Promise.all([
      safe(api.listTasks(), get().tasks),
      safe(api.statsSummary(), get().summary),
    ]);
    set({ tasks, summary });
  },
  refreshRevisions: async () => set({ revisions: await safe(api.listRevisions(), get().revisions) }),
  refreshCategories: async () => set({ categories: await safe(api.listCategories(), get().categories) }),
  refreshNotes: async () => set({ notes: await safe(api.listNotes(), get().notes) }),
  refreshProjects: async () => set({ projects: await safe(api.listProjects(), get().projects) }),
  refreshSummary: async () => set({ summary: await safe(api.statsSummary(), get().summary) }),

  // Optimistic-ish updates: patch the affected task locally to avoid a full refetch
  _replaceTask: (updated) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === updated.id ? updated : t)) })),
  _removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  createTask: async (data) => {
    const created = await api.createTask(data);
    set((s) => ({ tasks: [created, ...s.tasks] }));
    get().refreshSummary();
    if (created.revision_enabled) get().refreshRevisions();
  },
  updateTask: async (id, data) => {
    const updated = await api.updateTask(id, data);
    get()._replaceTask(updated);
    get().refreshSummary();
    if (updated.revision_enabled) get().refreshRevisions();
  },
  toggleTask: async (id) => {
    const updated = await api.toggleTask(id);
    get()._replaceTask(updated);
    get().refreshSummary();
    if (updated.status === "completed" || updated.revision_enabled) get().refreshRevisions();
    // Recurrence may have created a new task; only fetch tasks in that case
    if (updated.recurrence && updated.recurrence !== "none") {
      const tasks = await safe(api.listTasks(), get().tasks);
      set({ tasks });
    }
  },
  pinTask: async (id) => {
    const updated = await api.pinTask(id);
    get()._replaceTask(updated);
  },
  favoriteTask: async (id) => {
    const updated = await api.favoriteTask(id);
    get()._replaceTask(updated);
  },
  deleteTask: async (id) => {
    await api.deleteTask(id);
    get()._removeTask(id);
    get().refreshSummary();
    get().refreshRevisions();
  },
}));
