import { useState } from "react";
import { useStore } from "@/store/store";
import { api } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Primitives";
import { Layers, Plus, Trash2, ExternalLink } from "lucide-react";
import { fmtDate } from "@/lib/utils-date";

const STATUS_COLOR = {
  planning: "#A1A1AA",
  active: "var(--acid)",
  on_hold: "#FFB800",
  completed: "#00FFAA",
};

export default function Projects() {
  const { projects, tasks, refreshProjects } = useStore();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", deadline: "", reference_link: "", status: "active", color: "#00E5FF" });

  async function create(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await api.createProject({ ...form, deadline: form.deadline || null });
    setForm({ name: "", description: "", deadline: "", reference_link: "", status: "active", color: "#00E5FF" });
    setCreating(false);
    await refreshProjects();
  }

  return (
    <div className="p-8 lg:p-12" data-testid="projects-page">
      <PageHeader
        title="Projects"
        subtitle="Group related tasks into missions. Track scope and progress."
        actions={
          <button
            onClick={() => setCreating(!creating)}
            data-testid="project-new"
            className="bg-[var(--acid)] text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--acid-hover)] flex items-center gap-2"
          >
            <Plus strokeWidth={2} className="w-4 h-4" /> New Project
          </button>
        }
      />

      {creating && (
        <form onSubmit={create} className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Project name…"
            className="bg-black border border-[#1f1f22] rounded-md px-3 py-2 focus:outline-none focus:border-[var(--acid)]"
            data-testid="project-name-input"
          />
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="bg-black border border-[#1f1f22] rounded-md px-3 py-2 text-sm"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="md:col-span-2 bg-black border border-[#1f1f22] rounded-md px-3 py-2 text-sm"
          />
          <input
            value={form.reference_link}
            onChange={(e) => setForm({ ...form, reference_link: e.target.value })}
            placeholder="Reference link (optional)"
            className="md:col-span-2 bg-black border border-[#1f1f22] rounded-md px-3 py-2 text-sm"
          />
          <button className="bg-[var(--acid)] text-black px-4 py-2 rounded-md text-sm font-medium col-span-full" data-testid="project-create-btn">Create</button>
        </form>
      )}

      {projects.length === 0 && !creating ? (
        <EmptyState icon={Layers} title="No projects yet" description="Group tasks under a mission to track progress." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const relatedTasks = tasks.filter((t) => t.project_id === p.id);
            const done = relatedTasks.filter((t) => t.status === "completed").length;
            const progress = relatedTasks.length ? Math.round((done / relatedTasks.length) * 100) : p.progress;
            return (
              <div key={p.id} className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6 hover:border-[#333] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg" style={{ background: `${p.color}20`, border: `1px solid ${p.color}40` }}>
                      <div className="w-full h-full flex items-center justify-center font-display font-medium" style={{ color: p.color }}>
                        {p.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div className="font-display text-lg text-[#F2F2F2]">{p.name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest mt-1" style={{ color: STATUS_COLOR[p.status] }}>
                        {p.status.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => { await api.deleteProject(p.id); await refreshProjects(); }}
                    className="p-2 rounded hover:bg-[#121214] text-[#71717A] hover:text-[#FF3366]"
                  >
                    <Trash2 strokeWidth={1.5} className="w-4 h-4" />
                  </button>
                </div>
                {p.description && <p className="text-sm text-[#A1A1AA] mt-3">{p.description}</p>}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[#71717A]">
                    <span>{relatedTasks.length} tasks · {done} done</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-[#121214] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00E5FF] transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 font-mono text-[10px] text-[#71717A]">
                  <span>{p.deadline ? `Due ${fmtDate(p.deadline)}` : "No deadline"}</span>
                  {p.reference_link && (
                    <a href={p.reference_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[var(--acid)]">
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
