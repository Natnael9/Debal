function ProfilePhoto({ photoUrl, name = "User" }) {
  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 md:p-8">
      {/* Section Header */}
      <div className="mb-5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Profile Photo
        </h2>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:flex-row sm:gap-5">
        {/* Avatar / Photo Container */}
        <div className="relative">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-blue-100 text-xl font-bold text-blue-900 shadow-sm sm:h-22 sm:w-22 sm:text-2xl">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${name}'s profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>

          <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-2xs" />
        </div>

        {/* User Info & Caption */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="truncate text-sm font-bold text-gray-900">
            {name}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            Profile photo
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl border border-blue-100/60 bg-blue-50/40 px-2.5 py-1 text-[11px] text-gray-500">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-blue-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Optional. Photos are reviewed before public display.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePhoto;