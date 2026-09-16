const STYLES = {
  LOW: "bg-safe-100 text-safe-600 border-safe-500/20 dark:bg-safe-500/10 dark:text-safe-dark dark:border-safe-500/25",
  MEDIUM: "bg-review-100 text-review-600 border-review-500/20 dark:bg-review-500/10 dark:text-review-dark dark:border-review-500/25",
  HIGH: "bg-danger-100 text-danger-600 border-danger-500/20 dark:bg-danger-500/10 dark:text-danger-dark dark:border-danger-500/25",
};

const LABELS = {
  LOW: "Low risk",
  MEDIUM: "Medium risk",
  HIGH: "High risk",
};

export default function RiskBadge({ level, className = "" }) {
  const style = STYLES[level] || STYLES.LOW;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-medium ${style} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {LABELS[level] || level}
    </span>
  );
}
