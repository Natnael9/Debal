function ActionNotification({ type, message }) {
  const config = {
    success: {
      icon: (
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
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      iconClass: "bg-emerald-100 text-emerald-600",
      borderClass: "border-emerald-100",
    },

    error: {
      icon: (
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      iconClass: "bg-rose-100 text-rose-600",
      borderClass: "border-rose-100",
    },

    warning: {
      icon: (
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
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      ),
      iconClass: "bg-amber-100 text-amber-600",
      borderClass: "border-amber-100",
    },
  };

  const selected = config[type] || config.success;

  return (
    <div
      className={`fixed right-5 top-5 z-[110] flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl ${selected.borderClass}`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${selected.iconClass}`}
      >
        {selected.icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-900">
          {message}
        </p>
      </div>
    </div>
  );
}

export default ActionNotification;