import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to create account."
        );
      }

      sessionStorage.setItem("payguard_verification_email", form.email);

      navigate("/verify-email");
    } catch (err) {
      setError(err.message || "Unable to create account.");
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
              Create your account
            </h1>

            <p className="text-sm text-ink-500 dark:text-ink-400 mt-2">
              Register to start protecting your digital payments.
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
                Full name
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 px-4 py-3 text-sm text-ink-900 dark:text-ink-50 outline-none focus:border-accent-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                Gmail address
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@gmail.com"
                className="w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 px-4 py-3 text-sm text-ink-900 dark:text-ink-50 outline-none focus:border-accent-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">
                Password
              </label>

              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Create a password"
                className="w-full rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 px-4 py-3 text-sm text-ink-900 dark:text-ink-50 outline-none focus:border-accent-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-medium py-3 text-sm transition-colors"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-6">
            Already have an account?{" "}
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