// src/routes/PublicRoutes.jsx

import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import OAuthCallback from "../components/auth/OAuthCallback";

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

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