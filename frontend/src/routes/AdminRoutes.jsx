 import { Routes, Route } from "react-router-dom";

const AdminDashboard = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
  </div>
);

function AdminRoutes() {
  return (
    <Routes>
      <Route path="*" element={<AdminDashboard />} />
    </Routes>
  );
}

export default AdminRoutes;