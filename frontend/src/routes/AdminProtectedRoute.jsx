import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthProvider'; // Verify this path matches your folder structure

const AdminProtectedRoute = () => {
  const auth = useAdminAuth();

  // Safeguard if context is missing
  if (!auth) {
    return <Navigate to="/admin/login" replace />;
  }

  const { admin, isLoading } = auth;

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return admin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;