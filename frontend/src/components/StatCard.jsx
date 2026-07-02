export function StatCard({ label, value, hint, accent, testid }) {
  const accentColor = accent || "var(--acid)";
  return (
    <div
      data-testid={testid}
      className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-5 hover:border-[#333] transition-colors relative overflow-hidden"
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">{label}</div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="font-display text-4xl font-medium tracking-tight text-[#F2F2F2] font-mono">
          {value}
        </div>
      </div>
      {hint && <div className="mt-1 text-xs text-[#A1A1AA]">{hint}</div>}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />
    </div>
  );
}
