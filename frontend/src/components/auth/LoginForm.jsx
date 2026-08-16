import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleCredentialResponse = (response) => {
    console.log("Google credential:", response);
  };

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById("googleSignInDiv"),
      { theme: "outline", size: "large" }
    );
  }, []);

    const handleSubmit = (e) => {
      e.preventDefault();

      const mockUser = {
        email,
      };

      login(mockUser);

      console.log("Logged in:", mockUser);
    };
  return (
    <>
      <div className="mt-8">
        <div id="googleSignInDiv"></div>

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

        {/* Checkbox for Terms & Privacy */}
        <div className="flex items-center text-sm">
          <input
            id="accept-terms"
            type="checkbox"
            required
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="accept-terms" className="ml-2 text-gray-600">
            I agree to the{" "}
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="font-medium text-blue-600 underline hover:text-blue-500"
            >
              Terms and Privacy Policy
            </button>
          </label>
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

        {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">
              Terms & Privacy Policy
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Last updated: August 2026
            </p>

            <div className="mt-4 space-y-4 text-sm text-gray-600">
              <section>
                <h3 className="font-semibold text-gray-800">
                  1. Terms of Service
                </h3>
                <div className="mt-1 rounded bg-yellow-50 p-2 text-xs font-mono text-yellow-800 border-l-2 border-yellow-400">
                  TODO: Insert real Terms of Service legal copy here.
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800">
                  2. Privacy Policy
                </h3>
                <div className="mt-1 rounded bg-yellow-50 p-2 text-xs font-mono text-yellow-800 border-l-2 border-yellow-400">
                  TODO: Insert real Privacy Policy legal copy here.
                </div>
              </section>
            </div>

            <button
              type="button"
              onClick={() => setShowPrivacy(false)}
              className="mt-6 w-full rounded-lg bg-gray-900 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      </p>
    </>
  );
}

export default LoginForm;