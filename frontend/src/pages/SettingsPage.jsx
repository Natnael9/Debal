import React, { useState } from "react";

const SettingsPage = () => {
  // MOCK DATA: Simulating the initial GET /users/me response
  const [preferences, setPreferences] = useState({
    newChatRequest: true,
    requestAccepted: true,
    newMessage: true,
    meetupUpdate: true,
    reportStatus: false,
    verificationResult: true, // Mandatory
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (category) => {
    // Safety check to ensure verificationResult cannot be toggled
    if (category === "verificationResult") return;

    // Optimistically update the UI state
    const newValue = !preferences[category];
    setPreferences((prev) => ({ ...prev, [category]: newValue }));

    // Simulating the PATCH /users/me request
    setIsSaving(true);
    console.log(`Mocking PATCH request... { "notificationPreferences.${category}": ${newValue} }`);

    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  // Reusable component for each setting row
  const SettingRow = ({ title, description, category, disabled = false, icon }) => (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3.5 pr-2">
        {icon && (
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-2xs ${
              disabled
                ? "border-gray-100 bg-gray-50 text-gray-400"
                : "border-blue-100/70 bg-blue-50/70 text-blue-900"
            }`}
          >
            {icon}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h3
              className={`text-xs font-bold sm:text-sm ${
                disabled ? "text-gray-400" : "text-gray-900"
              }`}
            >
              {title}
            </h3>
            {disabled && (
              <span className="rounded-md border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">
                Required
              </span>
            )}
          </div>
          <p
            className={`mt-0.5 text-[11px] leading-relaxed sm:text-xs ${
              disabled ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      {/* Toggle Switch */}
      <button
        type="button"
        onClick={() => handleToggle(category)}
        disabled={disabled}
        aria-pressed={preferences[category]}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-900/20 ${
          disabled
            ? "cursor-not-allowed bg-gray-200 opacity-60"
            : preferences[category]
            ? "bg-blue-900"
            : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            preferences[category] ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* Page Header */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100/80 bg-blue-50 text-blue-900 shadow-2xs">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Settings
              </h1>
              <p className="mt-0.5 text-xs text-gray-400">
                Manage your account preferences, alerts, and notifications.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Email & App Notifications
              </h2>
            </div>

            {isSaving && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-900 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                Saving changes...
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-50">
            {/* Standard Toggles with contextual icons */}
            <SettingRow
              title="New Chat Requests"
              description="Get notified when someone wants to connect with you."
              category="newChatRequest"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            />

            <SettingRow
              title="Requests Accepted"
              description="Get notified when someone accepts your chat request."
              category="requestAccepted"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <SettingRow
              title="New Messages"
              description="Get notified when you receive a direct message while offline."
              category="newMessage"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
            />

            <SettingRow
              title="Meetup Updates"
              description="Get notified when a meetup is proposed, accepted, or rescheduled."
              category="meetupUpdate"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />

            <SettingRow
              title="Report Status"
              description="Get notified when a submitted safety report has been resolved."
              category="reportStatus"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />

            {/* Mandatory Toggle */}
            <SettingRow
              title="Verification Updates"
              description="Account verification and security emails are mandatory."
              category="verificationResult"
              disabled={true}
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;