const TONE = {
  active: "text-safe-600 dark:text-safe-dark",
  neutral: "text-ink-500 dark:text-ink-400",
  warning: "text-review-600 dark:text-review-dark",
  danger: "text-danger-600 dark:text-danger-dark",
};

export default function StatusIndicator({ label, tone = "active", pulse = true, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${TONE[tone]} ${className}`}>
      <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
        {pulse && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60 animate-soft-pulse" />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {label}
    </span>
  );
}
