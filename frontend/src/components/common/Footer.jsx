import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/Debal(LOGO).png";

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <NavLink
              to="/"
              className="text-2xl font-bold tracking-tight text-blue-600"
            >
              <img
                src={logo}
                alt="Debal"
                className="h-9 w-auto"
              />
            </NavLink>

            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-500">
              Find compatible roommates, discover better living
              arrangements, and build a comfortable home together.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#2274A5] hover:bg-[#2274A5] hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.4-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.2V11H7.4v3h2.7v8h3.4z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#2274A5] hover:bg-[#2274A5] hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    ry="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                  />
                </svg>
              </a>

              {/* Twitter */}
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#2274A5] hover:bg-[#2274A5] hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.2-8.3L3 2h6.2l4.3 5.7L18.9 2zm-1.1 17.9h1.7L8.3 3.9H6.5l11.3 16z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#2274A5] hover:bg-[#2274A5] hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6.5 8.5H3V21h3.5V8.5zM4.75 3C3.65 3 3 3.7 3 4.65S3.65 6.3 4.7 6.3h.05c1.1 0 1.75-.7 1.75-1.65C6.5 3.7 5.85 3 4.75 3zM21 13.8c0-3.8-2-5.6-4.7-5.6-2.15 0-3.1 1.2-3.65 2v-1.7H9.2V21h3.45v-6.2c0-1.65.3-3.25 2.35-3.25 2 0 2.05 1.8 2.05 3.35V21H21v-7.2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Product
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/app/dashboard"
                  className="text-sm text-gray-500 transition hover:text-[#2274A5]"
                >
                  Find Matches
                </Link>
              </li>

              <li>
                <Link
                  to="/app/messages"
                  className="text-sm text-gray-500 transition hover:text-[#2274A5]"
                >
                  Messages
                </Link>
              </li>

              <li>
                <Link
                  to="/app/profile"
                  className="text-sm text-gray-500 transition hover:text-[#2274A5]"
                >
                  My Profile
                </Link>
              </li>

              <li>
                <Link
                  to="/questionnaire"
                  className="text-sm text-gray-500 transition hover:text-[#2274A5]"
                >
                  Questionnaire
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Company
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-500 transition hover:text-[#2274A5]"
                >
                  About Us
                </Link>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 transition hover:text-[#2274A5]"
                >
                  How It Works
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 transition hover:text-[#2274A5]"
                >
                  Safety
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 transition hover:text-[#2274A5]"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Support
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 transition hover:text-[#2274A5]"
                >
                  Help Center
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 transition hover:text-[#2274A5]"
                >
                  Privacy Policy
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 transition hover:text-[#2274A5]"
                >
                  Terms of Service
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-gray-500 transition hover:text-[#2274A5]"
                >
                  Report a Problem
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter / CTA */}
        <div className="mt-12 rounded-2xl bg-gray-50 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <h3 className="font-semibold text-gray-900">
                Find your perfect roommate
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Complete your profile to get better roommate matches.
              </p>
            </div>

            <Link
              to="/app/profile"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#2274A5] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Complete Profile

              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h14m-6-6l6 6-6 6"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} RoomMatch. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-5">
            <a
              href="#"
              className="text-xs text-gray-400 transition hover:text-gray-600"
            >
              Privacy
            </a>

            <a
              href="#"
              className="text-xs text-gray-400 transition hover:text-gray-600"
            >
              Terms
            </a>

            <a
              href="#"
              className="text-xs text-gray-400 transition hover:text-gray-600"
            >
              Cookies
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;