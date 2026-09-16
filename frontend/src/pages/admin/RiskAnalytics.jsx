import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "../../components/common/ChartCard";
import LoadingState from "../../components/common/LoadingState";
import { getAdminAnalytics } from "../../data/mockApi";

const RISK_COLORS = ["#1E9A5C", "#B4790E", "#C4392E"];
const PRED_COLORS = ["#1E9A5C", "#C4392E"];

const gridProps = { stroke: "#8892A0", strokeOpacity: 0.18, vertical: false };
const tickProps = { fontSize: 11, fill: "#8892A0" };

export default function RiskAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let active = true;
    getAdminAnalytics().then((res) => {
      if (active) {
        setAnalytics(res);
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
        <LoadingState rows={2} className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">Risk analytics</h2>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">How risk is trending and distributed across the platform.</p>
      </div>

      <ChartCard title="Fraud probability trend" subtitle="Average predicted probability, last 14 days" height="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analytics.trend} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="riskAnalyticsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#158F79" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#158F79" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" tick={tickProps} />
            <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={tickProps} />
            <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
            <Area type="monotone" dataKey="avgProbability" stroke="#158F79" fill="url(#riskAnalyticsGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Prediction distribution" subtitle="Legitimate vs. fraud, all-time">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={analytics.predictionDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                {analytics.predictionDistribution.map((_, i) => (
                  <Cell key={i} fill={PRED_COLORS[i % PRED_COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={24} />
              <Tooltip formatter={(v) => v.toLocaleString("en-IN")} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Risk level distribution" subtitle="Transactions bucketed by risk">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={analytics.riskDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                {analytics.riskDistribution.map((_, i) => (
                  <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={24} />
              <Tooltip formatter={(v) => v.toLocaleString("en-IN")} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Transaction volume" subtitle="Daily transactions, last 14 days">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.trend} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="date" tick={tickProps} />
              <YAxis tick={tickProps} />
              <Tooltip />
              <Bar dataKey="volume" fill="#158F79" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Latency trend" subtitle="Average vs. P95, last 24 hours">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.latency} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
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
      </div>
    </div>
  );
}
