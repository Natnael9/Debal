import { useState } from "react";
import { blockUser } from "../../services/chatModerationApi";

function BlockModal({ user, onClose }) {
  const [isBlocking, setIsBlocking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleBlock = async () => {
    setError("");
    setIsBlocking(true);

    try {
      await blockUser(user.id);

      // Any 2xx response reaches here
      setSuccess(true);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">

        {/* ================= SUCCESS ================= */}
        {success ? (
          <div className="flex flex-col items-center text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m5 12 4 4L19 6"
                />
              </svg>
            </div>

            <h2 className="mt-3 text-base font-bold text-gray-900">
              User blocked
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {user.name} has been blocked successfully.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-blue-900 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Done
            </button>
          </div>
        ) : (

          /* ================= CONFIRMATION ================= */
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>

            <h2 className="mt-4 text-base font-bold text-gray-900">
              Block {user.name}?
            </h2>

            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Are you sure you want to block this user? You will
              no longer receive messages from them.
            </p>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isBlocking}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBlock}
                disabled={isBlocking}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBlocking ? "Blocking..." : "Block User"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BlockModal;