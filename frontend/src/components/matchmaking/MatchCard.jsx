import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, apiDelete } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const MatchCardComponent = ({ matchData, onBookmark, onConnect }) => {
  const { user } = useAuth();
  const [localIsBookmarked, setLocalIsBookmarked] = useState(matchData.isBookmarked || false);
  const isBookmarked = matchData.isBookmarked !== undefined ? matchData.isBookmarked : localIsBookmarked;

  // Once connected, show Connected on BOTH sides!
  const isConnected = Boolean(matchData.isConnected || matchData.status === "accepted");
  const [localIsRequestSent, setLocalIsRequestSent] = useState(
    Boolean(!isConnected && (matchData.isRequestSent || matchData.hasPendingRequest))
  );
  const isRequestSent = Boolean(
    !isConnected &&
    (matchData.isRequestSent !== undefined ? matchData.isRequestSent : localIsRequestSent)
  );
  const hasReceivedRequest = Boolean(
    !isConnected &&
    !isRequestSent &&
    Boolean(matchData.hasReceivedRequest)
  );

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    if (matchData.isRequestSent !== undefined) {
      setLocalIsRequestSent(Boolean(!isConnected && matchData.isRequestSent));
    }
  }, [matchData.isRequestSent, isConnected]);

  useEffect(() => {
    if (matchData.isBookmarked !== undefined) {
      setLocalIsBookmarked(Boolean(matchData.isBookmarked));
    }
  }, [matchData.isBookmarked]);

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

  const handleConnectClick = () => {
    if (user?.verificationStatus !== 'verified') {
      setShowVerificationPrompt(true);
      return;
    }
    setShowRequestModal(true);
  };

  const handleSendMatchRequest = async (e) => {
    e.preventDefault();
    setRequestError("");
    setIsSending(true);

    try {
      await apiPost(`/matches/request/${candidateId}`, { message: requestMessage });
      setRequestSuccess(true);
      matchData.isConnected = false;
      matchData.isRequestSent = true;
      setLocalIsRequestSent(true);
      if (onConnect) {
        onConnect(candidateId);
      }
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
        setRequestMessage("");
      }, 1500);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("already")) {
        matchData.isConnected = false;
        matchData.isRequestSent = true;
        setLocalIsRequestSent(true);
        if (onConnect) {
          onConnect(candidateId);
        }
        setRequestSuccess(true);
        setTimeout(() => {
          setShowRequestModal(false);
          setRequestSuccess(false);
          setRequestMessage("");
        }, 1500);
      } else {
        setRequestError(err.message || "Failed to send match request.");
      }
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
                <span className="text-xs font-semibold text-black dark:text-white bg-gray-100 dark:bg-[#242f3d] px-2 py-0.5 rounded-md">
                  Has room
                </span>
              ) : matchData.housingStatus === "needs_room" ? (
                <span className="text-xs font-semibold text-black dark:text-white bg-gray-100 dark:bg-[#242f3d] px-2 py-0.5 rounded-md">
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
              <span className="text-xs font-semibold text-black dark:text-white bg-gray-100 dark:bg-[#242f3d] px-2.5 py-1 rounded-md">
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

          {isConnected ? (
            <button
              type="button"
              onClick={() => navigate(`/app/messages?chat=${candidateId}`)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer shadow-xs active:scale-98"
              title="Chat with your connection"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Connected</span>
            </button>
          ) : isRequestSent ? (
            <button
              type="button"
              disabled
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 cursor-not-allowed opacity-95 shadow-2xs select-none"
              title="Connection request sent. Waiting for candidate to chat back."
            >
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Request Sent</span>
            </button>
          ) : hasReceivedRequest ? (
            <button
              type="button"
              onClick={() => navigate(`/app/messages?chat=${candidateId}`)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white bg-[#2274A5] hover:bg-[#1b5e87] transition cursor-pointer shadow-xs active:scale-98"
              title="Candidate sent you a request! Click to chat back"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Request Received</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnectClick}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white bg-[#2274A5] hover:bg-[#1b5e87] transition cursor-pointer shadow-xs active:scale-98"
            >
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>

      {/* Verification Required Modal */}
      {showVerificationPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-gray-900">ID Verification Required</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVerificationPrompt(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="my-5 text-center">
              <p className="text-xs text-gray-600 leading-relaxed">
                To keep our roommate community safe and verified, please verify your National ID (Fayda) before sending connection requests.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowVerificationPrompt(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVerificationPrompt(false);
                  navigate('/app/verification');
                }}
                className="rounded-xl bg-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                Verify ID Now
              </button>
            </div>
          </div>
        </div>
      )}

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