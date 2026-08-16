import { Routes, Route } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import QuestionnaireRoutes from "./QuestionnaireRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import AdminRoutes from "./AdminRoutes";
import OAuthCallback from "../components/auth/OAuthCallback";

function AppRoutes() {
  return (
    <Routes>
      {/* Public application */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Questionnaire / onboarding */}
      <Route
        path="/questionnaire/*"
        element={<QuestionnaireRoutes />}
      />

      {/* Authenticated user application */}
      <Route
        path="/app/*"
        element={<ProtectedRoutes />}
      />

      {/* Separate admin application */}
      <Route
        path="/admin/*"
        element={<AdminRoutes />}
      />
    </Routes>
  );
}

export default AppRoutes;