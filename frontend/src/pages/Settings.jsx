import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/Primitives";
import { useStore } from "@/store/store";
import { Select, Input, Switch } from "@/components/ui-atoms";
import { useTheme } from "@/components/ThemeProvider";

const ACCENT_COLORS = ["#D4FF00", "#00E5FF", "#FF3366", "#00FFAA", "#FFB800"];

export default function Settings() {
  const { settings } = useStore();
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState(null);

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  // Persist changes immediately — no Save button.
  async function persist(patch) {
    if (!form) return;
    const next = { ...form, ...patch };
    setForm(next);
    // Instant DOM write — no wait for React re-render / ThemeProvider effect
    if (patch.accent_color) document.documentElement.style.setProperty("--acid", patch.accent_color);
    await api.updateSettings(next);
    useStore.setState({ settings: next });
  }

  if (!form) return <div className="p-8 text-[#71717A]">Loading…</div>;

  return (
    <div className="p-8 lg:p-12 max-w-3xl" data-testid="settings-page">
      <PageHeader title="Settings" subtitle="Changes save instantly and stay on this device." />
      <div className="space-y-3">
        <Row label="Theme" hint="Your preference is saved on this device and applies instantly.">
          <Select value={theme} onChange={(e) => { setTheme(e.target.value); persist({ theme: e.target.value }); }} className="w-48">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </Select>
        </Row>

        <Row label="Accent color" hint="Sharp accent used across the app — updates instantly.">
          <div className="flex items-center gap-2">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => persist({ accent_color: c })}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${form.accent_color === c ? "border-white" : "border-transparent"}`}
                style={{ background: c }}
                aria-label={`Accent ${c}`}
                data-testid={`accent-${c.slice(1)}`}
              />
            ))}
          </div>
        </Row>

        <Row label="Default view" hint="Landing page when app opens.">
          <Select value={form.default_view} onChange={(e) => persist({ default_view: e.target.value })} className="w-48">
            <option value="dashboard">Dashboard</option>
            <option value="today">Today</option>
            <option value="all">All tasks</option>
          </Select>
        </Row>

        <Row label="Revision schedule" hint="Comma-separated interval days for spaced repetition.">
          <Input
            data-testid="revision-schedule-input"
            className="w-48"
            value={(form.revision_schedule || []).join(", ")}
            onChange={(e) =>
              persist({
                revision_schedule: e.target.value.split(",").map((s) => parseInt(s.trim())).filter((n) => !Number.isNaN(n)),
              })
            }
          />
        </Row>

        <Row label="Notifications" hint="Enable reminders for due tasks and revisions.">
          <Switch checked={form.notifications_enabled} onChange={(v) => persist({ notifications_enabled: v })} testid="toggle-notifications" />
        </Row>

        <Row label="Automatic backups" hint="Snapshot data periodically.">
          <Switch checked={form.auto_backup} onChange={(v) => persist({ auto_backup: v })} testid="toggle-auto-backup" />
        </Row>
      </div>
    </div>
  );
}

function Row({ label, hint, children }) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-5 flex items-center justify-between gap-6 min-h-[76px]">
      <div className="flex-1 min-w-0">
        <div className="font-display text-[15px] text-[#F2F2F2]">{label}</div>
        {hint && <div className="text-xs text-[#71717A] mt-1 max-w-md">{hint}</div>}
      </div>
      <div className="shrink-0 flex items-center">{children}</div>
    </div>
  );
}
