import { useState } from "react";
import { useStore } from "@/store/store";
import { api } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Primitives";
import { Target, Plus, Trash2 } from "lucide-react";
import { fmtDate } from "@/lib/utils-date";

export default function Goals() {
  const { goals, refreshGoals } = useStore();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", deadline: "", progress: 0 });

  async function create(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await api.createGoal({ ...form, deadline: form.deadline || null, milestones: [], status: "active" });
    setForm({ title: "", description: "", deadline: "", progress: 0 });
    setCreating(false);
    await refreshGoals();
  }

  async function updateProgress(g, delta) {
    const progress = Math.max(0, Math.min(100, g.progress + delta));
    await api.updateGoal(g.id, { ...g, progress, status: progress >= 100 ? "completed" : g.status });
    await refreshGoals();
  }

  return (
    <div className="p-8 lg:p-12" data-testid="goals-page">
      <PageHeader
        title="Goals"
        subtitle="Long-horizon commitments. Break them down, track progress."
        actions={
          <button
            onClick={() => setCreating(!creating)}
            data-testid="goal-new"
            className="bg-[var(--acid)] text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--acid-hover)] flex items-center gap-2"
          >
            <Plus strokeWidth={2} className="w-4 h-4" /> New Goal
          </button>
        }
      />

      {creating && (
        <form onSubmit={create} className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-5 mb-6 space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Goal title…"
            className="w-full bg-black border border-[#1f1f22] rounded-md px-3 py-2 focus:outline-none focus:border-[var(--acid)]"
            data-testid="goal-title-input"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Why is this important?"
            className="w-full bg-black border border-[#1f1f22] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--acid)]"
          />
          <div className="flex gap-3">
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="bg-black border border-[#1f1f22] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--acid)]"
            />
            <button className="bg-[var(--acid)] text-black px-4 py-2 rounded-md text-sm font-medium" data-testid="goal-create-btn">
              Create goal
            </button>
          </div>
        </form>
      )}

      {goals.length === 0 && !creating ? (
        <EmptyState icon={Target} title="No goals yet" description="Set a meaningful long-term objective." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => (
            <div key={g.id} className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6 hover:border-[#333] transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-lg text-[#F2F2F2]">{g.title}</div>
                  <div className="font-mono text-[10px] text-[#71717A] mt-1">
                    {g.deadline ? `Due ${fmtDate(g.deadline)}` : "No deadline"} · {g.status}
                  </div>
                </div>
                <button
                  onClick={async () => { await api.deleteGoal(g.id); await refreshGoals(); }}
                  className="p-2 rounded hover:bg-[#121214] text-[#71717A] hover:text-[#FF3366]"
                >
                  <Trash2 strokeWidth={1.5} className="w-4 h-4" />
                </button>
              </div>
              {g.description && <p className="text-sm text-[#A1A1AA] mt-3">{g.description}</p>}

              <div className="mt-5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                  <span>Progress</span><span>{g.progress}%</span>
                </div>
                <div className="h-2 bg-[#121214] rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[var(--acid)] transition-all" style={{ width: `${g.progress}%` }} />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => updateProgress(g, -10)} className="px-3 py-1 rounded bg-[#121214] hover:bg-[#1a1a1a] text-xs font-mono">-10%</button>
                  <button onClick={() => updateProgress(g, 10)} data-testid={`goal-progress-${g.id}`} className="px-3 py-1 rounded bg-[#121214] hover:bg-[#1a1a1a] text-xs font-mono">+10%</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
