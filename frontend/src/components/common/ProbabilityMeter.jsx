import { RISK_THRESHOLDS } from "../../data/sampleData";

const TONE_COLOR = {
  LOW: "bg-safe-500",
  MEDIUM: "bg-review-500",
  HIGH: "bg-danger-500",
};

export default function ProbabilityMeter({ probability, riskLevel, className = "" }) {
  const pct = Math.max(0, Math.min(100, probability * 100));
  const lowMax = RISK_THRESHOLDS.LOW_MAX * 100;
  const mediumMax = RISK_THRESHOLDS.MEDIUM_MAX * 100;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-ink-500 dark:text-ink-400">Fraud probability</span>
        <span className="text-xs font-mono text-ink-700 dark:text-ink-300">{pct.toFixed(1)}%</span>
      </div>

      <div
        role="img"
        aria-label={`Fraud probability ${pct.toFixed(1)} percent, classified as ${riskLevel.toLowerCase()} risk`}
        className="relative h-2 rounded-pill bg-ink-100 dark:bg-ink-800 overflow-hidden"
      >
        {/* Threshold zone dividers */}
        <div
          className="absolute inset-y-0 w-px bg-ink-50 dark:bg-ink-950"
          style={{ left: `${lowMax}%` }}
        />
        <div
          className="absolute inset-y-0 w-px bg-ink-50 dark:bg-ink-950"
          style={{ left: `${mediumMax}%` }}
        />
        <div
          className={`absolute inset-y-0 left-0 rounded-pill transition-all duration-500 ${TONE_COLOR[riskLevel]}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between mt-1 text-[11px] text-ink-400 dark:text-ink-500">
        <span>0%</span>
        <span>{lowMax.toFixed(0)}%</span>
        <span>{mediumMax.toFixed(0)}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
