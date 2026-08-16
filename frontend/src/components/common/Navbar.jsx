import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/Debal(LOGO).png";

function Navbar() {
  // 1. Create a state variable to track if the mobile menu is open
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 2. A helper function to close the menu after a link is clicked
  const closeMenu = () => setIsMenuOpen(false);

  const navLinkStyle = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-gray-950 font-semibold"
        : "text-gray-600 hover:text-gray-900"
    }`;

  // 3. A slightly adjusted style for mobile links to make them easier to tap
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
          <img src={logo} alt="Debal" className="h-10 w-auto" />
        </NavLink>

        {/* Desktop Navigation links (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navLinkStyle}>Home</NavLink>
          <NavLink to="/app/dashboard" className={navLinkStyle}>Find Matches</NavLink>
          <NavLink to="/app/messages" className={navLinkStyle}>Messages</NavLink>
          <NavLink to="/app/profile" className={navLinkStyle}>Profile</NavLink>
          <NavLink to="/app/verify" className={navLinkStyle}>Verification</NavLink>
        </div>

        {/* Desktop Action buttons (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-3">
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
        </div>

        {/* 4. Mobile Hamburger Button (Visible ONLY on mobile) */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
          >
            {isMenuOpen ? (
              // X icon when open
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon when closed
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 5. Mobile Menu Dropdown Panel */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="space-y-1 px-4 pb-6 pt-3">
            <NavLink to="/" className={mobileNavLinkStyle} onClick={closeMenu}>Home</NavLink>
            <NavLink to="/app/dashboard" className={mobileNavLinkStyle} onClick={closeMenu}>Find Matches</NavLink>
            <NavLink to="/app/messages" className={mobileNavLinkStyle} onClick={closeMenu}>Messages</NavLink>
            <NavLink to="/app/profile" className={mobileNavLinkStyle} onClick={closeMenu}>Profile</NavLink>
            
            {/* Mobile Action Buttons */}
            <div className="mt-6 flex flex-col gap-3">
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
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;