// Frontend options and demo seed data. Fraud scoring is handled by
// src/data/mockApi.js in demo mode and can be switched to the real
// PayGuard FastAPI service with VITE_USE_REAL_API=true.

export const CATEGORIES = [
  "Online Shopping",
  "Bill Payment",
  "Peer Transfer",
  "Food & Dining",
  "Travel & Transport",
  "Subscription",
  "ATM Withdrawal",
  "Other",
];

export const PAYMENT_METHODS = ["Debit Card", "Credit Card", "UPI", "Net Banking"];

export const DEVICE_TYPES = ["Mobile app", "Desktop browser", "Mobile browser", "POS terminal"];

export const SAMPLE_TRANSACTION_INPUT = {
  amount: "1499",
  category: "Online Shopping",
  paymentMethod: "Credit Card",
  deviceType: "Mobile app",
  emailDomain: "gmail.com",
  distanceKm: "8",
  merchant: "BlueCart Retail",
  isNewRecipient: "no",
};

// Single source of truth for risk thresholds — keep in sync with the
// eventual PayGuard backend's display conventions.
export const RISK_THRESHOLDS = { LOW_MAX: 0.3, MEDIUM_MAX: 0.7 };

export function riskLevelFromProbability(p) {
  if (p >= RISK_THRESHOLDS.MEDIUM_MAX) return "HIGH";
  if (p >= RISK_THRESHOLDS.LOW_MAX) return "MEDIUM";
  return "LOW";
}

function pad(n, len = 4) {
  return String(n).padStart(len, "0");
}

function decisionFromRisk(risk) {
  return risk === "HIGH" ? "FRAUD" : "LEGITIMATE";
}

function statusFromRisk(risk) {
  if (risk === "HIGH") return "High risk";
  if (risk === "MEDIUM") return "Review";
  return "Safe";
}

// ------------------------------ Customer data -------------------------------

const CUSTOMER_TXN_SEED = [
  { amount: 500, category: "Food & Dining", method: "UPI", probability: 0.04 },
  { amount: 2500, category: "Online Shopping", method: "Credit Card", probability: 0.31 },
  { amount: 8000, category: "Peer Transfer", method: "UPI", probability: 0.74 },
  { amount: 1299, category: "Subscription", method: "Debit Card", probability: 0.08 },
  { amount: 15499, category: "Travel & Transport", method: "Credit Card", probability: 0.52 },
  { amount: 350, category: "Bill Payment", method: "Net Banking", probability: 0.02 },
  { amount: 42000, category: "ATM Withdrawal", method: "Debit Card", probability: 0.81 },
  { amount: 999, category: "Online Shopping", method: "UPI", probability: 0.11 },
  { amount: 6200, category: "Peer Transfer", method: "UPI", probability: 0.44 },
  { amount: 189, category: "Food & Dining", method: "UPI", probability: 0.03 },
  { amount: 3100, category: "Online Shopping", method: "Credit Card", probability: 0.22 },
  { amount: 27500, category: "Travel & Transport", method: "Credit Card", probability: 0.67 },
];

export const CUSTOMER_TRANSACTIONS = CUSTOMER_TXN_SEED.map((t, i) => {
  const risk = riskLevelFromProbability(t.probability);
  const daysAgo = i * 2 + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id: `TXN-2026-${pad(1000 + i)}`,
    date: date.toISOString(),
    amount: t.amount,
    category: t.category,
    paymentMethod: t.method,
    decision: decisionFromRisk(risk),
    riskLevel: risk,
    probability: t.probability,
    status: statusFromRisk(risk),
    merchant: ["BlueCart Retail", "CityMart", "QuickPay", "TransitCard", "StreamFlix", "N/A"][i % 6],
    device: DEVICE_TYPES[i % DEVICE_TYPES.length],
  };
});

export const CUSTOMER_OVERVIEW_STATS = {
  transactionsChecked: 128,
  transactionsProtected: 119,
  transactionsForReview: 9,
  securityStatus: "Protected",
};

export const NOTIFICATIONS = [
  {
    id: "n1",
    type: "alert",
    title: "Suspicious transaction detected",
    detail: "A ₹42,000 ATM withdrawal was flagged as high risk.",
    time: "3 minutes ago",
  },
  {
    id: "n2",
    type: "success",
    title: "Transaction verified",
    detail: "Your ₹2,500 online shopping payment was cleared.",
    time: "2 hours ago",
  },
  {
    id: "n3",
    type: "info",
    title: "Security system updated",
    detail: "PayGuard's monitoring rules were refreshed for better accuracy.",
    time: "Yesterday",
  },
];

// -------------------------------- Admin data --------------------------------

export const ADMIN_SUMMARY_STATS = {
  totalTransactions: 48213,
  fraudPredictions: 1362,
  legitimatePredictions: 46851,
  fraudRate: 0.0282,
  avgLatencyMs: 47,
  p95LatencyMs: 96,
};

export const ADMIN_TREND = Array.from({ length: 14 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  const base = 0.02 + Math.sin(i / 2.3) * 0.008 + (i > 9 ? 0.012 : 0);
  return {
    date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    avgProbability: Math.max(0.01, Number(base.toFixed(3))),
    volume: 2800 + Math.round(Math.sin(i / 1.7) * 300 + i * 40),
    fraudCount: Math.round(70 + Math.sin(i / 2) * 15 + (i > 9 ? 20 : 0)),
  };
});

export const RISK_DISTRIBUTION = [
  { name: "Low", value: 41230 },
  { name: "Medium", value: 5621 },
  { name: "High", value: 1362 },
];

export const PREDICTION_DISTRIBUTION = [
  { name: "Legitimate", value: 46851 },
  { name: "Fraud", value: 1362 },
];

export const LATENCY_SAMPLES = Array.from({ length: 24 }).map((_, i) => ({
  hour: `${pad(i, 2).slice(0, 2)}:00`,
  avgLatency: 38 + Math.round(Math.sin(i / 2.2) * 10 + (i % 5 === 0 ? 12 : 0)),
  p95Latency: 78 + Math.round(Math.sin(i / 2.2) * 18 + (i % 5 === 0 ? 20 : 0)),
}));

export const RECENT_API_ACTIVITY = [
  { id: "req_9f21", endpoint: "/api/predict", status: 200, latencyMs: 44, time: "2s ago" },
  { id: "req_9f20", endpoint: "/api/predict", status: 200, latencyMs: 51, time: "6s ago" },
  { id: "req_9f1f", endpoint: "/api/predict", status: 200, latencyMs: 39, time: "11s ago" },
  { id: "req_9f1e", endpoint: "/api/health", status: 200, latencyMs: 8, time: "14s ago" },
  { id: "req_9f1d", endpoint: "/api/predict", status: 200, latencyMs: 62, time: "18s ago" },
  { id: "req_9f1c", endpoint: "/api/predict", status: 500, latencyMs: 210, time: "25s ago" },
];

const ADMIN_CATEGORIES = CATEGORIES;
const ADMIN_METHODS = PAYMENT_METHODS;

function makeAdminTransaction(i) {
  // Deterministic pseudo-random generation so the table is stable across renders.
  const seed = Math.sin(i * 12.9898) * 43758.5453;
  const frac = seed - Math.floor(seed);
  const probability = Number(Math.min(0.98, Math.max(0.01, frac)).toFixed(4));
  const risk = riskLevelFromProbability(probability);
  const amount = Math.round(200 + frac * 60000);
  const minutesAgo = i * 7 + 1;
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  return {
    id: `TXN-2026-${pad(4000 + i)}`,
    timestamp: date.toISOString(),
    amount,
    category: ADMIN_CATEGORIES[i % ADMIN_CATEGORIES.length],
    paymentMethod: ADMIN_METHODS[i % ADMIN_METHODS.length],
    probability,
    prediction: decisionFromRisk(risk),
    riskLevel: risk,
    latencyMs: 28 + Math.round(frac * 70),
  };
}

export const ADMIN_TRANSACTIONS = Array.from({ length: 240 }).map((_, i) => makeAdminTransaction(i));

export const RECENT_PREDICTIONS = ADMIN_TRANSACTIONS.slice(0, 6).map((t) => ({
  ...t,
  time: "just now",
}));

export const DRIFT_REPORT = {
  status: "DRIFT_DETECTED",
  monitoringActive: true,
  detectedAt: new Date().toISOString(),
  summary:
    "Recent transaction patterns differ from the training baseline for 3 monitored features.",
  affectedFeatures: [
    { feature: "Transaction Amount", change: 0.35, baseline: "₹2,140 avg", current: "₹2,889 avg", status: "Drift" },
    { feature: "Distance", change: 0.27, baseline: "6.2 km avg", current: "7.9 km avg", status: "Drift" },
    { feature: "Transaction Count", change: 0.31, baseline: "3.1 / day avg", current: "4.1 / day avg", status: "Drift" },
  ],
  stableFeatures: [
    { feature: "Card Type Mix", change: 0.04, status: "Stable" },
    { feature: "Device Type Mix", change: 0.02, status: "Stable" },
    { feature: "Category Mix", change: 0.05, status: "Stable" },
  ],
};
