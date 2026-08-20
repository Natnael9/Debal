import { useParams, useNavigate } from "react-router-dom";

const candidates = {
  "1": {
    _id: "1",
    name: "Elias",
    age: 21,
    gender: "Male",
    location: "Bole",
    bio: "Looking for a chill roommate. I study computer science and prefer a respectful and relaxed home.",
    budgetMin: 4000,
    budgetMax: 6000,
    cleanliness: 4,
    sleepSchedule: "Night owl",
    smoking: "Non-smoker",
    pets: "Comfortable with pets",
  },

  "2": {
    _id: "2",
    name: "Sara",
    age: 20,
    gender: "Female",
    location: "Kazanchis",
    bio: "Architecture student! I am very tidy and organized and enjoy having a peaceful home.",
    budgetMin: 5000,
    budgetMax: 8000,
    cleanliness: 5,
    sleepSchedule: "Early bird",
    smoking: "Non-smoker",
    pets: "Prefer no pets",
  },

  "3": {
    _id: "3",
    name: "Daniel",
    age: 23,
    gender: "Male",
    location: "CMC",
    bio: "Easygoing person who enjoys cooking, watching movies, and keeping shared spaces comfortable.",
    budgetMin: 4000,
    budgetMax: 7000,
    cleanliness: 4,
    sleepSchedule: "Flexible",
    smoking: "Non-smoker",
    pets: "Comfortable with pets",
  },

  "4": {
    _id: "4",
    name: "Hana",
    age: 22,
    gender: "Female",
    location: "Bole",
    bio: "Medical student looking for a quiet and clean roommate. I value a peaceful and respectful living environment.",
    budgetMin: 6000,
    budgetMax: 9000,
    cleanliness: 5,
    sleepSchedule: "Early bird",
    smoking: "Non-smoker",
    pets: "Prefer no pets",
  },
};

function CandidateProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const candidate = candidates[userId];

  if (!candidate) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">
            Candidate not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            We couldn't find the profile you're looking for.
          </p>
        </div>
      </div>
    );
  }

  const handleMessage = () => {
    navigate("/app/messages");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            {/* Candidate information */}
            <div className="flex items-center gap-5">

              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-900">
                {candidate.name.charAt(0)}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {candidate.name}, {candidate.age}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  {candidate.gender} · {candidate.location}
                </p>
              </div>

            </div>

            {/* Message Button */}
            <button
              type="button"
              onClick={handleMessage}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0B3954] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#082a3e]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 014 11.5a8.5 8.5 0 018.5-8.5h.5a8.5 8.5 0 018 8v.5z"
                />
              </svg>

              Message
            </button>

          </div>

          <p className="mt-6 text-gray-700">
            {candidate.bio}
          </p>

        </div>

        {/* Preferences */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">

          {/* Budget */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-bold text-gray-900">
              Budget
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {candidate.budgetMin} - {candidate.budgetMax} ETB
            </p>
          </div>

          {/* Cleanliness */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-bold text-gray-900">
              Cleanliness
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {candidate.cleanliness}/5
            </p>
          </div>

          {/* Sleep Schedule */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-bold text-gray-900">
              Sleep Schedule
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {candidate.sleepSchedule}
            </p>
          </div>

          {/* Smoking */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-bold text-gray-900">
              Smoking
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {candidate.smoking}
            </p>
          </div>

          {/* Pets */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-bold text-gray-900">
              Pets
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {candidate.pets}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default CandidateProfilePage;