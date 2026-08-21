// src/routes/ProtectedRoutes.jsx

import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import ProfilePage from "../pages/ProfilePage";
import MatchFeed from "../pages/Dashboard";
import ChatLayout from "../pages/chat/ChatLayout";
import VerificationWizard from "../pages/VerificationWizard";
import SettingsPage from "../pages/SettingsPage";
import BookmarksPage from "../pages/BookmarksPage";
import CandidateProfilePage from "../pages/CandidateProfilePage";

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </div>
    );
  }

  /*
   * User is not logged in.
   */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /*
   * User is logged in but has not completed
   * the questionnaire.
   *
   * We don't redirect here because the questionnaire
   * is outside /app.
   */
  return (
    <Routes>
      {/* Dashboard */}
      <Route
        path="dashboard"
        element={<MatchFeed />}
      />

      {/* Messages */}
      <Route
        path="messages"
        element={<ChatLayout />}
      />

      {/* Profile */}
      <Route
        path="profile"
        element={<ProfilePage />}
      />

      {/* Settings */}
      <Route
        path="settings"
        element={<SettingsPage />}
      />

      {/* Bookmarks */}
      <Route
        path="bookmarks"
        element={<BookmarksPage />}
      />

      {/* Candidate profile */}
      <Route
        path="candidate-profile/:userId"
        element={<CandidateProfilePage />}
      />

      {/* Verification */}
      <Route
        path="verification"
        element={<VerificationWizard />}
      />

      {/* Unknown /app route */}
      <Route
        path="*"
        element={<Navigate to="dashboard" replace />}
      />
    </Routes>
  );
}

export default ProtectedRoutes;