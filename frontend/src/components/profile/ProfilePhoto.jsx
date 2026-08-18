function ProfilePhoto({ photoUrl, name = "User" }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
                Profile Photo
            </h2>

            <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl font-bold text-[#2274A5]">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={`${name}'s profile`}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        name.charAt(0).toUpperCase()
                    )}
                </div>

                <div>
                    <p className="font-medium text-gray-900">
                        {name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Profile photo
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                        Optional. Your photo may be reviewed before being displayed.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ProfilePhoto;