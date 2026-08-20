import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const credentials = {
      email,
      password,
      rememberMe,
    };

    try {
      const result = await login(credentials);

      if (result?.success) {
        console.log("Logged in:", result.user);

        // After login → Matching page
        navigate("/app/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <>
      {/* Google Login */}
      <div className="mt-8">
        <a
          href="http://localhost:5000/api/v1/auth/google"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
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
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>

          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form
        className="mt-8 space-y-6"
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>
        </div>

        {/* Remember / Forgot */}
        <div className="flex items-center justify-between text-sm">

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            <label
              htmlFor="remember-me"
              className="ml-2 text-gray-600"
            >
              Remember me
            </label>
          </div>

          {/* Forgot Password */}
          <a
            href="#"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Sign in
        </button>
      </form>

      {/* Register Link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{" "}

        <Link
          to="/register"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Register
        </Link>
      </p>
    </>
  );
}

export default LoginForm;