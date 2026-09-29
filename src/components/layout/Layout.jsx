import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "../ui/ThemeToggle";

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-end px-6 transition-colors">
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
