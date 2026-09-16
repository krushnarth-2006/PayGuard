import { useEffect, useRef, useState } from "react";
import { Bell, TriangleAlert, CircleCheck, Info } from "lucide-react";
import { getNotifications } from "../../data/mockApi";

const ICONS = {
  alert: { icon: TriangleAlert, cls: "text-review-600 dark:text-review-dark bg-review-100 dark:bg-review-500/15" },
  success: { icon: CircleCheck, cls: "text-safe-600 dark:text-safe-dark bg-safe-100 dark:bg-safe-500/15" },
  info: { icon: Info, cls: "text-accent-600 dark:text-accent-300 bg-accent-100 dark:bg-accent-500/15" },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    getNotifications().then((res) => setNotifications(res.notifications));
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={`Notifications${notifications.length ? `, ${notifications.length} unread` : ""}`}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 border border-white dark:border-ink-850" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-card border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-850 shadow-panel dark:shadow-panel-dark py-1.5 animate-rise z-30">
          <div className="px-4 py-2.5 border-b border-ink-100 dark:border-ink-800">
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">Notifications</p>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notifications.map((n) => {
              const cfg = ICONS[n.type] || ICONS.info;
              const Icon = cfg.icon;
              return (
                <li key={n.id} className="px-4 py-3 flex gap-3 border-b border-ink-50 dark:border-ink-800 last:border-b-0">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0 ${cfg.cls}`}>
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 dark:text-ink-50">{n.title}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{n.detail}</p>
                    <p className="text-[11px] text-ink-400 dark:text-ink-500 mt-1">{n.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
