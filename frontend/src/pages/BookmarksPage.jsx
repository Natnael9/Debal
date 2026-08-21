import React, { useState, useEffect } from 'react';
import MatchCard from '../components/matchmaking/MatchCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiGet, apiDelete } from '../services/api';

const BookmarksPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [error, setError] = useState(null);

  // Fetch real bookmarks on page load
  useEffect(() => {
    let isMounted = true;

    async function loadBookmarks() {
      setIsLoading(true);
      setError(null);
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
            };
          });

        if (isMounted) {
          setBookmarks(mapped);
        }
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
        if (isMounted) {
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
  const handleRemoveBookmark = async (candidateId) => {
    // Optimistically remove from state
    setBookmarks((prev) => prev.filter((b) => b._id !== candidateId));

    try {
      await apiDelete(`/bookmarks/${candidateId}`);
    } catch (err) {
      console.error(`Failed to remove bookmark ${candidateId}:`, err);
      // Reload bookmarks to sync with server state if API call failed
      try {
        const res = await apiGet('/bookmarks');
        const list = res?.data?.bookmarks || [];
        const mapped = list
          .filter((item) => item?.user)
          .map((item) => ({
            _id: item.user._id || item.user.id,
            name: item.user.name,
            age: item.user.age,
            gender: item.user.gender,
            bio: item.user.bio,
            avatarUrl: item.user.avatarUrl,
            housingStatus: item.user.housingStatus,
            location: item.user.location?.displayName || item.user.location || 'Addis Ababa',
            preferences: item.user.preferences || {},
            isBookmarked: true,
          }));
        setBookmarks(mapped);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8 border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-extrabold text-[#0B3954]">Saved Profiles</h1>
          <p className="mt-2 text-sm text-gray-500">
            Keep track of potential roommates you want to connect with later.
          </p>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-semibold text-red-700 underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. LOADING STATE */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-500 text-sm font-medium animate-pulse">Loading your bookmarks...</p>
          </div>
        ) : bookmarks.length > 0 ? (
          
          /* BOOKMARKS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookmarks.map((match) => (
              <MatchCard
                key={match._id}
                matchData={match}
                onBookmark={handleRemoveBookmark}
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