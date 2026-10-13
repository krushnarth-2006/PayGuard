import {
  ShieldCheck,
  TriangleAlert,
  ShieldAlert,
  Hash,
  Clock,
  RotateCcw,
  CreditCard,
  CheckCircle2,
  XCircle,
  LoaderCircle,
} from "lucide-react";

import ProbabilityMeter from "../common/ProbabilityMeter";
import RiskBadge from "../common/RiskBadge";


const COPY = {
  LOW: {
    icon: ShieldCheck,
    heading: "Low risk",
    message: "This transaction appears safe.",
    guidance: null,
  },

  MEDIUM: {
    icon: TriangleAlert,
    heading: "Medium risk",
    message:
      "This transaction requires additional verification.",
    guidance:
      "Consider double-checking the recipient before proceeding.",
  },

  HIGH: {
    icon: ShieldAlert,
    heading: "High risk",
    message:
      "This transaction appears suspicious.",
    guidance:
      "Please verify the payment details before proceeding.",
  },
};


const TONE = {
  LOW: {
    panel:
      "border-safe-500/25 bg-safe-100/60 dark:bg-safe-500/5 dark:border-safe-500/25",

    iconBg:
      "bg-safe-500/15 text-safe-600 dark:text-safe-dark",

    heading:
      "text-safe-600 dark:text-safe-dark",
  },

  MEDIUM: {
    panel:
      "border-review-500/25 bg-review-100/60 dark:bg-review-500/5 dark:border-review-500/25",

    iconBg:
      "bg-review-500/15 text-review-600 dark:text-review-dark",

    heading:
      "text-review-600 dark:text-review-dark",
  },

  HIGH: {
    panel:
      "border-danger-500/25 bg-danger-100/60 dark:bg-danger-500/5 dark:border-danger-500/25",

    iconBg:
      "bg-danger-500/15 text-danger-600 dark:text-danger-dark",

    heading:
      "text-danger-600 dark:text-danger-dark",
  },
};


/* -------------------------------------------------------
   Payment status configuration
------------------------------------------------------- */

const PAYMENT_STATUS = {
  SUCCESS: {
    label: "Payment Successful",
    description:
      "The Cashfree sandbox payment was completed successfully.",
    className:
      "border-safe-500/25 bg-safe-500/10 text-safe-600 dark:text-safe-dark",
    icon: CheckCircle2,
  },

  PENDING: {
    label: "Payment Pending",
    description:
      "The payment has not reached a final status yet.",
    className:
      "border-review-500/25 bg-review-500/10 text-review-600 dark:text-review-dark",
    icon: LoaderCircle,
  },

  FAILURE: {
    label: "Payment Failed",
    description:
      "The Cashfree sandbox payment was not completed.",
    className:
      "border-danger-500/25 bg-danger-500/10 text-danger-600 dark:text-danger-dark",
    icon: XCircle,
  },

  CHECKOUT_OPENED: {
    label: "Checkout Closed",
    description:
      "Cashfree checkout was opened, but no successful payment was confirmed.",
    className:
      "border-review-500/25 bg-review-500/10 text-review-600 dark:text-review-dark",
    icon: CreditCard,
  },

  CHECKOUT_READY: {
    label: "Checkout Ready",
    description:
      "The Cashfree payment session was created successfully.",
    className:
      "border-review-500/25 bg-review-500/10 text-review-600 dark:text-review-dark",
    icon: CreditCard,
  },

  VERIFYING: {
    label: "Verifying Payment",
    description:
      "PayGuard is checking the payment status with Cashfree.",
    className:
      "border-review-500/25 bg-review-500/10 text-review-600 dark:text-review-dark",
    icon: LoaderCircle,
  },

  BLOCKED_BY_PAYGUARD: {
    label: "Blocked by PayGuard",
    description:
      "Cashfree checkout was not opened because PayGuard detected high fraud risk.",
    className:
      "border-danger-500/25 bg-danger-500/10 text-danger-600 dark:text-danger-dark",
    icon: ShieldAlert,
  },

  CHECKOUT_ERROR: {
    label: "Checkout Error",
    description:
      "Cashfree checkout could not be completed.",
    className:
      "border-danger-500/25 bg-danger-500/10 text-danger-600 dark:text-danger-dark",
    icon: XCircle,
  },

  STATUS_CHECK_FAILED: {
    label: "Status Verification Failed",
    description:
      "The payment was initiated, but PayGuard could not verify the final Cashfree status.",
    className:
      "border-review-500/25 bg-review-500/10 text-review-600 dark:text-review-dark",
    icon: TriangleAlert,
  },

  UNKNOWN: {
    label: "Payment Status Unknown",
    description:
      "The payment status could not be determined.",
    className:
      "border-ink-300 bg-ink-100/50 text-ink-600 dark:bg-ink-800 dark:text-ink-200",
    icon: TriangleAlert,
  },
};


/* -------------------------------------------------------
   Component
------------------------------------------------------- */

export default function TransactionResult({
  result,
  onReset,
}) {
  const level =
    result.risk_level ||
    result.riskLevel ||
    "LOW";

  const copy =
    COPY[level] || COPY.LOW;

  const tone =
    TONE[level] || TONE.LOW;

  const Icon = copy.icon;


  /* -----------------------------------------------------
     Payment status
  ----------------------------------------------------- */

  const paymentStatus =
    result.payment_status ||
    "UNKNOWN";

  const paymentInfo =
    PAYMENT_STATUS[paymentStatus] ||
    PAYMENT_STATUS.UNKNOWN;

  const PaymentIcon =
    paymentInfo.icon;


  return (
    <div className="max-w-md mx-auto py-6">

      {/* -------------------------------------------------
          Page heading
      ------------------------------------------------- */}

      <p className="text-center text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-500 mb-4">
        Payment risk assessment
      </p>


      {/* -------------------------------------------------
          Main result card
      ------------------------------------------------- */}

      <div
        className={`rounded-card border shadow-panel dark:shadow-panel-dark p-8 text-center animate-rise ${tone.panel}`}
      >

        {/* Risk icon */}

        <span
          className={`inline-flex h-14 w-14 items-center justify-center rounded-full mb-4 ${tone.iconBg}`}
        >
          <Icon size={28} />
        </span>


        {/* Risk heading */}

        <h2
          className={`text-lg font-bold tracking-wide uppercase ${tone.heading}`}
        >
          {copy.heading}
        </h2>


        {/* Fraud probability */}

        <div className="mt-5 mb-1">

          <p className="text-4xl font-bold text-ink-900 dark:text-ink-50 tabular-nums">
            {(
              result.fraud_probability *
              100
            ).toFixed(1)}
            %
          </p>

          <p className="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400 mt-1">
            Fraud probability
          </p>

        </div>


        {/* Probability meter */}

        <ProbabilityMeter
          probability={
            result.fraud_probability
          }
          riskLevel={level}
          className="mt-5 text-left"
        />


        {/* -------------------------------------------------
            Decision + Risk
        ------------------------------------------------- */}

        <div className="mt-6 grid grid-cols-2 gap-4 text-left">

          <div className="rounded-chip bg-white/70 dark:bg-ink-900/40 border border-ink-200/70 dark:border-ink-700 p-4">

            <p className="text-xs text-ink-500 dark:text-ink-400">
              Decision
            </p>

            <p className="text-lg font-semibold text-ink-900 dark:text-ink-50 mt-1">
              {result.prediction ||
                result.decision ||
                "—"}
            </p>

          </div>


          <div className="rounded-chip bg-white/70 dark:bg-ink-900/40 border border-ink-200/70 dark:border-ink-700 p-4">

            <p className="text-xs text-ink-500 dark:text-ink-400">
              Risk level
            </p>

            <p className="text-lg font-semibold text-ink-900 dark:text-ink-50 mt-1">
              <RiskBadge level={level} />
            </p>

          </div>

        </div>


        {/* -------------------------------------------------
            Payment Status
        ------------------------------------------------- */}

        <div
          className={`mt-4 rounded-chip border px-4 py-4 text-left ${paymentInfo.className}`}
        >

          <div className="flex items-start gap-3">

            <span className="mt-0.5 shrink-0">
              <PaymentIcon size={20} />
            </span>

            <div className="min-w-0">

              <p className="text-xs uppercase tracking-wide opacity-70">
                Payment status
              </p>

              <p className="text-base font-semibold mt-1">
                {paymentInfo.label}
              </p>

              <p className="text-xs mt-1 opacity-80">
                {paymentInfo.description}
              </p>

            </div>

          </div>

        </div>


        {/* -------------------------------------------------
            Transaction ID + Response Time
        ------------------------------------------------- */}

        <div className="mt-4 flex items-center justify-between text-xs text-ink-500 dark:text-ink-400 rounded-chip bg-white/70 dark:bg-ink-900/40 border border-ink-200/70 dark:border-ink-700 px-4 py-3">

          <span className="inline-flex items-center gap-1.5 font-mono min-w-0">

            <Hash size={13} />

            <span className="truncate">
              {result.transaction_id ||
                result.id ||
                "—"}
            </span>

          </span>


          <span className="inline-flex items-center gap-1.5 shrink-0">

            <Clock size={13} />

            {result.response_time_ms ??
              result.latencyMs ??
              "—"}{" "}
            ms

          </span>

        </div>


        {/* -------------------------------------------------
            Cashfree Order ID
        ------------------------------------------------- */}

        {result.cashfree_order_id && (
          <div className="mt-3 rounded-chip bg-white/70 dark:bg-ink-900/40 border border-ink-200/70 dark:border-ink-700 px-4 py-3 text-left">

            <p className="text-xs text-ink-500 dark:text-ink-400">
              Cashfree Order ID
            </p>

            <p className="text-xs font-mono text-ink-700 dark:text-ink-200 mt-1 break-all">
              {result.cashfree_order_id}
            </p>

          </div>
        )}


        {/* -------------------------------------------------
            Main risk message
        ------------------------------------------------- */}

        <p className="mt-5 text-sm text-ink-700 dark:text-ink-200">
          {copy.message}
        </p>


        {copy.guidance && (
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
            {copy.guidance}
          </p>
        )}


        {/* -------------------------------------------------
            Reset button
        ------------------------------------------------- */}

        <button
          onClick={onReset}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-chip bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 text-sm font-medium py-2.5 hover:bg-ink-800 dark:hover:bg-white transition-colors"
        >
          <RotateCcw size={15} />

          Check Another Payment
        </button>

      </div>

    </div>
  );
}