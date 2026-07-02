import { useStore } from "@/store/store";
import { TaskCard } from "@/components/TaskCard";
import { PageHeader, EmptyState } from "@/components/Primitives";
import { Sun, Plus } from "lucide-react";
import { Button } from "@/components/ui-atoms";
import { isToday, parseISO } from "date-fns";

export default function TodayTasks() {
  const { tasks, openQuickAdd } = useStore();
  const today = tasks.filter(
    (t) => t.status !== "completed" && t.due_date && isToday(parseISO(t.due_date))
  );
  return (
    <div className="p-8 lg:p-12" data-testid="today-page">
      <PageHeader
        title="Today's Tasks"
        subtitle="Only what matters for the next 24 hours. Complete these first."
        actions={
          <Button testid="header-new-task" onClick={() => openQuickAdd()}>
            <Plus strokeWidth={2} className="w-4 h-4" />
            New Task
          </Button>
        }
      />
      {today.length === 0 ? (
        <EmptyState icon={Sun} title="Nothing due today" description="Great — enjoy focus time or plan tomorrow." />
      ) : (
        <div className="space-y-2">{today.map((t) => <TaskCard key={t.id} task={t} />)}</div>
      )}
    </div>
  );
}
