import { ChevronUp, ChevronDown } from "lucide-react";

/**
 * Generic table for transaction-shaped data. `columns` is an array of:
 *   { key, header, render(row), sortable, align }
 * `sortBy`/`sortDir`/`onSort` are optional — omit to render a plain table.
 */
export default function TransactionTable({
  columns,
  rows,
  onRowClick,
  sortBy,
  sortDir,
  onSort,
  rowKey = "id",
  highlightRow,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink-500 dark:text-ink-400 text-xs uppercase tracking-wide">
            {columns.map((col) => (
              <th key={col.key} className={`px-5 py-3 font-medium ${col.align === "right" ? "text-right" : ""}`}>
                {col.sortable && onSort ? (
                  <button
                    onClick={() => onSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-ink-800 dark:hover:text-ink-100 transition-colors"
                  >
                    {col.header}
                    {sortBy === col.key &&
                      (sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isHighlighted = highlightRow?.(row);
            return (
              <tr
                key={row[rowKey]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-t border-ink-100 dark:border-ink-800 transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-800/60" : ""
                } ${isHighlighted ? "bg-danger-100/40 dark:bg-danger-500/5" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-3 ${col.align === "right" ? "text-right" : ""}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
