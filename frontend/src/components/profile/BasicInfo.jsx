function BasicInfo({ age, gender, bio }) {
  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 md:p-8">
      {/* Section Header */}
      <div className="mb-5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Basic Information
        </h2>
      </div>

      <div className="space-y-5">
        {/* Age & Gender Grid */}
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Age
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {age ? `${age} years old` : "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Gender
            </p>
            <p className="mt-1 text-sm font-medium capitalize text-gray-900">
              {gender || "Not provided"}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            About Me
          </p>
          <div className="rounded-2xl border border-blue-50 bg-blue-50/30 p-4">
            <p className="text-sm leading-relaxed text-gray-700">
              {bio ? (
                bio
              ) : (
                <span className="italic text-gray-400">
                  No bio added yet.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BasicInfo;