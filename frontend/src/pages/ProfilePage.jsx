import { useState, useRef, useEffect } from "react";

import { useAuth } from "../context/AuthContext";
import { ProfileSkeleton } from "../components/common/Skeleton";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProfileCompletionMeter from "../components/profile/ProfileCompletionMeter";
import LifestyleAttributes from "../components/profile/LifestyleAttributes";
import EditProfileForm from "../components/profile/EditProfileForm";
import { getMyProfile, updateMyProfile } from "../services/profileService";
import { uploadPhoto } from "../services/uploadService";

import IDSubmitForm from "../components/IDSubmitForm";
import OTPConfirmForm from "../components/OTPConfirmForm";
import VerificationStatusScreen from "../components/VerificationStatusScreen";
import ImageLightboxModal from "../components/common/ImageLightboxModal";

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
    isFrozen: Boolean(user.isFrozen || user.isPaused),
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
  const { user: authUser, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const initialProfile = mapUserToProfile(authUser);
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(!initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(initialProfile?.bio || "");
  const [verificationStep, setVerificationStep] = useState(null);
  const [editProfile, setEditProfile] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);

  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;
  const isEditingBioRef = useRef(isEditingBio);
  isEditingBioRef.current = isEditingBio;

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const user = await getMyProfile();
        if (isMounted && user) {
          setUser(user);
          const mapped = mapUserToProfile(user);
          setProfile(mapped);
          if (!isEditingRef.current) {
            setEditProfile(mapped);
          }
          if (!isEditingBioRef.current) {
            setBioText(mapped.bio || "");
          }
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

  // FIX 1: Bulletproof Cancel Function (refetches profile to clear false "pending" states)
  const handleCancelVerification = async () => {
    setVerificationStep(null);
    try {
      const user = await getMyProfile();
      if (user) {
        setUser(user);
        setProfile(mapUserToProfile(user));
      }
    } catch (err) {
      console.error("Failed to refresh profile on cancel:", err);
    }
  };

  const handleIDSubmit = (data, updatedUser) => {
    const freshUser = updatedUser || { verificationStatus: "verified" };
    setUser((prev) => ({
      ...(prev || {}),
      ...freshUser,
      verificationStatus: "verified",
    }));
    setProfile((prev) => ({
      ...(prev || {}),
      verificationStatus: "verified",
    }));
    setVerificationStep("STATUS_SCREEN");
  };

  const handleOTPSuccess = (status = "verified", updatedUser = null) => {
    const freshUser = updatedUser || { verificationStatus: "verified" };
    setUser((prev) => ({
      ...(prev || {}),
      ...freshUser,
      verificationStatus: "verified",
    }));
    setProfile((prev) => ({
      ...(prev || {}),
      verificationStatus: "verified",
    }));
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
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Unable to load profile data.</p>
      </div>
    );
  }

  return (
    // DESIGN: soft tinted page background instead of flat gray
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-emerald-50/40 pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      {/* DESIGN: tighter max width so hero + cards line up as one centered column */}
      <div className="w-full max-w-4xl mx-auto space-y-6">

        {/* ── HERO HEADER CARD ──────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/60 ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-2 duration-500">

          {/* Header Cover Banner: layered gradient + glow blobs + dot texture */}
          <div className="h-40 sm:h-52 bg-gradient-to-br from-[#0F2027] via-[#1E7F74] to-[#71B280] relative p-5 flex items-start justify-end overflow-hidden">
            {/* glow blobs */}
            <div className="pointer-events-none absolute -top-16 -left-10 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl" />
            {/* dot texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
            />
            {/* fade into the card below */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Edit Profile CTA in Banner (glass style) */}
            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEditing}
                className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/30 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Full Profile
              </button>
            )}
          </div>

          {/* Profile Header Details & Photo Overlap */}
          <div className="px-6 pb-8 pt-0 relative">
            <div className="flex flex-col items-center text-center gap-4 -mt-16 sm:-mt-20 mb-2">

              {/* Photo & Overlap Avatar: gradient ring + soft glow */}
              <div className="relative group self-center">
                <div className="absolute -inset-1.5 rounded-[2rem] bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 opacity-80 blur-sm group-hover:opacity-100 transition-opacity" />
                <div
                  onClick={() => profile.photoUrl && setIsPhotoLightboxOpen(true)}
                  className={`relative flex h-32 w-32 sm:h-40 sm:w-40 shrink-0 items-center justify-center overflow-hidden rounded-[1.75rem] border-4 border-white bg-gradient-to-br from-emerald-50 to-teal-100 text-4xl font-extrabold text-[#0B3954] shadow-2xl ${profile.photoUrl ? "cursor-pointer group/avatar" : ""
                    }`}
                  title={profile.photoUrl ? "Click to view full photo" : ""}
                >
                  {profile.photoUrl ? (
                    <>
                      <img
                        src={profile.photoUrl}
                        alt={`${profile.name}'s profile`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="p-1.5 rounded-full bg-black/50 text-white backdrop-blur-xs shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </span>
                      </div>
                    </>
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-10">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploadingPhoto}
                  className="absolute -bottom-1 -right-1 z-10 p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transition-transform hover:scale-110 active:scale-90 border-[3px] border-white cursor-pointer"
                  title="Change profile photo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              {/* Name, Status & Tags */}
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                    {profile.name}
                  </h1>
                  {profile.age && (
                    <span className="text-xl font-medium text-gray-400">
                      , {profile.age}
                    </span>
                  )}
                </div>

                {/* Badges on their own row so the name stays clean */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {/* Active Profile Indicator */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Profile
                  </span>

                  {/* Verification Badge */}
                  {profile.verificationStatus === "verified" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-200">
                      <svg className="w-3.5 h-3.5 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                      Unverified
                    </span>
                  )}

                  <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    {profile.housingStatus === "has_room" ? "Has a Room Available" : "Seeking a Room"}
                  </span>
                </div>

                {/* Subtitle location */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile.location.preferred}
                  </span>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-100">
                <span>{uploadError}</span>
                <button
                  onClick={() => setUploadError(null)}
                  className="rounded-lg p-1 text-red-500 hover:bg-red-100"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Quick stats strip (display only, uses existing profile fields) */}
            <div className="mt-6 grid grid-cols-3 divide-x divide-gray-100 rounded-2xl bg-gray-50/80 ring-1 ring-gray-100 py-4">
              <div className="px-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Budget</p>
                <p className="mt-1 text-sm font-extrabold text-gray-900">
                  {profile.budget.max ? `${profile.budget.max.toLocaleString()} ETB` : "Not set"}
                </p>
              </div>
              <div className="px-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Radius</p>
                <p className="mt-1 text-sm font-extrabold text-gray-900">{profile.location.maxDistance} km</p>
              </div>
              <div className="px-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sleep</p>
                <p className="mt-1 text-sm font-extrabold text-gray-900">{profile.lifestyle.sleepSchedule}</p>
              </div>
            </div>

            {/* Profile Completion Meter */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <ProfileCompletionMeter percentage={profile.profileCompletion} />
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT (EDIT FULL VS EDIT BIO VS READ MODE) ─────────────── */}
        {isEditing ? (
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/60 ring-1 ring-black/5">
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
          /* ── SINGLE-COLUMN VERTICAL LAYOUT ─────────────────────────────── */
          <div className="grid grid-cols-1 gap-6 w-full">

            {/* ── LEFT COLUMN WRAPPER ("contents" so cards flow into one column) ── */}
            <div className="contents">

              {/* Identity & Verification Card */}
              <div className="order-1 relative overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-lg shadow-slate-200/50 ring-1 ring-black/5 space-y-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                {/* colored top accent */}
                <div className={`absolute inset-x-0 top-0 h-1 ${profile.verificationStatus === 'verified' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} />

                <div className="flex items-center justify-between pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                    Identity Trust & Verification
                  </h3>
                  <span className={`h-2.5 w-2.5 rounded-full ${profile.verificationStatus === 'verified' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                </div>

                <div className={`p-4 rounded-2xl border ${profile.verificationStatus === 'verified' ? 'bg-emerald-50/60 border-emerald-100' : 'bg-amber-50/60 border-amber-100'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${profile.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black dark:text-white capitalize">
                        {profile.verificationStatus === 'verified' ? 'Verified Account' : 'Verification Needed'}
                      </h4>
                      <p className="text-xs text-black dark:text-gray-100 mt-0.5 leading-relaxed font-medium">
                        {profile.verificationStatus === 'verified'
                          ? 'Your National ID record is verified. Verified profiles receive 3x more match responses!'
                          : 'Verify your ID to increase trust and unlock all chat & roommate matching features.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* FIX 2: Dynamic Button State Rendering */}
                {profile.verificationStatus === "unverified" && (
                  <button
                    onClick={handleVerifyClick}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-4 py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/30 transition active:scale-98 cursor-pointer mt-4"
                  >
                    Verify My Identity Now
                  </button>
                )}

                {profile.verificationStatus === "pending" && (
                  <button
                    onClick={handleVerifyClick}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-amber-500/30 transition active:scale-98 cursor-pointer mt-4"
                  >
                    Resume Verification
                  </button>
                )}
              </div>

              {/* Quick Housing & Budget Summary Card */}
              <div className="order-3 rounded-[1.75rem] bg-white p-6 shadow-lg shadow-slate-200/50 ring-1 ring-black/5 space-y-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-500" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                    Housing & Budget
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-50 ring-1 ring-gray-100 transition hover:bg-emerald-50/50">
                    <span className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </span>
                      Monthly Budget
                    </span>
                    <span className="text-xs font-bold text-[#0B3954]">
                      {profile.budget.min > 0 ? `${profile.budget.min.toLocaleString()} - ` : ''}
                      {profile.budget.max ? `${profile.budget.max.toLocaleString()} ETB/mo` : 'Not set'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-50 ring-1 ring-gray-100 transition hover:bg-emerald-50/50">
                    <span className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      Preferred Location
                    </span>
                    <span className="text-xs font-bold text-gray-900">{profile.location.preferred}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-50 ring-1 ring-gray-100 transition hover:bg-emerald-50/50">
                    <span className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </span>
                      Max Distance Radius
                    </span>
                    <span className="text-xs font-bold text-gray-900">{profile.location.maxDistance} km</span>
                  </div>

                  {profile.housingStatus === "needs_room" && (
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-teal-50/60 ring-1 ring-teal-100">
                      <span className="flex items-center gap-3 text-xs font-semibold text-[#0B3954]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </span>
                        Team-Up Preference
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${profile.teamUpEnabled ? 'bg-teal-100 text-teal-800' : 'bg-gray-200 text-gray-600'}`}>
                        {profile.teamUpEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN WRAPPER ("contents" so cards flow into one column) ── */}
            <div className="contents">

              {/* Bio & About Me Card (Focused Bio Edit vs View) */}
              <div className="order-2 rounded-[1.75rem] bg-white p-6 sm:p-8 shadow-lg shadow-slate-200/50 ring-1 ring-black/5 space-y-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                      About Me & Bio
                    </h3>
                  </div>

                  {!isEditingBio && (
                    <button
                      type="button"
                      onClick={handleStartEditingBio}
                      className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 hover:bg-teal-100 px-3 py-1.5 text-xs font-bold text-teal-700 transition cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
                        rows={5}
                        maxLength={500}
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        placeholder="Share a bit about yourself, your hobbies, work/study routine, and what you look for in a roommate..."
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all"
                      />
                      <div className="flex justify-end items-center mt-1 text-[11px] text-gray-400 px-1">
                        <span>{bioText.length}/500</span>
                      </div>
                    </div>

                    {/* Action buttons for Bio Save/Cancel */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleCancelEditingBio}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveBioOnly}
                        disabled={isSavingBio}
                        className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/25 transition disabled:opacity-60 cursor-pointer"
                      >
                        {isSavingBio ? "Saving Bio..." : "Save Bio"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── READ BIO VIEW ─────────────────────────────────────── */
                  <div className="relative rounded-2xl border border-teal-50 dark:border-blue-900/30 bg-gradient-to-br from-teal-50/50 to-emerald-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 p-5 pl-6 border-l-4 border-l-teal-400">
                    <p className="text-sm leading-relaxed text-black dark:text-white whitespace-pre-line font-medium">
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
              <div className="order-4 rounded-[1.75rem] bg-white p-6 sm:p-8 shadow-lg shadow-slate-200/50 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                <LifestyleAttributes lifestyle={profile.lifestyle} />
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ── VERIFICATION MODAL OVERLAY ────────────────────────────────────────── */}
      {verificationStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-150">
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
      )}
      {/* ── IMAGE LIGHTBOX MODAL ────────────────────────────────────────── */}
      <ImageLightboxModal
        isOpen={isPhotoLightboxOpen}
        onClose={() => setIsPhotoLightboxOpen(false)}
        imageUrl={profile.photoUrl}
        altText={`${profile.name}'s profile picture`}
        title={`${profile.name}'s Profile Photo`}
      />
    </div>
  );
}

export default ProfilePage;