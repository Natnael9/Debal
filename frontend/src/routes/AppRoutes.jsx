// src/routes/AppRoutes.jsx

import { Routes, Route } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import QuestionnaireRoutes from "./QuestionnaireRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import AdminRoutes from "./AdminRoutes";

import { AdminAuthProvider } from "../context/AdminAuthProvider";

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Questionnaire */}
      <Route
        path="/questionnaire/*"
        element={<QuestionnaireRoutes />}
      />

      {/* Main authenticated application */}
      <Route
        path="/app/*"
        element={<ProtectedRoutes />}
      />

      {/* Admin */}
      <Route
        path="/admin/*"
        element={
          <AdminAuthProvider>
            <AdminRoutes />
          </AdminAuthProvider>
        }
      />
    </Routes>
  );
}

export default AppRoutes;