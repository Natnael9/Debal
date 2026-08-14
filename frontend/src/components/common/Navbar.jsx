import { NavLink } from "react-router-dom";

function Navbar() {
  const navLinkStyle = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-gray-900"
        : "text-gray-500 hover:text-gray-900"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <NavLink
          to="/"
          className="text-2xl font-bold text-gray-900"
        >
          Debal 
        </NavLink>

        {/* Navigation links */}
        <div className="flex items-center gap-6">
          <NavLink
            to="/"
            className={navLinkStyle}
          >
            Home
          </NavLink>

          <NavLink
            to="/login"
            className={navLinkStyle}
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Get Started
          </NavLink>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;