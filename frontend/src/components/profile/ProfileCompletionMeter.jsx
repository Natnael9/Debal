function ProfileCompletionMeter({ percentage = 0 }) {
  const safePercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition">
      {/* Header Info */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-900 shadow-2xs">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-gray-800">
            Profile Completion
          </span>
        </div>

        <span className="rounded-full border border-blue-100 bg-white px-2 py-0.5 text-[10px] font-bold text-blue-900 shadow-2xs">
          {safePercentage}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200/80 p-0.5">
        <div
          className="h-full rounded-full bg-blue-900 transition-all duration-500 ease-out"
          style={{ width: `${safePercentage}%` }}
        />
      </div>

      {/* Helper text */}
      {safePercentage < 100 && (
        <p className="mt-2 text-[10px] text-gray-400">
          Complete your profile to get more accurate roommate matches.
        </p>
      )}
    </div>
  );
}

export default ProfileCompletionMeter;