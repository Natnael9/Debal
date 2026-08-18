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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Team-Up Preference
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Allow matching with other people who are also looking for a
                        room.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleToggle}
                    aria-pressed={isEnabled}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${isEnabled ? "bg-[#2274A5]" : "bg-gray-300"
                        }`}
                >
                    <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${isEnabled ? "translate-x-6" : "translate-x-1"
                            }`}
                    />
                </button>
            </div>

            <div className="mt-4">
                <span
                    className={`text-sm font-medium ${isEnabled ? "text-[#2274A5]" : "text-gray-500"
                        }`}
                >
                    {isEnabled
                        ? "Team-up matching is enabled"
                        : "Team-up matching is disabled"}
                </span>
            </div>
        </div>
    );
}

export default TeamUpPreference;