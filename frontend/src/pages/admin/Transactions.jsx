import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import RiskBadge from "../../components/common/RiskBadge";
import EmptyState from "../../components/common/EmptyState";
import LoadingState from "../../components/common/LoadingState";
import TransactionTable from "../../components/transaction/TransactionTable";
import Pagination from "../../components/transaction/Pagination";
import { getAdminTransactions } from "../../data/mockApi";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function formatTimestamp(iso) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const RISK_FILTERS = ["All", "LOW", "MEDIUM", "HIGH"];
const PAGE_SIZE = 10;

export default function AdminTransactions() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ rows: [], total: 0 });
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAdminTransactions({ page, pageSize: PAGE_SIZE, search, riskFilter, sortBy, sortDir }).then((res) => {
      if (active) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [page, search, riskFilter, sortBy, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, riskFilter]);

  function handleSort(key) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  }

  const columns = [
    { key: "id", header: "Transaction ID", render: (t) => <span className="font-mono text-xs text-ink-700 dark:text-ink-300">{t.id}</span> },
    { key: "timestamp", header: "Timestamp", sortable: true, render: (t) => <span className="text-ink-500 dark:text-ink-400 text-xs">{formatTimestamp(t.timestamp)}</span> },
    { key: "amount", header: "Amount", sortable: true, render: (t) => <span className="text-ink-900 dark:text-ink-50 font-medium">{formatINR(t.amount)}</span> },
    { key: "probability", header: "Fraud Probability", sortable: true, render: (t) => <span className="font-mono text-xs text-ink-600 dark:text-ink-300">{(t.probability * 100).toFixed(1)}%</span> },
    { key: "prediction", header: "Prediction", render: (t) => <span className="text-ink-600 dark:text-ink-300">{t.prediction}</span> },
    { key: "riskLevel", header: "Risk", render: (t) => <RiskBadge level={t.riskLevel} /> },
    { key: "latencyMs", header: "Latency", sortable: true, render: (t) => <span className="text-ink-500 dark:text-ink-400">{t.latencyMs} ms</span> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">Transactions</h2>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Every transaction scored by PayGuard, system-wide.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
          <input
            type="text"
            placeholder="Search by transaction ID or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-chip border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 pl-9 pr-3.5 py-2.5 text-sm text-ink-900 dark:text-ink-50 placeholder:text-ink-400 dark:placeholder:text-ink-500 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {RISK_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`rounded-pill px-3 py-1.5 text-xs font-medium border transition-colors ${
                riskFilter === r
                  ? "bg-accent-600 text-white border-accent-600"
                  : "border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
              }`}
            >
              {r === "All" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark overflow-hidden">
        {loading ? (
          <div className="p-5">
            <LoadingState rows={8} />
          </div>
        ) : data.rows.length === 0 ? (
          <EmptyState icon={Search} title="No matching transactions" description="Try adjusting your search or filters." />
        ) : (
          <>
            <TransactionTable
              columns={columns}
              rows={data.rows}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
              highlightRow={(t) => t.riskLevel === "HIGH"}
            />
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
