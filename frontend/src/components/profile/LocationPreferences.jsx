function LocationPreferences({ location, maxDistance }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
                Location Preferences
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Preferred Location</p>
                    <p className="mt-1 font-semibold text-gray-900">
                        {location || "Not provided"}
                    </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                        Maximum Distance
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                        {maxDistance !== undefined &&
                            maxDistance !== null &&
                            maxDistance !== ""
                            ? `${maxDistance} km`
                            : "Not provided"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LocationPreferences;