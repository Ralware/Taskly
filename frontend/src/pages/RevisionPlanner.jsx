import { useStore } from "@/store/store";
import { api } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Primitives";
import { Repeat, Check, Trash2 } from "lucide-react";
import { daysRemainingLabel, fmtDate } from "@/lib/utils-date";

export default function RevisionPlanner() {
  const { revisions, tasks, refreshRevisions, refreshSummary } = useStore();
  const sorted = [...revisions].sort((a, b) => a.due_date.localeCompare(b.due_date));

  async function markDone(id) {
    await api.completeRevision(id, "");
    await refreshRevisions();
    await refreshSummary();
  }
  async function remove(id) {
    await api.deleteRevision(id);
    await refreshRevisions();
  }

  return (
    <div className="p-8 lg:p-12" data-testid="revisions-page">
      <PageHeader
        title="Revision Planner"
        subtitle="Spaced repetition: revisit completed tasks at 1, 3, 7, 14, 30 day intervals."
      />
      {sorted.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No revisions scheduled"
          description="Enable 'Spaced revisions' when creating or editing a task to auto-schedule it."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sorted.map((r) => {
            const t = tasks.find((x) => x.id === r.task_id);
            const dr = daysRemainingLabel(r.due_date, r.completed ? "completed" : "pending");
            return (
              <div
                key={r.id}
                data-testid={`revision-${r.id}`}
                className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-4 hover:border-[#333] transition-colors flex items-center gap-3"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xs ${
                    r.completed
                      ? "bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/25"
                      : "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/25"
                  }`}
                >
                  +{r.interval_days}d
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${r.completed ? "text-[#71717A] line-through" : "text-[#F2F2F2]"}`}>
                    {t?.title || "Deleted task"}
                  </div>
                  <div className="text-[11px] font-mono text-[#71717A]">
                    {fmtDate(r.due_date, "MMM d")} · {dr.label}
                  </div>
                </div>
                {!r.completed && (
                  <button
                    onClick={() => markDone(r.id)}
                    data-testid={`revision-done-${r.id}`}
                    className="p-2 rounded hover:bg-[#121214] text-[#00FFAA]"
                  >
                    <Check strokeWidth={1.5} className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => remove(r.id)}
                  className="p-2 rounded hover:bg-[#121214] text-[#71717A] hover:text-[#FF3366]"
                >
                  <Trash2 strokeWidth={1.5} className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
