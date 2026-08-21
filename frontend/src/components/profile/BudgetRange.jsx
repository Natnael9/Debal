function BudgetRange({ minBudget, maxBudget }) {
  const formatBudget = (value) => {
    if (value === undefined || value === null || value === "") {
      return "Not provided";
    }

    return `${Number(value).toLocaleString()} ETB`;
  };

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 md:p-8">
      {/* Section Header */}
      <div className="mb-5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Budget Range
        </h2>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        {/* Min Budget */}
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
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Minimum Budget
            </p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">
              {formatBudget(minBudget)}
            </p>
          </div>
        </div>

        {/* Max Budget */}
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
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Maximum Budget
            </p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">
              {formatBudget(maxBudget)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetRange;