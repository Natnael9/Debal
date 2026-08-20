import { Routes, Route, Navigate } from "react-router-dom";

import ProfilePage from "../pages/ProfilePage";
import MatchFeed from "../pages/Dashboard";
import ChatLayout from "../pages/chat/ChatLayout";
import VerificationWizard from "../pages/VerificationWizard";
import SettingsPage from "../pages/SettingsPage";
import BookmarksPage from "../pages/BookmarksPage";
import CandidateProfilePage from "../pages/CandidateProfilePage";

function ProtectedRoutes() {
  const user = {
    questionnaireCompleted: true,
  };

  const isLoading = false;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    !user.questionnaireCompleted &&
    window.location.pathname !== "/questionnaire"
  ) {
    return <Navigate to="/questionnaire" replace />;
  }

  return (
    <Routes>

      {/* Main application */}

      <Route
        path="dashboard"
        element={<MatchFeed />}
      />

      <Route
        path="messages"
        element={<ChatLayout />}
      />

      <Route
        path="profile"
        element={<ProfilePage />}
      />

      <Route
        path="settings"
        element={<SettingsPage />}
      />

      <Route
        path="bookmarks"
        element={<BookmarksPage />}
      />

      {/* Candidate profile */}

      <Route
        path="candidate-profile/:userId"
        element={<CandidateProfilePage />}
      />

      {/* Optional verification */}

      <Route
        path="verification"
        element={<VerificationWizard />}
      />

      {/* Fallback */}

      <Route
        path="*"
        element={<Navigate to="dashboard" replace />}
      />

    </Routes>
  );
}

export default ProtectedRoutes;