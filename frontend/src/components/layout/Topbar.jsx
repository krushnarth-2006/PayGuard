import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, ChevronDown, ShieldCheck } from "lucide-react";
import NotificationBell from "../common/NotificationBell";
import ThemeToggle from "../common/ThemeToggle";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = () => {
    logout();
    navigate(isAdmin ? "/admin/login" : "/login", { replace: true });
  };

  return (
    <header className="h-16 border-b border-ink-200 dark:border-ink-700 bg-white/90 dark:bg-ink-900/90 backdrop-blur sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <button aria-label="Open navigation" onClick={onMenuClick} className="lg:hidden text-ink-600 dark:text-ink-300 p-1">
          <Menu size={22} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-ink-900 dark:text-ink-50 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-ink-500 dark:text-ink-400 truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <NotificationBell />
        <div className="relative ml-1" ref={ref}>
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-pill border border-ink-200 dark:border-ink-700 pl-2 pr-2.5 py-1.5 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
            <span className="h-7 w-7 rounded-full bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 flex items-center justify-center text-xs font-semibold">
              {user?.name?.slice(0, 2).toUpperCase() || "PG"}
            </span>
            <span className="text-sm text-ink-800 dark:text-ink-100 hidden sm:inline max-w-32 truncate">{user?.name || "User"}</span>
            <ChevronDown size={14} className="text-ink-500 dark:text-ink-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-card border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-850 shadow-panel dark:shadow-panel-dark py-1.5 animate-rise z-30">
              <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-accent-600 dark:text-accent-300" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-400">{isAdmin ? "Administrator" : "Customer"}</span>
                </div>
                <p className="text-sm font-medium text-ink-900 dark:text-ink-50 mt-1">{user?.name}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger-600 dark:text-danger-dark hover:bg-danger-100/60 dark:hover:bg-danger-500/10 transition-colors">
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
