import { useParams, useNavigate } from "react-router-dom";

const candidates = {
  "1": {
    _id: "1",
    name: "Elias",
    age: 21,
    gender: "Male",
    location: "Bole",
    photoUrl: "",
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
    photoUrl: "",
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
    photoUrl: "",
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
    photoUrl: "",
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
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex flex-col items-center rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mt-4 text-base font-bold text-gray-900">
            Candidate not found
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            We couldn't find the profile you're looking for.
          </p>
          <button
            onClick={() => navigate("/find-matches")}
            className="mt-5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
          >
            Back to matches
          </button>
        </div>
      </div>
    );
  }

  const handleMessage = () => {
    navigate("/app/messages");
  };

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Main Card Frame */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            
            {/* LEFT COLUMN: Square Photo + Big Name + (Age, Sex, Location) Below */}
            <div className="flex flex-col items-center md:col-span-5 md:items-start">
              
              {/* Profile Image Square */}
              <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border border-gray-100 bg-blue-100 shadow-inner">
                {candidate.photoUrl ? (
                  <img
                    src={candidate.photoUrl}
                    alt={candidate.name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-300 via-blue-600 to-indigo-950 text-5xl font-bold text-white">
                    {candidate.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Big Name & Attributes Down to It */}
              <div className="mt-4 w-full max-w-[280px] text-center md:text-left px-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {candidate.name}
                </h1>

                <div className="mt-2.5 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-semibold text-blue-900 border border-blue-100/70">
                    {candidate.age} yrs
                  </span>

                  <span className="rounded-lg bg-gray-50 px-2.5 py-1 font-medium text-gray-600 border border-gray-100">
                    {candidate.gender}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1 font-medium text-gray-600 border border-gray-100">
                    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {candidate.location}
                  </span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: About + Preferences Grid */}
            <div className="flex flex-col justify-between md:col-span-7">
              <div className="space-y-6">
                
                {/* About Section */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-1.5">
                    About
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-gray-700 sm:text-sm">
                    {candidate.bio}
                  </p>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Budget */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Budget
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-gray-900 sm:text-sm">
                      {candidate.budgetMin.toLocaleString()} – {candidate.budgetMax.toLocaleString()} ETB
                    </p>
                  </div>

                  {/* Cleanliness */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Cleanliness
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-gray-900 sm:text-sm">
                      {candidate.cleanliness}/5
                    </p>
                  </div>

                  {/* Sleep Schedule */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Sleep Schedule
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-gray-900 sm:text-sm">
                      {candidate.sleepSchedule}
                    </p>
                  </div>

                  {/* Smoking */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Smoking
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-gray-900 sm:text-sm">
                      {candidate.smoking}
                    </p>
                  </div>

                  {/* Pets */}
                  <div className="col-span-2 rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Pets
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-gray-900 sm:text-sm">
                      {candidate.pets}
                    </p>
                  </div>

                </div>
              </div>

              {/* BOTTOM RIGHT: Message Button */}
              <div className="mt-6 flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleMessage}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-98"
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Message
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default CandidateProfilePage;