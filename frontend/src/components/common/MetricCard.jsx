const TONE_STYLES = {
  neutral: "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200",
  accent: "bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300",
  safe: "bg-safe-100 text-safe-600 dark:bg-safe-500/15 dark:text-safe-dark",
  review: "bg-review-100 text-review-600 dark:bg-review-500/15 dark:text-review-dark",
  danger: "bg-danger-100 text-danger-600 dark:bg-danger-500/15 dark:text-danger-dark",
};

export default function MetricCard({ icon: Icon, label, value, sublabel, tone = "neutral", emphasize = false }) {
  return (
    <div
      className={`rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark p-5 flex flex-col gap-3 animate-rise ${
        emphasize ? "ring-1 ring-accent-500/25" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-500 dark:text-ink-400">{label}</span>
        {Icon && (
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${TONE_STYLES[tone]}`}>
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
      </div>
      <div className={`font-semibold tracking-tight text-ink-900 dark:text-ink-50 ${emphasize ? "text-3xl" : "text-2xl"}`}>
        {value}
      </div>
      {sublabel && <div className="text-xs text-ink-500 dark:text-ink-400">{sublabel}</div>}
    </div>
  );
}
