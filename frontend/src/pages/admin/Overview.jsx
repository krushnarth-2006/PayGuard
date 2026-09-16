import { useEffect, useState } from "react";
import {
  ListChecks,
  ShieldAlert,
  ShieldCheck,
  Percent,
  Timer,
  Gauge,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import MetricCard from "../../components/common/MetricCard";
import ChartCard from "../../components/common/ChartCard";
import LoadingState from "../../components/common/LoadingState";
import StatusIndicator from "../../components/common/StatusIndicator";
import { getAdminSummary, getAdminAnalytics } from "../../data/mockApi";

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([getAdminSummary(), getAdminAnalytics()]).then(([s, a]) => {
      if (active) {
        setSummary(s);
        setTrend(a.trend);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">System overview</h2>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Fraud detection performance across the whole platform.</p>
        </div>
        <StatusIndicator label="Monitoring active" tone="active" className="mt-1.5" />
      </div>

      {loading ? (
        <LoadingState rows={2} className="h-[104px]" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard icon={ListChecks} label="Total Transactions" value={summary.totalTransactions.toLocaleString("en-IN")} tone="neutral" />
          <MetricCard icon={ShieldAlert} label="Fraud Predictions" value={summary.fraudPredictions.toLocaleString("en-IN")} tone="danger" emphasize />
          <MetricCard icon={ShieldCheck} label="Legitimate Predictions" value={summary.legitimatePredictions.toLocaleString("en-IN")} tone="safe" />
          <MetricCard icon={Percent} label="Fraud Prediction Rate" value={`${(summary.fraudRate * 100).toFixed(2)}%`} tone="review" />
          <MetricCard icon={Timer} label="Average Latency" value={`${summary.avgLatencyMs} ms`} tone="accent" />
          <MetricCard icon={Gauge} label="P95 Latency" value={`${summary.p95LatencyMs} ms`} tone="accent" />
        </div>
      )}

      {!loading && (
        <ChartCard title="Fraud probability trend" subtitle="Average predicted probability, last 14 days" height="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="overviewProbGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#158F79" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#158F79" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="currentColor" className="text-ink-100 dark:text-ink-800" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "currentColor" }} className="text-ink-500 dark:text-ink-400" />
              <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11, fill: "currentColor" }} className="text-ink-500 dark:text-ink-400" />
              <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
              <Area type="monotone" dataKey="avgProbability" stroke="#158F79" fill="url(#overviewProbGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
