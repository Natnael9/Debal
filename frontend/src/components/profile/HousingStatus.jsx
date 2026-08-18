function HousingStatus({ status }) {
    const isHasRoom = status === "has_room";

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
                Housing Status
            </h2>

            <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-medium text-gray-500">
                    Current status
                </p>

                <p className="mt-1 text-base font-semibold text-[#2274A5]">
                    {isHasRoom
                        ? "Has a room — Looking for a roommate"
                        : status === "needs_room"
                            ? "Needs a room — Looking to join a room"
                            : "Not provided"}
                </p>
            </div>
        </div>
    );
}

export default HousingStatus;