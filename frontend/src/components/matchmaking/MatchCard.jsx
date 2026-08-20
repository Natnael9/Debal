import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MatchCard = ({ matchData }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const navigate = useNavigate();

  const handleToggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
  };

  const handleViewProfile = () => {
    navigate(`/app/candidate-profile/${matchData._id}`);
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-md">
      
      {/* Top Section: Avatar + Header + Bookmark */}
      <div>
        <div className="flex items-start justify-between gap-3">
          
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar with initial or photo */}
            <div className="relative shrink-0">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-blue-100/70 bg-blue-100 text-lg font-bold text-blue-900 shadow-2xs">
                {matchData.photoUrl ? (
                  <img
                    src={matchData.photoUrl}
                    alt={matchData.name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  matchData.name?.charAt(0) || "U"
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-2xs" />
            </div>

            {/* Name, Age & Location */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-gray-900 leading-snug">
                {matchData.name}, {matchData.age}
              </h3>

              <p className="mt-0.5 truncate text-xs text-gray-500">
                <span className="capitalize">{matchData.gender}</span>
                {matchData.location && (
                  <>
                    <span className="mx-1.5 text-gray-300">•</span>
                    <span>{matchData.location}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-95 ${
              isBookmarked
                ? "border-blue-200 bg-blue-50 text-blue-900"
                : "border-gray-100 bg-gray-50/60 text-gray-400 hover:border-gray-200 hover:bg-white hover:text-gray-600"
            }`}
            title={isBookmarked ? "Remove bookmark" : "Save for later"}
          >
            <svg
              className="h-4 w-4"
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>

        {/* Bio snippet */}
        <p className="mt-3.5 line-clamp-2 text-xs leading-relaxed text-gray-600">
          {matchData.bio || "Looking for a compatible and friendly roommate to share an apartment."}
        </p>

        {/* Key Preference Badges */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {matchData.preferences?.budgetMax && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-blue-100/60 bg-blue-50/50 px-2.5 py-1 text-[11px] font-semibold text-blue-950">
              <svg className="h-3 w-3 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Max {matchData.preferences.budgetMax.toLocaleString()} ETB
            </span>
          )}

          {matchData.preferences?.cleanliness && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50/80 px-2.5 py-1 text-[11px] font-medium text-gray-700">
              <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Clean: {matchData.preferences.cleanliness}/5
            </span>
          )}
        </div>
      </div>

      {/* Action CTA */}
      <button
        type="button"
        onClick={handleViewProfile}
        className="mt-4.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-900 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-800 active:scale-98"
      >
        <span>View Profile</span>
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default MatchCard;