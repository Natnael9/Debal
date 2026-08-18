function BudgetRange({ minBudget, maxBudget }) {
    const formatBudget = (value) => {
        if (value === undefined || value === null || value === "") {
            return "Not provided";
        }

        return `${Number(value).toLocaleString()} ETB`;
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
                Budget Range
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Minimum Budget</p>
                    <p className="mt-1 font-semibold text-gray-900">
                        {formatBudget(minBudget)}
                    </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Maximum Budget</p>
                    <p className="mt-1 font-semibold text-gray-900">
                        {formatBudget(maxBudget)}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default BudgetRange;