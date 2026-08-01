import { useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { PageHeader } from "@/components/Primitives";
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, format
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const tasks = useStore((s) => s.tasks);
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const dayMap = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (t.due_date) {
        const key = t.due_date.slice(0, 10);
        (map[key] ||= []).push({ type: "task", data: t });
      }
      if (t.completed_at) {
        const key = t.completed_at.slice(0, 10);
        (map[key] ||= []).push({ type: "done", data: t });
      }
    });
    return map;
  }, [tasks]);

  const selectedItems = dayMap[format(selected, "yyyy-MM-dd")] || [];
  const weekCount = Math.ceil(days.length / 7);

  return (
    <div className="calendar-page p-5 lg:p-6" data-testid="calendar-page">
      <PageHeader compact title="Calendar" subtitle="Select a day to inspect your commitments." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)] lg:flex-1 lg:min-h-0">
        <section className="surface-card flex min-h-[460px] flex-col p-3 sm:p-4 lg:min-h-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="font-display text-xl">{format(month, "MMMM yyyy")}</h2>
            <div className="flex items-center gap-1">
              <button aria-label="Previous month" onClick={() => setMonth(subMonths(month, 1))} data-testid="cal-prev" className="icon-button">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setMonth(new Date())} className="px-2 py-1 text-[11px] font-mono text-[#A1A1AA] hover:text-white rounded hover:bg-[#121214] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acid)]/50">
                TODAY
              </button>
              <button aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))} data-testid="cal-next" className="icon-button">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
              <div key={d} className="px-1 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#71717A]">{d}</div>
            ))}
          </div>
          <div className="grid flex-1 min-h-0 grid-cols-7 gap-1" style={{ gridTemplateRows: `repeat(${weekCount}, minmax(0, 1fr))` }}>
            {days.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              const items = dayMap[key] || [];
              const isCurrent = isSameMonth(d, month);
              const isSel = isSameDay(d, selected);
              const isToday = isSameDay(d, new Date());
              return (
                <button
                  key={key}
                  onClick={() => setSelected(d)}
                  data-testid={`cal-day-${key}`}
                  aria-label={`${format(d, "MMMM d, yyyy")}${items.length ? `, ${items.length} scheduled item${items.length === 1 ? "" : "s"}` : ""}`}
                  className={`h-full min-h-0 rounded-md text-left p-1 border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acid)]/70 ${
                    isSel
                      ? "border-[var(--acid)] bg-[var(--acid)]/5"
                      : "border-transparent hover:border-[#333] hover:bg-[#121214]"
                  } ${!isCurrent ? "opacity-30" : ""}`}
                >
                  <div className={`font-mono text-xs leading-none ${isToday ? "text-[var(--acid)] font-bold" : "text-[#F2F2F2]"}`}>{format(d, "d")}</div>
                  <div className="flex gap-0.5 mt-1 flex-wrap">
                    {items.slice(0, 3).map((it, idx) => (
                      <span
                        key={idx}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: it.type === "done" ? "var(--success)" : "var(--acid)",
                        }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="surface-card flex min-h-[220px] flex-col p-4 lg:min-h-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">Selected</div>
          <div className="font-display text-xl mt-1">{format(selected, "EEE, MMM d")}</div>
          <div className="mt-3 space-y-2 overflow-y-auto pr-1">
            {selectedItems.length === 0 ? (
              <div className="text-sm text-[#71717A]">Nothing scheduled.</div>
            ) : (
              selectedItems.map((it, idx) => (
                <div key={idx} className="flex items-start gap-2 py-2 border-b border-[#1f1f22] last:border-0">
                  <span
                    className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: it.type === "done" ? "var(--success)" : "var(--acid)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#F2F2F2]">
                      {it.data.title}
                    </div>
                    <div className="font-mono text-[11px] text-[#71717A]">
                      {it.type.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
