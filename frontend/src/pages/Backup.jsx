import { useState } from "react";
import { api } from "@/lib/api";
import { useStore } from "@/store/store";
import { PageHeader } from "@/components/Primitives";
import { Download, Upload, QrCode } from "lucide-react";
import { Button } from "@/components/ui-atoms";
import QRCode from "qrcode";

export default function Backup() {
  const { loadAll, settings } = useStore();
  const [msg, setMsg] = useState(null);
  const [mode, setMode] = useState("replace"); // 'replace' | 'merge'

  const [qrDataUrl, setQrDataUrl] = useState(null);

  async function exportQR() {
    const data = await api.backupExport();
    const json = JSON.stringify(data);
    if (json.length > 2500) {
      setMsg("Workspace too large for QR (>2.5KB). Use JSON export instead.");
      return;
    }
    try {
      const light = settings?.accent_color || "#D4FF00";
      const url = await QRCode.toDataURL(json, { errorCorrectionLevel: "M", margin: 2, width: 512, color: { dark: "#000000", light } });
      setQrDataUrl(url);
    } catch (e) {
      setMsg(`QR generation failed: ${e.message}`);
    }
  }

  async function exportAll() {
    const data = await api.backupExport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskly-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Backup downloaded");
  }

  async function importFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let json;
    try { json = JSON.parse(text); } catch { setMsg("Invalid file"); return; }
    const verb = mode === "replace" ? "REPLACE all current data" : "MERGE into current workspace";
    if (!window.confirm(`This will ${verb}. Continue?`)) return;
    try {
      await api.backupImport(json, mode === "replace");
      await loadAll();
      setMsg(mode === "replace" ? "Backup restored (replaced)" : "Backup merged");
    } catch (err) {
      setMsg(`Import failed: ${err.message || err}`);
    }
  }

  return (
    <div className="p-8 lg:p-12 max-w-4xl" data-testid="backup-page">
      <PageHeader
        title="Backup"
        subtitle="Own your data. Export as JSON, restore anywhere."
        actions={
          <Button testid="header-export-backup" onClick={exportAll}>
            <Download strokeWidth={2} className="w-4 h-4" />
            Export Backup
          </Button>
        }
      />

      <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-5 mb-6" data-testid="import-mode-selector">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A] mb-3">Import mode</div>
        <div className="flex items-center gap-6">
          {[
            { v: "replace", label: "Replace current workspace", desc: "Wipe everything, then load the backup." },
            { v: "merge", label: "Merge into current workspace", desc: "Keep existing items; add/overwrite by ID." },
          ].map((opt) => (
            <label key={opt.v} className="flex items-start gap-2 cursor-pointer flex-1 rounded-md p-2 -m-2 focus-within:ring-2 focus-within:ring-[var(--acid)]/40 hover:bg-[#0f0f11] transition-colors">
              <input
                type="radio"
                name="import-mode"
                value={opt.v}
                checked={mode === opt.v}
                onChange={() => setMode(opt.v)}
                data-testid={`mode-${opt.v}`}
                className="mt-1 accent-[var(--acid)]"
              />
              <div>
                <div className="text-sm text-[#F2F2F2]">{opt.label}</div>
                <div className="text-xs text-[#71717A] mt-0.5">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={exportAll}
          data-testid="backup-export"
          className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6 hover:border-[var(--acid)] transition-colors text-left"
        >
          <Download strokeWidth={1.5} className="w-6 h-6 text-[var(--acid)]" />
          <div className="font-display text-lg mt-3">Export database</div>
          <div className="text-xs text-[#A1A1AA] mt-1">Download JSON snapshot with all your tasks, notes, and settings.</div>
        </button>

        <label
          className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6 hover:border-[var(--acid)] transition-colors text-left cursor-pointer"
          data-testid="backup-import"
        >
          <input type="file" accept="application/json" onChange={importFile} className="hidden" />
          <Upload strokeWidth={1.5} className="w-6 h-6 text-[#00E5FF]" />
          <div className="font-display text-lg mt-3">Import backup</div>
          <div className="text-xs text-[#A1A1AA] mt-1">Restore from a Taskly JSON export. Replaces current data.</div>
        </label>

        <button
          onClick={exportQR}
          data-testid="backup-qr"
          className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6 hover:border-[var(--acid)] transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[var(--acid)]/40"
        >
          <QrCode strokeWidth={1.5} className="w-6 h-6 text-[var(--acid)]" />
          <div className="font-display text-lg mt-3">Export as QR</div>
          <div className="text-xs text-[#A1A1AA] mt-1">Scan on another device to sync (workspace must be small).</div>
        </button>
      </div>

      {msg && <div className="mt-6 text-sm text-[var(--acid)] font-mono">{msg}</div>}
      {qrDataUrl && (
        <div
          data-testid="qr-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-6"
          onClick={() => setQrDataUrl(null)}
        >
          <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-lg mb-3">Scan on another device</div>
            <img src={qrDataUrl} alt="Backup QR code" className="w-full rounded-md" />
            <div className="text-xs text-[#71717A] mt-3">Any device with Taskly can scan this to import your workspace.</div>
          </div>
        </div>
      )}
    </div>
  );
}
