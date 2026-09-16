import { Search, Wand2 } from "lucide-react";
import { CATEGORIES, PAYMENT_METHODS, DEVICE_TYPES } from "../../data/sampleData";

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-danger-600 dark:text-danger-dark mt-1.5">{error}</span>}
    </label>
  );
}

const baseInputClass =
  "w-full rounded-chip border bg-white dark:bg-ink-900 px-3.5 py-2.5 text-sm text-ink-900 dark:text-ink-50 placeholder:text-ink-400 dark:placeholder:text-ink-500 focus:ring-1 transition-colors";
const validClass = "border-ink-200 dark:border-ink-700 focus:border-accent-500 focus:ring-accent-500";
const invalidClass = "border-danger-500/60 focus:border-danger-500 focus:ring-danger-500";

function inputClass(hasError) {
  return `${baseInputClass} ${hasError ? invalidClass : validClass}`;
}

export default function TransactionForm({ form, errors, onChange, onSubmit, onUseSample }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark p-6">
        <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50 mb-1">Payment information</h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mb-5">The basics of the payment you're about to make.</p>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Transaction amount (₹)" error={errors.amount}>
            <input
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="e.g. 2,500"
              className={inputClass(!!errors.amount)}
              value={form.amount}
              onChange={(e) => onChange("amount", e.target.value)}
            />
          </Field>

          <Field label="Payment category">
            <select
              className={inputClass(false)}
              value={form.category}
              onChange={(e) => onChange("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Payment method">
            <select
              className={inputClass(false)}
              value={form.paymentMethod}
              onChange={(e) => onChange("paymentMethod", e.target.value)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>

          <Field label="Merchant / recipient (optional)">
            <input
              type="text"
              placeholder="e.g. BlueCart Retail"
              className={inputClass(false)}
              value={form.merchant}
              onChange={(e) => onChange("merchant", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-card bg-white dark:bg-ink-850 border border-ink-200 dark:border-ink-700 shadow-panel dark:shadow-panel-dark p-6">
        <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50 mb-1">Transaction context</h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 mb-5">
          A little context helps PayGuard tell a normal payment from an unusual one.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Device">
            <select
              className={inputClass(false)}
              value={form.deviceType}
              onChange={(e) => onChange("deviceType", e.target.value)}
            >
              {DEVICE_TYPES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>

          <Field label="Distance from usual location (km)" error={errors.distanceKm}>
            <input
              type="number"
              min="0"
              placeholder="e.g. 12"
              className={inputClass(!!errors.distanceKm)}
              value={form.distanceKm}
              onChange={(e) => onChange("distanceKm", e.target.value)}
            />
          </Field>

          <Field label="Email domain">
            <input
              type="text"
              placeholder="e.g. gmail.com"
              className={inputClass(false)}
              value={form.emailDomain}
              onChange={(e) => onChange("emailDomain", e.target.value)}
            />
          </Field>

          <Field label="First time paying this recipient?">
            <select
              className={inputClass(false)}
              value={form.isNewRecipient}
              onChange={(e) => onChange("isNewRecipient", e.target.value)}
            >
              <option value="no">No, I've paid them before</option>
              <option value="yes">Yes, this is new</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-chip bg-accent-600 text-white text-sm font-semibold py-3 hover:bg-accent-700 transition-colors"
        >
          <Search size={16} />
          Analyze Payment
        </button>
        <button
          type="button"
          onClick={onUseSample}
          className="inline-flex items-center justify-center gap-2 rounded-chip border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-200 text-sm font-medium py-3 px-4 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
        >
          <Wand2 size={15} />
          Use sample payment
        </button>
      </div>
    </form>
  );
}
