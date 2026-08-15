import { NavLink } from "react-router-dom";
import logo from "../../assets/Debal(LOGO).png"; // 1. Import your logo image path here

function Navbar() {
  const navLinkStyle = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-gray-950 font-semibold"
        : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <NavLink
          to="/"
          className="text-2xl font-bold text-blue-600 tracking-tight"
        >
          <img src={logo} alt="Debal" className="h-10 w-auto" />
        </NavLink>

        {/* Navigation links (Center) */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navLinkStyle}>
            Home
          </NavLink>
          <NavLink to="/find-matches" className={navLinkStyle}>
            Find Matches
          </NavLink>
          <NavLink to="/messages" className={navLinkStyle}>
            Messages
          </NavLink>
          <NavLink to="/profile" className={navLinkStyle}>
            Profile
          </NavLink>
        </div>

        {/* Action buttons (Right) */}
        <div className="flex items-center gap-3">
          <NavLink
            to="/login"
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 shadow-sm"
          >
            Register
          </NavLink>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;