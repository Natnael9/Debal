import { Routes, Route } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import QuestionnaireRoutes from "./QuestionnaireRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import AdminRoutes from "./AdminRoutes";
import { AdminAuthProvider } from "../context/AdminAuthProvider";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<PublicRoutes />} />
      <Route path="/questionnaire/*" element={<QuestionnaireRoutes />} />
      <Route path="/app/*" element={<ProtectedRoutes />} />

      {/* This wrapper provides the useAdminAuth context */}
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