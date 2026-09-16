export default function LoadingState({ rows = 4, className = "h-12" }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`rounded-chip bg-ink-100 dark:bg-ink-800 animate-pulse ${className}`} />
      ))}
    </div>
  );
}
