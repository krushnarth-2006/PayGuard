import { TriangleAlert, CircleCheckBig } from "lucide-react";

export default function DriftAlert({ detected, summary, checkedAt }) {
  return (
    <div
      className={`rounded-card border shadow-panel dark:shadow-panel-dark p-6 flex items-start gap-4 ${
        detected
          ? "border-review-500/25 bg-review-100/70 dark:bg-review-500/10 dark:border-review-500/25"
          : "border-safe-500/25 bg-safe-100/70 dark:bg-safe-500/10 dark:border-safe-500/25"
      }`}
    >
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full flex-shrink-0 ${
          detected
            ? "bg-review-500/15 text-review-600 dark:text-review-dark"
            : "bg-safe-500/15 text-safe-600 dark:text-safe-dark"
        }`}
      >
        {detected ? <TriangleAlert size={22} /> : <CircleCheckBig size={22} />}
      </span>
      <div>
        <h3
          className={`text-sm font-semibold ${
            detected ? "text-review-600 dark:text-review-dark" : "text-safe-600 dark:text-safe-dark"
          }`}
        >
          {detected ? "Drift detected" : "No drift detected"}
        </h3>
        <p className="text-sm text-ink-700 dark:text-ink-200 mt-1">{summary}</p>
        {checkedAt && <p className="text-xs text-ink-500 dark:text-ink-400 mt-2">Last checked {checkedAt}</p>}
      </div>
    </div>
  );
}
