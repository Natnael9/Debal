import React, { useState } from 'react';

const MatchCard = ({ matchData }) => {
  // State to track if this specific card is bookmarked
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleToggleBookmark = (e) => {
    e.preventDefault(); // Prevents the card's main click event if it's wrapped in a link
    
    if (isBookmarked) {
      console.log(`Removing ${matchData._id} from bookmarks...`);
      // TODO: Wire to DELETE /bookmarks/:userId
      setIsBookmarked(false);
    } else {
      console.log(`Adding ${matchData._id} to bookmarks...`);
      // TODO: Wire to POST /bookmarks with { bookmarkedUserId: matchData._id }
      setIsBookmarked(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative transition-transform hover:-translate-y-1 hover:shadow-md">
      
      {/* BOOKMARK BUTTON - Positioned absolute in the top right corner */}
      <button 
        onClick={handleToggleBookmark}
        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10 text-[#2274A5]"
        title={isBookmarked ? "Remove bookmark" : "Save for later"}
      >
        <svg 
          className="w-5 h-5" 
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

      {/* The rest of your existing MatchCard UI goes here */}
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0">
             {/* Avatar Image would go here */}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{matchData.name} · {matchData.age}</h3>
            <p className="text-sm text-gray-500 capitalize">{matchData.gender}</p>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{matchData.bio}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
            Budget: {matchData.preferences?.budgetMax} ETB
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
            Cleanliness: {matchData.preferences?.cleanliness}/5
          </span>
        </div>

        <button className="w-full py-2 bg-[#0B3954] text-white rounded-lg text-sm font-bold hover:bg-[#082a3e] transition-colors">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default MatchCard;