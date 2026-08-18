function GuidedBioPrompts({ prompts = [], onSelectPrompt }) {
    const defaultPrompts = [
        "Describe a typical weekday for you.",
        "What matters most to you in a roommate?",
        "What do you enjoy doing in your free time?",
    ];

    const availablePrompts = prompts.length > 0 ? prompts : defaultPrompts;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-gray-900">
                Guided Bio Prompts
            </h2>

            <p className="mb-4 text-sm text-gray-500">
                Choose a prompt to help you write a better introduction.
            </p>

            <div className="space-y-3">
                {availablePrompts.map((prompt, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onSelectPrompt?.(prompt)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-sm text-gray-700 transition hover:border-[#2274A5] hover:bg-blue-50 hover:text-[#2274A5]"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default GuidedBioPrompts;