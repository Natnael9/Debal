import React, { useState, useEffect } from 'react';
import MatchCard from '../components/matchmaking/MatchCard';
import { MatchGridSkeleton } from '../components/common/Skeleton';
import { apiGet, apiDelete, getToken } from '../services/api';
import { connectSocket, getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { updateCachedFeedBookmark } from './Dashboard';

// Module-level in-memory cache for instant navigation transitions
let cachedBookmarks = null;
let lastBookmarksFetchTime = 0;

export function updateCachedBookmark(candidateId, isBookmarked) {
  if (!isBookmarked) {
    if (cachedBookmarks) {
      cachedBookmarks = cachedBookmarks.filter((b) => b._id !== candidateId && b.id !== candidateId);
    }
  } else {
    // Invalidate timestamp so entering BookmarksPage immediately fetches newly added bookmarks
    lastBookmarksFetchTime = 0;
  }
}

const BookmarksPage = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState(cachedBookmarks || []);
  const [isLoading, setIsLoading] = useState(!cachedBookmarks);
  const [error, setError] = useState(null);

  // Real-time match connection updates without refresh
  useEffect(() => {
    const token = getToken();
    const socket = getSocket() || (token ? connectSocket(token) : null);
    if (!socket) return;

    const handleMatchAccepted = (data) => {
      const targetUserId = String(data?.userId || data?.partnerId || data?.fromUser || "");
      if (targetUserId) {
        setBookmarks((prev) =>
          prev.map((c) => {
            const cId = String(c._id || c.id || "");
            return cId === targetUserId
              ? { ...c, isConnected: true, isRequestSent: false }
              : c;
          })
        );
        if (cachedBookmarks) {
          cachedBookmarks = cachedBookmarks.map((c) => {
            const cId = String(c._id || c.id || "");
            return cId === targetUserId
              ? { ...c, isConnected: true, isRequestSent: false }
              : c;
          });
        }
      }
    };

    const handleChatMessage = (payload) => {
      const sender = String(
        payload?.message?.senderId?._id ||
        payload?.message?.senderId?.id ||
        payload?.message?.senderId ||
        payload?.message?.sender ||
        ""
      );
      const myId = String(user?._id || user?.id || "");
      if (sender && sender !== myId) {
        setBookmarks((prev) =>
          prev.map((c) => {
            const cId = String(c._id || c.id || "");
            return cId === sender
              ? { ...c, isConnected: true, isRequestSent: false }
              : c;
          })
        );
        if (cachedBookmarks) {
          cachedBookmarks = cachedBookmarks.map((c) => {
            const cId = String(c._id || c.id || "");
            return cId === sender
              ? { ...c, isConnected: true, isRequestSent: false }
              : c;
          });
        }
      }
    };

    socket.on("match:accepted", handleMatchAccepted);
    socket.on("chat:new_message", handleChatMessage);
    return () => {
      socket.off("match:accepted", handleMatchAccepted);
      socket.off("chat:new_message", handleChatMessage);
    };
  }, [user]);

  // Fetch real bookmarks on page load with SWR pattern
  useEffect(() => {
    let isMounted = true;

    if (!cachedBookmarks) {
      setIsLoading(true);
    } else {
      setBookmarks(cachedBookmarks);
      setIsLoading(false);
    }
    setError(null);

    async function loadBookmarks() {
      try {
        const res = await apiGet('/bookmarks');
        const list = res?.data?.bookmarks || [];

        // Map backend response into format expected by MatchCard
        const mapped = list
          .filter((item) => item?.user)
          .map((item) => {
            const u = item.user;
            return {
              _id: u._id || u.id,
              name: u.name,
              age: u.age,
              gender: u.gender,
              bio: u.bio,
              avatarUrl: u.avatarUrl,
              housingStatus: u.housingStatus,
              location: u.location?.displayName || (typeof u.location === 'string' ? u.location : 'Addis Ababa'),
              preferences: u.preferences || {},
              isBookmarked: true,
              isRequestSent: Boolean(u.isRequestSent),
            };
          });

        if (isMounted) {
          cachedBookmarks = mapped;
          lastBookmarksFetchTime = Date.now();
          setBookmarks(mapped);
        }
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
        if (isMounted && !cachedBookmarks) {
          setError(err.message || 'Failed to load saved profiles.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBookmarks();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle un-favoriting (removing bookmark) when clicking the favorite heart button
  const handleRemoveBookmark = React.useCallback(async (candidateId) => {
    // Optimistically remove from state and cache
    if (cachedBookmarks) {
      cachedBookmarks = cachedBookmarks.filter((b) => b._id !== candidateId && b.id !== candidateId);
    }
    setBookmarks((prev) => prev.filter((b) => b._id !== candidateId && b.id !== candidateId));
    updateCachedFeedBookmark(candidateId, false);

    try {
      await apiDelete(`/bookmarks/${candidateId}`);
    } catch (err) {
      console.error(`Failed to remove bookmark ${candidateId}:`, err);
    }
  }, []);

  const handleConnect = React.useCallback((candidateId) => {
    setBookmarks((prev) =>
      prev.map((c) =>
        (c._id === candidateId || c.id === candidateId) ? { ...c, isConnected: true, isRequestSent: false } : c
      )
    );
    if (cachedBookmarks) {
      cachedBookmarks = cachedBookmarks.map((c) =>
        (c._id === candidateId || c.id === candidateId) ? { ...c, isConnected: true, isRequestSent: false } : c
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10">
        
        {/* Page Header */}
        <div className="mb-8 border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-extrabold text-[#0B3954] dark:!text-white">Saved Profiles</h1>
          <p className="mt-2 text-sm text-gray-500">
            Keep track of potential roommates you want to connect with later.
          </p>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-xs font-semibold text-red-700 underline hover:text-red-800 cursor-pointer active:scale-95"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. LOADING STATE */}
        {isLoading ? (
          <MatchGridSkeleton count={8} />
        ) : bookmarks.length > 0 ? (
          
          /* BOOKMARKS GRID */
          <div className="card-grid-fluid">
            {bookmarks.map((match) => (
              <MatchCard
                key={match._id}
                matchData={match}
                onBookmark={handleRemoveBookmark}
                onConnect={handleConnect}
              />
            ))}
          </div>
        ) : (
          
          /* 2. EMPTY STATE */
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm mt-4">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 mb-5">
              <svg className="h-10 w-10 text-[#2274A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No profiles saved yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              When you see someone who looks like a great match in your feed, click the heart icon to save them here for later.
            </p>
            <button 
              onClick={() => window.history.back()} 
              className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2274A5] transition-colors"
            >
              Go back to Match Feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;