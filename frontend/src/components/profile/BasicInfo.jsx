function BasicInfo({ age, gender, bio }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
                Basic Information
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="mt-1 font-medium text-gray-900">
                        {age || "Not provided"}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="mt-1 font-medium capitalize text-gray-900">
                        {gender || "Not provided"}
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <p className="text-sm text-gray-500">Bio</p>
                <p className="mt-1 leading-relaxed text-gray-700">
                    {bio || "No bio added yet."}
                </p>
            </div>
        </div>
    );
}

export default BasicInfo;