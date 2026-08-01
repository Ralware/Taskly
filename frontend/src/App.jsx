import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { QuickAddFab } from "@/components/QuickAddFab";
import { TaskDialog } from "@/components/TaskDialog";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useStore } from "@/store/store";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const TodayTasks = lazy(() => import("@/pages/TodayTasks"));
const AllTasks = lazy(() => import("@/pages/AllTasks"));
const Completed = lazy(() => import("@/pages/Completed"));
const Categories = lazy(() => import("@/pages/Categories"));
const CalendarPage = lazy(() => import("@/pages/CalendarPage"));
const Statistics = lazy(() => import("@/pages/Statistics"));
const Notes = lazy(() => import("@/pages/Notes"));
const Projects = lazy(() => import("@/pages/Projects"));
const Settings = lazy(() => import("@/pages/Settings"));
const Backup = lazy(() => import("@/pages/Backup"));

function Shell() {
  const loadAll = useStore((s) => s.loadAll);
  useEffect(() => {
    loadAll();
    // register service worker (progressive enhancement)
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, [loadAll]);

  return (
    <div className="app-shell min-h-screen bg-black p-6 text-[#F2F2F2] md:flex md:gap-6">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <main className="app-main-content flex-1 min-w-0 w-full overflow-x-hidden">
          <Suspense fallback={<div className="p-8 text-[#71717A]">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/today" element={<TodayTasks />} />
              <Route path="/all" element={<AllTasks />} />
              <Route path="/completed" element={<Completed />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/stats" element={<Statistics />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/backup" element={<Backup />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <QuickAddFab />
      <TaskDialog />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Shell />
      </ThemeProvider>
    </BrowserRouter>
  );
}
