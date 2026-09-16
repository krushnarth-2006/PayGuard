import { X, Hash, Calendar, CreditCard, Smartphone, Store } from "lucide-react";
import RiskBadge from "../common/RiskBadge";
import ProbabilityMeter from "../common/ProbabilityMeter";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-ink-100 dark:border-ink-800 last:border-b-0">
      <span className="inline-flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
        <Icon size={15} />
        {label}
      </span>
      <span className="text-sm font-medium text-ink-900 dark:text-ink-50">{value}</span>
    </div>
  );
}

export default function TransactionDetailDrawer({ transaction, onClose }) {
  if (!transaction) return null;
  const t = transaction;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close transaction details"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/40"
      />
      <div className="relative w-full max-w-md h-full bg-white dark:bg-ink-900 border-l border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark animate-slide-over overflow-y-auto">
        <div className="flex items-center justify-between px-5 h-16 border-b border-ink-200 dark:border-ink-700 sticky top-0 bg-white dark:bg-ink-900">
          <h2 className="text-sm font-semibold text-ink-900 dark:text-ink-50">Transaction details</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="text-center py-4">
            <p className="font-mono text-xs text-ink-500 dark:text-ink-400 mb-2">{t.id}</p>
            <p className="text-3xl font-semibold text-ink-900 dark:text-ink-50">{formatINR(t.amount)}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <RiskBadge level={t.riskLevel} />
            </div>
          </div>

          <ProbabilityMeter probability={t.probability} riskLevel={t.riskLevel} />

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500 mb-1">
              Payment information
            </h3>
            <Row icon={Calendar} label="Date & time" value={formatDateTime(t.date)} />
            <Row icon={CreditCard} label="Payment method" value={t.paymentMethod} />
            <Row icon={Store} label="Category" value={t.category} />
            {t.merchant && t.merchant !== "N/A" && <Row icon={Store} label="Merchant" value={t.merchant} />}
            {t.device && <Row icon={Smartphone} label="Device" value={t.device} />}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500 mb-1">
              Assessment
            </h3>
            <Row icon={Hash} label="Decision" value={t.decision} />
            <Row icon={Hash} label="Status" value={t.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
