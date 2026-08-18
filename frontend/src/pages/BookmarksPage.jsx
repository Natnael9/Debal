import React, { useState, useEffect } from 'react';
import MatchCard from '../components/matchmaking/MatchCard';

const BookmarksPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the remove confirmation modal
  const [bookmarkToRemove, setBookmarkToRemove] = useState(null);

  // MOCK DATA: Seeded with some bookmarked profiles
  const [bookmarks, setBookmarks] = useState([
    {
      _id: '3', name: 'Abebe', age: 23, gender: 'male', bio: 'Engineering student. Looking for a quiet place to study and live.', avatarUrl: '',
      preferences: { budgetMax: 5000, cleanliness: 4, sleepSchedule: 'early_bird' }
    },
    {
      _id: '4', name: 'Hanna', age: 22, gender: 'female', bio: 'Medical student, mostly at the hospital. Need a reliable roommate.', avatarUrl: '',
      preferences: { budgetMax: 7500, cleanliness: 5, sleepSchedule: 'flexible' }
    }
  ]);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const initiateRemove = (userId) => {
    setBookmarkToRemove(userId);
  };

  const cancelRemove = () => {
    setBookmarkToRemove(null);
  };

  const confirmRemove = () => {
    if (!bookmarkToRemove) return;
    
    // Optimistically remove from UI
    setBookmarks(prev => prev.filter(b => b._id !== bookmarkToRemove));
    console.log(`Executing DELETE /bookmarks/${bookmarkToRemove}...`);
    // TODO: Wire this to DELETE /bookmarks/:userId on the backend
    
    setBookmarkToRemove(null);
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

        {/* 1. LOADING STATE */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2274A5] mb-4"></div>
            <p className="text-gray-500 text-sm font-medium animate-pulse">Loading your bookmarks...</p>
          </div>
        ) : bookmarks.length > 0 ? (
          
          /* BOOKMARKS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookmarks.map(match => (
              <div key={match._id} className="relative group">
                <MatchCard matchData={match} />
                
                {/* Remove Button - Now triggers the modal instead of deleting instantly */}
                <button
                  onClick={() => initiateRemove(match._id)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 p-2 rounded-full shadow-sm transition-all duration-200 z-10 border border-transparent hover:border-red-100"
                  title="Remove from bookmarks"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
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
              When you see someone who looks like a great match in your feed, click the bookmark icon to save them here for later.
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

      {/* 3. REMOVE CONFIRMATION MODAL */}
      {bookmarkToRemove && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Remove Bookmark?</h3>
              <p className="text-sm text-gray-500 text-center">
                Are you sure you want to remove this profile from your saved list? You will have to find them in the match feed to save them again.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={cancelRemove}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2274A5]"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookmarksPage;