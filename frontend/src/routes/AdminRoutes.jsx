import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLoginPage from '../pages/admin/AdminLoginPage';
import ActivityLog from '../components/admin/ActivityLog';
import VerificationQueuePage from '../pages/admin/VerificationQueuePage';
import PhotoReviewQueuePage from '../pages/admin/PhotoReviewQueuePage';
import AdminDashboardPage from '../pages/admin/AdminDashboard'; 
import AdminProtectedRoute from './AdminProtectedRoute';
import ReportsTable from '../components/admin/ReportsTable';
import AdminUsersPage from '../pages/admin/AdminUsersPage';

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />

      <Route element={<AdminProtectedRoute />}>
        
        <Route path="/dashboard" element={<AdminDashboardPage />} />
        
        <Route path="/activity" element={<ActivityLog />} />
        <Route path="/verifications" element={<VerificationQueuePage />} />
        <Route path="/photos" element={<PhotoReviewQueuePage />} />
        
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/reports" element={<ReportsTable />} />
      </Route>
      <Route path='/userTable' element={<AdminUsersPage/>} />
    </Routes>
  );
}

export default AdminRoutes;