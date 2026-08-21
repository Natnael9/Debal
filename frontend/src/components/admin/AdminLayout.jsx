import React from "react";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">

      <AdminNavbar />

      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

    </div>
  );
};

export default AdminLayout;