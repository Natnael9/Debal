import React from "react";
import { Routes, Route } from "react-router-dom";

import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminDashboardPage from "../pages/admin/AdminDashboard";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import PhotoReviewQueuePage from "../pages/admin/PhotoReviewQueuePage";
import VerificationQueuePage from "../pages/admin/VerificationQueuePage";

import AdminLayout from "../components/admin/AdminLayout";
import AdminProtectedRoute from "./AdminProtectedRoute";

import ActivityLog from "../components/admin/ActivityLog";
import ReportsTable from "../components/admin/ReportsTable";

function AdminRoutes() {
  return (
    <Routes>
      {/* ============================= */}
      {/* ADMIN LOGIN */}
      {/* ============================= */}

      <Route
        path="/login"
        element={<AdminLoginPage />}
      />

      {/* ============================= */}
      {/* PROTECTED ADMIN PAGES */}
      {/* ============================= */}

      <Route
        path="/dashboard"
          element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>}
      />

      <Route
        path="/activity"
          element={<AdminProtectedRoute><ActivityLog /></AdminProtectedRoute>}
      />

      <Route
        path="/reports"
          element={<AdminProtectedRoute><ReportsTable /></AdminProtectedRoute>}
      />

      <Route
        path="/users"
          element={<AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>}
      />

      <Route
        path="/verifications"
          element={<AdminProtectedRoute><VerificationQueuePage /></AdminProtectedRoute>}
      />

      <Route
        path="/photos"
          element={<AdminProtectedRoute><PhotoReviewQueuePage /></AdminProtectedRoute>}
      />
    </Routes>
  );
}

export default AdminRoutes;