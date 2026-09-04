import React, { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, apiDelete } from "../../services/api";

const MatchCardComponent = ({ matchData, onBookmark }) => {
  const [localIsBookmarked, setLocalIsBookmarked] = useState(matchData.isBookmarked || false);
  const isBookmarked = matchData.isBookmarked !== undefined ? matchData.isBookmarked : localIsBookmarked;
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  const navigate = useNavigate();

  const candidateId = matchData._id || matchData.id;
  const avatarImage = matchData.avatarUrl || matchData.photoUrl;
  const matchScore = matchData.score ? Math.min(99, Math.max(65, Math.round(matchData.score))) : 88;

  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isBookmarked;
    setLocalIsBookmarked(nextState);

    if (onBookmark) {
      onBookmark(candidateId, nextState);
    } else {
      try {
        if (nextState) {
          await apiPost("/bookmarks", { bookmarkedUserId: candidateId });
        } else {
          await apiDelete(`/bookmarks/${candidateId}`);
        }
      } catch (err) {
        console.warn("Bookmark toggle failed:", err.message);
      }
    }
  };

  const handleViewProfile = () => {
    if (candidateId) {
      navigate(`/app/candidate-profile/${candidateId}`, {
        state: { candidate: matchData },
      });
    }
  };

  const handleSendMatchRequest = async (e) => {
    e.preventDefault();
    setRequestError("");
    setIsSending(true);

    try {
      await apiPost(`/matches/request/${candidateId}`, { message: requestMessage });
      setRequestSuccess(true);
      setIsRequestSent(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
        setRequestMessage("");
      }, 1800);
    } catch (err) {
      setRequestError(err.message || "Failed to send match request.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-gray-300 hover:shadow-md">
        
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Compatibility score */}
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {matchScore}% match
            </span>

            <div className="flex items-center gap-2">
              {matchData.housingStatus === "has_room" ? (
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                  Has room
                </span>
              ) : matchData.housingStatus === "needs_room" ? (
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                  Seeking room
                </span>
              ) : null}

              {/* Bookmark Button */}
              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                  isBookmarked
                    ? "text-rose-600 bg-rose-50"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleViewProfile}>
            <div className="relative shrink-0">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100 text-base font-semibold text-gray-700">
                {avatarImage && matchData.photoModerationStatus !== 'flagged' && matchData.photoModerationStatus !== 'pending' ? (
                  <img
                    src={avatarImage}
                    alt={matchData.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  matchData.name?.charAt(0) || "U"
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-blue-900">
                  {matchData.name}
                </h3>
                {matchData.age && (
                  <span className="text-xs text-gray-500">, {matchData.age}</span>
                )}
              </div>

              <p className="text-xs text-gray-500 truncate mt-0.5">
                {matchData.location || "Addis Ababa"}
              </p>
            </div>
          </div>

          {/* Bio Preview (Natural text) */}
          {matchData.bio && (
            <p className="mt-3 line-clamp-2 text-xs text-gray-600 leading-relaxed">
              {matchData.bio}
            </p>
          )}

          {/* Preference Details (Only show real values) */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {matchData.preferences?.budgetMax && (
              <span className="text-xs text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                Up to {Number(matchData.preferences.budgetMax).toLocaleString()} ETB/mo
              </span>
            )}

            {matchData.preferences?.cleanliness && (
              <span className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                Cleanliness {matchData.preferences.cleanliness}/5
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleViewProfile}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-98"
          >
            View Profile
          </button>

          <button
            type="button"
            disabled={isRequestSent}
            onClick={() => setShowRequestModal(true)}
            className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold text-white transition active:scale-98 ${
              isRequestSent
                ? "bg-emerald-600 cursor-default"
                : "bg-[#2274A5] hover:bg-[#1b5e87]"
            }`}
          >
            {isRequestSent ? "Request Sent" : "Connect"}
          </button>
        </div>
      </div>

      {/* Send Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-semibold text-gray-900">Connect with {matchData.name}</h3>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            {requestSuccess ? (
              <div className="my-6 rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-xs font-semibold text-emerald-800">Match Request Sent</p>
                <p className="mt-1 text-xs text-emerald-600">You will be notified once {matchData.name} responds.</p>
              </div>
            ) : (
              <form onSubmit={handleSendMatchRequest} className="mt-4 space-y-3">
                {requestError && (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                    {requestError}
                  </p>
                )}

                <div>
                  <label htmlFor="requestMessage" className="mb-1 block text-xs font-medium text-gray-700">
                    Add a message (optional)
                  </label>
                  <textarea
                    id="requestMessage"
                    rows={3}
                    maxLength={300}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder={`Hi ${matchData.name}, I'm looking for a roommate in your area.`}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-900 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="rounded-xl bg-[#2274A5] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1b5e87] disabled:opacity-60"
                  >
                    {isSending ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const MatchCard = memo(MatchCardComponent);
export default MatchCard;