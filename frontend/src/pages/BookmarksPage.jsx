import React, { useState } from 'react';
import MatchCard from '../components/matchmaking/MatchCard';

const BookmarksPage = () => {
  const [isLoading, setIsLoading] = useState(false);

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

  const handleRemoveBookmark = (userId) => {
    // Optimistically remove from UI
    setBookmarks(prev => prev.filter(b => b._id !== userId));
    console.log(`Removing user ${userId} from bookmarks...`);
    // TODO: Wire this to DELETE /bookmarks/:userId on the backend
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

        {/* Bookmarks Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2274A5]"></div>
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookmarks.map(match => (
              <div key={match._id} className="relative">
                {/* 
                  We render the MatchCard, but add a wrapper with a Remove button 
                  positioned at the top right, so users can easily delete it from the list.
                */}
                <MatchCard matchData={match} />
                
                <button
                  onClick={() => handleRemoveBookmark(match._id)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 p-2 rounded-full shadow-sm transition-colors z-10"
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
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm mt-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookmarks yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              When you see a profile you like on the Match Feed, click the bookmark icon to save it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;