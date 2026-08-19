function ProfileCompletionMeter({ percentage = 0 }) {
    const safePercentage = Math.min(100, Math.max(0, percentage));

    return (
        <div className="w-full">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                    Profile Completion
                </span>

                <span className="text-sm font-semibold text-[#2274A5]">
                    {safePercentage}%
                </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                    className="h-full rounded-full bg-[#2274A5] transition-all duration-500"
                    style={{ width: `${safePercentage}%` }}
                />
            </div>
        </div>
    );
}

export default ProfileCompletionMeter;