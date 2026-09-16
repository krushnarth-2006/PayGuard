export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-14 px-6">
      {Icon && (
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400">
          <Icon size={22} strokeWidth={1.8} />
        </span>
      )}
      <div>
        <p className="text-sm font-medium text-ink-900 dark:text-ink-50">{title}</p>
        {description && <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
