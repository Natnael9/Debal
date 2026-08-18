import ProfileCompletionMeter from "../components/common/ProfileCompletionMeter";

import BasicInfo from "../components/profile/BasicInfo";
import HousingStatus from "../components/profile/HousingStatus";
import BudgetRange from "../components/profile/BudgetRange";
import LocationPreferences from "../components/profile/LocationPreferences";
import LifestyleAttributes from "../components/profile/LifestyleAttributes";
import ProfilePhoto from "../components/profile/ProfilePhoto";
import IdentityVerification from "../components/profile/IdentityVerification";
import GuidedBioPrompts from "../components/profile/GuidedBioPrompts";
import TeamUpPreference from "../components/profile/TeamUpPreference";

function ProfilePage() {
  // Temporary profile data for the frontend display.
  // Later this can come from the backend/API.
  const profile = {
    name: "Midas",
    age: 18,
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

    profileCompletion: 75,
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
                Manage your personal information and roommate preferences.
              </p>
            </div>

            <IdentityVerification
              status={profile.verificationStatus}
            />
          </div>

          <div className="mt-6">
            <ProfileCompletionMeter
              percentage={profile.profileCompletion}
            />
          </div>
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
          <GuidedBioPrompts />
        </div>

        {/* Team-Up Preference */}
        {profile.housingStatus === "needs_room" && (
          <div className="mb-6">
            <TeamUpPreference />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;