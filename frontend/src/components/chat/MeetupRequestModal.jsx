import { useState } from "react";
import { apiPost } from "../../services/api";
import CustomDatePicker from "./CustomDatePicker";
import CustomTimePicker from "./CustomTimePicker";

function MeetupRequestModal({ matchId, user, onClose, onSent }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const getWeekendStr = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (6 - day + 7) % 7 || 7; // Saturday
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  };

  const setDatePreset = (preset) => {
    if (preset === "today") setDate(todayStr);
    if (preset === "tomorrow") setDate(getTomorrowStr());
    if (preset === "weekend") setDate(getWeekendStr());
  };

  const setTimePreset = (tVal) => {
    setTime(tVal);
  };

  const formatDisplayDate = (dStr) => {
    if (!dStr) return "";
    try {
      const d = new Date(`${dStr}T00:00:00`);
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dStr;
    }
  };

  const formatDisplayTime = (tStr) => {
    if (!tStr) return "";
    const [h, m] = tStr.split(":");
    const hours = parseInt(h, 10);
    if (isNaN(hours)) return tStr;
    const suffix = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${h12}:${m} ${suffix}`;
  };

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-900 border border-blue-100">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Propose In-Person Meetup
              </h2>
              <p className="text-xs text-slate-400">
                Suggest a date and time to meet {user?.name || "your roommate match"}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Custom Date Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Meetup Date <span className="text-rose-500">*</span>
              </label>
              {date && (
                <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {formatDisplayDate(date)}
                </span>
              )}
            </div>

            <CustomDatePicker
              value={date}
              onChange={(newDate) => setDate(newDate)}
              minDate={todayStr}
              placeholder="Select meetup date..."
            />

            {/* Quick Date Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => setDatePreset("today")}
                className={`rounded-lg border px-2.5 py-1 font-semibold transition ${date === todayStr ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDatePreset("tomorrow")}
                className={`rounded-lg border px-2.5 py-1 font-semibold transition ${date === getTomorrowStr() ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDatePreset("weekend")}
                className={`rounded-lg border px-2.5 py-1 font-semibold transition ${date === getWeekendStr() ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                This Weekend
              </button>
            </div>
          </div>

          {/* Custom Time Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Meetup Time <span className="text-rose-500">*</span>
              </label>
              {time && (
                <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {formatDisplayTime(time)}
                </span>
              )}
            </div>

            <CustomTimePicker
              value={time}
              onChange={(newTime) => setTime(newTime)}
              placeholder="Select meetup time..."
            />

            {/* Quick Time Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => setTimePreset("10:00")}
                className={`rounded-lg border px-2.5 py-1 font-semibold transition ${time === "10:00" ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                10:00 AM (Morning)
              </button>
              <button
                type="button"
                onClick={() => setTimePreset("14:00")}
                className={`rounded-lg border px-2.5 py-1 font-semibold transition ${time === "14:00" ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                2:00 PM (Afternoon)
              </button>
              <button
                type="button"
                onClick={() => setTimePreset("18:00")}
                className={`rounded-lg border px-2.5 py-1 font-semibold transition ${time === "18:00" ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                6:00 PM (Evening)
              </button>
            </div>
          </div>

          {/* Location / Venue Note */}
          <div>
            <label htmlFor="meetup-location" className="mb-1.5 block text-xs font-bold text-slate-700">
              Location / Venue Note
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute top-3 left-3 text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <textarea
                id="meetup-location"
                rows="2"
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                placeholder="e.g. Kaldi's Coffee, Edna Mall Bole..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9.5 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/10"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 p-2 text-xs font-semibold text-rose-600">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !date || !time}
              className="rounded-xl bg-blue-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-blue-800 active:scale-98 disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? "Sending Request..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MeetupRequestModal;