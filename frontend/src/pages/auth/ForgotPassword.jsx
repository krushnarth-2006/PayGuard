import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email) {
      setError("Please enter your Gmail address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to send reset OTP."
        );
      }

      sessionStorage.setItem("payguard_reset_email", email);

      navigate("/reset-password");
    } catch (err) {
      setError(err.message || "Unable to send reset OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-sm p-6 lg:p-8 shadow-xl">

          <div className="mb-7">

            <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">
              Customer Portal
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Forgot password?
            </h1>

            <p className="mt-2 text-slate-400">
              Enter your Gmail address and we'll send you a password reset OTP.
            </p>

          </div>


          {error && (
            <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-5">

            <div>

              <label className="block text-sm font-medium text-slate-300 mb-2">
                Gmail address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@gmail.com"
                className="w-full rounded-xl border border-white/10 bg-[#0b111b] px-4 py-3.5 text-white placeholder:text-slate-600 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                required
              />

            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white text-[#070b12] font-semibold py-3.5 hover:bg-slate-200 disabled:opacity-60 transition"
            >
              {loading ? "Sending OTP..." : "Send reset OTP"}
            </button>

          </form>


          <div className="mt-6 text-center">

            <Link
              to="/login"
              className="text-sm text-slate-400 hover:text-white transition"
            >
              ← Back to sign in
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}