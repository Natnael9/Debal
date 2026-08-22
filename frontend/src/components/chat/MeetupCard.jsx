function MeetupCard({
  proposedBy = "Roommate Candidate",
  isProposer = false,
  date = "Not specified",
  time = "Not specified",
  location = "",
  locationNote = "",
  note = "",
  status = "none",
  onAccept,
  onDecline,
  onRemove,
  onCancel,
}) {
  const displayLocation = location || locationNote || "To be decided";
  const displayNote = note || (locationNote && location ? locationNote : "");

  const isPending = status === "pending" || status === "proposed";
  const isConfirmed = status === "confirmed" || status === "accepted";
  const isDeclined = status === "declined";

  const handleAddToCalendar = () => {
    const startDate = new Date(`${date} ${time}`);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    const formatGoogleDate = (d) => {
      return d
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
      `&location=${encodeURIComponent(displayLocation)}` +
      `&details=${encodeURIComponent(displayNote || "")}`;

    window.open(calendarUrl, "_blank", "noopener,noreferrer");
  };

  /* =====================================================
     NO MEETUP
  ====================================================== */
  if (status === "none") {
    return (
      <div className="flex w-full max-w-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-4 text-center md:max-w-[245px]">
        <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <svg
            className="h-4 w-4"
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
        </div>

        <p className="text-[11px] font-semibold text-gray-700">
          No active meetup
        </p>

        <p className="mt-0.5 text-[9px] text-gray-400">
          Propose a meetup to schedule an in-person meeting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[220px] flex-col rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm transition hover:shadow-md md:max-w-[245px]">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex min-w-0 items-center gap-1.5">

          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-blue-100/80 bg-blue-50 text-blue-900">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 01-2-2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="truncate">
            <h3 className="truncate text-[10px] font-bold leading-tight text-gray-900">
              Meetup Proposal
            </h3>

            <p className="truncate text-[8px] text-gray-400">
              by{" "}
              <span className="font-medium text-gray-600">
                {proposedBy}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* STATUS BADGE */}
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${
              isConfirmed
                ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                : isDeclined
                ? "border border-rose-100 bg-rose-50 text-rose-700"
                : "border border-blue-100/60 bg-blue-50 text-blue-900"
            }`}
          >
            {isConfirmed
              ? "Confirmed"
              : isDeclined
              ? "Declined"
              : "Pending"}
          </span>

          {/* REMOVE / DELETE 'X' BUTTON - ONLY VISIBLE TO SENDER (PROPOSER) */}
          {isProposer && (onRemove || onCancel || onDecline) && (
            <button
              type="button"
              onClick={onRemove || onCancel || onDecline}
              className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition shrink-0"
              title="Delete meetup from history and panel"
              aria-label="Delete meetup from history and panel"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          DETAILS BOX
      ====================================================== */}
      <div className="mt-2 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2">

        {/* DATE */}
        <div className="flex items-center gap-1.5">
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-100 bg-white text-gray-500 shadow-2xs">
            <svg
              className="h-2.5 w-2.5 text-blue-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-[7px] font-medium uppercase leading-none tracking-wider text-gray-400">
              Date
            </p>

            <p className="truncate text-[10px] font-semibold text-gray-800">
              {date}
            </p>
          </div>
        </div>

        {/* TIME */}
        <div className="flex items-center gap-1.5">
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-100 bg-white text-gray-500 shadow-2xs">
            <svg
              className="h-2.5 w-2.5 text-blue-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-[7px] font-medium uppercase leading-none tracking-wider text-gray-400">
              Time
            </p>

            <p className="truncate text-[10px] font-semibold text-gray-800">
              {time}
            </p>
          </div>
        </div>

        {/* LOCATION */}
        <div className="flex items-center gap-1.5">
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-100 bg-white text-gray-500 shadow-2xs">
            <svg
              className="h-2.5 w-2.5 text-blue-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />

              <path
                strokeLinecap="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-[7px] font-medium uppercase leading-none tracking-wider text-gray-400">
              Location
            </p>

            <p className="truncate text-[10px] font-semibold text-gray-800">
              {displayLocation}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          NOTE
      ====================================================== */}
      {displayNote && (
        <div className="mt-2 rounded-lg border border-blue-100/60 bg-blue-50/30 px-2 py-1">
          <p className="text-[7px] font-medium uppercase text-blue-900/60">
            Note
          </p>

          <p className="mt-0.5 line-clamp-2 text-[9px] italic leading-tight text-gray-600">
            "{displayNote}"
          </p>
        </div>
      )}

      {/* =====================================================
          PENDING ACTIONS / STATUS
      ====================================================== */}
      {isPending && (
        <div className="mt-2.5">
          {isProposer ? (
            <div className="flex flex-col gap-1.5 text-center">
              <span className="rounded-lg border border-blue-100 bg-blue-50/70 py-1 text-[9px] font-medium text-blue-800">
                ⏳ Waiting for response...
              </span>
              <button
                type="button"
                onClick={onRemove || onCancel || onDecline}
                className="w-full rounded-lg border border-rose-200 bg-rose-50/50 py-1 text-[10px] font-semibold text-rose-700 transition hover:bg-rose-100 active:scale-98"
              >
                Cancel Proposal
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5">
              {/* DECLINE */}
              <button
                type="button"
                onClick={onDecline}
                className="flex-1 rounded-lg border border-gray-200 bg-white py-1 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-98"
              >
                Decline
              </button>

              {/* ACCEPT */}
              <button
                type="button"
                onClick={onAccept}
                className="flex-1 rounded-lg bg-blue-900 py-1 text-[10px] font-semibold text-white shadow-xs transition hover:bg-blue-800 active:scale-98"
              >
                Accept
              </button>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          DECLINED MESSAGE
      ====================================================== */}
      {isDeclined && (
        <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50 px-2 py-1.5 text-center">
          <p className="text-[9px] font-semibold text-rose-700">
            Meetup Declined / Cancelled
          </p>
        </div>
      )}

      {/* =====================================================
          CONFIRMED → CALENDAR
      ====================================================== */}
      {isConfirmed && (
        <button
          type="button"
          onClick={handleAddToCalendar}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-blue-100 bg-blue-50 py-1 text-[10px] font-semibold text-blue-900 transition hover:bg-blue-100 active:scale-98"
        >
          <svg
            className="h-2.5 w-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2v12a2 2 0 002 2z"
            />
          </svg>

          Add to Calendar
        </button>
      )}
    </div>
  );
}

export default MeetupCard;