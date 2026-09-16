import { ShieldCheck, TriangleAlert, ShieldAlert, Hash, Clock, RotateCcw } from "lucide-react";
import ProbabilityMeter from "../common/ProbabilityMeter";
import RiskBadge from "../common/RiskBadge";

const COPY = {
  LOW: {
    icon: ShieldCheck,
    heading: "Low risk",
    message: "This transaction appears safe.",
    guidance: null,
  },
  MEDIUM: {
    icon: TriangleAlert,
    heading: "Medium risk",
    message: "This transaction requires additional verification.",
    guidance: "Consider double-checking the recipient before proceeding.",
  },
  HIGH: {
    icon: ShieldAlert,
    heading: "High risk",
    message: "This transaction appears suspicious.",
    guidance: "Please verify the payment details before proceeding.",
  },
};

const TONE = {
  LOW: {
    panel: "border-safe-500/25 bg-safe-100/60 dark:bg-safe-500/5 dark:border-safe-500/25",
    iconBg: "bg-safe-500/15 text-safe-600 dark:text-safe-dark",
    heading: "text-safe-600 dark:text-safe-dark",
  },
  MEDIUM: {
    panel: "border-review-500/25 bg-review-100/60 dark:bg-review-500/5 dark:border-review-500/25",
    iconBg: "bg-review-500/15 text-review-600 dark:text-review-dark",
    heading: "text-review-600 dark:text-review-dark",
  },
  HIGH: {
    panel: "border-danger-500/25 bg-danger-100/60 dark:bg-danger-500/5 dark:border-danger-500/25",
    iconBg: "bg-danger-500/15 text-danger-600 dark:text-danger-dark",
    heading: "text-danger-600 dark:text-danger-dark",
  },
};

export default function TransactionResult({ result, onReset }) {
  const level = result.risk_level;
  const copy = COPY[level] || COPY.LOW;
  const tone = TONE[level] || TONE.LOW;
  const Icon = copy.icon;

  return (
    <div className="max-w-md mx-auto py-6">
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-500 mb-4">
        Payment risk assessment
      </p>

      <div className={`rounded-card border shadow-panel dark:shadow-panel-dark p-8 text-center animate-rise ${tone.panel}`}>
        <span className={`inline-flex h-14 w-14 items-center justify-center rounded-full mb-4 ${tone.iconBg}`}>
          <Icon size={28} />
        </span>
        <h2 className={`text-lg font-bold tracking-wide uppercase ${tone.heading}`}>{copy.heading}</h2>

        <div className="mt-5 mb-1">
          <p className="text-4xl font-bold text-ink-900 dark:text-ink-50 tabular-nums">
            {(result.fraud_probability * 100).toFixed(1)}%
          </p>
          <p className="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400 mt-1">Fraud probability</p>
        </div>

        <ProbabilityMeter probability={result.fraud_probability} riskLevel={level} className="mt-5 text-left" />

        <div className="mt-6 grid grid-cols-2 gap-4 text-left">
          <div className="rounded-chip bg-white/70 dark:bg-ink-900/40 border border-ink-200/70 dark:border-ink-700 p-4">
            <p className="text-xs text-ink-500 dark:text-ink-400">Decision</p>
            <p className="text-lg font-semibold text-ink-900 dark:text-ink-50 mt-1">{result.prediction}</p>
          </div>
          <div className="rounded-chip bg-white/70 dark:bg-ink-900/40 border border-ink-200/70 dark:border-ink-700 p-4">
            <p className="text-xs text-ink-500 dark:text-ink-400">Risk level</p>
            <p className="text-lg font-semibold text-ink-900 dark:text-ink-50 mt-1">
              <RiskBadge level={level} />
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-ink-500 dark:text-ink-400 rounded-chip bg-white/70 dark:bg-ink-900/40 border border-ink-200/70 dark:border-ink-700 px-4 py-3">
          <span className="inline-flex items-center gap-1.5 font-mono">
            <Hash size={13} /> {result.transaction_id || result.id}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} /> {result.response_time_ms ?? result.latencyMs ?? "—"} ms
          </span>
        </div>

        <p className="mt-5 text-sm text-ink-700 dark:text-ink-200">{copy.message}</p>
        {copy.guidance && <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">{copy.guidance}</p>}

        <button
          onClick={onReset}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-chip bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 text-sm font-medium py-2.5 hover:bg-ink-800 dark:hover:bg-white transition-colors"
        >
          <RotateCcw size={15} />
          Check Another Payment
        </button>
      </div>
    </div>
  );
}
