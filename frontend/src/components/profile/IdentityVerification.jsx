function IdentityVerification({ status = "pending" }) {
    const verificationStyles = {
        pending: {
            label: "Verification Pending",
            className: "bg-yellow-50 text-yellow-700 border-yellow-200",
            description: "Your identity verification is currently being reviewed.",
        },
        verified: {
            label: "Verified",
            className: "bg-green-50 text-green-700 border-green-200",
            description: "Your identity has been successfully verified.",
        },
        rejected: {
            label: "Verification Rejected",
            className: "bg-red-50 text-red-700 border-red-200",
            description: "Your identity verification was not approved.",
        },
    };

    const currentStatus =
        verificationStyles[status] || verificationStyles.pending;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
                Identity Verification
            </h2>

            <div
                className={`rounded-xl border p-4 ${currentStatus.className}`}
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                        {status === "verified" ? "✓" : "!"}
                    </div>

                    <div>
                        <p className="font-semibold">
                            {currentStatus.label}
                        </p>

                        <p className="mt-1 text-sm">
                            {currentStatus.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IdentityVerification;