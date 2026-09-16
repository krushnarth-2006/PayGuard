import { useEffect, useState } from "react";
import { TrendingUp, Activity } from "lucide-react";
import DriftAlert from "../../components/common/DriftAlert";
import LoadingState from "../../components/common/LoadingState";
import StatusIndicator from "../../components/common/StatusIndicator";
import { getDriftReport } from "../../data/mockApi";

function formatDetectedAt(iso) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function StatusPill({ status }) {
  const isDrift = status === "Drift";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-medium ${
        isDrift
          ? "bg-review-100 text-review-600 border-review-500/20 dark:bg-review-500/10 dark:text-review-dark dark:border-review-500/25"
          : "bg-safe-100 text-safe-600 border-safe-500/20 dark:bg-safe-500/10 dark:text-safe-dark dark:border-safe-500/25"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export default function DriftMonitoring() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    let active = true;
    getDriftReport().then((res) => {
      if (active) {
        setReport(res);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <LoadingState rows={1} className="h-24" />
        <LoadingState rows={1} className="h-64" />
      </div>
    );
  }

  const allFeatures = [...report.affectedFeatures, ...report.stableFeatures];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">Model health</h2>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            Tracks whether recent transaction patterns diverge from the model's training baseline.
          </p>
        </div>
        <StatusIndicator
          label={report.monitoringActive ? "Monitoring active" : "Monitoring paused"}
          tone={report.monitoringActive ? "active" : "neutral"}
          className="mt-1.5"
        />
      </div>

      <DriftAlert
        detected={report.status === "DRIFT_DETECTED"}
        summary={report.summary}
        checkedAt={formatDetectedAt(report.detectedAt)}
      />

      <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-200 dark:border-ink-700 flex items-center gap-2">
          <TrendingUp size={16} className="text-ink-600 dark:text-ink-300" />
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50">Feature drift</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-500 dark:text-ink-400 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Feature</th>
                <th className="px-5 py-3 font-medium">Baseline</th>
                <th className="px-5 py-3 font-medium">Current</th>
                <th className="px-5 py-3 font-medium">Change</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((f) => (
                <tr key={f.feature} className="border-t border-ink-100 dark:border-ink-800">
                  <td className="px-5 py-3 text-ink-900 dark:text-ink-50 font-medium">{f.feature}</td>
                  <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{f.baseline ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{f.current ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`font-mono text-xs font-medium ${
                        f.status === "Drift" ? "text-review-600 dark:text-review-dark" : "text-ink-500 dark:text-ink-400"
                      }`}
                    >
                      +{(f.change * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill status={f.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark p-5 flex items-start gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 flex-shrink-0">
          <Activity size={15} />
        </span>
        <p className="text-xs text-ink-500 dark:text-ink-400 pt-1.5">
          This is a frontend visualization only. Drift is calculated by PayGuard's existing monitoring
          service — this page will display live values once connected to the real backend.
        </p>
      </div>
    </div>
  );
}
