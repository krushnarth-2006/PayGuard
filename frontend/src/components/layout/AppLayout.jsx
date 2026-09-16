import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const PAGE_META = {
  "/": ["Overview", "Your personal payment security center"],
  "/check-transaction": ["Check Transaction", "Verify a payment before you complete it"],
  "/transaction-history": ["Transaction History", "Everything you've checked so far"],
  "/security": ["Security", "How your account is protected"],
  "/admin/overview": ["Admin · Overview", "Fraud operations at a glance"],
  "/admin/transactions": ["Admin · Transactions", "Every scored transaction, system-wide"],
  "/admin/risk-analytics": ["Admin · Risk Analytics", "Trends and distributions across the platform"],
  "/admin/performance": ["Admin · Performance", "API latency and throughput"],
  "/admin/drift-monitoring": ["Admin · Drift Monitoring", "Model input drift vs. training baseline"],
};

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const [title, subtitle] = PAGE_META[pathname] || ["PayGuard", ""];

  return (
    <div className="min-h-screen flex bg-ink-50 dark:bg-ink-950">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
