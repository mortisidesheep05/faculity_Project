import { NavLink } from "react-router-dom";
import { LayoutDashboard, CalendarPlus, LogOut } from "lucide-react";
import useAuthStore from "../../store/authStore";

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen flex flex-col transition-colors">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">Faculty Portal</h2>
        <div className="mt-4 flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-white">
            {user?.name}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {user?.role}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        {user?.role === "Faculty" && (
          <NavLink
            to="/events/new"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`
            }
          >
            <CalendarPlus size={20} />
            <span>New Event</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
