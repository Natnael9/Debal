import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthProvider";
import logo from "../../assets/Debal(LOGO).png";

const AdminNavbar = () => {
  const { admin, adminLogout } = useAdminAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    adminLogout();
    navigate("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Reports", path: "/admin/reports" },
    { name: "Users", path: "/admin/users" },
    { name: "Activity Log", path: "/admin/activity" },
    { name: "Verification", path: "/admin/verifications" },
    { name: "Photo Review", path: "/admin/photos" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#071E2D]/95 backdrop-blur-md text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-15 items-center justify-between gap-4">

          {/* BRAND LOGO & BADGE */}
          <div className="flex items-center gap-2.5">
            <NavLink
              to={admin ? "/admin/dashboard" : "/admin/login"}
              className="flex items-center"
            >
              <img
                src={logo}
                alt="Debal"
                className="h-7 w-auto object-contain brightness-0 invert"
              />
            </NavLink>
            <span className="rounded-md border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
              Admin
            </span>
          </div>

          {/* ADMIN IS LOGGED IN */}
          {admin && (
            <>
              {/* DESKTOP NAVIGATION */}
              <nav className="hidden lg:flex items-center gap-1.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide transition active:scale-98 ${
                        isActive
                          ? "bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-2xs"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>

              {/* RIGHT: PROFILE PILL DROPDOWN TRIGGER */}
              <div className="hidden sm:flex items-center">
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                    className={`flex items-center gap-2 rounded-full border p-1 pr-3 transition active:scale-98 ${
                      isProfileDropdownOpen
                        ? "border-sky-400/40 bg-sky-500/15 shadow-2xs"
                        : "border-slate-700/80 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800"
                    }`}
                  >
                    {/* Circular Avatar */}
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 text-xs font-bold text-white shadow-2xs">
                      {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
                    </div>

                    <span className="max-w-[120px] truncate text-xs font-semibold text-slate-100">
                      {admin.name || "Admin"}
                    </span>

                    {/* Chevron Icon */}
                    <svg
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                        isProfileDropdownOpen ? "rotate-180 text-sky-300" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Popup Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl border border-slate-700/80 bg-[#0B2538] p-1.5 shadow-2xl ring-1 ring-black/20 animate-in fade-in zoom-in-95 duration-100">
                      
                      {/* Admin Info Header */}
                      <div className="border-b border-slate-700/70 px-3 py-2">
                        <p className="truncate text-[11px] font-bold text-white">
                          {admin.name || "Administrator"}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] capitalize text-sky-300 font-medium">
                          {admin.role || "Super Admin"}
                        </p>
                      </div>

                      {/* Menu Actions */}
                      <div className="py-1">
                        <NavLink
                          to="/admin/dashboard"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                        >
                          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Console Overview
                        </NavLink>
                      </div>

                      {/* Logout Action */}
                      <div className="border-t border-slate-700/70 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <svg className="h-3.5 w-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </div>

              {/* MOBILE HAMBURGER BUTTON */}
              <div className="flex lg:hidden items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="rounded-xl border border-slate-700/80 bg-slate-800/60 p-2 text-slate-300 hover:text-white"
                >
                  {isMobileMenuOpen ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* MOBILE MENU */}
      {admin && isMobileMenuOpen && (
        <div className="border-t border-slate-800 bg-[#071E2D] lg:hidden">
          <div className="space-y-1 px-4 pb-5 pt-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            <div className="mt-4 border-t border-slate-800 pt-3">
              <div className="mb-2.5 px-3.5">
                <p className="text-xs font-bold text-white">{admin.name}</p>
                <p className="text-[10px] capitalize text-sky-300">{admin.role}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl border border-rose-500/20 bg-rose-500/10 py-2 text-center text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;