import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import AdminLogin from "./pages/auth/AdminLogin";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Overview from "./pages/customer/Overview";
import CheckTransaction from "./pages/customer/CheckTransaction";
import TransactionHistory from "./pages/customer/TransactionHistory";
import Security from "./pages/customer/Security";

import AdminOverview from "./pages/admin/Overview";
import AdminTransactions from "./pages/admin/Transactions";
import RiskAnalytics from "./pages/admin/RiskAnalytics";
import Performance from "./pages/admin/Performance";
import DriftMonitoring from "./pages/admin/DriftMonitoring";


function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    if (user.role === "admin") {
      return <Navigate to="/admin/overview" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}


export default function App() {
  return (
    <Routes>

      {/* =========================
          AUTHENTICATION
      ========================== */}

      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />


      {/* =========================
          CUSTOMER PORTAL
      ========================== */}

      <Route
        element={
          <ProtectedRoute role="customer">
            <AppLayout />
          </ProtectedRoute>
        }
      >

        <Route
          path="/"
          element={<Overview />}
          handle={{
            title: "Overview",
            subtitle: "Your personal payment security center",
          }}
        />

        <Route
          path="/check-transaction"
          element={<CheckTransaction />}
          handle={{
            title: "Check Transaction",
            subtitle: "Verify a payment before you complete it",
          }}
        />

        <Route
          path="/transaction-history"
          element={<TransactionHistory />}
          handle={{
            title: "Transaction History",
            subtitle: "Everything you've checked so far",
          }}
        />

        <Route
          path="/security"
          element={<Security />}
          handle={{
            title: "Security",
            subtitle: "How your account is protected",
          }}
        />

      </Route>


      {/* =========================
          ADMIN CONSOLE
      ========================== */}

      <Route
        element={
          <ProtectedRoute role="admin">
            <AppLayout />
          </ProtectedRoute>
        }
      >

        <Route
          path="/admin/overview"
          element={<AdminOverview />}
          handle={{
            title: "Admin · Overview",
            subtitle: "Fraud operations at a glance",
          }}
        />

        <Route
          path="/admin/transactions"
          element={<AdminTransactions />}
          handle={{
            title: "Admin · Transactions",
            subtitle: "Every scored transaction, system-wide",
          }}
        />

        <Route
          path="/admin/risk-analytics"
          element={<RiskAnalytics />}
          handle={{
            title: "Admin · Risk Analytics",
            subtitle: "Trends and distributions across the platform",
          }}
        />

        <Route
          path="/admin/performance"
          element={<Performance />}
          handle={{
            title: "Admin · Performance",
            subtitle: "API latency and throughput",
          }}
        />

        <Route
          path="/admin/drift-monitoring"
          element={<DriftMonitoring />}
          handle={{
            title: "Admin · Drift Monitoring",
            subtitle: "Model input drift vs. training baseline",
          }}
        />

      </Route>


      {/* =========================
          UNKNOWN ROUTES
      ========================== */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}