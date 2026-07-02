import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/store";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/Primitives";
import { Plus, Trash2, StickyNote } from "lucide-react";
import { fmtDate } from "@/lib/utils-date";

export default function Notes() {
  const { notes, refreshNotes } = useStore();
  const [activeId, setActiveId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const saveTimer = useRef(null);

  const active = notes.find((n) => n.id === activeId);
  useEffect(() => {
    if (active) {
      setTitle(active.title);
      setContent(active.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Auto-save on change (debounced)
  useEffect(() => {
    if (!activeId) return;
    if (!active) return;
    if (title === active.title && content === active.content) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await api.updateNote(activeId, { ...active, title, content });
      await refreshNotes();
    }, 500);
    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  async function createNote() {
    const n = await api.createNote({ title: "Untitled", content: "" });
    await refreshNotes();
    setActiveId(n.id);
  }
  async function removeNote(id) {
    await api.deleteNote(id);
    if (activeId === id) setActiveId(null);
    await refreshNotes();
  }

  return (
    <div className="p-8 lg:p-12" data-testid="notes-page">
      <PageHeader
        title="Notes"
        subtitle="A quiet space for thoughts, journals, and long-lived context. Auto-saves."
        actions={
          <button
            onClick={createNote}
            data-testid="header-new-note"
            className="bg-[var(--acid)] text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--acid-hover)] flex items-center gap-2 transition-colors"
          >
            <Plus strokeWidth={2} className="w-4 h-4" /> New Note
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-260px)]">
        <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl overflow-hidden flex flex-col">
          <button
            onClick={createNote}
            data-testid="note-new"
            className="flex items-center gap-2 px-4 py-3 border-b border-[#1f1f22] text-sm text-[#F2F2F2] hover:bg-[#121214]"
          >
            <Plus strokeWidth={1.5} className="w-4 h-4 text-[var(--acid)]" /> New note
          </button>
          <div className="overflow-y-auto flex-1">
            {notes.length === 0 && (
              <div className="p-6 text-center text-sm text-[#71717A]">
                <StickyNote strokeWidth={1.5} className="w-6 h-6 mx-auto mb-2" />
                No notes yet
              </div>
            )}
            {notes.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveId(n.id)}
                data-testid={`note-item-${n.id}`}
                className={`w-full text-left px-4 py-3 border-b border-[#1f1f22] hover:bg-[#121214] transition-colors ${activeId === n.id ? "bg-[#121214] border-l-2 border-l-[var(--acid)]" : ""}`}
              >
                <div className="font-display text-sm text-[#F2F2F2] truncate">{n.title || "Untitled"}</div>
                <div className="font-mono text-[10px] text-[#71717A] mt-1">{fmtDate(n.updated_at, "MMM d, HH:mm")}</div>
                <div className="text-xs text-[#A1A1AA] mt-1 line-clamp-1">{n.content?.slice(0, 60)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-[#0A0A0A] border border-[#1f1f22] rounded-xl overflow-hidden flex flex-col">
          {active ? (
            <>
              <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1f1f22]">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="note-title"
                  className="flex-1 bg-transparent text-2xl font-display font-medium focus:outline-none"
                  placeholder="Note title"
                />
                <button
                  onClick={() => removeNote(active.id)}
                  className="p-2 rounded hover:bg-[#121214] text-[#71717A] hover:text-[#FF3366]"
                >
                  <Trash2 strokeWidth={1.5} className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                data-testid="note-content"
                placeholder="Start writing… Markdown-friendly. Use # for headings, - for bullets, [ ] for checklists, ``` for code."
                className="flex-1 bg-transparent px-6 py-4 focus:outline-none font-mono text-sm text-[#F2F2F2] resize-none leading-relaxed"
              />
              <div className="px-6 py-2 border-t border-[#1f1f22] font-mono text-[10px] text-[#71717A]">
                Auto-saved · {fmtDate(active.updated_at, "MMM d, HH:mm")}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-[#71717A]">
              Select or create a note.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
