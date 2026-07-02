import { useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { TaskCard } from "@/components/TaskCard";
import { PageHeader, EmptyState } from "@/components/Primitives";
import { ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui-atoms";
import { isToday, isTomorrow, isPast, parseISO } from "date-fns";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
  { id: "archived", label: "Archived" },
  { id: "cancelled", label: "Cancelled" },
  { id: "due_today", label: "Due today" },
  { id: "due_tomorrow", label: "Tomorrow" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
  { id: "favorites", label: "Favorites" },
  { id: "pinned", label: "Pinned" },
];

const SORTS = [
  { id: "due_date", label: "Due date" },
  { id: "priority", label: "Priority" },
  { id: "created_at", label: "Created" },
  { id: "updated_at", label: "Modified" },
  { id: "title", label: "Alphabetical" },
];

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function AllTasks() {
  const { tasks, search, filter, setFilter, openQuickAdd } = useStore();
  const [sort, setSort] = useState("due_date");
  const [category, setCategory] = useState("");
  const categories = useStore((s) => s.categories);

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q) ||
          (t.notes || "").toLowerCase().includes(q) ||
          (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (category) list = list.filter((t) => t.category_id === category);
    switch (filter) {
      case "pending": list = list.filter((t) => t.status === "pending"); break;
      case "in_progress": list = list.filter((t) => t.status === "in_progress"); break;
      case "completed": list = list.filter((t) => t.status === "completed"); break;
      case "archived": list = list.filter((t) => t.status === "archived"); break;
      case "cancelled": list = list.filter((t) => t.status === "cancelled"); break;
      case "due_today": list = list.filter((t) => t.due_date && isToday(parseISO(t.due_date))); break;
      case "due_tomorrow": list = list.filter((t) => t.due_date && isTomorrow(parseISO(t.due_date))); break;
      case "upcoming":
        list = list.filter((t) => t.due_date && !isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)));
        break;
      case "overdue":
        list = list.filter(
          (t) => t.status !== "completed" && t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))
        );
        break;
      case "critical": list = list.filter((t) => t.priority === "critical"); break;
      case "high": list = list.filter((t) => t.priority === "high"); break;
      case "medium": list = list.filter((t) => t.priority === "medium"); break;
      case "low": list = list.filter((t) => t.priority === "low"); break;
      case "favorites": list = list.filter((t) => t.favorite); break;
      case "pinned": list = list.filter((t) => t.pinned); break;
      default: break;
    }
    // Sorting: pinned first, then chosen
    list.sort((a, b) => {
      if ((b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      switch (sort) {
        case "priority": return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        case "title": return a.title.localeCompare(b.title);
        case "due_date":
          return (a.due_date || "9999").localeCompare(b.due_date || "9999");
        case "updated_at":
          return b.updated_at.localeCompare(a.updated_at);
        default: return b.created_at.localeCompare(a.created_at);
      }
    });
    return list;
  }, [tasks, filter, sort, search, category]);

  return (
    <div className="p-8 lg:p-12" data-testid="all-tasks-page">
      <PageHeader
        title="All Tasks"
        subtitle="Filter, sort, and drill into your entire task database."
        actions={
          <Button testid="header-new-task" onClick={() => openQuickAdd()}>
            <Plus strokeWidth={2} className="w-4 h-4" />
            New Task
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            data-testid={`filter-${f.id}`}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border transition-colors ${
              filter === f.id
                ? "bg-[var(--acid)] text-black border-[var(--acid)]"
                : "border-[#1f1f22] text-[#A1A1AA] hover:border-[#333] hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            data-testid="sort-select"
            className="bg-[#0A0A0A] border border-[#1f1f22] text-[#F2F2F2] rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--acid)]"
          >
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            data-testid="category-filter"
            className="bg-[#0A0A0A] border border-[#1f1f22] text-[#F2F2F2] rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--acid)]"
          >
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A] ml-auto">
          {filtered.length} results
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks match"
          description="Adjust filters or create a new task to get started."
        />
      ) : (
        <div className="space-y-2" data-testid="task-list">
          {filtered.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      )}
    </div>
  );
}
