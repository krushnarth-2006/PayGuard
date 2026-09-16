import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorState({ title = "Couldn't load this data", description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-14 px-6">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 dark:bg-danger-500/15 text-danger-600 dark:text-danger-dark">
        <AlertTriangle size={22} strokeWidth={1.8} />
      </span>
      <div>
        <p className="text-sm font-medium text-ink-900 dark:text-ink-50">{title}</p>
        {description && <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 max-w-sm">{description}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-chip border border-ink-200 dark:border-ink-700 text-ink-800 dark:text-ink-100 text-sm font-medium px-3.5 py-2 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
        >
          <RotateCcw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
