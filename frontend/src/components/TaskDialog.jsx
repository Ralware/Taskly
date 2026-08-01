import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { X } from "lucide-react";
import { Switch, Button, Input, Textarea, Select, Label } from "@/components/ui-atoms";

const emptyTask = {
  title: "",
  description: "",
  notes: "",
  category_id: "",
  priority: "medium",
  status: "pending",
  due_date: "",
  due_time: "",
  estimated_minutes: null,
  tags: [],
  pinned: false,
  favorite: false,
  recurrence: "none",
  project_id: "",
};

export function TaskDialog() {
  const { quickAddOpen, closeQuickAdd, editingTaskId, tasks, categories, projects, createTask, updateTask } =
    useStore();
  const [form, setForm] = useState(emptyTask);
  const [tagsText, setTagsText] = useState("");

  useEffect(() => {
    if (editingTaskId) {
      const t = tasks.find((x) => x.id === editingTaskId);
      if (t) {
        setForm({ ...emptyTask, ...t, category_id: t.category_id || "", project_id: t.project_id || "" });
        setTagsText((t.tags || []).join(", "));
      }
    } else {
      setForm(emptyTask);
      setTagsText("");
    }
  }, [editingTaskId, tasks, quickAddOpen]);

  if (!quickAddOpen) return null;

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      ...form,
      category_id: form.category_id || null,
      project_id: form.project_id || null,
      due_date: form.due_date || null,
      due_time: form.due_time || null,
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      estimated_minutes: form.estimated_minutes ? Number(form.estimated_minutes) : null,
    };
    if (editingTaskId) await updateTask(editingTaskId, payload);
    else await createTask(payload);
    closeQuickAdd();
  }

  return (
    <div
      data-testid="task-dialog"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-6"
      onClick={closeQuickAdd}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0A0A0A] border border-[#1f1f22] rounded-xl mt-16 fade-up"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f22]">
          <h2 className="font-display text-xl">{editingTaskId ? "Edit task" : "New task"}</h2>
          <button type="button" onClick={closeQuickAdd} data-testid="dialog-close" className="p-1.5 rounded hover:bg-[#121214] text-[#A1A1AA]">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              data-testid="task-title-input"
              autoFocus
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="What needs to happen?"
              className="!h-10 text-[15px]"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              data-testid="task-desc-input"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority">
              <Select
                data-testid="task-priority-select"
                value={form.priority}
                onChange={(e) => setField("priority", e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setField("status", e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </Field>
            <Field label="Category">
              <Select value={form.category_id} onChange={(e) => setField("category_id", e.target.value)}>
                <option value="">— none —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Project">
              <Select value={form.project_id} onChange={(e) => setField("project_id", e.target.value)}>
                <option value="">— none —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Due date">
              <Input
                data-testid="task-due-input"
                type="date"
                value={form.due_date ? form.due_date.slice(0, 10) : ""}
                onChange={(e) => setField("due_date", e.target.value)}
              />
            </Field>
            <Field label="Due time">
              <Input
                type="time"
                value={form.due_time || ""}
                onChange={(e) => setField("due_time", e.target.value)}
              />
            </Field>
            <Field label="Estimated (min)">
              <Input
                type="number"
                value={form.estimated_minutes || ""}
                onChange={(e) => setField("estimated_minutes", e.target.value)}
              />
            </Field>
            <Field label="Recurrence">
              <Select value={form.recurrence} onChange={(e) => setField("recurrence", e.target.value)}>
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </Field>
          </div>

          <Field label="Tags (comma separated)">
            <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="deep-work, quick-win" />
          </Field>

          <Field label="Notes">
            <Textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              placeholder="Extra context, links, references…"
            />
          </Field>

          <div className="flex items-center gap-6 pt-2 flex-wrap">
            <ToggleRow label="Pinned" checked={form.pinned} onChange={(v) => setField("pinned", v)} testid="toggle-pinned" />
            <ToggleRow label="Favorite" checked={form.favorite} onChange={(v) => setField("favorite", v)} testid="toggle-favorite" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#1f1f22] flex justify-end gap-2">
          <Button variant="ghost" onClick={closeQuickAdd} testid="dialog-cancel">Cancel</Button>
          <Button type="submit" testid="dialog-submit">
            {editingTaskId ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ToggleRow({ label, checked, onChange, testid }) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm text-[#A1A1AA] select-none">
      <Switch checked={checked} onChange={onChange} testid={testid} />
      <span>{label}</span>
    </label>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
