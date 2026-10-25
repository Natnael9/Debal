function GuidedBioPrompts({ prompts = [], onSelectPrompt }) {
  const defaultPrompts = [
    "Describe a typical weekday for you.",
    "What matters most to you in a roommate?",
    "What do you enjoy doing in your free time?",
  ];

  const availablePrompts = prompts.length > 0 ? prompts : defaultPrompts;

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 md:p-8">
      {/* Section Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Guided Bio Prompts
          </h2>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Choose a prompt to help inspire your profile introduction.
        </p>
      </div>

      {/* Prompts List */}
      <div className="space-y-2.5">
        {availablePrompts.map((prompt, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectPrompt?.(prompt)}
            className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5 text-left transition hover:border-blue-200 hover:bg-blue-50/50 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-white text-[11px] font-bold text-gray-500 shadow-2xs group-hover:border-blue-100 group-hover:text-blue-900">
                {index + 1}
              </span>
              <span className="text-xs font-medium text-gray-700 transition group-hover:text-blue-950">
                {prompt}
              </span>
            </div>

            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-blue-900">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default GuidedBioPrompts;