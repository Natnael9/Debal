import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/Debal(LOGO).png";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  // Close profile dropdown when clicking outside
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
    logout();
    closeMenu();
    navigate("/");
  };

  const navLinkStyle = ({ isActive }) =>
    `text-xs font-semibold tracking-wide transition ${
      isActive
        ? "text-[#2274A5] font-bold"
        : "text-gray-600 hover:text-[#2274A5]"
    }`;

  const mobileNavLinkStyle = ({ isActive }) =>
    `block px-4 py-2.5 text-xs font-semibold transition rounded-xl ${
      isActive
        ? "text-[#2274A5] bg-blue-50/70 font-bold"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo - click navigates to Landing Page */}
        <NavLink
          to="/"
          className="flex items-center gap-2"
          onClick={closeMenu}
        >
          <img
            src={logo}
            alt="Debal"
            className="h-8 w-auto object-contain"
          />
        </NavLink>

        {/* ================================
            DESKTOP NAVIGATION
        ================================= */}
        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated && (
            <>
              <NavLink to="/" className={navLinkStyle}>
                Home
              </NavLink>

              <NavLink to="/app/dashboard" className={navLinkStyle}>
                Find Matches
              </NavLink>

              <NavLink to="/app/messages" className={navLinkStyle}>
                Messages
              </NavLink>
              <NavLink to="/app/bookmarks" className={navLinkStyle}>
                Book Marks
              </NavLink>
            </>
          )}
        </div>

        {/* ================================
            RIGHT SECTION: PROFILE PILL / AUTH
        ================================= */}
        <div className="hidden md:flex items-center">

          {!isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <NavLink
                to="/login"
                className="rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-98"
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="rounded-xl bg-[#2274A5] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1b5e87] active:scale-98"
              >
                Register
              </NavLink>
            </div>
          ) : (
            /* Profile Pill Dropdown Trigger */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-2 rounded-full border p-1 pr-3 transition active:scale-98 ${
                  isProfileDropdownOpen
                    ? "border-[#2274A5] bg-blue-50/50 shadow-2xs"
                    : "border-gray-200 bg-gray-50/70 hover:border-gray-300 hover:bg-white"
                }`}
              >
                {/* Circular Avatar */}
                <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#2274A5] text-xs font-bold text-white shadow-2xs">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : user?.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    "U"
                  )}
                </div>

                <span className="text-xs font-semibold text-gray-800 max-w-[100px] truncate">
                  {user?.name || "Profile"}
                </span>

                {/* Chevron icon */}
                <svg
                  className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${
                    isProfileDropdownOpen ? "rotate-180 text-blue-900" : ""
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
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-gray-100 bg-white p-1.5 shadow-lg shadow-gray-900/5 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                  
                  {/* User info header */}
                  <div className="border-b border-gray-100 px-3 py-2">
                    <p className="text-[11px] font-bold text-gray-900 truncate">
                      {user?.name || "User Account"}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {user?.email || "Signed in"}
                    </p>
                  </div>

                  <div className="py-1">
                    <NavLink
                      to="/app/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 hover:text-blue-900"
                    >
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </NavLink>

                    <NavLink
                      to="/app/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 hover:text-blue-900"
                    >
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </NavLink>
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50/70"
                    >
                      <svg className="h-3.5 w-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

        {/* ================================
            MOBILE HAMBURGER BUTTON
        ================================= */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 focus:outline-none"
          >
            {isMenuOpen ? (
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
      </div>

      {/* ================================
          MOBILE MENU
      ================================= */}
      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="space-y-1 px-4 pb-5 pt-3">
            
            {isAuthenticated && (
              <>
                <NavLink to="/" className={mobileNavLinkStyle} onClick={closeMenu}>
                  Home
                </NavLink>

                <NavLink to="/app/dashboard" className={mobileNavLinkStyle} onClick={closeMenu}>
                  Find Matches
                </NavLink>

                <NavLink to="/app/messages" className={mobileNavLinkStyle} onClick={closeMenu}>
                  Messages
                </NavLink>

                <NavLink to="/app/profile" className={mobileNavLinkStyle} onClick={closeMenu}>
                  My Profile
                </NavLink>

                <NavLink to="/app/settings" className={mobileNavLinkStyle} onClick={closeMenu}>
                  Settings
                </NavLink>
              </>
            )}

            <div className="mt-4 border-t border-gray-100 pt-3">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <NavLink
                    to="/login"
                    className="rounded-xl border border-gray-200 py-2 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    onClick={closeMenu}
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="rounded-xl bg-[#2274A5] py-2 text-center text-xs font-semibold text-white shadow-xs hover:bg-[#1b5e87]"
                    onClick={closeMenu}
                  >
                    Register
                  </NavLink>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl border border-rose-100 bg-rose-50/50 py-2 text-center text-xs font-semibold text-rose-600 hover:bg-rose-100/50"
                >
                  Logout
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;