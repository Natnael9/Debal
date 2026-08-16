import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/Debal(LOGO).png";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const navLinkStyle = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-gray-950 font-semibold"
        : "text-gray-600 hover:text-gray-900"
    }`;

  const mobileNavLinkStyle = ({ isActive }) =>
    `block px-4 py-3 text-base font-medium transition rounded-md ${
      isActive
        ? "text-blue-700 bg-blue-50 font-semibold"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <NavLink
          to="/"
          className="text-2xl font-bold text-blue-600 tracking-tight"
          onClick={closeMenu}
        >
          <img
            src={logo}
            alt="Debal"
            className="h-10 w-auto"
          />
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            className={navLinkStyle}
          >
            Home
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink
                to="/app/find-matches"
                className={navLinkStyle}
              >
                Find Matches
              </NavLink>

              <NavLink
                to="/app/messages"
                className={navLinkStyle}
              >
                Messages
              </NavLink>

              <NavLink
                to="/app/profile"
                className={navLinkStyle}
              >
                Profile
              </NavLink>
            </>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm font-medium text-gray-700">
                Hi, {user?.name}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-lg border border-blue-900 px-4 py-2 text-sm font-medium text-blue-900 transition hover:bg-blue-50"
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 shadow-sm"
              >
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="space-y-1 px-4 pb-6 pt-3">

            {/* Home */}
            <NavLink
              to="/"
              className={mobileNavLinkStyle}
              onClick={closeMenu}
            >
              Home
            </NavLink>

            {/* Authenticated Links */}
            {isAuthenticated && (
              <>
                <NavLink
                  to="/app/find-matches"
                  className={mobileNavLinkStyle}
                  onClick={closeMenu}
                >
                  Find Matches
                </NavLink>

                <NavLink
                  to="/app/messages"
                  className={mobileNavLinkStyle}
                  onClick={closeMenu}
                >
                  Messages
                </NavLink>

                <NavLink
                  to="/app/profile"
                  className={mobileNavLinkStyle}
                  onClick={closeMenu}
                >
                  Profile
                </NavLink>
              </>
            )}

            {/* Mobile Actions */}
            <div className="mt-6 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                    Hi, {user?.name}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="rounded-lg bg-blue-900 px-4 py-2.5 text-base font-medium text-white transition hover:bg-blue-700 shadow-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="text-center rounded-lg border border-blue-600 px-4 py-2.5 text-base font-medium text-blue-600 transition hover:bg-blue-50"
                    onClick={closeMenu}
                  >
                    Login
                  </NavLink>

                  <NavLink
                    to="/register"
                    className="text-center rounded-lg bg-blue-900 px-4 py-2.5 text-base font-medium text-white transition hover:bg-blue-700 shadow-sm"
                    onClick={closeMenu}
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;