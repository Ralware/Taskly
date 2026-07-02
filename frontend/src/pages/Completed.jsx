import { useStore } from "@/store/store";
import { PageHeader, EmptyState } from "@/components/Primitives";
import { CheckCircle2 } from "lucide-react";
import { fmtDate } from "@/lib/utils-date";
import { parseISO, differenceInMinutes } from "date-fns";

export default function Completed() {
  const { tasks, toggleTask, deleteTask, categories } = useStore();
  const list = tasks
    .filter((t) => t.status === "completed")
    .sort((a, b) => (b.completed_at || "").localeCompare(a.completed_at || ""));

  return (
    <div className="p-8 lg:p-12" data-testid="completed-page">
      <PageHeader title="Completed" subtitle="Your archive of finished work — proof of progress." />
      {list.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No completed tasks yet"
          description="Mark a task as done to see it here."
        />
      ) : (
        <div className="space-y-2">
          {list.map((t) => {
            const cat = categories.find((c) => c.id === t.category_id);
            const timeTaken =
              t.completed_at && t.created_at
                ? `${differenceInMinutes(parseISO(t.completed_at), parseISO(t.created_at))} min`
                : "—";
            return (
              <div
                key={t.id}
                data-testid={`completed-${t.id}`}
                className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-5 hover:border-[#333] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 text-[#00FFAA]" />
                      <h3 className="font-display text-[15px] text-[#F2F2F2] line-through">{t.title}</h3>
                    </div>
                    {t.description && <p className="text-xs text-[#A1A1AA] mt-2">{t.description}</p>}
                    <div className="flex items-center gap-4 mt-3 font-mono text-[11px] text-[#71717A]">
                      <span>Completed {fmtDate(t.completed_at, "MMM d, HH:mm")}</span>
                      <span>Due: {fmtDate(t.due_date)}</span>
                      <span>Time: {timeTaken}</span>
                      {cat && <span style={{ color: cat.color }}>· {cat.name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTask(t.id)}
                      className="text-xs text-[#A1A1AA] hover:text-white px-2 py-1 rounded hover:bg-[#121214]"
                    >
                      Reopen
                    </button>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="text-xs text-[#71717A] hover:text-[#FF3366] px-2 py-1 rounded hover:bg-[#121214]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
