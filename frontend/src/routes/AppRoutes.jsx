import { Routes, Route } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import QuestionnaireRoutes from "./QuestionnaireRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import AdminRoutes from "./AdminRoutes";

import { AdminAuthProvider } from "../context/AdminAuthProvider";

import AppLayout from "../components/common/AppLayout";
import AdminLayout from "../components/admin/AdminLayout";

function AppRoutes() {
  return (
    <Routes>

      {/* =====================================
          PUBLIC PAGES
          Navbar + Footer
      ===================================== */}

      <Route
        path="/*"
        element={
          <AppLayout>
            <PublicRoutes />
          </AppLayout>
        }
      />

      {/* =====================================
          QUESTIONNAIRE
          Navbar + Footer
      ===================================== */}

      <Route
        path="/questionnaire/*"
        element={
          <AppLayout>
            <QuestionnaireRoutes />
          </AppLayout>
        }
      />

      {/* =====================================
          NORMAL USER APPLICATION
          Navbar + Footer
      ===================================== */}

      <Route
        path="/app/*"
        element={
          <AppLayout>
            <ProtectedRoutes />
          </AppLayout>
        }
      />

      {/* =====================================
          ADMIN APPLICATION
          AdminNavbar
          NO Footer
      ===================================== */}

      <Route
        path="/admin/*"
        element={
          <AdminAuthProvider>
            <AdminLayout>
              <AdminRoutes />
            </AdminLayout>
          </AdminAuthProvider>
        }
      />

    </Routes>
  );
}

export default AppRoutes;