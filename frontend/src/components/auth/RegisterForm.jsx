import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAuth, validatePasswordStrength } from "../../context/AuthContext";
import { registerSchema } from "../../schemas/authSchema";

function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password") || "";
  const pwdStrength = validatePasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    setError("");
    try {
      setIsSubmitting(true);
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (result?.success) {
        // New users always go to questionnaire first
        navigate("/questionnaire", { replace: true });
      } else {
        setError(result?.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Google Sign Up */}
      {/* <a
        href="/api/v1/auth/google"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-98"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Continue with Google
      </a> */}

      {/* Divider */}
      {/* <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-[10px]">
          <span className="bg-white px-2 font-medium text-gray-400">or</span>
        </div>
      </div> */}

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
        <div>
          <label htmlFor="name" className="mb-1 block text-[11px] font-semibold text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Abebe Bikila"
            {...register("name")}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-1 focus:ring-blue-900/20"
          />
          {errors.name && (
            <p className="mt-0.5 text-[10px] font-medium text-rose-600 leading-tight">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-[11px] font-semibold text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-1 focus:ring-blue-900/20"
          />
          {errors.email && (
            <p className="mt-0.5 text-[10px] font-medium text-rose-600 leading-tight">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-[11px] font-semibold text-gray-700">
              Password
            </label>
            {passwordValue.length > 0 && (
              <span className={`text-[10px] font-bold ${
                pwdStrength.score <= 1 ? 'text-rose-600' :
                pwdStrength.score === 2 ? 'text-amber-600' :
                pwdStrength.score === 3 ? 'text-blue-600' : 'text-emerald-600'
              }`}>
                {pwdStrength.strengthLabel}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/60 pl-3 pr-9 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-1 focus:ring-blue-900/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.01 10.01 0 014.122-.963c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Strength Bar */}
          {passwordValue.length > 0 && (
            <div className="mt-1.5 flex h-1 w-full gap-1 overflow-hidden rounded-full bg-gray-100">
              <div className={`h-full flex-1 transition-all duration-300 ${pwdStrength.score >= 1 ? (pwdStrength.score === 1 ? 'bg-rose-500' : pwdStrength.score === 2 ? 'bg-amber-500' : pwdStrength.score === 3 ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-transparent'}`} />
              <div className={`h-full flex-1 transition-all duration-300 ${pwdStrength.score >= 2 ? (pwdStrength.score === 2 ? 'bg-amber-500' : pwdStrength.score === 3 ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-transparent'}`} />
              <div className={`h-full flex-1 transition-all duration-300 ${pwdStrength.score >= 3 ? (pwdStrength.score === 3 ? 'bg-blue-500' : 'bg-emerald-500') : 'bg-transparent'}`} />
              <div className={`h-full flex-1 transition-all duration-300 ${pwdStrength.score >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
            </div>
          )}

          {/* Interactive Requirement Checklist */}
          {passwordValue.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 rounded-lg border border-gray-100 bg-gray-50/50 p-2 text-[10px]">
              <div className={`flex items-center gap-1 ${pwdStrength.checks.hasMinLength ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                <span>{pwdStrength.checks.hasMinLength ? '✓' : '○'}</span>
                <span>At least 8 chars</span>
              </div>
              <div className={`flex items-center gap-1 ${pwdStrength.checks.hasUppercase ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                <span>{pwdStrength.checks.hasUppercase ? '✓' : '○'}</span>
                <span>Uppercase (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1 ${pwdStrength.checks.hasLowercase ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                <span>{pwdStrength.checks.hasLowercase ? '✓' : '○'}</span>
                <span>Lowercase (a-z)</span>
              </div>
              <div className={`flex items-center gap-1 ${pwdStrength.checks.hasNumber ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                <span>{pwdStrength.checks.hasNumber ? '✓' : '○'}</span>
                <span>Number (0-9)</span>
              </div>
              <div className={`col-span-2 flex items-center gap-1 ${pwdStrength.checks.hasSpecialChar ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                <span>{pwdStrength.checks.hasSpecialChar ? '✓' : '○'}</span>
                <span>Special char (!@#$%^&*)</span>
              </div>
            </div>
          )}

          {errors.password && (
            <p className="mt-1 text-[10px] font-medium text-rose-600 leading-tight">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-[11px] font-semibold text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/60 pl-3 pr-9 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-1 focus:ring-blue-900/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              title={showConfirmPassword ? "Hide password" : "Show password"}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.01 10.01 0 014.122-.963c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-0.5 text-[10px] font-medium text-rose-600 leading-tight">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-center gap-1.5 pt-0.5 text-[10px]">
          <input
            id="accept-terms"
            type="checkbox"
            required
            className="h-3 w-3 rounded border-gray-300 text-blue-900 focus:ring-0"
          />
          <label htmlFor="accept-terms" className="text-gray-500">
            Agree to{" "}
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="font-semibold text-blue-900 underline"
            >
              Terms & Privacy
            </button>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full rounded-lg bg-blue-900 py-2 text-xs font-bold text-white transition hover:bg-blue-800 active:scale-98 disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-3.5 text-center text-[11px] text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-blue-900 hover:underline">
          Sign in
        </Link>
      </p>

      {/* Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="max-h-[75vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-xs font-bold text-gray-900">Terms & Privacy</h2>
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-[11px] text-gray-600">
              <p>Your profile data is only used for room and roommate matching.</p>
              <p>Authentic information is required to maintain platform safety.</p>
            </div>

            <button
              type="button"
              onClick={() => setShowPrivacy(false)}
              className="mt-4 w-full rounded-lg bg-blue-900 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterForm;