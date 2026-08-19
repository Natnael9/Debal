function EditProfileForm({ profile, onChange, onSave, onCancel, isSaving = false }) {
    const updateField = (field, value) => {
        onChange({
            ...profile,
            [field]: value,
        });
    };

    const updateNestedField = (section, field, value) => {
        onChange({
            ...profile,
            [section]: {
                ...profile[section],
                [field]: value,
            },
        });
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                    Edit Profile
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Update your personal information and roommate preferences.
                </p>
            </div>

            <div className="space-y-6">
                {/* Basic Information */}
                <div>
                    <h3 className="mb-4 font-semibold text-gray-900">
                        Basic Information
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="profile-name"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>

                            <input
                                id="profile-name"
                                type="text"
                                value={profile.name || ""}
                                onChange={(e) =>
                                    updateField("name", e.target.value)
                                }
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="profile-age"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Age
                            </label>

                            <input
                                id="profile-age"
                                type="number"
                                min="18"
                                value={profile.age ?? ""}
                                onChange={(e) =>
                                    updateField(
                                        "age",
                                        e.target.value === ""
                                            ? ""
                                            : Number(e.target.value)
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="profile-gender"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Gender
                            </label>

                            <select
                                id="profile-gender"
                                value={profile.gender || ""}
                                onChange={(e) =>
                                    updateField("gender", e.target.value)
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div>
                    <label
                        htmlFor="profile-bio"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Bio
                    </label>

                    <textarea
                        id="profile-bio"
                        rows="4"
                        value={profile.bio || ""}
                        onChange={(e) =>
                            updateField("bio", e.target.value)
                        }
                        placeholder="Tell potential roommates a little about yourself..."
                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* Housing */}
                <div>
                    <label
                        htmlFor="housing-status"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Housing Status
                    </label>

                    <select
                        id="housing-status"
                        value={profile.housingStatus || ""}
                        onChange={(e) =>
                            updateField("housingStatus", e.target.value)
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">Select housing status</option>
                        <option value="needs_room">
                            Needs a room
                        </option>
                        <option value="has_room">
                            Has a room
                        </option>
                    </select>
                </div>

                {/* Budget */}
                <div>
                    <h3 className="mb-4 font-semibold text-gray-900">
                        Budget
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="min-budget"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Minimum Budget
                            </label>

                            <input
                                id="min-budget"
                                type="number"
                                min="0"
                                value={profile.budget?.min ?? ""}
                                onChange={(e) =>
                                    updateNestedField(
                                        "budget",
                                        "min",
                                        e.target.value === ""
                                            ? ""
                                            : Number(e.target.value)
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="max-budget"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Maximum Budget
                            </label>

                            <input
                                id="max-budget"
                                type="number"
                                min="0"
                                value={profile.budget?.max ?? ""}
                                onChange={(e) =>
                                    updateNestedField(
                                        "budget",
                                        "max",
                                        e.target.value === ""
                                            ? ""
                                            : Number(e.target.value)
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div>
                    <h3 className="mb-4 font-semibold text-gray-900">
                        Location Preferences
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="preferred-location"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Preferred Location
                            </label>

                            <input
                                id="preferred-location"
                                type="text"
                                value={profile.location?.preferred || ""}
                                onChange={(e) =>
                                    updateNestedField(
                                        "location",
                                        "preferred",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="max-distance"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Maximum Distance (km)
                            </label>

                            <input
                                id="max-distance"
                                type="number"
                                min="0"
                                value={profile.location?.maxDistance ?? ""}
                                onChange={(e) =>
                                    updateNestedField(
                                        "location",
                                        "maxDistance",
                                        e.target.value === ""
                                            ? ""
                                            : Number(e.target.value)
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Lifestyle */}
                <div>
                    <h3 className="mb-4 font-semibold text-gray-900">
                        Lifestyle
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="cleanliness"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Cleanliness
                            </label>

                            <select
                                id="cleanliness"
                                value={profile.lifestyle?.cleanliness || ""}
                                onChange={(e) =>
                                    updateNestedField(
                                        "lifestyle",
                                        "cleanliness",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Select</option>
                                <option value="Very clean">Very clean</option>
                                <option value="Clean">Clean</option>
                                <option value="Moderately clean">
                                    Moderately clean
                                </option>
                                <option value="Relaxed">Relaxed</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="sleep-schedule"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Sleep Schedule
                            </label>

                            <select
                                id="sleep-schedule"
                                value={profile.lifestyle?.sleepSchedule || ""}
                                onChange={(e) =>
                                    updateNestedField(
                                        "lifestyle",
                                        "sleepSchedule",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Select</option>
                                <option value="Early sleeper">
                                    Early sleeper
                                </option>
                                <option value="Night owl">
                                    Night owl
                                </option>
                                <option value="Flexible">Flexible</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="smoking"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Smoking
                            </label>

                            <select
                                id="smoking"
                                value={profile.lifestyle?.smoking || ""}
                                onChange={(e) =>
                                    updateNestedField(
                                        "lifestyle",
                                        "smoking",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Select</option>
                                <option value="Non-smoker">Non-smoker</option>
                                <option value="Smoker">Smoker</option>
                                <option value="Occasionally">
                                    Occasionally
                                </option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="pets"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Pets
                            </label>

                            <select
                                id="pets"
                                value={profile.lifestyle?.pets || ""}
                                onChange={(e) =>
                                    updateNestedField(
                                        "lifestyle",
                                        "pets",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Select</option>
                                <option value="Comfortable with pets">
                                    Comfortable with pets
                                </option>
                                <option value="No pets">No pets</option>
                                <option value="Prefer no pets">
                                    Prefer no pets
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Team-up */}
                {profile.housingStatus === "needs_room" && (
                    <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
                        <div>
                            <p className="font-medium text-gray-900">
                                Team-up matching
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Allow matching with other people who also need
                                a room.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                updateField(
                                    "teamUpEnabled",
                                    !profile.teamUpEnabled
                                )
                            }
                            aria-pressed={profile.teamUpEnabled}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                                profile.teamUpEnabled
                                    ? "bg-[#2274A5]"
                                    : "bg-gray-300"
                            }`}
                        >
                            <span
                                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                    profile.teamUpEnabled
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving}
                    className="rounded-xl bg-[#2274A5] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}

export default EditProfileForm;