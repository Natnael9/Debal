import { useState } from "react";
import { apiPost } from "../../services/api";

function MeetupRequestModal({ matchId, user, onClose, onSent }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!date || !time) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await apiPost(`/matches/${matchId}/meetups`, {
        proposedTime: `${date}T${time}:00.000Z`,
        date,
        time,
        locationNote,
      });

      const meetup = res?.data?.meetup || {
        date,
        time,
        locationNote,
        status: "proposed",
      };

      onSent?.(meetup);
      onClose();
    } catch (err) {
      console.error("Meetup creation failed:", err.message);
      setError(err.message || "Failed to send meetup request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Send Meetup Request
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Suggest a meetup with {user?.name || "this person"}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date */}
          <div>
            <label
              htmlFor="meetup-date"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Date
            </label>

            <input
              id="meetup-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Time */}
          <div>
            <label
              htmlFor="meetup-time"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Time
            </label>

            <input
              id="meetup-time"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="meetup-location"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Location
            </label>

            <textarea
              id="meetup-location"
              rows="3"
              value={locationNote}
              onChange={(event) => setLocationNote(event.target.value)}
              placeholder="Example: Let's meet at Edna Mall..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#2274A5] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#2274A5] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MeetupRequestModal;