import { useState } from "react";
import { reportUser } from "../../services/chatModerationApi";

const REPORT_REASONS = [
  "Harassment or bullying",
  "Spam",
  "Scam or fraud",
  "Inappropriate behavior",
  "Fake profile",
  "Other",
];

function ReportModal({ user, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reason) {
      setError("Please select a reason.");
      return;
    }

    if (reason === "Other" && !details.trim()) {
      setError("Please provide some details.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await reportUser({
        userId: user.id,
        reason,
        details: details.trim(),
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-[3%] backdrop-blur-xs"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-[85vw] max-w-[22rem] sm:w-[65vw] md:w-[45vw] lg:w-[25vw] max-h-[85vh] overflow-y-auto rounded-[1.25rem] bg-white p-[4%] sm:p-[1.2rem] shadow-2xl border border-gray-100">

        {/* ================= SUCCESS ================= */}
        {success ? (
          <div className="flex flex-col items-center py-[4%] text-center">
            <div className="flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg
                className="h-[55%] w-[55%]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="m5 12 4 4L19 6"
                />
              </svg>
            </div>

            <h2 className="mt-[3%] text-[0.95rem] font-bold text-gray-900 leading-tight">
              Report Submitted
            </h2>

            <p className="mt-[1.5%] text-[0.75rem] text-gray-500">
              Thank you. Your report has been submitted successfully.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-[6%] w-full rounded-[0.75rem] bg-blue-900 py-[2.5%] text-[0.8rem] font-semibold text-white transition hover:bg-blue-800"
            >
              Done
            </button>
          </div>
        ) : (

          /* ================= FORM ================= */
          <>
            {/* Header */}
            <div className="flex items-start justify-between pb-[3%] border-b border-gray-100">
              <div className="min-w-0 pr-[2%]">
                <h2 className="truncate text-[0.9rem] font-bold text-gray-900 leading-tight">
                  Report {user.name}
                </h2>
                <p className="text-[0.7rem] text-gray-400">
                  Select a reason for reporting this user.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-[1.5rem] w-[1.5rem] shrink-0 items-center justify-center rounded-full bg-gray-100 text-[0.75rem] text-gray-500 transition hover:bg-gray-200"
                aria-label="Close report modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-[4%]">
              {/* Reasons */}
              <div>
                <label className="text-[0.75rem] font-semibold text-gray-700">
                  Reason
                </label>

                <div className="mt-[2%] space-y-[2%]">
                  {REPORT_REASONS.map((item) => (
                    <label
                      key={item}
                      className={`flex cursor-pointer items-center gap-[3%] rounded-[0.6rem] border px-[3.5%] py-[2%] transition ${
                        reason === item
                          ? "border-blue-200 bg-blue-50/70"
                          : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={item}
                        checked={reason === item}
                        onChange={(event) => {
                          setReason(event.target.value);
                          setError("");
                        }}
                        className="h-[0.85rem] w-[0.85rem] accent-blue-900"
                      />

                      <span className="text-[0.75rem] text-gray-700 leading-snug">
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="mt-[4%]">
                <label className="text-[0.75rem] font-semibold text-gray-700">
                  Additional details
                  {reason === "Other" && (
                    <span className="ml-[1%] text-rose-500">*</span>
                  )}
                </label>

                <textarea
                  value={details}
                  onChange={(event) => {
                    setDetails(event.target.value);
                    setError("");
                  }}
                  rows={2}
                  placeholder="Tell us more about the issue..."
                  className="mt-[2%] w-full resize-none rounded-[0.6rem] border border-gray-200 px-[3.5%] py-[2.5%] text-[0.75rem] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="mt-[3%] rounded-[0.5rem] border border-rose-100 bg-rose-50 px-[3%] py-[1.5%] text-[0.7rem] text-rose-600">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="mt-[5%] flex gap-[3%]">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 rounded-[0.6rem] border border-gray-200 bg-white py-[2.5%] text-[0.75rem] font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-[0.6rem] bg-blue-900 py-[2.5%] text-[0.75rem] font-semibold text-white shadow-xs transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportModal;