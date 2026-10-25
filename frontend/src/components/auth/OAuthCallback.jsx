import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken } from "../../services/api";
import { apiGet } from "../../services/api";
import { connectSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

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
  const { setUser } = useAuth();

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
        if (user && setUser) setUser(user);
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
  }, [searchParams, navigate, setUser]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-600">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="md" />
        <p className="text-sm font-medium">Completing Google Sign-In...</p>
      </div>
    </div>
  );
}

export default OAuthCallback;