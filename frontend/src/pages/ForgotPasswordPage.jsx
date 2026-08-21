import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import { apiPost } from "../services/api";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const res = await apiPost("/auth/forgot-password", { email });
      setMessage(res.message || "A password reset link has been sent to your email.");
    } catch (err) {
      setError(err.message || "Failed to process request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Reset Password"
      description="Enter your registered email to receive a password reset link."
    >
      {message ? (
        <div className="space-y-4 text-center">
          <div className="rounded-lg bg-green-50 p-3 text-xs font-medium text-green-700">
            {message}
          </div>
          <Link
            to="/login"
            className="inline-block text-xs font-bold text-blue-900 hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-[11px] font-semibold text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-1 focus:ring-blue-900/20"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-900 py-2 text-xs font-bold text-white transition hover:bg-blue-800 active:scale-98 disabled:opacity-60"
          >
            {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
          </button>

          <p className="pt-2 text-center text-[11px] text-gray-500">
            Remember your password?{" "}
            <Link to="/login" className="font-bold text-blue-900 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}

export default ForgotPasswordPage;
