import { useStore } from "@/store/store";
import { daysRemainingLabel } from "@/lib/utils-date";
import { Pin, Star, Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/IconButton";

const priorityStyle = {
  critical: "bg-[#FF3366]/10 text-[#FF3366] border-[#FF3366]/25",
  high: "bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/25",
  medium: "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/25",
  low: "bg-[#71717A]/10 text-[#A1A1AA] border-[#71717A]/25",
};
const toneClass = {
  success: "text-[#00FFAA]",
  warning: "text-[#FFB800]",
  info: "text-[#00E5FF]",
  danger: "text-[#FF3366]",
  muted: "text-[#71717A]",
};

export function TaskCard({ task }) {
  const { categories, toggleTask, pinTask, favoriteTask, deleteTask, openQuickAdd } = useStore();
  const cat = categories.find((c) => c.id === task.category_id);
  const dr = daysRemainingLabel(task.due_date, task.status);
  const done = task.status === "completed";

  return (
    <article
      data-testid={`task-card-${task.id}`}
      className="group bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-4 hover:border-[#333] transition-colors fade-up"
    >
      <div className="flex items-start gap-3">
        <button
          data-testid={`task-checkbox-${task.id}`}
          onClick={() => toggleTask(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
            done
              ? "bg-[var(--acid)] border-[var(--acid)]"
              : "border-[#333] hover:border-[var(--acid)]"
          }`}
        >
          {done && (
            <svg viewBox="0 0 24 24" className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-display font-medium text-[15px] leading-tight ${
                done ? "text-[#71717A] line-through" : "text-[#F2F2F2]"
              }`}
            >
              {task.title}
            </h3>
            {task.pinned && <Pin strokeWidth={1.5} className="w-3.5 h-3.5 text-[var(--acid)]" />}
            {task.favorite && <Star strokeWidth={1.5} className="w-3.5 h-3.5 text-[#FFB800]" fill="#FFB800" />}
          </div>

          {task.description && (
            <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span
              className={`px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider font-mono ${priorityStyle[task.priority]}`}
              data-testid={`task-priority-${task.id}`}
            >
              {task.priority}
            </span>
            {cat && (
              <span
                className="px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider font-mono border-[#1f1f22]"
                style={{ color: cat.color, borderColor: `${cat.color}40`, background: `${cat.color}10` }}
              >
                {cat.name}
              </span>
            )}
            <span className={`text-[11px] font-mono ${toneClass[dr.tone]}`}>· {dr.label}</span>
            {task.tags?.map((t) => (
              <span key={t} className="text-[11px] font-mono text-[#71717A]">#{t}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconButton onClick={() => pinTask(task.id)} testid={`pin-${task.id}`} title="Pin">
            <Pin strokeWidth={1.5} className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton onClick={() => favoriteTask(task.id)} testid={`fav-${task.id}`} title="Favorite">
            <Star strokeWidth={1.5} className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton onClick={() => openQuickAdd(task.id)} testid={`edit-${task.id}`} title="Edit">
            <Pencil strokeWidth={1.5} className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton onClick={() => deleteTask(task.id)} testid={`delete-${task.id}`} danger title="Delete">
            <Trash2 strokeWidth={1.5} className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </div>
    </article>
  );
}
