import React, { useState } from 'react';
import MatchCard from '../components/matchmaking/MatchCard';

// 1. UPDATE THIS IMPORT TO POINT TO YOUR SEARCH PAGE FILE
import { TopFilterBar, SideFilterBar } from './SearchPage'; 

const MatchFeed = () => {
  // Toggle for the push-sidebar
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    location: '',
    minBudget: '',
    maxBudget: '',
    minAge: '',
    maxAge: '',
    gender: 'any',
    status: 'any',
  });

  const [results, setResults] = useState([
    {
      _id: '1', name: 'Elias', age: 21, gender: 'male', bio: 'Looking for a chill roommate. I study computer science.', avatarUrl: '',
      preferences: { budgetMax: 6000, cleanliness: 4, sleepSchedule: 'night_owl' }
    },
    {
      _id: '2', name: 'Sara', age: 20, gender: 'female', bio: 'Architecture student! Very tidy and organized.', avatarUrl: '',
      preferences: { budgetMax: 8000, cleanliness: 5, sleepSchedule: 'early_bird' }
    }
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Applying filters:", filters);
    // TODO: Wire this to backend API
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-2">
      
      {/* The Top Horizontal Bar */}
      <TopFilterBar 
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleSearch={handleSearch}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      {/* MAIN CONTENT AREA - Flexbox to handle the push layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-start gap-6">
        
        {/* THE PUSH SIDEBAR */}
        <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${isDrawerOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
           <SideFilterBar filters={filters} handleFilterChange={handleFilterChange} />
        </div>

        {/* THE MATCH FEED GRID */}
        <main className="flex-1 min-w-0 transition-all duration-300">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2274A5]"></div>
            </div>
          ) : results.length > 0 ? (
            
            // This grid class automatically wraps cards to the next line when pushed!
            <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
              {results.map(match => (
                <MatchCard key={match._id} matchData={match} />
              ))}
            </div>

          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more people.</p>
            </div>
          )}
        </main>
      </div>
      
    </div>
  );
};

export default MatchFeed;