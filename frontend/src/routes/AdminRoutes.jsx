 import { Routes, Route } from "react-router-dom";
import PhotoReviewQueuePage from '../pages/admin/PhotoReviewQueuePage';
import VerificationQueuePage from '../pages/admin/VerificationQueuePage';

const AdminDashboard = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
  </div>
);

function AdminRoutes() {
  return (
    <Routes>
      <Route path="*" element={<AdminDashboard />} />
      <Route path="/photos" element={<PhotoReviewQueuePage />}/>
      <Route path="/verification" element={<VerificationQueuePage />}/>
      
    </Routes>
  );
}

export default AdminRoutes;