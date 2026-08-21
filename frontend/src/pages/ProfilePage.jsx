import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProfileCompletionMeter from "../components/profile/ProfileCompletionMeter";
import BasicInfo from "../components/profile/BasicInfo";
import HousingStatus from "../components/profile/HousingStatus";
import BudgetRange from "../components/profile/BudgetRange";
import LocationPreferences from "../components/profile/LocationPreferences";
import LifestyleAttributes from "../components/profile/LifestyleAttributes";
import ProfilePhoto from "../components/profile/ProfilePhoto";
import IdentityVerification from "../components/profile/IdentityVerification";
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
  const [verificationStep, setVerificationStep] = useState(null);
  const [editProfile, setEditProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

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
  };

  const handleCancelEditing = () => {
    setEditProfile(profile);
    setIsEditing(false);
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

  const handlePromptSelect = (prompt) => {
    setEditProfile((currentProfile) => ({
      ...currentProfile,
      bio: `${currentProfile?.bio || ""}${currentProfile?.bio ? "\n\n" : ""}${prompt} `,
    }));
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    } finally {
      setIsUploadingPhoto(false);
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
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Profile
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your personal information and roommate preferences.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEditing}
                className="rounded-xl bg-[#2274A5] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="mt-6">
            <ProfileCompletionMeter
              percentage={profile.profileCompletion}
            />
          </div>
        </div>

        {isEditing ? (
          <>
            <div className="mb-6">
              <EditProfileForm
                profile={editProfile}
                onChange={setEditProfile}
                onSave={handleSave}
                onCancel={handleCancelEditing}
                isSaving={isSaving}
              />
            </div>

            <div className="mb-6">
              <GuidedBioPrompts
                onSelectPrompt={handlePromptSelect}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <ProfilePhoto
                  photoUrl={profile.photoUrl}
                  name={profile.name}
                />
                <div>
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
                    className="whitespace-nowrap rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <IdentityVerification
                  status={profile.verificationStatus}
                />
                
                {profile.verificationStatus !== "verified" && profile.verificationStatus !== "pending" && (
                  <button
                    onClick={handleVerifyClick}
                    className="whitespace-nowrap rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
                  >
                    Verify Identity Now
                  </button>
                )}
              </div>
            </div>

            <div className="mb-6">
              <BasicInfo
                age={profile.age}
                gender={profile.gender}
                bio={profile.bio}
              />
            </div>

            <div className="mb-6">
              <HousingStatus status={profile.housingStatus} />
            </div>

            <div className="mb-6">
              <BudgetRange
                minBudget={profile.budget.min}
                maxBudget={profile.budget.max}
              />
            </div>

            <div className="mb-6">
              <LocationPreferences
                location={profile.location.preferred}
                maxDistance={profile.location.maxDistance}
              />
            </div>

            <div className="mb-6">
              <LifestyleAttributes lifestyle={profile.lifestyle} />
            </div>

            <div className="mb-6">
              <GuidedBioPrompts
                onSelectPrompt={() => handleStartEditing()}
              />
            </div>

            {profile.housingStatus === "needs_room" && (
              <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Team-Up Preference
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Allow matching with other people who are also looking for a room.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Edit
                  </button>
                </div>
                <p className="mt-4 text-sm font-medium text-[#2274A5]">
                  {profile.teamUpEnabled
                    ? "Team-up matching is enabled"
                    : "Team-up matching is disabled"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;