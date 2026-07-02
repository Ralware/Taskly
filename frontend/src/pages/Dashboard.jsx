import { useEffect } from "react";
import { useStore } from "@/store/store";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/Primitives";
import { TaskCard } from "@/components/TaskCard";
import { daysRemainingLabel, fmtDate } from "@/lib/utils-date";
import { isToday, parseISO } from "date-fns";
import { Flame, Repeat, Plus } from "lucide-react";
import { Button } from "@/components/ui-atoms";

export default function Dashboard() {
  const { summary, tasks, revisions, loadAll, openQuickAdd } = useStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!summary) loadAll(); }, []);
  if (!summary) return <div className="p-8 text-[#71717A]">Loading dashboard…</div>;

  const todayTasks = tasks
    .filter((t) => t.status !== "completed" && t.due_date && isToday(parseISO(t.due_date)))
    .slice(0, 5);
  const upcomingRevisions = revisions
    .filter((r) => !r.completed)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 4);

  return (
    <div className="flex-1 w-full p-8 lg:p-12" data-testid="dashboard-page">
      <PageHeader
        title="Command Center"
        subtitle="Your daily operating view — focus on what moves the needle today."
        actions={
          <Button testid="header-new-task" onClick={() => openQuickAdd()}>
            <Plus strokeWidth={2} className="w-4 h-4" />
            New Task
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard testid="stat-total" label="Total tasks" value={summary.total} />
        <StatCard testid="stat-pending" label="Pending" value={summary.pending} accent="#00E5FF" />
        <StatCard testid="stat-completed" label="Completed" value={summary.completed} accent="#00FFAA" />
        <StatCard testid="stat-due-today" label="Due today" value={summary.due_today} accent="#FFB800" />
        <StatCard testid="stat-overdue" label="Overdue" value={summary.overdue} accent="#FF3366" />
        <StatCard testid="stat-upcoming" label="Upcoming" value={summary.upcoming} />
        <StatCard testid="stat-revisions" label="Revisions due" value={summary.revisions_due} accent="#00E5FF" />
        <StatCard
          testid="stat-productivity"
          label="Productivity"
          value={`${summary.productivity}%`}
          accent="var(--acid)"
          hint="Completed / total"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[var(--acid)]/10 border border-[var(--acid)]/20 flex items-center justify-center">
            <Flame strokeWidth={1.5} className="w-5 h-5 text-[var(--acid)]" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">Current streak</div>
            <div className="font-display text-3xl mt-1 font-mono">{summary.current_streak} <span className="text-sm text-[#71717A]">days</span></div>
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00FFAA]/10 border border-[#00FFAA]/20 flex items-center justify-center">
            <Flame strokeWidth={1.5} className="w-5 h-5 text-[#00FFAA]" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">Longest streak</div>
            <div className="font-display text-3xl mt-1 font-mono">{summary.longest_streak} <span className="text-sm text-[#71717A]">days</span></div>
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center">
            <Repeat strokeWidth={1.5} className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">Weekly completed</div>
            <div className="font-display text-3xl mt-1 font-mono">{summary.weekly_completed}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl">Focus for today</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">
              {todayTasks.length} items
            </span>
          </div>
          {todayTasks.length === 0 ? (
            <div className="text-sm text-[#71717A] border border-dashed border-[#1f1f22] rounded-xl p-8 text-center">
              Nothing scheduled for today. Enjoy the calm — or use Quick Add to plan.
            </div>
          ) : (
            <div className="space-y-2">{todayTasks.map((t) => <TaskCard key={t.id} task={t} />)}</div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl">Upcoming revisions</h2>
          </div>
          <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl divide-y divide-[#1f1f22]">
            {upcomingRevisions.length === 0 ? (
              <div className="p-6 text-sm text-[#71717A]">No revisions scheduled.</div>
            ) : (
              upcomingRevisions.map((r) => {
                const t = tasks.find((x) => x.id === r.task_id);
                return (
                  <div key={r.id} className="p-4 flex items-start gap-3">
                    <div className="w-1 h-8 rounded-full bg-[#00E5FF]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[#F2F2F2] truncate">{t?.title || "Deleted task"}</div>
                      <div className="text-[11px] font-mono text-[#71717A] mt-1">
                        {daysRemainingLabel(r.due_date, "pending").label} · {fmtDate(r.due_date, "MMM d")} · +{r.interval_days}d
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
