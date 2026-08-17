function MeetupCard({
  proposedBy = "Sarah",
  date = "Saturday, August 22",
  time = "3:00 PM",
  location = "Bole, Addis Ababa",
  note = "Let's meet for coffee!",
  status = "pending",
  onAccept,
  onDecline,
}) 

{
      const handleAddToCalendar = () => {
      const startDate = new Date(`${date} ${time}`);

      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);

      const formatGoogleDate = (date) => {
        return date
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}Z$/, "Z");
      };

      const start = formatGoogleDate(startDate);
      const end = formatGoogleDate(endDate);

      const calendarUrl =
        `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent("Meetup with " + proposedBy)}` +
        `&dates=${start}/${end}` +
        `&location=${encodeURIComponent(location)}` +
        `&details=${encodeURIComponent(note || "")}`;

      window.open(calendarUrl, "_blank", "noopener,noreferrer");
    };
  return (
    <div className="w-[30vw] h-[55vh] max-w-sm rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-900 border border-blue-100/80">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight text-gray-900">
              Meetup Proposal
            </h3>
            <p className="text-[10px] text-gray-400">
              Proposed by <span className="font-medium text-gray-600">{proposedBy}</span>
            </p>
          </div>
        </div>

        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-900 border border-blue-100/60">
          Pending
        </span>
      </div>

      {/* Details Box */}
      <div className="mt-3 space-y-2 rounded-xl bg-slate-50/70 p-3 border border-slate-100">
        
        {/* Date */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-gray-500 shadow-2xs border border-gray-100">
            <svg className="h-3.5 w-3.5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wider text-gray-400 leading-none">Date</p>
            <p className="text-xs font-semibold text-gray-800">{date}</p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-gray-500 shadow-2xs border border-gray-100">
            <svg className="h-3.5 w-3.5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wider text-gray-400 leading-none">Time</p>
            <p className="text-xs font-semibold text-gray-800">{time}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-gray-500 shadow-2xs border border-gray-100">
            <svg className="h-3.5 w-3.5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wider text-gray-400 leading-none">Location</p>
            <p className="text-xs font-semibold text-gray-800">{location}</p>
          </div>
        </div>
      </div>

      {/* Note */}
      {note && (
        <div className="mt-2.5 rounded-xl border border-blue-100/60 bg-blue-50/30 px-3 py-2">
          <p className="text-[9px] font-medium uppercase tracking-wider text-blue-900/60">Note</p>
          <p className="mt-0.5 text-[11px] italic text-gray-600 leading-snug">
            "{note}"
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3.5 flex gap-2">
        <button
          type="button"
          onClick={onDecline}
          className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-98"
        >
          Decline
        </button>

        <button
          type="button"
          onClick={onAccept}
          className="flex-1 rounded-xl bg-blue-900 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-800 active:scale-98"
        >
          Accept
        </button>
        
      </div>
      {status === "confirmed" && (
          <button
            type="button"
            onClick={handleAddToCalendar}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 py-2 text-xs font-semibold text-blue-900 transition hover:bg-blue-100 active:scale-98"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>

            Add to Calendar
          </button>
)}
    </div>
  );
}

export default MeetupCard;