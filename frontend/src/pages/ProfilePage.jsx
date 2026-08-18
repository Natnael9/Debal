import ProfileCompletionMeter from "../components/common/ProfileCompletionMeter";

function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold">
          User Profile
        </h1>

        <ProfileCompletionMeter percentage={75} />
      </div>
    </div>
  );
}

export default ProfilePage;