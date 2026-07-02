import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sun,
  ListTodo,
  CheckCircle2,
  Repeat,
  FolderKanban,
  CalendarDays,
  BarChart3,
  StickyNote,
  Target,
  Settings as SettingsIcon,
  Database,
  Layers,
  Flame,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/today", label: "Today's Tasks", icon: Sun, testid: "nav-today" },
  { to: "/all", label: "All Tasks", icon: ListTodo, testid: "nav-all" },
  { to: "/completed", label: "Completed", icon: CheckCircle2, testid: "nav-completed" },
  { to: "/revisions", label: "Revision Planner", icon: Repeat, testid: "nav-revisions" },
  { to: "/categories", label: "Categories", icon: FolderKanban, testid: "nav-categories" },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, testid: "nav-calendar" },
  { to: "/stats", label: "Statistics", icon: BarChart3, testid: "nav-stats" },
  { to: "/notes", label: "Notes", icon: StickyNote, testid: "nav-notes" },
  { to: "/goals", label: "Goals", icon: Target, testid: "nav-goals" },
  { to: "/projects", label: "Projects", icon: Layers, testid: "nav-projects" },
  { to: "/habits", label: "Habits", icon: Flame, testid: "nav-habits" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, testid: "nav-settings" },
  { to: "/backup", label: "Backup", icon: Database, testid: "nav-backup" },
];

export function Sidebar() {
  return (
    <aside
      data-testid="sidebar"
      className="w-60 shrink-0 border-r border-[#1f1f22] bg-[#050505] sticky top-0 h-screen flex items-center"
    >
      <nav className="w-full px-3 py-4 space-y-0.5">
        {NAV_LINKS.map(({ to, label, icon: Icon, testid }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            data-testid={testid}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-[#121214] text-[#F2F2F2] border-l-2 border-[var(--acid)] pl-[10px]"
                  : "text-[#A1A1AA] hover:text-[#F2F2F2] hover:bg-[#0f0f11] border-l-2 border-transparent"
              }`
            }
          >
            <Icon strokeWidth={1.5} className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
