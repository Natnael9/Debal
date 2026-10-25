import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateUserSettings, freezeAccount, unfreezeAccount, changePassword } from "../services/settingsService";
import DeleteAccountModal from "../components/DeleteAccountModal";
import ImageLightboxModal from "../components/common/ImageLightboxModal";


const SettingsPage = () => {
  const { user, setUser } = useAuth();

  const [isPaused, setIsPaused] = useState(false);
  const [preferences, setPreferences] = useState({
    newChatRequest: true,
    requestAccepted: true,
    newMessage: true,
    meetupUpdate: true,
    reportStatus: true,
  });

  // Phone state
  const [phone, setPhone] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState({ type: "", text: "" });

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  const [isSaving, setIsSaving] = useState(false);
  const [generalMessage, setGeneralMessage] = useState({ type: "", text: "" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setIsPaused(Boolean(user.pauseProfile ?? user.isFrozen ?? user.isPaused));
      setPhone(user.phone || "");
      const userPrefs = user.notificationPreferences || {};
      const userSettings = user.notificationSettings || {};
      setPreferences({
        newChatRequest: userSettings.chatRequests ?? userPrefs.newChatRequest ?? true,
        requestAccepted: userSettings.acceptedRequests ?? userPrefs.requestAccepted ?? true,
        newMessage: userSettings.messages ?? userPrefs.newMessage ?? true,
        meetupUpdate: userSettings.meetupUpdates ?? userPrefs.meetupUpdate ?? true,
        reportStatus: userSettings.reportStatus ?? userPrefs.reportStatus ?? true,
      });
    }
  }, [user]);

  const handleTogglePause = async () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    setIsSaving(true);
    setGeneralMessage({ type: "", text: "" });

    try {
      const updatedUser = nextPaused ? await freezeAccount() : await unfreezeAccount();
      if (updatedUser) {
        setUser(updatedUser);
      } else {
        setUser((prev) => (prev ? { ...prev, pauseProfile: nextPaused, isFrozen: nextPaused, isPaused: nextPaused } : prev));
      }
      setGeneralMessage({
        type: "success",
        text: nextPaused
          ? "Account paused successfully. Your profile is now hidden from the feed until manually reactivated."
          : "Account reactivated successfully. Your profile is visible in the feed again.",
      });
    } catch (err) {
      setIsPaused(!nextPaused); // revert on error
      setGeneralMessage({
        type: "error",
        text: err.message || "Failed to update account freeze status.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNotification = async (category) => {
    const nextVal = !preferences[category];
    const nextPrefs = { ...preferences, [category]: nextVal };
    setPreferences(nextPrefs);
    setIsSaving(true);
    setGeneralMessage({ type: "", text: "" });

    try {
      const updatedUser = await updateUserSettings({
        notificationPreferences: nextPrefs,
        notificationSettings: {
          chatRequests: nextPrefs.newChatRequest,
          acceptedRequests: nextPrefs.requestAccepted,
          messages: nextPrefs.newMessage,
          meetupUpdates: nextPrefs.meetupUpdate,
          reportStatus: nextPrefs.reportStatus,
        },
      });
      if (updatedUser) setUser(updatedUser);
    } catch (err) {
      setPreferences(preferences); // revert on error
      setGeneralMessage({ type: "error", text: err.message || "Failed to update notification settings." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePhone = async (e) => {
    e.preventDefault();
    setIsSavingPhone(true);
    setPhoneMessage({ type: "", text: "" });
    try {
      const updatedUser = await updateUserSettings({ phone: phone.trim() });
      if (updatedUser) setUser(updatedUser);
      setPhoneMessage({ type: "success", text: "Phone number updated successfully!" });
    } catch (err) {
      setPhoneMessage({ type: "error", text: err.message || "Failed to update phone number." });
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage({ type: "error", text: err.message || "Failed to change password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const SettingRow = ({ title, description, checked, onChange, disabled = false, icon }) => (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3.5 pr-2">
        {icon && (
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-2xs ${disabled ? "border-gray-100 bg-gray-50 text-gray-400" : "border-blue-100/70 bg-blue-50/70 text-[#2274A5]"}`}>
            {icon}
          </div>
        )}
        <div>
          <h3 className={`text-xs font-bold sm:text-sm ${disabled ? "text-gray-400" : "text-gray-900"}`}>{title}</h3>
          <p className={`mt-0.5 text-[11px] leading-relaxed sm:text-xs ${disabled ? "text-gray-400" : "text-gray-500"}`}>{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        aria-pressed={checked}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2274A5]/20 ${
          disabled ? "cursor-not-allowed bg-gray-200 opacity-60" : checked ? "bg-[#2274A5]" : "bg-gray-200"
        }`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* Page Header */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100/80 bg-blue-50 text-[#2274A5] shadow-2xs">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Settings</h1>
              <p className="mt-0.5 text-xs text-gray-400">Manage your profile visibility, notifications, and security.</p>
            </div>
          </div>
          {isSaving && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2274A5] animate-pulse">
              <span className="h-2 w-2 rounded-full bg-[#2274A5]" />
              Saving...
            </span>
          )}
        </div>

        {/* Profile / Account Overview Card in Settings */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              onClick={() => user?.avatarUrl && setIsImageLightboxOpen(true)}
              className={`relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-gradient-to-br from-blue-50 to-indigo-100 text-lg sm:text-xl font-bold text-[#0B3954] shadow-sm ${
                user?.avatarUrl ? "cursor-pointer group/avatar" : ""
              }`}
              title={user?.avatarUrl ? "Click to view full photo" : ""}
            >
              {user?.avatarUrl ? (
                <>
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "User profile photo"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-1 rounded-full bg-black/50 text-white backdrop-blur-xs shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </span>
                  </div>
                </>
              ) : (
                (user?.name || "U").charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 sm:text-lg">{user?.name || "Your Account"}</h2>
                {user?.isVerified && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#2274A5]">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{user?.email || ""}</p>
              {user?.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setIsImageLightboxOpen(true)}
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2274A5] hover:text-[#0B3954] transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View full image
                </button>
              )}
            </div>
          </div>
          <Link
            to="/app/profile"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition active:scale-95 cursor-pointer self-start sm:self-center"
          >
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </Link>
        </div>

        {generalMessage.text && (
          <div className={`p-4 rounded-2xl text-xs font-medium border ${generalMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            {generalMessage.text}
          </div>
        )}

        {/* Account Status & Visibility Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Account Status & Visibility</h2>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isPaused 
                ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              {isPaused ? 'Frozen / Paused' : 'Active on Feed'}
            </span>
          </div>
          <SettingRow
            title="Freeze / Pause Account"
            description="Temporarily remove your profile from the match feed and search. Your matches, chats, and data will remain safe until you manually unfreeze."
            checked={isPaused}
            onChange={handleTogglePause}
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
        </div>

        {/* Contact & Phone Number Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Contact Information</h2>
            <span className="text-[11px] text-gray-400">Account phone for notifications</span>
          </div>

          {phoneMessage.text && (
            <div className={`p-3 rounded-xl text-xs font-medium border ${phoneMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              {phoneMessage.text}
            </div>
          )}

          <form onSubmit={handleSavePhone} className="space-y-3">
            <div>
              <label htmlFor="settingsPhone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Phone Number
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="settingsPhone"
                  type="tel"
                  placeholder="+251 91 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-[#2274A5] focus:bg-white focus:ring-2 focus:ring-[#2274A5]/10"
                />
                <button
                  type="submit"
                  disabled={isSavingPhone}
                  className="rounded-xl bg-[#2274A5] hover:bg-[#1b5e87] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-60 cursor-pointer shrink-0"
                >
                  {isSavingPhone ? "Saving..." : "Save Phone"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Notifications Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Email & App Notifications</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <SettingRow
              title="New Chat Requests"
              description="Get notified when someone wants to connect with you."
              checked={preferences.newChatRequest}
              onChange={() => handleToggleNotification("newChatRequest")}
            />
            <SettingRow
              title="Requests Accepted"
              description="Get notified when someone accepts your chat request."
              checked={preferences.requestAccepted}
              onChange={() => handleToggleNotification("requestAccepted")}
            />
            <SettingRow
              title="New Messages"
              description="Get notified when you receive a direct message."
              checked={preferences.newMessage}
              onChange={() => handleToggleNotification("newMessage")}
            />
            <SettingRow
              title="Meetup Updates"
              description="Get notified when a meetup is proposed or rescheduled."
              checked={preferences.meetupUpdate}
              onChange={() => handleToggleNotification("meetupUpdate")}
            />
            <SettingRow
              title="Report Status"
              description="Get notified when a submitted safety report has been resolved."
              checked={preferences.reportStatus}
              onChange={() => handleToggleNotification("reportStatus")}
            />
          </div>
        </div>

        {/* Change Password Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Change Password</h2>
          </div>

          {passwordMessage.text && (
            <div className={`mb-4 p-3 rounded-xl text-xs font-medium border ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm outline-none focus:border-[#2274A5] focus:bg-white focus:ring-2 focus:ring-[#2274A5]/10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm outline-none focus:border-[#2274A5] focus:bg-white focus:ring-2 focus:ring-[#2274A5]/10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm outline-none focus:border-[#2274A5] focus:bg-white focus:ring-2 focus:ring-[#2274A5]/10"
              />
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="rounded-xl bg-[#2274A5] hover:bg-[#1b5e87] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-60 cursor-pointer"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone Card */}
        <div className="rounded-3xl border border-rose-100 bg-rose-50/30 p-5 shadow-sm sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-800">Danger Zone</h2>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold sm:text-sm text-gray-900">Delete Account</h3>
              <p className="mt-0.5 text-[11px] leading-relaxed sm:text-xs text-gray-500">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="rounded-xl bg-white border border-rose-200 hover:bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 shadow-2xs transition shrink-0 cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>

      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      <ImageLightboxModal
        isOpen={isImageLightboxOpen}
        onClose={() => setIsImageLightboxOpen(false)}
        imageUrl={user?.avatarUrl}
        altText={`${user?.name || "User"}'s profile picture`}
        title={`${user?.name || "Your"} Profile Photo`}
      />
    </div>
  );
};

export default SettingsPage;