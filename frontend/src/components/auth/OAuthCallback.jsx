import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken } from "../../services/api";
import { apiGet } from "../../services/api";
import { connectSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

/**
 * Landing page for Google OAuth redirect.
 * Backend sends the user to: /auth/callback?token=<accessToken>
 *
 * We store the token, fetch the user profile to populate AuthContext,
 * then redirect to the appropriate page.
 */
function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Backend redirects to /oauth/callback?accessToken=<token>
    const token = searchParams.get("accessToken") || searchParams.get("token");

    if (!token) {
      navigate("/login?error=oauth_failed", { replace: true });
      return;
    }

    // Persist the token
    setToken(token);

    // Hydrate the user from the backend, then redirect
    apiGet("/users/me")
      .then((data) => {
        const user = data?.data?.user;
        connectSocket(token);

        if (!user?.questionnaireCompleted) {
          navigate("/questionnaire", { replace: true });
        } else {
          navigate("/app/dashboard", { replace: true });
        }
      })
      .catch(() => {
        navigate("/login?error=oauth_failed", { replace: true });
      });
  }, [searchParams, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-600">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        <p className="text-sm font-medium">Completing Google Sign-In...</p>
      </div>
    </div>
  );
}

export default OAuthCallback;