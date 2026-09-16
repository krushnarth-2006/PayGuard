import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ScanLine, TriangleAlert, History, ArrowRight, ArrowUpRight } from "lucide-react";
import MetricCard from "../../components/common/MetricCard";
import RiskBadge from "../../components/common/RiskBadge";
import EmptyState from "../../components/common/EmptyState";
import LoadingState from "../../components/common/LoadingState";
import StatusIndicator from "../../components/common/StatusIndicator";
import TransactionTable from "../../components/transaction/TransactionTable";
import { getCustomerOverview } from "../../data/mockApi";
import { useAuth } from "../../context/AuthContext";

const money = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const date = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

export default function Overview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const load = () => { setLoading(true); getCustomerOverview().then((res) => { setData(res); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const columns = [
    { key: "id", header: "Transaction", render: (t) => <span className="font-mono text-xs text-ink-700 dark:text-ink-300">{t.id}</span> },
    { key: "amount", header: "Amount", render: (t) => <span className="font-medium text-ink-900 dark:text-ink-50">{money(t.amount)}</span> },
    { key: "date", header: "Date", render: (t) => <span className="text-ink-500 dark:text-ink-400">{date(t.date)}</span> },
    { key: "status", header: "Status", render: (t) => <span className="text-ink-700 dark:text-ink-200">{t.status}</span> },
    { key: "riskLevel", header: "Risk", render: (t) => <RiskBadge level={t.riskLevel} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300 font-semibold">Customer security center</p>
          <h2 className="text-2xl font-semibold text-ink-900 dark:text-ink-50 mt-1">{greeting()}, {user?.name || "Customer"}</h2>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Your payment security is active and ready.</p>
        </div>
        <StatusIndicator label="Protection active" tone="active" className="mt-1.5" />
      </div>

      <div className="rounded-card bg-ink-900 dark:bg-ink-850 border border-ink-900 dark:border-ink-700 shadow-panel dark:shadow-panel-dark p-6 lg:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/20 text-accent-300 flex-shrink-0"><ShieldCheck size={24} /></span>
          <div><p className="text-xs uppercase tracking-wide text-ink-300">Security status</p><p className="text-xl font-semibold text-white mt-0.5">Protected</p><p className="text-sm text-ink-300 mt-0.5">Real-time transaction monitoring is ready.</p></div>
        </div>
        <Link to="/check-transaction" className="inline-flex items-center justify-center gap-2 rounded-chip bg-white text-ink-900 px-4 py-2.5 text-sm font-semibold hover:bg-ink-100 transition-colors">Check a payment <ArrowUpRight size={15} /></Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? <LoadingState rows={3} className="h-[104px]" /> : <>
          <MetricCard icon={ScanLine} label="Transactions Checked" value={data.stats.transactionsChecked} sublabel="Including recent checks" tone="accent" />
          <MetricCard icon={ShieldCheck} label="Transactions Protected" value={data.stats.transactionsProtected} sublabel="Cleared automatically" tone="safe" />
          <MetricCard icon={TriangleAlert} label="Requiring Review" value={data.stats.transactionsForReview} sublabel="Medium-risk payments" tone="review" />
        </>}
      </div>

      <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200 dark:border-ink-700"><div><h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50">Recent activity</h3><p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">Your latest payment risk assessments</p></div><Link to="/transaction-history" className="text-sm text-accent-600 dark:text-accent-300 font-medium inline-flex items-center gap-1">View all <ArrowRight size={14} /></Link></div>
        {loading ? <div className="p-5"><LoadingState rows={4} /></div> : data.recentTransactions.length === 0 ? <EmptyState icon={History} title="No transactions yet" description="Check your first payment to see its assessment here." /> : <TransactionTable columns={columns} rows={data.recentTransactions} />}
      </div>
    </div>
  );
}
