import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

function CandidateProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!userId || userId === "undefined") {
      setIsLoading(false);
      setError("Invalid candidate ID.");
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    apiGet(`/users/${userId}`)
      .then((res) => {
        if (cancelled) return;
        const u = res?.data?.user || res?.data;
        if (u) {
          setCandidate({
            _id: u._id || u.id || userId,
            name: u.name || "Anonymous User",
            age: u.age || 22,
            gender: u.gender || "Not specified",
            location: u.location?.displayName || (typeof u.location === "string" ? u.location : "Addis Ababa"),
            avatarUrl: u.avatarUrl || u.photoUrl || "",
            bio: u.bio || "No bio provided.",
            preferences: {
              budgetMax: u.preferences?.budgetMax || 0,
              cleanliness: u.preferences?.cleanliness || 4,
              sleepSchedule: u.preferences?.sleepSchedule || "flexible",
              pets: u.preferences?.petsOk ? "Pets allowed" : "No pets",
              smoking: u.preferences?.smokingOk ? "Smoking allowed" : "No smoking",
            },
          });
        } else {
          setError("Candidate profile not found.");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load candidate profile.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleMessage = async () => {
    const targetId = candidate?._id || userId;
    setIsSending(true);
    try {
      await apiPost(`/matches/request/${targetId}`, {
        message: `Hi ${candidate?.name || 'there'}, I'd like to connect regarding room sharing!`,
      });
    } catch (err) {
      console.warn("Match request notice:", err.message);
    } finally {
      setIsSending(false);
    }
    navigate(`/app/messages?chat=${targetId}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs font-semibold text-gray-500">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex flex-col items-center rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm max-w-sm w-full">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="mt-4 text-base font-bold text-gray-900">
            Candidate not found
          </h1>

          <p className="mt-1 text-xs text-gray-400">
            {error || "We couldn't find the profile you're looking for."}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-800"
          >
            Back to matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Main Card Frame */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* LEFT COLUMN */}
            <div className="flex flex-col items-center md:col-span-5 md:items-start">
              {/* Profile Image */}
              <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border border-gray-100 bg-blue-100 shadow-inner">
                {candidate.avatarUrl ? (
                  <img
                    src={candidate.avatarUrl}
                    alt={candidate.name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-300 via-blue-600 to-indigo-950 text-5xl font-bold text-white">
                    {candidate.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>

              {/* Name & Basic details */}
              <div className="mt-4 w-full max-w-[280px] px-1 text-center md:text-left">
                <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
                  {candidate.name}
                </h1>

                <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 text-xs md:justify-start">
                  <span className="rounded-lg border border-blue-100/70 bg-blue-50 px-2.5 py-1 font-semibold text-blue-900">
                    {candidate.age} yrs
                  </span>

                  <span className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 font-medium capitalize text-gray-600">
                    {candidate.gender}
                  </span>

                  {candidate.location && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 font-medium text-gray-600">
                      <svg
                        className="h-3.5 w-3.5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {candidate.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col justify-between md:col-span-7">
              <div className="space-y-6">
                {/* About */}
                <div>
                  <h3 className="border-b border-gray-100 pb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                    About
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-gray-700 sm:text-sm">
                    {candidate.bio}
                  </p>
                </div>

                {/* Preferences */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Budget
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-gray-900 sm:text-sm">
                      {candidate.preferences?.budgetMax
                        ? `Up to ${candidate.preferences.budgetMax.toLocaleString()} ETB`
                        : "Flexible"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Cleanliness
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-gray-900 sm:text-sm">
                      {candidate.preferences?.cleanliness
                        ? `${candidate.preferences.cleanliness}/5`
                        : "Moderate"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Sleep Schedule
                    </p>
                    <p className="mt-0.5 text-xs font-bold capitalize text-gray-900 sm:text-sm">
                      {candidate.preferences?.sleepSchedule
                        ? candidate.preferences.sleepSchedule.replace("_", " ")
                        : "Flexible"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Pets
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-gray-900 sm:text-sm">
                      {candidate.preferences?.pets || "No pets"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Smoking
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-gray-900 sm:text-sm">
                      {candidate.preferences?.smoking || "No smoking"}
                    </p>
                  </div>
                </div>
              </div>

              {/* MESSAGE BUTTON */}
              <div className="mt-6 flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleMessage}
                  disabled={isSending}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-95 disabled:opacity-60"
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
                  {isSending ? "Connecting..." : "Message"}
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