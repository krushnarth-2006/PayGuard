const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === "true";
const STORAGE_KEY = "payguard_customer_transactions";

const CATEGORIES = [
  "Online Shopping", "Bill Payment", "Peer Transfer", "Food & Dining",
  "Travel & Transport", "Subscription", "ATM Withdrawal", "Other",
];
const METHODS = ["Debit Card", "Credit Card", "UPI", "Net Banking"];
const DEVICES = ["Mobile app", "Desktop browser", "Mobile browser", "POS terminal"];

const seed = [
  [500, "Food & Dining", "UPI", 0.04], [2500, "Online Shopping", "Credit Card", 0.31],
  [8000, "Peer Transfer", "UPI", 0.74], [1299, "Subscription", "Debit Card", 0.08],
  [15499, "Travel & Transport", "Credit Card", 0.52], [350, "Bill Payment", "Net Banking", 0.02],
  [42000, "ATM Withdrawal", "Debit Card", 0.81], [999, "Online Shopping", "UPI", 0.11],
  [6200, "Peer Transfer", "UPI", 0.44], [189, "Food & Dining", "UPI", 0.03],
  [3100, "Online Shopping", "Credit Card", 0.22], [27500, "Travel & Transport", "Credit Card", 0.67],
];

const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const riskFromProbability = (p) => p >= 0.7 ? "HIGH" : p >= 0.3 ? "MEDIUM" : "LOW";
const decisionFromRisk = (risk) => risk === "HIGH" ? "FRAUD" : "LEGITIMATE";
const statusFromRisk = (risk) => risk === "HIGH" ? "High risk" : risk === "MEDIUM" ? "Review" : "Safe";
const pad = (n) => String(n).padStart(4, "0");

function normalizeTransaction(t) {
  const probability = Number(t.probability ?? t.fraud_probability ?? 0);
  const riskLevel = t.riskLevel ?? t.risk_level ?? riskFromProbability(probability);
  const prediction = t.prediction ?? t.decision ?? decisionFromRisk(riskLevel);
  const date = t.date ?? t.timestamp ?? new Date().toISOString();

  return {
    id: t.id ?? `TXN-${Date.now()}`,
    date,
    timestamp: date,
    amount: Number(t.amount ?? 0),
    category: t.category ?? "Other",
    paymentMethod: t.paymentMethod ?? t.method ?? "UPI",
    decision: prediction,
    prediction,
    riskLevel,
    risk_level: riskLevel,
    probability,
    fraud_probability: probability,
    status: t.status ?? statusFromRisk(riskLevel),
    merchant: t.merchant ?? "Unknown merchant",
    device: t.device ?? t.deviceType ?? "Mobile app",
    emailDomain: t.emailDomain ?? "",
    distanceKm: t.distanceKm ?? "",
    isNewRecipient: t.isNewRecipient ?? "no",
    response_time_ms: Number(t.response_time_ms ?? t.latencyMs ?? 42),
    latencyMs: Number(t.latencyMs ?? t.response_time_ms ?? 42),
  };
}

function seedTransactions() {
  return seed.map(([amount, category, method, probability], i) => {
    const date = new Date();
    date.setDate(date.getDate() - (i * 2 + 1));
    const riskLevel = riskFromProbability(probability);
    return normalizeTransaction({
      id: `TXN-2026-${pad(1000 + i)}`,
      date: date.toISOString(), amount, category, paymentMethod: method,
      probability, riskLevel, prediction: decisionFromRisk(riskLevel),
      merchant: ["BlueCart Retail", "CityMart", "QuickPay", "TransitCard", "StreamFlix", "N/A"][i % 6],
      device: DEVICES[i % DEVICES.length], latencyMs: 35 + (i * 7) % 24,
    });
  });
}

function readStored() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizeTransaction) : [];
  } catch {
    return [];
  }
}

function writeStored(rows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.map(normalizeTransaction)));
}

function mockProbability(transaction) {
  const amount = Number(transaction.amount) || 0;
  const distance = Number(transaction.distanceKm) || 0;
  const newRecipient = transaction.isNewRecipient === "yes" ? 0.16 : 0;
  const categoryRisk = {
    "ATM Withdrawal": 0.11,
    "Peer Transfer": 0.09,
    "Online Shopping": 0.06,
    "Travel & Transport": 0.04,
    "Subscription": 0.01,
    "Food & Dining": 0.01,
    "Bill Payment": 0.005,
    Other: 0.02,
  }[transaction.category] ?? 0.02;
  const deviceRisk = transaction.deviceType === "Desktop browser" ? 0.02 : 0;
  const amountRisk = clamp((amount - 5000) / 30000, 0, 0.46);
  const distanceRisk = clamp(distance / 80, 0, 0.18);
  return Number(clamp(0.03 + amountRisk + distanceRisk + newRecipient + categoryRisk + deviceRisk).toFixed(4));
}

function buildRecord(transaction, probability, latency = 42) {
  const riskLevel = riskFromProbability(probability);
  const id = `TXN-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`;
  return normalizeTransaction({
    ...transaction,
    id,
    transaction_id: id,
    date: new Date().toISOString(),
    probability,
    fraud_probability: probability,
    riskLevel,
    risk_level: riskLevel,
    prediction: decisionFromRisk(riskLevel),
    response_time_ms: latency,
    latencyMs: latency,
  });
}

export async function analyzeTransaction(transaction) {
  const started = performance.now();

  if (USE_REAL_API) {
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body.detail === "string" ? body.detail : "Prediction request failed.");
      }
      const result = await response.json();
      const record = buildRecord(transaction, Number(result.fraud_probability), Number(result.response_time_ms ?? (performance.now() - started)));
      record.prediction = result.prediction ?? record.prediction;
      record.riskLevel = result.risk_level ?? record.riskLevel;
      record.risk_level = record.riskLevel;
      record.decision = record.prediction;
      record.status = statusFromRisk(record.riskLevel);
      saveCustomerTransaction(record);
      return { success: true, data: record, source: "api" };
    } catch (error) {
      console.warn("PayGuard API unavailable:", error.message);
      return { success: false, error: error.message || "Unable to connect to the PayGuard API." };
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  const probability = mockProbability(transaction);
  const latency = Math.max(28, Math.round(performance.now() - started));
  const record = buildRecord(transaction, probability, latency);
  saveCustomerTransaction(record);
  return { success: true, data: record, source: "demo" };
}

function saveCustomerTransaction(transaction) {
  writeStored([normalizeTransaction(transaction), ...readStored()].slice(0, 100));
}

export function getCustomerTransactions() {
  return Promise.resolve({ transactions: [...readStored(), ...seedTransactions()] });
}

export function getCustomerOverview() {
  const transactions = [...readStored(), ...seedTransactions()];
  const checked = transactions.length;
  const protectedCount = transactions.filter((t) => t.prediction === "LEGITIMATE").length;
  const review = transactions.filter((t) => t.riskLevel === "MEDIUM").length;
  return Promise.resolve({
    stats: {
      transactionsChecked: checked,
      transactionsProtected: protectedCount,
      transactionsForReview: review,
      securityStatus: "Protected",
    },
    recentTransactions: transactions.slice(0, 6),
  });
}

export function getNotifications() {
  const recent = readStored();
  const generated = recent.slice(0, 3).map((t, i) => ({
    id: `local-${t.id}`,
    type: t.riskLevel === "HIGH" ? "alert" : t.riskLevel === "LOW" ? "success" : "info",
    title: t.riskLevel === "HIGH" ? "Suspicious transaction detected" : "Transaction analyzed",
    detail: `₹${t.amount.toLocaleString("en-IN")} payment assessed as ${t.riskLevel.toLowerCase()} risk.`,
    time: i === 0 ? "Just now" : `${i + 1}h ago`,
  }));
  const fallback = [
    { id: "n1", type: "success", title: "Protection active", detail: "PayGuard is ready to assess your next payment.", time: "Today" },
    { id: "n2", type: "info", title: "Security monitoring enabled", detail: "Your payment checks are stored in transaction history.", time: "Today" },
  ];
  return Promise.resolve({ notifications: [...generated, ...fallback].slice(0, 5) });
}

const ADMIN_TRANSACTIONS = Array.from({ length: 240 }, (_, i) => {
  const frac = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
  const probability = Number(clamp(0.01 + frac * 0.97).toFixed(4));
  const riskLevel = riskFromProbability(probability);
  const date = new Date(); date.setMinutes(date.getMinutes() - (i * 7 + 1));
  return normalizeTransaction({
    id: `TXN-2026-${pad(4000 + i)}`, timestamp: date.toISOString(),
    amount: Math.round(200 + frac * 60000), category: CATEGORIES[i % CATEGORIES.length],
    paymentMethod: METHODS[i % METHODS.length], probability, riskLevel,
    prediction: decisionFromRisk(riskLevel), latencyMs: 28 + Math.round(frac * 70),
  });
});

export function getAdminTransactions({ page = 1, pageSize = 10, search = "", riskFilter = "All", sortBy = "timestamp", sortDir = "desc" } = {}) {
  let rows = [...ADMIN_TRANSACTIONS, ...readStored()];
  const q = search.trim().toLowerCase();
  if (q) rows = rows.filter((t) => `${t.id} ${t.category} ${t.paymentMethod}`.toLowerCase().includes(q));
  if (riskFilter !== "All") rows = rows.filter((t) => t.riskLevel === riskFilter);
  rows.sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    const av = sortBy === "amount" ? a.amount : sortBy === "probability" ? a.probability : sortBy === "latencyMs" ? a.latencyMs : new Date(a.timestamp).getTime();
    const bv = sortBy === "amount" ? b.amount : sortBy === "probability" ? b.probability : sortBy === "latencyMs" ? b.latencyMs : new Date(b.timestamp).getTime();
    return (av - bv) * dir;
  });
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return Promise.resolve({ rows: rows.slice(start, start + pageSize), total });
}

const ADMIN_TREND = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (13 - i));
  const avgProbability = Math.max(0.01, Number((0.02 + Math.sin(i / 2.3) * 0.008 + (i > 9 ? 0.012 : 0)).toFixed(3)));
  return { date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }), avgProbability, volume: 2800 + Math.round(Math.sin(i / 1.7) * 300 + i * 40), fraudCount: Math.round(70 + Math.sin(i / 2) * 15 + (i > 9 ? 20 : 0)) };
});
const LATENCY = Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2, "0")}:00`, avgLatency: 38 + Math.round(Math.sin(i / 2.2) * 10 + (i % 5 === 0 ? 12 : 0)), p95Latency: 78 + Math.round(Math.sin(i / 2.2) * 18 + (i % 5 === 0 ? 20 : 0)) }));

export function getAdminSummary() {
  return Promise.resolve({ totalTransactions: 48213, fraudPredictions: 1362, legitimatePredictions: 46851, fraudRate: 0.0282, avgLatencyMs: 47, p95LatencyMs: 96 });
}
export function getAdminAnalytics() {
  return Promise.resolve({ trend: ADMIN_TREND, latency: LATENCY, predictionDistribution: [{ name: "Legitimate", value: 46851 }, { name: "Fraud", value: 1362 }], riskDistribution: [{ name: "Low", value: 41230 }, { name: "Medium", value: 5621 }, { name: "High", value: 1362 }] });
}
export function getPerformanceMetrics() {
  return Promise.resolve({ avgLatencyMs: 47, p95LatencyMs: 96, throughputPerMin: 184, latency: LATENCY, recentActivity: [
    { id: "req_9f21", endpoint: "/predict", status: 200, latencyMs: 44, time: "2s ago" },
    { id: "req_9f20", endpoint: "/predict", status: 200, latencyMs: 51, time: "6s ago" },
    { id: "req_9f1f", endpoint: "/predict", status: 200, latencyMs: 39, time: "11s ago" },
    { id: "req_9f1e", endpoint: "/health", status: 200, latencyMs: 8, time: "14s ago" },
    { id: "req_9f1d", endpoint: "/predict", status: 200, latencyMs: 62, time: "18s ago" },
  ] });
}
export function getDriftReport() {
  return Promise.resolve({ status: "DRIFT_DETECTED", monitoringActive: true, detectedAt: new Date().toISOString(), summary: "Recent transaction patterns differ from the training baseline for 3 monitored features.", affectedFeatures: [
    { feature: "Transaction Amount", change: 0.35, baseline: "₹2,140 avg", current: "₹2,889 avg", status: "Drift" },
    { feature: "Distance", change: 0.27, baseline: "6.2 km avg", current: "7.9 km avg", status: "Drift" },
    { feature: "Transaction Count", change: 0.31, baseline: "3.1 / day avg", current: "4.1 / day avg", status: "Drift" },
  ], stableFeatures: [
    { feature: "Card Type Mix", change: 0.04, status: "Stable" },
    { feature: "Device Type Mix", change: 0.02, status: "Stable" },
    { feature: "Category Mix", change: 0.05, status: "Stable" },
  ] });
}
export function checkApiHealth() {
  return fetch(`${API_URL}/`).then((r) => r.ok).catch(() => false);
}
