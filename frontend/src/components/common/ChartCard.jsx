export default function ChartCard({ title, subtitle, action, height = "h-56", children }) {
  return (
    <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50">{title}</h3>
          {subtitle && <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={`mt-4 ${height}`}>{children}</div>
    </div>
  );
}
