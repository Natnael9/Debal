function LocationPreferences({ location, maxDistance }) {
  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 md:p-8">
      {/* Section Header */}
      <div className="mb-5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Location Preferences
        </h2>
      </div>

      {/* Preferences Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        {/* Preferred Location */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition hover:border-blue-100 hover:bg-blue-50/20">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-blue-900 shadow-2xs">
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Preferred Location
            </p>
            <p className="mt-0.5 truncate text-sm font-bold text-gray-900">
              {location || (
                <span className="font-normal italic text-gray-400">
                  Not provided
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Maximum Distance */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition hover:border-blue-100 hover:bg-blue-50/20">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-blue-900 shadow-2xs">
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
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Maximum Distance
            </p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">
              {maxDistance !== undefined &&
              maxDistance !== null &&
              maxDistance !== "" ? (
                `${maxDistance} km`
              ) : (
                <span className="font-normal italic text-gray-400">
                  Not provided
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationPreferences;