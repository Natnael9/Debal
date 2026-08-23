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

function VerifiedOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user?.verificationStatus !== 'verified') {
    return <Navigate to="/app/verification" replace />;
  }
  return children;
}

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
   * Dual-Gate Gate 1: Questionnaire Completion
   */
  if (!user.questionnaireCompleted) {
    return <Navigate to="/questionnaire" replace />;
  }

  return (
    <Routes>
      {/* Dashboard - Gated by Verification */}
      <Route
        path="dashboard"
        element={
          <VerifiedOnlyRoute>
            <MatchFeed />
          </VerifiedOnlyRoute>
        }
      />

      {/* Messages - Gated by Verification */}
      <Route
        path="messages"
        element={
          <VerifiedOnlyRoute>
            <ChatLayout />
          </VerifiedOnlyRoute>
        }
      />

      {/* Profile - Open to all logged-in users */}
      <Route
        path="profile"
        element={<ProfilePage />}
      />

      {/* Settings - Open to all logged-in users */}
      <Route
        path="settings"
        element={<SettingsPage />}
      />

      {/* Bookmarks - Gated by Verification */}
      <Route
        path="bookmarks"
        element={
          <VerifiedOnlyRoute>
            <BookmarksPage />
          </VerifiedOnlyRoute>
        }
      />

      {/* Candidate profile - Gated by Verification */}
      <Route
        path="candidate-profile/:userId"
        element={
          <VerifiedOnlyRoute>
            <CandidateProfilePage />
          </VerifiedOnlyRoute>
        }
      />

      {/* Verification Wizard */}
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