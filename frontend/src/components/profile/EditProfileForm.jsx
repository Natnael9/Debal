function EditProfileForm({
  profile,
  onChange,
  onSave,
  onCancel,
  isSaving = false,
}) {
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
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 md:p-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100/80 bg-blue-50 text-blue-900 shadow-xs">
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              Edit Profile
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Update your personal information and roommate preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-7">
        {/* Section 1: Basic Information */}
        <section>
          <div className="mb-3.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Basic Information
            </h3>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {/* Name */}
            <div>
              <label
                htmlFor="profile-name"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={profile.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Abebe Bikila"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
              />
            </div>

            {/* Age */}
            <div>
              <label
                htmlFor="profile-age"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
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
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="e.g. 21"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
              />
            </div>

            {/* Gender */}
            <div className="sm:col-span-2">
              <label
                htmlFor="profile-gender"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Gender
              </label>
              <div className="relative">
                <select
                  id="profile-gender"
                  value={profile.gender || ""}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Bio */}
        <section>
          <div className="mb-3.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              About You
            </h3>
          </div>

          <div>
            <label
              htmlFor="profile-bio"
              className="mb-1.5 block text-xs font-semibold text-gray-700"
            >
              Bio
            </label>
            <textarea
              id="profile-bio"
              rows="3"
              value={profile.bio || ""}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Tell potential roommates about your study habits, hobbies, and routine..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
            />
          </div>
        </section>

        {/* Section 3: Housing & Budget */}
        <section>
          <div className="mb-3.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Housing & Budget
            </h3>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {/* Housing Status */}
            <div className="sm:col-span-2">
              <label
                htmlFor="housing-status"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Housing Status
              </label>
              <div className="relative">
                <select
                  id="housing-status"
                  value={profile.housingStatus || ""}
                  onChange={(e) => updateField("housingStatus", e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
                >
                  <option value="">Select housing status</option>
                  <option value="needs_room">Needs a room</option>
                  <option value="has_room">Has a room</option>
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Min Budget */}
            <div>
              <label
                htmlFor="min-budget"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Minimum Budget (ETB)
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
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="e.g. 2500"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
              />
            </div>

            {/* Max Budget */}
            <div>
              <label
                htmlFor="max-budget"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Maximum Budget (ETB)
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
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="e.g. 5000"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Location Preferences */}
        <section>
          <div className="mb-3.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Location Preferences
            </h3>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="preferred-location"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Preferred Neighborhood
              </label>
              <input
                id="preferred-location"
                type="text"
                value={profile.location?.preferred || ""}
                onChange={(e) =>
                  updateNestedField("location", "preferred", e.target.value)
                }
                placeholder="e.g. 4 Kilo, Bole, Ayat"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
              />
            </div>

            <div>
              <label
                htmlFor="max-distance"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Max Distance (km)
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
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="e.g. 5"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
              />
            </div>
          </div>
        </section>

        {/* Section 5: Lifestyle */}
        <section>
          <div className="mb-3.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Lifestyle Habits
            </h3>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {/* Cleanliness */}
            <div>
              <label
                htmlFor="cleanliness"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Cleanliness
              </label>
              <div className="relative">
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
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
                >
                  <option value="">Select cleanliness</option>
                  <option value="Very clean">Very clean</option>
                  <option value="Clean">Clean</option>
                  <option value="Moderately clean">Moderately clean</option>
                  <option value="Relaxed">Relaxed</option>
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sleep Schedule */}
            <div>
              <label
                htmlFor="sleep-schedule"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Sleep Schedule
              </label>
              <div className="relative">
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
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
                >
                  <option value="">Select sleep schedule</option>
                  <option value="Early sleeper">Early sleeper</option>
                  <option value="Night owl">Night owl</option>
                  <option value="Flexible">Flexible</option>
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Smoking */}
            <div>
              <label
                htmlFor="smoking"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Smoking
              </label>
              <div className="relative">
                <select
                  id="smoking"
                  value={profile.lifestyle?.smoking || ""}
                  onChange={(e) =>
                    updateNestedField("lifestyle", "smoking", e.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
                >
                  <option value="">Select smoking preference</option>
                  <option value="Non-smoker">Non-smoker</option>
                  <option value="Smoker">Smoker</option>
                  <option value="Occasionally">Occasionally</option>
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pets */}
            <div>
              <label
                htmlFor="pets"
                className="mb-1.5 block text-xs font-semibold text-gray-700"
              >
                Pets
              </label>
              <div className="relative">
                <select
                  id="pets"
                  value={profile.lifestyle?.pets || ""}
                  onChange={(e) =>
                    updateNestedField("lifestyle", "pets", e.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-gray-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
                >
                  <option value="">Select pets preference</option>
                  <option value="Comfortable with pets">Comfortable with pets</option>
                  <option value="No pets">No pets</option>
                  <option value="Prefer no pets">Prefer no pets</option>
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Team-up matching */}
        {profile.housingStatus === "needs_room" && (
          <div className="flex items-center justify-between rounded-2xl border border-blue-100/80 bg-blue-50/50 p-4 transition">
            <div className="pr-4">
              <p className="text-xs font-bold text-blue-950">
                Team-up Matching
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500 leading-relaxed">
                Allow matching with other room-seekers to find a shared apartment together.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateField("teamUpEnabled", !profile.teamUpEnabled)
              }
              aria-pressed={profile.teamUpEnabled}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-900/20 ${
                profile.teamUpEnabled ? "bg-blue-900" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                  profile.teamUpEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col-reverse gap-2.5 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="rounded-xl bg-blue-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-800 active:scale-98 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default EditProfileForm;