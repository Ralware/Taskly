import { useState } from "react";
import { useStore } from "@/store/store";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/Primitives";
import { Plus, Trash2 } from "lucide-react";

const PALETTE = ["#D4FF00", "#00E5FF", "#FF3366", "#00FFAA", "#FFB800", "#A78BFA", "#F472B6"];

export default function Categories() {
  const { categories, refreshCategories, tasks } = useStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [creating, setCreating] = useState(false);

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await api.createCategory({ name, color, icon: "Tag" });
    setName("");
    setCreating(false);
    await refreshCategories();
  }

  async function remove(id) {
    if (!window.confirm("Delete this category? Tasks won't be deleted.")) return;
    await api.deleteCategory(id);
    await refreshCategories();
  }

  return (
    <div className="flex-1 w-full p-8 lg:p-12" data-testid="categories-page">
      <PageHeader
        title="Categories"
        subtitle="Organize tasks into meaningful buckets."
        actions={
          <button
            onClick={() => setCreating(!creating)}
            data-testid="header-new-category"
            className="bg-[var(--acid)] text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--acid-hover)] flex items-center gap-2 transition-colors"
          >
            <Plus strokeWidth={2} className="w-4 h-4" /> New Category
          </button>
        }
      />

      {creating && (
        <form onSubmit={add} className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-5 mb-6 flex items-center gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name…"
            data-testid="cat-name"
            autoFocus
            className="flex-1 bg-black border border-[#1f1f22] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--acid)]"
          />
          <div className="flex items-center gap-1">
            {PALETTE.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <button data-testid="cat-add" className="bg-[var(--acid)] text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--acid-hover)] flex items-center gap-2">
            <Plus strokeWidth={2} className="w-4 h-4" /> Add
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((c) => {
          const count = tasks.filter((t) => t.category_id === c.id).length;
          return (
            <div key={c.id} className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-5 hover:border-[#333] transition-colors flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg border" style={{ background: `${c.color}20`, borderColor: `${c.color}40` }}>
                <div className="w-full h-full flex items-center justify-center font-display text-lg font-medium" style={{ color: c.color }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-display text-[15px] text-[#F2F2F2]">{c.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">{count} tasks</div>
              </div>
              <button
                onClick={() => remove(c.id)}
                data-testid={`cat-delete-${c.id}`}
                className="p-2 rounded hover:bg-[#121214] text-[#71717A] hover:text-[#FF3366]"
              >
                <Trash2 strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
