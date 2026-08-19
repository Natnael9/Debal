function LifestyleAttributes({ lifestyle = {} }) {
  const {
    cleanliness,
    sleepSchedule,
    smoking,
    pets,
  } = lifestyle;

  const attributes = [
    {
      label: "Cleanliness",
      value: cleanliness,
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      label: "Sleep Schedule",
      value: sleepSchedule,
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.03 9.03 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      label: "Smoking",
      value: smoking,
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
    {
      label: "Pets",
      value: pets,
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 md:p-8">
      {/* Section Header */}
      <div className="mb-5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Lifestyle
        </h2>
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {attributes.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5 transition hover:border-blue-100 hover:bg-blue-50/20"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-blue-900 shadow-2xs">
              {item.icon}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {item.label}
              </p>
              <p className="mt-0.5 truncate text-xs font-bold text-gray-800">
                {item.value || (
                  <span className="font-normal italic text-gray-400">
                    Not specified
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LifestyleAttributes;