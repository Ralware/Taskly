import { useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { PageHeader } from "@/components/Primitives";
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, format, parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fmtDate } from "@/lib/utils-date";

export default function CalendarPage() {
  const { tasks, revisions } = useStore();
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
    revisions.forEach((r) => {
      (map[r.due_date] ||= []).push({ type: "rev", data: r });
    });
    return map;
  }, [tasks, revisions]);

  const selectedItems = dayMap[format(selected, "yyyy-MM-dd")] || [];

  return (
    <div className="p-8 lg:p-12" data-testid="calendar-page">
      <PageHeader title="Calendar" subtitle="Zoom out on your commitments. Select any day to inspect it." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-2xl">{format(month, "MMMM yyyy")}</div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMonth(subMonths(month, 1))} data-testid="cal-prev" className="p-2 rounded hover:bg-[#121214] text-[#A1A1AA]">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setMonth(new Date())} className="px-3 py-1 text-xs font-mono text-[#A1A1AA] hover:text-white rounded hover:bg-[#121214]">
                TODAY
              </button>
              <button onClick={() => setMonth(addMonths(month, 1))} data-testid="cal-next" className="p-2 rounded hover:bg-[#121214] text-[#A1A1AA]">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
              <div key={d} className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] px-2 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
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
                  className={`aspect-square rounded-md text-left p-1.5 border transition-colors ${
                    isSel
                      ? "border-[var(--acid)] bg-[var(--acid)]/5"
                      : "border-transparent hover:border-[#333] hover:bg-[#121214]"
                  } ${!isCurrent ? "opacity-30" : ""}`}
                >
                  <div className={`font-mono text-xs ${isToday ? "text-[var(--acid)] font-bold" : "text-[#F2F2F2]"}`}>{format(d, "d")}</div>
                  <div className="flex gap-0.5 mt-1 flex-wrap">
                    {items.slice(0, 3).map((it, idx) => (
                      <span
                        key={idx}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: it.type === "done" ? "#00FFAA" : it.type === "rev" ? "#00E5FF" : "var(--acid)",
                        }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1f1f22] rounded-xl p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717A]">Selected</div>
          <div className="font-display text-2xl mt-1">{format(selected, "EEE, MMM d")}</div>
          <div className="mt-4 space-y-2">
            {selectedItems.length === 0 ? (
              <div className="text-sm text-[#71717A]">Nothing scheduled.</div>
            ) : (
              selectedItems.map((it, idx) => (
                <div key={idx} className="flex items-start gap-2 py-2 border-b border-[#1f1f22] last:border-0">
                  <span
                    className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: it.type === "done" ? "#00FFAA" : it.type === "rev" ? "#00E5FF" : "var(--acid)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#F2F2F2]">
                      {it.type === "rev" ? "Revision" : it.data.title}
                    </div>
                    <div className="font-mono text-[11px] text-[#71717A]">
                      {it.type.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
