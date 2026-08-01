import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, FolderKanban, LayoutDashboard, Layers, ListTodo, Menu, Settings as SettingsIcon, StickyNote, Sun, X } from "lucide-react";

const SIDEBAR_KEY = "taskly-sidebar-collapsed";
const NAV_LINKS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/today", label: "Today's Tasks", icon: Sun, testid: "nav-today" },
  { to: "/all", label: "All Tasks", icon: ListTodo, testid: "nav-all" },
  { to: "/completed", label: "Completed", icon: CheckCircle2, testid: "nav-completed" },
  { to: "/categories", label: "Categories", icon: FolderKanban, testid: "nav-categories" },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, testid: "nav-calendar" },
  { to: "/stats", label: "Statistics", icon: BarChart3, testid: "nav-stats" },
  { to: "/notes", label: "Notes", icon: StickyNote, testid: "nav-notes" },
  { to: "/projects", label: "Projects", icon: Layers, testid: "nav-projects" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, testid: "nav-settings" },
];

function getInitialCollapsed() {
  try { return localStorage.getItem(SIDEBAR_KEY) === "true"; } catch { return false; }
}

function Navigation({ collapsed, onNavigate }) {
  return <nav className="floating-sidebar-nav" aria-label="Primary navigation">
    {NAV_LINKS.map(({ to, label, icon: Icon, testid }) => <NavLink key={to} to={to} end={to === "/"} onClick={onNavigate} title={collapsed ? label : undefined} data-testid={testid} className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""} ${collapsed ? "sidebar-link-collapsed" : ""}`}>
      <span className="sidebar-icon-tile"><Icon strokeWidth={1.8} className="h-5 w-5 shrink-0" aria-hidden="true" /></span>
      <span className={`sidebar-label ${collapsed ? "sidebar-label-collapsed" : ""}`}>{label}</span>
    </NavLink>)}
  </nav>;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { try { localStorage.setItem(SIDEBAR_KEY, String(collapsed)); } catch { /* non-persistent fallback */ } }, [collapsed]);

  return <>
    <button type="button" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)} className="fixed left-4 top-4 z-40 inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acid)] md:hidden"><Menu className="h-5 w-5" /></button>
    {mobileOpen && <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/40 md:hidden" />}
    <aside data-testid="sidebar" className={`floating-sidebar fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 md:flex md:w-[72px] ${collapsed ? "sidebar-collapsed lg:w-[72px]" : "lg:w-[220px]"}`}>
      <Navigation collapsed={collapsed} />
      <button type="button" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} aria-pressed={collapsed} onClick={() => setCollapsed((value) => !value)} className="sidebar-collapse-control absolute -right-3 top-3 hidden lg:flex">
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </aside>
    <aside aria-hidden={!mobileOpen} className={`floating-sidebar fixed bottom-auto left-4 top-1/2 z-50 flex w-64 -translate-y-1/2 transition-transform duration-200 ease-out md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-[120%]"}`}>
      <Navigation collapsed={false} onNavigate={() => setMobileOpen(false)} />
      <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acid)]"><X className="h-4 w-4" /></button>
    </aside>
  </>;
}
