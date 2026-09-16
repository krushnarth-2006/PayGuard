import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://127.0.0.1:8000";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your administrator email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to sign in."
        );
      }

      if (!data.success) {
        setError(data.message || "Invalid administrator credentials.");
        return;
      }

      sessionStorage.setItem(
        "payguard_admin_email",
        email.toLowerCase().trim()
      );

      setStep("otp");
    } catch (err) {
      setError(err.message || "Unable to connect to PayGuard.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(event) {
    event.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP sent to your administrator email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/admin/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to verify OTP."
        );
      }

      if (!data.success || data.role !== "admin") {
        setError("Administrator verification failed.");
        return;
      }

      login({
        email: data.email,
        role: "admin",
        name: data.name || "PayGuard Admin",
      });

      sessionStorage.removeItem("payguard_admin_email");

      navigate("/admin/overview", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to verify administrator OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-slate-900 text-xl font-bold mb-4">
            PG
          </div>

          <h1 className="text-3xl font-bold text-white">
            PayGuard
          </h1>

          <p className="mt-2 text-slate-400">
            Admin Security Console
          </p>

        </div>


        {/* Admin Login Card */}
        <div className="bg-ink-900 rounded-2xl border border-ink-800 shadow-xl p-6">

          <div className="mb-6">

            <div className="flex items-center gap-2 mb-2">

              <span className="w-2 h-2 rounded-full bg-emerald-400" />

              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Authorized access
              </span>

            </div>

            <h2 className="text-xl font-semibold text-white">
              {step === "login"
                ? "Admin Sign in"
                : "Verify administrator"}
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              {step === "login"
                ? "Access fraud monitoring and system controls."
                : "Enter the OTP sent to your administrator email."}
            </p>

          </div>


          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}


          {/* STEP 1 — ADMIN LOGIN */}
          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Administrator email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="admin@payguard.com"
                  className="w-full rounded-xl border border-ink-700 bg-ink-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-slate-500"
                  required
                />

              </div>


              {/* Password */}
              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter administrator password"
                  className="w-full rounded-xl border border-ink-700 bg-ink-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-slate-500"
                  required
                />

              </div>


              {/* Sign In */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-950 font-semibold py-3 transition"
              >
                {loading
                  ? "Checking credentials..."
                  : "Continue to Admin Console"}
              </button>

            </form>
          )}


          {/* STEP 2 — OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Verification code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  placeholder="Enter 6-digit OTP"
                  className="w-full rounded-xl border border-ink-700 bg-ink-950 px-4 py-3 text-white text-center tracking-[0.35em] text-lg placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-slate-500"
                  required
                />

                <p className="mt-2 text-xs text-slate-500">
                  OTP sent to {email}
                </p>

              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-950 font-semibold py-3 transition"
              >
                {loading
                  ? "Verifying..."
                  : "Verify & Enter Admin Console"}
              </button>


              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setOtp("");
                  setError("");
                }}
                className="w-full text-sm text-slate-400 hover:text-white transition"
              >
                ← Back to admin login
              </button>

            </form>
          )}


          {/* Security Notice */}
          <div className="mt-6 rounded-xl border border-ink-800 bg-ink-950 p-4">

            <p className="text-xs leading-5 text-slate-500">
              This area is restricted to authorized PayGuard administrators.
              Administrative access provides visibility into fraud detection,
              risk analytics, model performance, and drift monitoring.
            </p>

          </div>

        </div>


        {/* Customer Access */}
        <div className="text-center mt-6">

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Back to Customer Portal
          </button>

        </div>


        <p className="text-center text-xs text-slate-600 mt-5">
          PayGuard · Restricted Administrative Access
        </p>

      </div>
    </div>
  );
}