import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  History,
  Lock,
  Activity,
  ListChecks,
  LineChart,
  Gauge,
  GitBranch,
  X,
  LogOut,
} from "lucide-react";

import ShieldMark from "../common/ShieldMark";
import StatusIndicator from "../common/StatusIndicator";
import { useAuth } from "../../context/AuthContext";

const customerLinks = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  {
    to: "/check-transaction",
    label: "Check Transaction",
    icon: ShieldCheck,
  },
  {
    to: "/transaction-history",
    label: "Transaction History",
    icon: History,
  },
  { to: "/security", label: "Security", icon: Lock },
];

const adminLinks = [
  { to: "/admin/overview", label: "Overview", icon: Activity },
  {
    to: "/admin/transactions",
    label: "Transactions",
    icon: ListChecks,
  },
  {
    to: "/admin/risk-analytics",
    label: "Risk Analytics",
    icon: LineChart,
  },
  {
    to: "/admin/performance",
    label: "Performance",
    icon: Gauge,
  },
  {
    to: "/admin/drift-monitoring",
    label: "Drift Monitoring",
    icon: GitBranch,
  },
];

function NavSection({ title, links, onNavigate }) {
  return (
    <div>
      <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500 mb-1.5">
        {title}
      </p>

      <ul className="space-y-0.5">
        {links.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-chip px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent-500/10 text-accent-700 dark:text-accent-300 font-medium"
                    : "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-900 dark:hover:text-ink-50"
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "admin";

  const links = isAdmin ? adminLinks : customerLinks;
  const sectionTitle = isAdmin ? "Admin Console" : "Customer";

  const handleLogout = () => {
    logout();

    if (isAdmin) {
      navigate("/admin/login", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }

    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-white dark:bg-ink-900 border-r border-ink-200 dark:border-ink-700 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-ink-200 dark:border-ink-700">

          <div className="flex items-center gap-2.5">
            <ShieldMark size={26} />

            <div className="leading-tight">
              <span className="block font-semibold text-ink-900 dark:text-ink-50 tracking-tight text-sm">
                PayGuard
              </span>

              <span className="block text-[10px] text-ink-400 dark:text-ink-500">
                {isAdmin ? "Admin Console" : "Payment protection"}
              </span>
            </div>
          </div>

          <button
            aria-label="Close navigation"
            onClick={onClose}
            className="lg:hidden text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-50"
          >
            <X size={20} />
          </button>

        </div>


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">

          <NavSection
            title={sectionTitle}
            links={links}
            onNavigate={onClose}
          />

        </nav>


        {/* System Status */}
        <div className="px-4 py-3 border-t border-ink-200 dark:border-ink-700">
          <StatusIndicator
            label="All systems operational"
            tone="active"
          />
        </div>


        {/* User / Logout */}
        <div className="border-t border-ink-200 dark:border-ink-700 p-3">

          <div className="flex items-center gap-3 px-2 py-2 mb-2">

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-ink-100 dark:bg-ink-800 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-ink-700 dark:text-ink-200">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>

            {/* User information */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-900 dark:text-ink-50 truncate">
                {user?.name || "User"}
              </p>

              <p className="text-[11px] text-ink-400 dark:text-ink-500 truncate">
                {user?.email || ""}
              </p>
            </div>

          </div>


          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-chip px-3 py-2 text-sm text-ink-600 dark:text-ink-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={17} strokeWidth={2} />
            Sign out
          </button>

        </div>

      </aside>
    </>
  );
}