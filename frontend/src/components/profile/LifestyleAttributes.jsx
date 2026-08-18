function LifestyleAttributes({ lifestyle = {} }) {
    const {
        cleanliness,
        sleepSchedule,
        smoking,
        pets,
    } = lifestyle;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
                Lifestyle
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <p className="text-sm text-gray-500">Cleanliness</p>
                    <p className="mt-1 font-medium text-gray-900">
                        {cleanliness || "Not specified"}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Sleep Schedule</p>
                    <p className="mt-1 font-medium text-gray-900">
                        {sleepSchedule || "Not specified"}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Smoking</p>
                    <p className="mt-1 font-medium text-gray-900">
                        {smoking || "Not specified"}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Pets</p>
                    <p className="mt-1 font-medium text-gray-900">
                        {pets || "Not specified"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LifestyleAttributes;