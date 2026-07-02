import { useState } from "react";
import { useStore } from "@/store/store";
import { api } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Primitives";
import { Flame, Plus, Trash2 } from "lucide-react";
import { format, subDays } from "date-fns";

export default function Habits() {
  const { habits, refreshHabits } = useStore();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await api.createHabit({ name });
    setName("");
    setCreating(false);
    await refreshHabits();
  }

  async function toggle(id, day) {
    await api.toggleHabitDay(id, day);
    await refreshHabits();
  }

  const days = Array.from({ length: 21 }).map((_, i) => subDays(new Date(), 20 - i));

  function computeStreak(logs) {
    const set = new Set(logs);
    let streak = 0;
    let d = new Date();
    while (set.has(format(d, "yyyy-MM-dd"))) {
      streak += 1;
      d = subDays(d, 1);
    }
    return streak;
  }

  return (
    <div className="p-8 lg:p-12" data-testid="habits-page">
      <PageHeader
        title="Habits"
        subtitle="Small commitments, compounded over time."
        actions={
          <button
            onClick={() => setCreating(!creating)}
            data-testid="header-new-habit"
            className="bg-[var(--acid)] text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--acid-hover)] flex items-center gap-2 transition-colors"
          >
            <Plus strokeWidth={2} className="w-4 h-4" /> New Habit
          </button>
        }
      />

      {creating && (
        <form onSubmit={add} className="flex items-center gap-3 bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-4 mb-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning run"
            data-testid="habit-name-input"
            autoFocus
            className="flex-1 bg-black border border-[#1f1f22] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--acid)]"
          />
          <button data-testid="habit-add" className="bg-[var(--acid)] text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--acid-hover)] flex items-center gap-2">
            <Plus strokeWidth={2} className="w-4 h-4" /> Add
          </button>
        </form>
      )}

      {habits.length === 0 ? (
        <EmptyState icon={Flame} title="No habits yet" description="Add a daily practice to see streaks come alive." />
      ) : (
        <div className="space-y-3">
          {habits.map((h) => {
            const streak = computeStreak(h.logs || []);
            return (
              <div key={h.id} className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-5 hover:border-[#333] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00FFAA]/10 border border-[#00FFAA]/25 flex items-center justify-center">
                      <Flame strokeWidth={1.5} className="w-5 h-5 text-[#00FFAA]" />
                    </div>
                    <div>
                      <div className="font-display text-[15px] text-[#F2F2F2]">{h.name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">
                        Streak · {streak}d
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => { await api.deleteHabit(h.id); await refreshHabits(); }}
                    className="p-2 rounded hover:bg-[#121214] text-[#71717A] hover:text-[#FF3366]"
                  >
                    <Trash2 strokeWidth={1.5} className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {days.map((d) => {
                    const key = format(d, "yyyy-MM-dd");
                    const done = (h.logs || []).includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggle(h.id, key)}
                        data-testid={`habit-day-${h.id}-${key}`}
                        title={format(d, "MMM d")}
                        className={`w-8 h-8 rounded border transition-all ${
                          done
                            ? "bg-[var(--acid)] border-[var(--acid)]"
                            : "border-[#1f1f22] hover:border-[#333]"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
