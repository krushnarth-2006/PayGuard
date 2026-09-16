import { Check, Loader2 } from "lucide-react";

const STEPS = [
  "Validating transaction",
  "Checking transaction behavior",
  "Assessing payment risk",
  "Generating security result",
];

export default function AnalyzingState({ stepIndex }) {
  return (
    <div className="max-w-md mx-auto py-16">
      <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 dark:bg-accent-500/15 text-accent-600 dark:text-accent-300">
            <Loader2 size={18} className="animate-spin" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink-900 dark:text-ink-50">Analyzing Payment</h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">This usually takes a moment.</p>
          </div>
        </div>

        <ul className="space-y-3.5">
          {STEPS.map((step, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0 transition-colors ${
                    done
                      ? "bg-safe-500 text-white animate-check-pop"
                      : current
                      ? "border-2 border-accent-500 text-transparent"
                      : "border-2 border-ink-200 dark:border-ink-700 text-transparent"
                  }`}
                >
                  {done && <Check size={12} strokeWidth={3} />}
                  {current && <span className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-soft-pulse" />}
                </span>
                <span className={done || current ? "text-ink-900 dark:text-ink-50" : "text-ink-400 dark:text-ink-500"}>
                  {step}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
