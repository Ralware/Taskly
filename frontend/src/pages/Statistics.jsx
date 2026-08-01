import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/Primitives";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["var(--acid)", "var(--info)", "var(--danger)", "var(--success)", "var(--warning)", "#A78BFA"];

function CustomTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-md px-3 py-2 text-xs">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill }}>{p.name}: <span className="font-mono">{p.value}</span></div>
      ))}
    </div>
  );
}

export default function Statistics() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [byCat, setByCat] = useState([]);
  const [byPrio, setByPrio] = useState([]);

  useEffect(() => {
    Promise.all([api.statsSummary(), api.statsTrend(30), api.statsByCategory(), api.statsByPriority()])
      .then(([s, t, c, p]) => {
        setSummary(s);
        setTrend(t);
        setByCat(c);
        setByPrio(p);
      });
  }, []);

  if (!summary) return <div className="p-8 text-[#71717A]">Loading statistics…</div>;

  return (
    <div className="p-8 lg:p-12" data-testid="statistics-page">
      <PageHeader title="Statistics" subtitle="Signal, not noise. Track completion velocity and productivity patterns." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <MiniStat label="Productivity" value={`${summary.productivity}%`} />
        <MiniStat label="Weekly done" value={summary.weekly_completed} />
        <MiniStat label="Current streak" value={`${summary.current_streak}d`} />
        <MiniStat label="Longest streak" value={`${summary.longest_streak}d`} />
      </div>

      <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6 mb-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A] mb-4">30-day completion trend</div>
        <div className="h-64">
          <ResponsiveContainer minWidth={0} minHeight={1}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--acid)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--acid)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke="var(--muted)" tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="var(--muted)" tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "JetBrains Mono" }} allowDecimals={false} />
              <Tooltip content={<CustomTip />} />
              <Area type="monotone" dataKey="completed" stroke="var(--acid)" strokeWidth={2} fill="url(#grad1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A] mb-4">By category</div>
          <div className="h-64">
          <ResponsiveContainer minWidth={0} minHeight={1}>
              <PieChart>
                <Pie data={byCat} dataKey="total" nameKey="name" innerRadius={50} outerRadius={90} strokeWidth={0}>
                  {byCat.map((c, i) => <Cell key={i} fill={c.color || COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTip />} />
                <Legend wrapperStyle={{ color: "var(--text-secondary)", fontSize: 11, fontFamily: "JetBrains Mono" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A] mb-4">By priority</div>
          <div className="h-64">
          <ResponsiveContainer minWidth={0} minHeight={1}>
              <BarChart data={byPrio}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="priority" stroke="var(--muted)" tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <YAxis stroke="var(--muted)" tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "JetBrains Mono" }} allowDecimals={false} />
                <Tooltip content={<CustomTip />} />
                <Bar dataKey="total" fill="var(--info)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" fill="var(--acid)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">{label}</div>
      <div className="font-display text-3xl mt-2 font-mono">{value}</div>
    </div>
  );
}
