function IdentityVerification({ status = "pending" }) {
  const verificationConfig = {
    pending: {
      label: "Verification Pending",
      containerClass: "border-amber-100/80 bg-amber-50/40 text-amber-800",
      badgeClass: "border-amber-200/60 bg-amber-100/80 text-amber-700",
      iconBg: "bg-amber-100 text-amber-700",
      description: "Your identity verification is currently being reviewed.",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    verified: {
      label: "Verified",
      containerClass: "border-emerald-100/80 bg-emerald-50/40 text-emerald-900",
      badgeClass: "border-emerald-200/60 bg-emerald-100/80 text-emerald-700",
      iconBg: "bg-emerald-100 text-emerald-700",
      description: "Your identity has been successfully verified.",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    rejected: {
      label: "Verification Rejected",
      containerClass: "border-rose-100/80 bg-rose-50/40 text-rose-900",
      badgeClass: "border-rose-200/60 bg-rose-100/80 text-rose-700",
      iconBg: "bg-rose-100 text-rose-700",
      description: "Your identity verification was not approved.",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const current = verificationConfig[status] || verificationConfig.pending;

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 md:p-8">
      {/* Section Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Identity Verification
          </h2>
        </div>

        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${current.badgeClass}`}>
          {current.label}
        </span>
      </div>

      {/* Verification Status Card */}
      <div className={`flex items-center gap-3.5 rounded-2xl border p-4 transition ${current.containerClass}`}>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/60 shadow-2xs ${current.iconBg}`}>
          {current.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold leading-tight">
            {current.label}
          </p>
          <p className="mt-0.5 text-[11px] opacity-80 leading-relaxed">
            {current.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default IdentityVerification;