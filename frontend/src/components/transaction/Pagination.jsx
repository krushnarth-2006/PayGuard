import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-ink-100 dark:border-ink-800 text-sm">
      <span className="text-ink-500 dark:text-ink-400">
        {total === 0 ? "No results" : `${start}–${end} of ${total.toLocaleString("en-IN")}`}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-chip border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-ink-100 dark:hover:enabled:bg-ink-800 transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-ink-600 dark:text-ink-300 text-xs px-1">
          Page {page} of {totalPages}
        </span>
        <button
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-chip border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-ink-100 dark:hover:enabled:bg-ink-800 transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
