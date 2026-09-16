import { useEffect, useState, useCallback } from "react";
import { Timer, Gauge, Zap, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import MetricCard from "../../components/common/MetricCard";
import ChartCard from "../../components/common/ChartCard";
import LoadingState from "../../components/common/LoadingState";
import StatusIndicator from "../../components/common/StatusIndicator";
import { getPerformanceMetrics } from "../../data/mockApi";

const gridProps = { stroke: "#8892A0", strokeOpacity: 0.18, vertical: false };
const tickProps = { fontSize: 11, fill: "#8892A0" };

function statusTone(status) {
  return status >= 500 ? "text-danger-600 dark:text-danger-dark" : "text-safe-600 dark:text-safe-dark";
}

export default function Performance() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    getPerformanceMetrics().then((res) => {
      setData(res);
      setLoading(false);
      setSecondsAgo(0);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">System performance</h2>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">API latency and throughput for the prediction service.</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusIndicator label={`Last updated ${secondsAgo}s ago`} tone="neutral" pulse={false} />
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-chip border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-200 text-xs font-medium px-2.5 py-1.5 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          >
            <RotateCcw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState rows={2} className="h-[104px]" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard icon={Timer} label="Average Latency" value={`${data.avgLatencyMs} ms`} tone="accent" />
          <MetricCard icon={Gauge} label="P95 Latency" value={`${data.p95LatencyMs} ms`} tone="accent" />
          <MetricCard icon={Zap} label="Throughput" value={`${data.throughputPerMin}/min`} sublabel="Predictions processed" tone="neutral" />
        </div>
      )}

      {!loading && (
        <>
          <ChartCard title="Latency, last 24 hours" subtitle="Average vs. P95 response time" height="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.latency} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="hour" tick={tickProps} interval={3} />
                <YAxis tick={tickProps} unit="ms" />
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} />
                <Line type="monotone" dataKey="avgLatency" name="Average" stroke="#158F79" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p95Latency" name="P95" stroke="#B4790E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark overflow-hidden">
            <div className="px-5 py-4 border-b border-ink-200 dark:border-ink-700">
              <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50">Recent API activity</h3>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">Latest calls to the prediction service</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-500 dark:text-ink-400 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 font-medium">Request</th>
                    <th className="px-5 py-3 font-medium">Endpoint</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Latency</th>
                    <th className="px-5 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentActivity.map((r) => (
                    <tr key={r.id} className="border-t border-ink-100 dark:border-ink-800">
                      <td className="px-5 py-3 font-mono text-xs text-ink-600 dark:text-ink-300">{r.id}</td>
                      <td className="px-5 py-3 font-mono text-xs text-ink-700 dark:text-ink-200">{r.endpoint}</td>
                      <td className={`px-5 py-3 font-medium ${statusTone(r.status)}`}>{r.status}</td>
                      <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{r.latencyMs} ms</td>
                      <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
