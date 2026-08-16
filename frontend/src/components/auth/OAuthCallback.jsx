import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("authToken", token);
      navigate("/app");
    } else {
      navigate("/login?error=oauth_failed");
    }
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