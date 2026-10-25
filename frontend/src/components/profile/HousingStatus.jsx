function HousingStatus({ status }) {
  const isHasRoom = status === "has_room";
  const isNeedsRoom = status === "needs_room";

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 md:p-8">
      {/* Section Header */}
      <div className="mb-5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Housing Status
        </h2>
      </div>

      {/* Status Card */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-blue-100/60 bg-blue-50/40 p-4 transition">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100/80 bg-white text-blue-900 shadow-2xs">
          {isHasRoom ? (
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          ) : (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Current Status
          </p>
          <p className="mt-0.5 text-xs font-bold text-blue-950 sm:text-sm">
            {isHasRoom
              ? "Has a room — Looking for a roommate"
              : isNeedsRoom
              ? "Needs a room — Looking to join a room"
              : "Not provided"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HousingStatus;