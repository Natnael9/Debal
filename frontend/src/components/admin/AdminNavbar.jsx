import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthProvider";

const AdminNavbar = () => {
  const { admin, adminLogout } = useAdminAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      name: "Reports",
      path: "/admin/reports",
    },
    {
      name: "Users",
      path: "/admin/users",
    },
    {
      name: "Activity Log",
      path: "/admin/activity",
    },
    {
      name: "Verification",
      path: "/admin/verifications",
    },
    {
      name: "Photo Review",
      path: "/admin/photos",
    },
  ];

  return (
    <header className="bg-[#0B3954] text-white shadow-lg">
      <div className="max-w-full px-6">
        <div className="h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link
            to="/admin/dashboard"
            className="text-xl font-bold"
          >
            Debal Admin
          </Link>

          {/* NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-[#2274A5] text-white"
                      : "text-gray-200 hover:bg-[#1A5C83]"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* ADMIN ACCOUNT */}
          <div className="flex items-center gap-4">

            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold">
                {admin?.name}
              </p>

              <p className="text-xs text-gray-300 capitalize">
                {admin?.role}
              </p>
            </div>

            <button
              onClick={adminLogout}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;