import { Routes, Route, Navigate } from "react-router-dom";

// 1. Add your new imports here:
import MatchCard from "../components/matchmaking/MatchCard";
import ChatList from "../components/chat/ChatList";
import ProfilePage from "../pages/ProfilePage";
import MatchFeed from "../pages/Dashboard";
import VerificationWizard from '../pages/VerificationWizard';
import BookmarksPage from '../pages/BookmarksPage';




function ProtectedRoutes() {
  // 1. Change user from null to this object:
  const user = { questionnaireCompleted: true }; 
  const isLoading = false;
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.questionnaireCompleted && window.location.pathname !== '/questionnaire') {
    return <Navigate to="/questionnaire" replace />;
  }

  return (
    <Routes>
      
      
      {/* 2. Add the new routes here: */}
      <Route path="/dashboard" element={<MatchFeed />} />
      <Route path="/messages" element={<ChatList />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/bookmarks" element={<BookmarksPage />} />
      
      
      
      
    </Routes>
  );
}

export default ProtectedRoutes;