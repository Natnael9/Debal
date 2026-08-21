import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import { apiPost } from "../services/api";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing password reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiPost("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      setMessage(res.message || "Password reset successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2500);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try requesting a new link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Set New Password"
      description="Enter your new password below to reset your account."
    >
      {!token ? (
        <div className="space-y-4 text-center">
          <p className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
            Invalid or missing reset token. Please request a new password reset link.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block text-xs font-bold text-blue-900 hover:underline"
          >
            Request New Reset Link
          </Link>
        </div>
      ) : message ? (
        <div className="space-y-4 text-center">
          <div className="rounded-lg bg-green-50 p-3 text-xs font-medium text-green-700">
            {message}
          </div>
          <Link
            to="/login"
            className="inline-block text-xs font-bold text-blue-900 hover:underline"
          >
            Proceed to Sign In
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
            <label htmlFor="newPassword" className="mb-1 block text-[11px] font-semibold text-gray-700">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-1 focus:ring-blue-900/20"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-[11px] font-semibold text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-1 focus:ring-blue-900/20"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-900 py-2 text-xs font-bold text-white transition hover:bg-blue-800 active:scale-98 disabled:opacity-60"
          >
            {isSubmitting ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}

export default ResetPasswordPage;
