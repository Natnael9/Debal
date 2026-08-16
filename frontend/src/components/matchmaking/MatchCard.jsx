import React from 'react';

const MatchCard = ({ matchData }) => {
  // Destructure the data based on the schema in your architecture doc
  const { name, age, gender, bio, avatarUrl, preferences } = matchData;
  const { budgetMax, cleanliness, sleepSchedule } = preferences;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      {/* Avatar Placeholder / Image */}
      <div className="h-48 bg-gray-200 relative">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-[#2274A5] text-white text-4xl font-bold">
            {name.charAt(0)}
          </div>
        )}
        {/* Mock Match Score Badge */}
        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          95% Match
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-gray-900">{name}, {age}</h3>
          <span className="text-sm font-semibold text-[#2274A5]">Up to ${budgetMax}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{bio}</p>

        {/* Badges for Lifestyle Preferences */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md border border-blue-100">
            {sleepSchedule === 'early_bird' ? '🌅 Early Bird' : '🌙 Night Owl'}
          </span>
          <span className="bg-gray-50 text-gray-700 text-xs px-2 py-1 rounded-md border border-gray-200">
            Cleanliness: {cleanliness}/5
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition-colors text-sm">
            Skip
          </button>
          <button className="flex-1 bg-[#2274A5] hover:bg-[#1A5C83] text-white font-semibold py-2 rounded-lg shadow-sm transition-colors text-sm">
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;