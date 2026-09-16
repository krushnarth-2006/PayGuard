import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://127.0.0.1:8000";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message || "";

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
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
        setError(data.message || "Invalid email or password.");
        return;
      }

      if (data.role !== "customer") {
        setError("This account does not have customer access.");
        return;
      }

      login({
        email: data.email,
        role: data.role,
        name: data.email.split("@")[0],
      });

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to connect to PayGuard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex flex-col">

      {/* Top Navigation */}
      <header className="w-full border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <span className="text-sm font-bold text-[#070b12]">
                PG
              </span>
            </div>

            <div>
              <div className="font-semibold tracking-tight">
                PayGuard
              </div>

              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Payment Intelligence
              </div>
            </div>
          </div>

          {/* Admin Access */}
          <button
            onClick={() => navigate("/admin/login")}
            className="text-sm text-slate-400 hover:text-white transition flex items-center gap-2"
          >
            Admin Console
            <span>→</span>
          </button>

        </div>
      </header>


      {/* Main */}
      <main className="flex-1 flex items-center">

        <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-20">

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* LEFT — Product Introduction */}
            <section className="hidden lg:block">

              <div className="max-w-xl">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 mb-7">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />

                  <span className="text-xs font-medium text-emerald-300">
                    Real-time payment protection
                  </span>
                </div>


                {/* Heading */}
                <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.05]">
                  Secure every
                  <br />
                  <span className="text-slate-400">
                    digital payment.
                  </span>
                </h1>


                {/* Description */}
                <p className="mt-7 text-lg leading-8 text-slate-400 max-w-lg">
                  PayGuard analyzes payment transactions in real time
                  to identify suspicious activity before it becomes a
                  financial risk.
                </p>


                {/* Features */}
                <div className="mt-10 space-y-5">

                  <Feature
                    title="Real-time fraud detection"
                    description="Transactions are scored instantly using the PayGuard ML pipeline."
                  />

                  <Feature
                    title="Risk-based decisions"
                    description="Every transaction receives a clear fraud probability and risk level."
                  />

                  <Feature
                    title="Continuous protection"
                    description="Monitoring helps identify changing transaction behavior and model drift."
                  />

                </div>

              </div>

            </section>


            {/* RIGHT — Login */}
            <section className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">

              <div className="mb-7">

                <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">
                  Customer Portal
                </div>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Welcome back
                </h2>

                <p className="mt-2 text-slate-400">
                  Sign in to verify and protect your payments.
                </p>

              </div>


              {/* Login Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-sm p-6 lg:p-7">

                {successMessage && (
                  <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                    {successMessage}
                  </div>
                )}

                {error && (
                  <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}


                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* Email */}
                  <div>

                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email address
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-[#0b111b] px-4 py-3.5 text-white placeholder:text-slate-600 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                      required
                    />

                  </div>


                  {/* Password */}
                  <div>

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-sm font-medium text-slate-300">
                        Password
                      </label>

                      <button
                        type="button"
                        onClick={() => navigate("/forgot-password")}
                        className="text-xs text-slate-500 hover:text-white transition"
                      >
                        Forgot password?
                      </button>

                    </div>

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-white/10 bg-[#0b111b] px-4 py-3.5 text-white placeholder:text-slate-600 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                      required
                    />

                  </div>


                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-white text-[#070b12] font-semibold py-3.5 hover:bg-slate-200 disabled:opacity-60 transition"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>

                </form>


                {/* Account */}
                <div className="mt-6 pt-6 border-t border-white/10 text-center">

                  <p className="text-sm text-slate-500">
                    New to PayGuard?
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="mt-1 text-sm font-medium text-white hover:text-slate-300 transition"
                  >
                    Create a customer account
                  </button>

                </div>

              </div>


              {/* Security Indicator */}
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-600">

                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                Protected PayGuard environment

              </div>

            </section>

          </div>

        </div>

      </main>


      {/* Footer */}
      <footer className="border-t border-white/10">

        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">

          <span>
            © 2026 PayGuard
          </span>

          <span>
            Real-Time Digital Payment Fraud Detection
          </span>

        </div>

      </footer>

    </div>
  );
}


/* Feature Component */
function Feature({ title, description }) {
  return (
    <div className="flex gap-4">

      <div className="flex-shrink-0 w-9 h-9 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center">
        <span className="text-emerald-400 text-sm">
          ✓
        </span>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

    </div>
  );
}