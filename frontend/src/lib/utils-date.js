import {
  differenceInCalendarDays,
  format,
  isToday,
  isTomorrow,
  isPast,
  parseISO,
} from "date-fns";

export function daysRemainingLabel(dueDate, status) {
  if (status === "completed") return { label: "Completed", tone: "success" };
  if (!dueDate) return { label: "No due date", tone: "muted" };
  const d = parseISO(dueDate);
  if (isToday(d)) return { label: "Due Today", tone: "warning" };
  if (isTomorrow(d)) return { label: "Tomorrow", tone: "info" };
  const diff = differenceInCalendarDays(d, new Date());
  if (diff < 0) return { label: `Overdue by ${Math.abs(diff)}d`, tone: "danger" };
  if (diff < 7) return { label: `${diff} days left`, tone: "muted" };
  const weeks = Math.floor(diff / 7);
  return { label: `${weeks}w left`, tone: "muted" };
}

export function fmtDate(iso, pattern = "MMM d, yyyy") {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return "—";
  }
}
