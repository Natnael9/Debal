import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { registerSchema } from "../../schemas/authSchema";

function RegisterForm() {
  const { login } = useAuth();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await login({
        name: data.name,
        email: data.email,
      });
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Google Sign Up */}
      <a
        href="http://localhost:5000/api/v1/auth/google"
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:border-gray-300 hover:bg-gray-50 active:scale-98"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Continue with Google
      </a>

      {/* Divider */}
      <div className="relative my-4.5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-[11px]">
          <span className="bg-white px-3 font-medium text-gray-400">
            or continue with email
          </span>
        </div>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-xs font-semibold text-gray-700"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Abebe Bikila"
            {...register("name")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/10"
          />
          {errors.name && (
            <p className="mt-1 text-[11px] font-medium text-rose-600">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-semibold text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/10"
          />
          {errors.email && (
            <p className="mt-1 text-[11px] font-medium text-rose-600">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-semibold text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/10"
          />
          {errors.password && (
            <p className="mt-1 text-[11px] font-medium text-rose-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Terms & Privacy Checkbox */}
        <div className="flex items-start gap-2 pt-0.5 text-[11px]">
          <input
            id="accept-terms"
            type="checkbox"
            required
            className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
          />
          <label htmlFor="accept-terms" className="text-gray-500 leading-relaxed">
            I agree to the{" "}
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="font-semibold text-blue-900 underline hover:text-blue-800"
            >
              Terms and Privacy Policy
            </button>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1.5 w-full rounded-xl bg-blue-900 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-800 active:scale-98 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Get Started"}
        </button>
      </form>

      {/* Login Footer */}
      <p className="mt-5 text-center text-xs text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold text-blue-900 transition hover:underline"
        >
          Sign in
        </Link>
      </p>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Terms & Privacy Policy
                </h2>
                <p className="mt-0.5 text-[10px] text-gray-400">
                  Last updated: August 2026
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-gray-600">
              <section>
                <h3 className="font-bold text-gray-800">
                  1. Terms of Service
                </h3>
                <div className="mt-1.5 rounded-xl border border-amber-200/60 bg-amber-50/50 p-2.5 text-[11px] text-amber-800 leading-relaxed">
                  By using this platform, you agree to provide authentic information and engage respectfully with potential roommates.
                </div>
              </section>

              <section>
                <h3 className="font-bold text-gray-800">
                  2. Privacy Policy
                </h3>
                <div className="mt-1.5 rounded-xl border border-amber-200/60 bg-amber-50/50 p-2.5 text-[11px] text-amber-800 leading-relaxed">
                  Your profile preferences are used solely for matchmaking purposes and are not shared with unauthorized third parties.
                </div>
              </section>
            </div>

            <button
              type="button"
              onClick={() => setShowPrivacy(false)}
              className="mt-6 w-full rounded-xl bg-blue-900 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-800 active:scale-98"
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