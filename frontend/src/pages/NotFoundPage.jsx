import { Link } from "react-router-dom";

function NotFoundPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#2274A5] px-6 py-12">
            <div className="w-full max-w-3xl text-center text-white">

                {/* Decorative 404 */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-40 w-40 rounded-full bg-blue-500 opacity-50 blur-3xl" />
                    </div>

                    <h1 className="relative text-[9rem] font-black leading-none tracking-tight drop-shadow-lg sm:text-[12rem]">
                        404
                    </h1>
                </div>

                {/* Message */}
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold sm:text-4xl">
                        Page Not Found
                    </h2>

                    <p className="mx-auto max-w-xl text-lg leading-8 text-blue-100 sm:text-xl">
                        Looks like you've wandered into uncharted territory.
                        The page you're looking for doesn't exist or may have been moved.
                    </p>
                </div>

                {/* Home button */}
                <div className="mt-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 shadow-lg transition duration-200 hover:-translate-y-1 hover:bg-blue-50 hover:shadow-xl"
                    >
                        <span>Go Back Home</span>
                    </Link>
                </div>

                {/* Footer */}
                <p className="mt-10 text-sm text-blue-200">
                    Debal • Something went wrong, but we've got you covered.
                </p>
            </div>
        </div>
    );
}

export default NotFoundPage;