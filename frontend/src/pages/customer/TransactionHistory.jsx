import { useEffect, useMemo, useState } from "react";
import { Search, History, RefreshCw } from "lucide-react";
import RiskBadge from "../../components/common/RiskBadge";
import EmptyState from "../../components/common/EmptyState";
import LoadingState from "../../components/common/LoadingState";
import TransactionTable from "../../components/transaction/TransactionTable";
import TransactionDetailDrawer from "../../components/transaction/TransactionDetailDrawer";
import { getCustomerTransactions } from "../../data/mockApi";

const money = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const dt = (iso) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const FILTERS = ["All", "Safe", "Review", "High risk"];

export default function TransactionHistory() {
  const [loading, setLoading] = useState(true); const [transactions, setTransactions] = useState([]);
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("All"); const [sortBy, setSortBy] = useState("date"); const [sortDir, setSortDir] = useState("desc"); const [selected, setSelected] = useState(null);
  const load = () => { setLoading(true); getCustomerTransactions().then((res) => { setTransactions(res.transactions); setLoading(false); }); };
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...transactions].filter((t) => (!q || `${t.id} ${t.category} ${t.merchant}`.toLowerCase().includes(q)) && (filter === "All" || t.status === filter)).sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1; const av = sortBy === "amount" ? a.amount : sortBy === "probability" ? a.probability : new Date(a.date).getTime(); const bv = sortBy === "amount" ? b.amount : sortBy === "probability" ? b.probability : new Date(b.date).getTime(); return (av - bv) * dir;
    });
  }, [transactions, query, filter, sortBy, sortDir]);
  const sort = (key) => { if (sortBy === key) setSortDir((d) => d === "asc" ? "desc" : "asc"); else { setSortBy(key); setSortDir("desc"); } };
  const columns = [
    { key: "id", header: "Transaction", render: (t) => <button onClick={() => setSelected(t)} className="font-mono text-xs text-accent-600 dark:text-accent-300 hover:underline">{t.id}</button> },
    { key: "date", header: "Date & time", sortable: true, render: (t) => <span className="text-ink-500 dark:text-ink-400">{dt(t.date)}</span> },
    { key: "amount", header: "Amount", sortable: true, render: (t) => <span className="font-medium text-ink-900 dark:text-ink-50">{money(t.amount)}</span> },
    { key: "paymentMethod", header: "Payment type", render: (t) => <span className="text-ink-600 dark:text-ink-300">{t.paymentMethod}</span> },
    { key: "decision", header: "Decision", render: (t) => <span className="text-ink-600 dark:text-ink-300">{t.decision}</span> },
    { key: "riskLevel", header: "Risk", render: (t) => <RiskBadge level={t.riskLevel} /> },
    { key: "probability", header: "Probability", sortable: true, render: (t) => <span className="font-mono text-xs text-ink-500 dark:text-ink-400">{(t.probability * 100).toFixed(1)}%</span> },
  ];
  return <div className="space-y-5">
    <div className="flex items-start justify-between gap-3 flex-wrap"><div><h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">Transaction history</h2><p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Every payment you've checked, with its risk assessment.</p></div><button onClick={load} className="inline-flex items-center gap-2 rounded-chip border border-ink-200 dark:border-ink-700 px-3 py-2 text-xs font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800"><RefreshCw size={14} /> Refresh</button></div>
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search transaction, category or merchant" className="w-full rounded-chip border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 pl-9 pr-3.5 py-2.5 text-sm outline-none focus:border-accent-500" /></div><div className="flex gap-1.5 flex-wrap">{FILTERS.map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded-pill px-3 py-1.5 text-xs font-medium border ${filter === f ? "bg-accent-600 text-white border-accent-600" : "border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300"}`}>{f}</button>)}</div></div>
    <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark overflow-hidden">{loading ? <div className="p-5"><LoadingState rows={7} /></div> : filtered.length === 0 ? <EmptyState icon={History} title="No matching transactions" description="Try another search or filter." /> : <TransactionTable columns={columns} rows={filtered} onSort={sort} />}</div>
    {selected && <TransactionDetailDrawer transaction={selected} onClose={() => setSelected(null)} />}
  </div>;
}
