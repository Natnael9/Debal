import React from "react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#2274A5] dark:hover:text-[#3a8ecc] hover:bg-gray-100 dark:hover:bg-[#242f3d] transition-all cursor-pointer ${className}`}
      title={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        /* Sun Icon for Switching to Light Mode */
        <svg className="w-5 h-5 text-amber-400 transition-transform rotate-0 hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        /* Moon Icon for Switching to Night Mode (Telegram style) */
        <svg className="w-5 h-5 text-gray-600 hover:text-[#2274A5] transition-transform -rotate-12 hover:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;

