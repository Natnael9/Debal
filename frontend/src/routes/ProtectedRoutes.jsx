// src/routes/ProtectedRoutes.jsx

import { Routes, Route, Navigate, Link } from "react-router-dom";
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
    return (
      <div className="flex min-h-[75vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#2274A5] mb-5 border border-blue-100">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h2 className="text-lg font-bold text-gray-900">ID Verification Required</h2>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            To ensure safety and mutual trust, chatting, sending messages, and organizing meetups require verified identity. All other features like browsing roommates and bookmarks remain open.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/app/verification"
              className="inline-flex items-center justify-center rounded-xl bg-[#2274A5] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1b5e87] active:scale-98"
            >
              Verify My ID Now
            </Link>
            <Link
              to="/app/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-98"
            >
              Back to Browse Feed
            </Link>
          </div>
        </div>
      </div>
    );
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
   * Gate 1: Questionnaire Completion
   */
  if (!user.questionnaireCompleted) {
    return <Navigate to="/questionnaire" replace />;
  }

  return (
    <Routes>
      {/* Dashboard - Open to all logged-in questionnaire-completed users */}
      <Route
        path="dashboard"
        element={<MatchFeed />}
      />

      {/* Messages / Chat - Gated by Verification */}
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

      {/* Bookmarks - Open to all logged-in questionnaire-completed users */}
      <Route
        path="bookmarks"
        element={<BookmarksPage />}
      />

      {/* Candidate profile - Open to all logged-in questionnaire-completed users */}
      <Route
        path="candidate-profile/:userId"
        element={<CandidateProfilePage />}
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
