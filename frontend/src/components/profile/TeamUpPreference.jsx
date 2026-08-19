import { useState } from "react";

function TeamUpPreference({ initialValue = false, onChange }) {
  const [isEnabled, setIsEnabled] = useState(initialValue);

  const handleToggle = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);

    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 md:p-8">
      {/* Section Header */}
      <div className="mb-5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Preferences
        </h2>
      </div>

      {/* Main Toggle Card */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-100/60 bg-blue-50/40 p-4 transition">
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100/80 bg-white text-blue-900 shadow-2xs">
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-900 sm:text-sm">
              Team-Up Matching
            </h3>
            <p className="mt-0.5 text-[11px] text-gray-500 leading-relaxed sm:text-xs">
              Allow matching with other room-seekers to co-sign and find an apartment together.
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={handleToggle}
          aria-pressed={isEnabled}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-900/20 ${
            isEnabled ? "bg-blue-900" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
              isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Status Footer */}
      <div className="mt-3.5 flex items-center gap-2 px-1">
        <span
          className={`h-2 w-2 rounded-full ${
            isEnabled ? "bg-emerald-500" : "bg-gray-300"
          }`}
        />
        <span
          className={`text-xs font-medium ${
            isEnabled ? "text-blue-900" : "text-gray-400"
          }`}
        >
          {isEnabled
            ? "Team-up matching is active"
            : "Team-up matching is disabled"}
        </span>
      </div>
    </div>
  );
}

export default TeamUpPreference;