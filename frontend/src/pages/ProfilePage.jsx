import { useState } from "react";

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
import { updateMyProfile } from "../services/profileService";

function ProfilePage() {
    const [profile, setProfile] = useState({
        name: "Deble",
        age: 25,
        gender: "male",
        bio: "Looking for a respectful and responsible roommate.",
        housingStatus: "needs_room",

        budget: {
            min: 3000,
            max: 6000,
        },

        location: {
            preferred: "Bole",
            maxDistance: 5,
        },

        lifestyle: {
            cleanliness: "Very clean",
            sleepSchedule: "Early sleeper",
            smoking: "Non-smoker",
            pets: "Comfortable with pets",
        },

        photoUrl: "",

        verificationStatus: "verified",

        teamUpEnabled: false,

        profileCompletion: 75,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editProfile, setEditProfile] = useState(profile);
    const [isSaving, setIsSaving] = useState(false);

    const handleStartEditing = () => {
        setEditProfile(profile);
        setIsEditing(true);
    };

    const handleCancelEditing = () => {
        setEditProfile(profile);
        setIsEditing(false);
    };

 const handleSave = async () => {
    setIsSaving(true);

    try {
        const updatedProfile = await updateMyProfile(editProfile);

        setProfile(updatedProfile);
        setEditProfile(updatedProfile);
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
            bio: `${currentProfile.bio || ""}${
                currentProfile.bio ? "\n\n" : ""
            }${prompt} `,
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">

                {/* Profile Header */}
                <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                My Profile
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage your personal information and roommate
                                preferences.
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
                        {/* Verification */}
                        <div className="mb-6">
                            <IdentityVerification
                                status={profile.verificationStatus}
                            />
                        </div>

                        {/* Profile Photo */}
                        <div className="mb-6">
                            <ProfilePhoto
                                photoUrl={profile.photoUrl}
                                name={profile.name}
                            />
                        </div>

                        {/* Basic Information */}
                        <div className="mb-6">
                            <BasicInfo
                                age={profile.age}
                                gender={profile.gender}
                                bio={profile.bio}
                            />
                        </div>

                        {/* Housing Status */}
                        <div className="mb-6">
                            <HousingStatus
                                status={profile.housingStatus}
                            />
                        </div>

                        {/* Budget */}
                        <div className="mb-6">
                            <BudgetRange
                                minBudget={profile.budget.min}
                                maxBudget={profile.budget.max}
                            />
                        </div>

                        {/* Location */}
                        <div className="mb-6">
                            <LocationPreferences
                                location={profile.location.preferred}
                                maxDistance={profile.location.maxDistance}
                            />
                        </div>

                        {/* Lifestyle */}
                        <div className="mb-6">
                            <LifestyleAttributes
                                lifestyle={profile.lifestyle}
                            />
                        </div>

                        {/* Guided Bio Prompts */}
                        <div className="mb-6">
                            <GuidedBioPrompts
                                onSelectPrompt={() => handleStartEditing()}
                            />
                        </div>

                        {/* Team-Up */}
                        {profile.housingStatus === "needs_room" && (
                            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Team-Up Preference
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Allow matching with other people who
                                            are also looking for a room.
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