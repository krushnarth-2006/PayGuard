import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function VerifyEmail() {
  const navigate = useNavigate();

  const email =
    sessionStorage.getItem("payguard_verification_email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email) {
      setError("Verification email not found. Please register again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP sent to your Gmail.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
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
            : "Unable to verify email."
        );
      }

      sessionStorage.removeItem("payguard_verification_email");

      navigate("/login", {
        replace: true,
        state: {
          message: "Email verified successfully. You can now sign in.",
        },
      });
    } catch (err) {
      setError(err.message || "Unable to verify email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-7">
            <p className="text-accent-500 text-sm font-semibold mb-2">
              PAYGUARD
            </p>

            <h1 className="text-2xl font-semibold text-ink-900 dark:text-ink-50">
              Verify your email
            </h1>

            <p className="text-sm text-ink-500 dark:text-ink-400 mt-2">
              Enter the 6-digit OTP sent to:
            </p>

            <p className="text-sm font-medium text-ink-800 dark:text-ink-200 mt-1 break-all">
              {email || "your Gmail address"}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                Verification code
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter 6-digit OTP"
                className="w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 px-4 py-3 text-center tracking-[0.35em] text-lg text-ink-900 dark:text-ink-50 outline-none focus:border-accent-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-medium py-3 text-sm transition-colors"
            >
              {loading ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-6">
            Already verified?{" "}
            <Link
              to="/login"
              className="font-medium text-accent-600 dark:text-accent-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}