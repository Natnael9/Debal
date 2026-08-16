import React, { useState, useEffect } from 'react';
import MatchCard from '../components/matchmaking/MatchCard';

const MatchFeed = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Simulating the GET /api/v1/matches/feed?page=1&limit=20 endpoint
    const fetchMatches = async () => {
      setIsLoading(true);
      
      // MOCK DATA: Remove this once Nardos finishes the matchmaking engine
      setTimeout(() => {
        const mockData = [
          {
            _id: '1', name: 'Elias', age: 21, gender: 'male', bio: 'Looking for a chill roommate. I study computer science and mostly stay in my room coding or playing games.', avatarUrl: '',
            preferences: { budgetMax: 600, cleanliness: 4, sleepSchedule: 'night_owl' }
          },
          {
            _id: '2', name: 'Sara', age: 20, gender: 'female', bio: 'Architecture student! Very tidy and organized. Looking to share a place near the university.', avatarUrl: '',
            preferences: { budgetMax: 800, cleanliness: 5, sleepSchedule: 'early_bird' }
          }
        ];
        
        setMatches(mockData);
        setIsLoading(false);
      }, 1000); // Simulate network delay
    };

    fetchMatches();
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Your Matches</h1>
            <p className="text-gray-600">Based on your lifestyle and budget preferences.</p>
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2274A5]"></div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && matches.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-500">Check back soon as more roommates join Debal!</p>
          </div>
        )}

        {/* MATCH GRID */}
        {!isLoading && matches.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {matches.map((match) => (
              <MatchCard key={match._id} matchData={match} />
            ))}
          </div>
        )}

        {/* PAGINATION (Placeholder) */}
        {!isLoading && matches.length > 0 && (
          <div className="mt-12 flex justify-center">
            <button 
              onClick={() => setPage(prev => prev + 1)}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-6 rounded-full shadow-sm transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchFeed;