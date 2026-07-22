import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { QuickAddFab } from "@/components/QuickAddFab";
import { TaskDialog } from "@/components/TaskDialog";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useStore } from "@/store/store";

import Dashboard from "@/pages/Dashboard";
import TodayTasks from "@/pages/TodayTasks";
import AllTasks from "@/pages/AllTasks";
import Completed from "@/pages/Completed";
import RevisionPlanner from "@/pages/RevisionPlanner";
import Categories from "@/pages/Categories";
import CalendarPage from "@/pages/CalendarPage";
import Statistics from "@/pages/Statistics";
import Notes from "@/pages/Notes";
import Projects from "@/pages/Projects";
import Settings from "@/pages/Settings";
import Backup from "@/pages/Backup";

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
    <div className="min-h-screen flex bg-black text-[#F2F2F2]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/today" element={<TodayTasks />} />
            <Route path="/all" element={<AllTasks />} />
            <Route path="/completed" element={<Completed />} />
            <Route path="/revisions" element={<RevisionPlanner />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/backup" element={<Backup />} />
          </Routes>
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
