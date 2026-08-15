import { Link } from "react-router-dom";
import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      email,
      password,
    });
  };

  return (
    <>
    <div className="mt-8">
  <button
    type="button"
    className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
  >
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.57-5.17 3.57-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3a7.18 7.18 0 0 1-10.69-3.79H1.39v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.39 14.31A7.22 7.22 0 0 1 5.39 9.7V6.61H1.39a12 12 0 0 0 0 10.78l4-3.08Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.81l3.44-3.44C17.95 1.1 15.24 0 12 0A12 12 0 0 0 1.39 6.61l4 3.09A7.18 7.18 0 0 1 12 4.77Z"
      />
    </svg>

    Continue with Google
  </button>

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
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

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
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>

        </div>

        {/* Remember / Forgot */}
        <div className="flex items-center justify-between text-sm">

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            <label
              htmlFor="remember-me"
              className="ml-2 text-gray-600"
            >
              Remember me
            </label>
          </div>

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

      {/* Register link */}
      <p className="text-center text-sm text-gray-500">
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