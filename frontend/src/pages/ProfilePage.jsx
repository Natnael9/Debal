import { useState, useRef, useEffect } from "react";

import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProfileCompletionMeter from "../components/profile/ProfileCompletionMeter";
import LifestyleAttributes from "../components/profile/LifestyleAttributes";
import GuidedBioPrompts from "../components/profile/GuidedBioPrompts";
import EditProfileForm from "../components/profile/EditProfileForm";
import { getMyProfile, updateMyProfile } from "../services/profileService";
import { uploadPhoto } from "../services/uploadService";

import IDSubmitForm from "../components/IDSubmitForm";
import OTPConfirmForm from "../components/OTPConfirmForm";
import VerificationStatusScreen from "../components/VerificationStatusScreen";

function mapUserToProfile(user) {
  if (!user) return null;

  const cleanlinessMap = { 1: "Quiet & Minimal", 2: "Relaxed", 3: "Moderate", 4: "Clean", 5: "Very Clean" };
  const cleanlinessStr = typeof user.preferences?.cleanliness === "number"
    ? cleanlinessMap[user.preferences.cleanliness] || `Level ${user.preferences.cleanliness}`
    : user.preferences?.cleanliness || "Moderate";

  const sleepMap = { early_bird: "Early Bird", night_owl: "Night Owl", flexible: "Flexible" };
  const sleepStr = sleepMap[user.preferences?.sleepSchedule] || user.preferences?.sleepSchedule || "Flexible";

  const smokingStr = user.preferences?.smokingOk ? "Smoker / Outdoor Smoking OK" : "Non-smoker";
  const petsStr = user.preferences?.petsOk ? "Comfortable with pets" : "No pets allowed";

  return {
    name: user.name || "User",
    age: user.age || 18,
    gender: user.gender || "male",
    bio: user.bio || "",
    housingStatus: user.housingStatus || "needs_room",

    budget: {
      min: user.preferences?.budgetMin ?? 0,
      max: user.preferences?.budgetMax ?? 0,
    },

    location: {
      preferred: user.location?.displayName || "Addis Ababa",
      maxDistance: user.maxDistance || 10,
    },

    lifestyle: {
      cleanliness: cleanlinessStr,
      cleanlinessScore: user.preferences?.cleanliness || 3,
      sleepSchedule: sleepStr,
      smoking: smokingStr,
      pets: petsStr,
    },

    photoUrl: user.avatarUrl || "",
    verificationStatus: user.verificationStatus || "unverified",
    teamUpEnabled: Boolean(user.teamUpEnabled),
    profileCompletion: user.profileCompletionPercent || 50,
  };
}

function parseCleanliness(val) {
  if (typeof val === 'number') return val;
  const str = String(val || "").toLowerCase();
  if (str.includes("very")) return 5;
  if (str.includes("clean") && !str.includes("moderate")) return 4;
  if (str.includes("relaxed")) return 2;
  return 3;
}

function parseSleep(val) {
  const str = String(val || "").toLowerCase();
  if (str.includes("early")) return "early_bird";
  if (str.includes("night")) return "night_owl";
  return "flexible";
}

function ProfilePage() {
  const { setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [verificationStep, setVerificationStep] = useState(null);
  const [editProfile, setEditProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      setIsLoading(true);
      try {
        const user = await getMyProfile();
        if (isMounted && user) {
          setUser(user);
          const mapped = mapUserToProfile(user);
          setProfile(mapped);
          setEditProfile(mapped);
          setBioText(mapped.bio || "");
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProfile();
    return () => { isMounted = false; };
  }, [setUser]);

  const handleStartEditing = () => {
    setEditProfile(profile);
    setIsEditing(true);
    setIsEditingBio(false);
  };

  const handleCancelEditing = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleStartEditingBio = () => {
    setBioText(profile?.bio || "");
    setIsEditingBio(true);
    setIsEditing(false);
  };

  const handleCancelEditingBio = () => {
    setBioText(profile?.bio || "");
    setIsEditingBio(false);
  };

  const handleSaveBioOnly = async () => {
    setIsSavingBio(true);
    try {
      const updatedUser = await updateMyProfile({ bio: bioText });
      if (updatedUser) setUser(updatedUser);
      const mapped = mapUserToProfile(updatedUser);
      setProfile(mapped);
      setEditProfile(mapped);
      setIsEditingBio(false);
    } catch (error) {
      console.error("Failed to update bio:", error);
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleSave = async () => {
    if (!editProfile) return;
    setIsSaving(true);
    try {
      const payload = {
        name: editProfile.name,
        age: Number(editProfile.age),
        gender: editProfile.gender,
        bio: editProfile.bio,
        housingStatus: editProfile.housingStatus,
        teamUpEnabled: editProfile.housingStatus === "needs_room" ? Boolean(editProfile.teamUpEnabled) : false,
        budget: {
          budgetMin: Number(editProfile.budget?.min ?? 0),
          budgetMax: Number(editProfile.budget?.max ?? 0),
        },
        location: {
          coordinates: [38.7635, 9.0168],
          displayName: editProfile.location?.preferred || "Addis Ababa",
        },
        maxDistance: Number(editProfile.location?.maxDistance || 10),
        lifestyle: {
          cleanliness: parseCleanliness(editProfile.lifestyle?.cleanliness),
          sleepSchedule: parseSleep(editProfile.lifestyle?.sleepSchedule),
          smokingOk: String(editProfile.lifestyle?.smoking || "").toLowerCase().includes("smoker"),
          petsOk: String(editProfile.lifestyle?.pets || "").toLowerCase().includes("comfortable"),
        },
      };

      const updatedUser = await updateMyProfile(payload);
      if (updatedUser) setUser(updatedUser);
      const mapped = mapUserToProfile(updatedUser);
      setProfile(mapped);
      setEditProfile(mapped);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromptSelectBioMode = (prompt) => {
    setBioText((current) => `${current || ""}${current ? "\n\n" : ""}${prompt} `);
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploadingPhoto(true);

    try {
      const { url } = await uploadPhoto(file);
      const updatedUser = await updateMyProfile({ avatarUrl: url });
      if (updatedUser) setUser(updatedUser);
      const mapped = mapUserToProfile(updatedUser);
      setProfile(mapped);
      setEditProfile(mapped);
    } catch (err) {
      console.error("Failed to upload profile photo:", err);
      setUploadError(err.message || "Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleVerifyClick = () => setVerificationStep("ID_FORM");
  const handleCancelVerification = () => setVerificationStep(null);
  
  const handleIDSubmit = () => {
    setProfile((prev) => (prev ? { ...prev, verificationStatus: "pending" } : prev));
    setVerificationStep("OTP_FORM");
  };
  
  const handleOTPSuccess = () => {
    setVerificationStep("STATUS_SCREEN");
  };
  
  const handleFinishVerification = async () => {
    try {
      const user = await getMyProfile();
      if (user) {
        setUser(user);
        setProfile(mapUserToProfile(user));
      }
    } catch (err) {
      console.error("Failed to refresh profile after verification:", err);
    } finally {
      setVerificationStep(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Unable to load profile data.</p>
      </div>
    );
  }

  if (verificationStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {verificationStep === "ID_FORM" && (
            <IDSubmitForm 
              onCancel={handleCancelVerification}
              onSubmit={handleIDSubmit} 
            />
          )}

          {verificationStep === "OTP_FORM" && (
            <OTPConfirmForm 
              onCancel={handleCancelVerification}
              onSuccess={handleOTPSuccess} 
            />
          )}

          {verificationStep === "STATUS_SCREEN" && (
            <VerificationStatusScreen 
              status="verified"
              onClose={handleFinishVerification} 
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70 pt-6 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ── HERO HEADER CARD ──────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
          {/* Header Cover Banner */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-[#0B3954] via-[#1A5B7A] to-[#2274A5] relative p-6 flex items-end justify-end">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

            {/* Edit Profile CTA in Banner */}
            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEditing}
                className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-white/95 hover:bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-[#0B3954] shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#2274A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 210.3H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Full Profile
              </button>
            )}
          </div>

          {/* Profile Header Details & Photo Overlap */}
          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
              
              {/* Photo & Overlap Avatar */}
              <div className="relative group self-start sm:self-auto">
                <div className="relative flex h-28 w-28 sm:h-36 sm:w-36 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-br from-blue-50 to-indigo-100 text-3xl font-extrabold text-[#0B3954] shadow-lg">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={`${profile.name}'s profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>

                {/* Upload Photo Button Overlay */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-1 right-1 p-2 rounded-2xl bg-[#0B3954] hover:bg-[#2274A5] text-white shadow-md transition-transform active:scale-90 border-2 border-white cursor-pointer"
                  title="Change profile photo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              {/* Name, Status & Tags */}
              <div className="flex-1 sm:ml-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    {profile.name}
                  </h1>
                  {profile.age && (
                    <span className="text-lg font-medium text-gray-500">
                      , {profile.age}
                    </span>
                  )}

                  {/* Active Profile Indicator */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Profile
                  </span>

                  {/* Verification Badge */}
                  {profile.verificationStatus === "verified" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                      Unverified
                    </span>
                  )}
                </div>

                {/* Subtitle location & Housing status */}
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile.location.preferred}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-gray-300" />

                  <span className="font-medium text-[#0B3954]">
                    {profile.housingStatus === "has_room" ? "Has a Room Available" : "Seeking a Room"}
                  </span>
                </div>

                {uploadError && (
                  <p className="mt-2 text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Completion Meter */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <ProfileCompletionMeter percentage={profile.profileCompletion} />
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT (EDIT FULL VS EDIT BIO VS READ MODE) ─────────────── */}
        {isEditing ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <EditProfileForm
                profile={editProfile}
                onChange={setEditProfile}
                onSave={handleSave}
                onCancel={handleCancelEditing}
                isSaving={isSaving}
              />
            </div>
          </div>
        ) : (
          /* ── 2-COLUMN DASHBOARD GRID ───────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT COLUMN (1/3 Width): Identity & Preferences Summary ── */}
            <div className="space-y-6">
              
              {/* Identity & Verification Card */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Identity Trust & Verification
                  </h3>
                  <span className={`h-2.5 w-2.5 rounded-full ${profile.verificationStatus === 'verified' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                </div>

                <div className={`p-4 rounded-2xl border ${profile.verificationStatus === 'verified' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${profile.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 capitalize">
                        {profile.verificationStatus === 'verified' ? 'Verified Account' : 'Verification Needed'}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {profile.verificationStatus === 'verified'
                          ? 'Your National ID record is verified. Verified profiles receive 3x more match responses!'
                          : 'Verify your ID to increase trust and unlock all chat & roommate matching features.'}
                      </p>
                    </div>
                  </div>
                </div>

                {profile.verificationStatus !== "verified" && profile.verificationStatus !== "pending" && (
                  <button
                    onClick={handleVerifyClick}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    Verify My Identity Now
                  </button>
                )}
              </div>

              {/* Quick Housing & Budget Summary Card */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Housing & Budget
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">Monthly Budget</span>
                    <span className="text-xs font-bold text-[#0B3954]">
                      {profile.budget.min > 0 ? `${profile.budget.min.toLocaleString()} - ` : ''}
                      {profile.budget.max ? `${profile.budget.max.toLocaleString()} ETB/mo` : 'Not set'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">Preferred Location</span>
                    <span className="text-xs font-bold text-gray-900">{profile.location.preferred}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">Max Distance Radius</span>
                    <span className="text-xs font-bold text-gray-900">{profile.location.maxDistance} km</span>
                  </div>

                  {profile.housingStatus === "needs_room" && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/50 border border-blue-100">
                      <span className="text-xs font-semibold text-[#0B3954]">Team-Up Preference</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${profile.teamUpEnabled ? 'bg-blue-100 text-[#0B3954]' : 'bg-gray-200 text-gray-600'}`}>
                        {profile.teamUpEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN (2/3 Width): Bio & Detailed Preferences ────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Bio & About Me Card (Focused Bio Edit vs View) */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#2274A5]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      About Me & Bio
                    </h3>
                  </div>
                  
                  {!isEditingBio && (
                    <button
                      type="button"
                      onClick={handleStartEditingBio}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#2274A5] hover:text-[#0B3954] transition cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 210.3H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit Bio Only
                    </button>
                  )}
                </div>

                {isEditingBio ? (
                  /* ── FOCUSED EDIT BIO ONLY ────────────────────────────── */
                  <div className="space-y-4 pt-1">
                    <div>
                      <label htmlFor="bioInput" className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Your Bio Introduction
                      </label>
                      <textarea
                        id="bioInput"
                        rows={4}
                        maxLength={500}
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        placeholder="Share a bit about yourself, your hobbies, work/study routine, and what you look for in a roommate..."
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#2274A5] focus:bg-white focus:ring-2 focus:ring-[#2274A5]/10 transition-all"
                      />
                      <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400 px-1">
                        <span>Tip: Select prompts below to add to your bio</span>
                        <span>{bioText.length}/500</span>
                      </div>
                    </div>

                    {/* Guided Prompts helper for Bio Edit */}
                    <div className="border-t border-gray-100 pt-4">
                      <GuidedBioPrompts onSelectPrompt={handlePromptSelectBioMode} />
                    </div>

                    {/* Action buttons for Bio Save/Cancel */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleCancelEditingBio}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveBioOnly}
                        disabled={isSavingBio}
                        className="rounded-xl bg-[#2274A5] hover:bg-[#1b5e87] px-5 py-2 text-xs font-semibold text-white shadow-sm transition disabled:opacity-60 cursor-pointer"
                      >
                        {isSavingBio ? "Saving Bio..." : "Save Bio"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── READ BIO VIEW ─────────────────────────────────────── */
                  <div className="rounded-2xl border border-blue-50 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 p-5">
                    <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line font-normal">
                      {profile.bio ? (
                        profile.bio
                      ) : (
                        <span className="italic text-gray-400">
                          No bio added yet. Click "Edit Bio Only" above to introduce yourself to potential roommates!
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Lifestyle Attributes Card */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
                <LifestyleAttributes lifestyle={profile.lifestyle} />
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default ProfilePage;