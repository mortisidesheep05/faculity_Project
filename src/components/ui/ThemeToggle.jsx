import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-800 dark:text-slate-200"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
