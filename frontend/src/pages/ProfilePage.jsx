import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

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

// --- CORRECTED IMPORTS FOR VERIFICATION WIZARD ---
import IDSubmitForm from "../components/IDSubmitForm";
import OTPConfirmForm from "../components/OTPConfirmForm";
import VerificationStatusScreen from "../components/VerificationStatusScreen";

function ProfilePage() {
    const fileInputRef = useRef(null);

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

        verificationStatus: "unverified", // Set to unverified to test

        teamUpEnabled: false,
        profileCompletion: 75,
    });

    const [isEditing, setIsEditing] = useState(false);
    
    // Tracks the verification wizard: null | "ID_FORM" | "OTP_FORM" | "STATUS_SCREEN"
    const [verificationStep, setVerificationStep] = useState(null);
    
    const [editProfile, setEditProfile] = useState(profile);
    const [isSaving, setIsSaving] = useState(false);

    // --- EDITING LOGIC ---
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

    // --- PHOTO LOGIC ---
    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfile((prev) => ({ ...prev, photoUrl: imageUrl }));
        }
    };

    // --- VERIFICATION WIZARD LOGIC ---
    const handleVerifyClick = () => setVerificationStep("ID_FORM");
    const handleCancelVerification = () => setVerificationStep(null);
    
    const handleIDSubmit = (data) => {
        // Form submitted successfully, move to OTP
        setVerificationStep("OTP_FORM");
    };
    
    const handleOTPSuccess = () => {
        // OTP verified, move to success screen
        setVerificationStep("STATUS_SCREEN");
    };
    
    const handleFinishVerification = () => {
        // Done! Close wizard and update profile status
        setProfile((prev) => ({ ...prev, verificationStatus: "pending" }));
        setVerificationStep(null);
    };


    // =========================================
    // RENDER 1: VERIFICATION WIZARD VIEW
    // (This hides the profile entirely while verifying)
    // =========================================
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
                            onClose={handleFinishVerification} 
                        />
                    )}
                </div>
            </div>
        );
    }

    // =========================================
    // RENDER 2: NORMAL PROFILE VIEW & EDIT VIEW
    // =========================================
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">

                {/* Profile Header & Completion Meter */}
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
                        {/* --- EDIT MODE --- */}
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
                        {/* --- VIEW MODE --- */}
                        
                        {/* 1. Profile Photo */}
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
                                        onClick={() => fileInputRef.current.click()}
                                        className="whitespace-nowrap rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                                    >
                                        Change Photo
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. Identity Verification */}
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
                            <HousingStatus status={profile.housingStatus} />
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
                            <LifestyleAttributes lifestyle={profile.lifestyle} />
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