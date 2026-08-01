import { useEffect, useMemo } from "react";
import { useStore } from "@/store/store";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/Primitives";
import { TaskCard } from "@/components/TaskCard";
import { isToday, parseISO } from "date-fns";
import { Flame, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui-atoms";

export default function Dashboard() {
  const { summary, tasks, loadAll, openQuickAdd } = useStore();
  useEffect(() => { if (!summary) loadAll(); }, [summary, loadAll]);

  const todayTasks = useMemo(
    () => tasks.filter((task) => task.status !== "completed" && task.due_date && isToday(parseISO(task.due_date))).slice(0, 5),
    [tasks],
  );

  if (!summary) return <div className="p-8 text-[#71717A]">Loading dashboard...</div>;

  return (
    <div className="flex-1 w-full p-8 lg:p-12" data-testid="dashboard-page">
      <PageHeader title="Command Center" subtitle="Your daily operating view — focus on what moves the needle today." actions={<Button testid="header-new-task" onClick={() => openQuickAdd()}><Plus strokeWidth={2} className="w-4 h-4" />New Task</Button>} />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard testid="stat-total" label="Total tasks" value={summary.total} />
        <StatCard testid="stat-pending" label="Pending" value={summary.pending} accent="var(--info)" />
        <StatCard testid="stat-completed" label="Completed" value={summary.completed} accent="var(--success)" />
        <StatCard testid="stat-due-today" label="Due today" value={summary.due_today} accent="var(--warning)" />
        <StatCard testid="stat-overdue" label="Overdue" value={summary.overdue} accent="var(--danger)" />
        <StatCard testid="stat-upcoming" label="Upcoming" value={summary.upcoming} />
        <StatCard testid="stat-productivity" label="Productivity" value={`${summary.productivity}%`} accent="var(--acid)" hint="Completed / total" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Metric icon={Flame} color="var(--acid)" label="Current streak" value={summary.current_streak} suffix="days" />
        <Metric icon={Flame} color="var(--success)" label="Longest streak" value={summary.longest_streak} suffix="days" />
        <Metric icon={CheckCircle2} color="var(--info)" label="Weekly completed" value={summary.weekly_completed} />
      </div>
      <section className="max-w-4xl">
        <div className="flex items-center justify-between mb-3"><h2 className="font-display text-xl">Focus for today</h2><span className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">{todayTasks.length} items</span></div>
        {todayTasks.length === 0 ? <div className="text-sm text-[#71717A] border border-dashed border-[#1f1f22] rounded-xl p-8 text-center">Nothing scheduled for today. Enjoy the calm — or use Quick Add to plan.</div> : <div className="space-y-2">{todayTasks.map((task) => <TaskCard key={task.id} task={task} />)}</div>}
      </section>
    </div>
  );
}

function Metric({ icon: Icon, color, label, value, suffix }) {
  return <div className="surface-card p-6 flex items-center gap-4"><div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ color, backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 20%, transparent)` }}><Icon strokeWidth={1.5} className="w-5 h-5" /></div><div><div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">{label}</div><div className="font-display text-3xl mt-1 font-mono">{value}{suffix && <span className="text-sm text-[#71717A]"> {suffix}</span>}</div></div></div>;
}
