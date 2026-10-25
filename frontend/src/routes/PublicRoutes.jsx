// src/routes/PublicRoutes.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import OAuthCallback from "../components/auth/OAuthCallback";

function RedirectIfAuthenticated({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (!user.questionnaireCompleted) {
      return <Navigate to="/questionnaire" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
}

function PublicRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RedirectIfAuthenticated>
            <LandingPage />
          </RedirectIfAuthenticated>
        }
      />

      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <LoginPage />
          </RedirectIfAuthenticated>
        }
      />

      <Route
        path="/register"
        element={
          <RedirectIfAuthenticated>
            <RegisterPage />
          </RedirectIfAuthenticated>
        }
      />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Google OAuth redirect landing – backend sends user here with ?accessToken= */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default PublicRoutes;