import React from 'react';

const SearchPage = ({ filters, handleFilterChange, handleSearch, isDrawerOpen, setIsDrawerOpen }) => {
  const pillStyle = "appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2274A5] transition-colors";

  return (
    <>
      {/* HORIZONTAL FILTER BAR */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
            
            {/* Filters Drawer Toggle Button */}
            <button 
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-full text-sm font-bold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>

            {/* Location Search */}
            <div className="relative flex-grow md:max-w-xs min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">📍</span>
              </div>
              <input 
                type="text" 
                name="location"
                placeholder="Location..." 
                value={filters.location} 
                onChange={handleFilterChange}
                className="w-full bg-white border border-gray-300 text-gray-900 py-2.5 pl-10 pr-4 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2274A5] transition-colors"
              />
            </div>

            {/* Budget (ETB) Min/Max */}
            <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-[#2274A5]">
              <span className="text-gray-500 text-sm font-medium mr-2">ETB</span>
              <input 
                type="number" 
                name="minBudget"
                placeholder="Min"
                value={filters.minBudget} 
                onChange={handleFilterChange}
                className="w-16 py-1 bg-transparent text-sm font-medium text-gray-700 focus:outline-none text-center"
              />
              <span className="text-gray-300 mx-2">-</span>
              <input 
                type="number" 
                name="maxBudget"
                placeholder="Max"
                value={filters.maxBudget} 
                onChange={handleFilterChange}
                className="w-16 py-1 bg-transparent text-sm font-medium text-gray-700 focus:outline-none text-center"
              />
            </div>

            {/* Age Min/Max */}
            <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-[#2274A5]">
              <span className="text-gray-500 text-sm font-medium mr-2">Age</span>
              <input 
                type="number" 
                name="minAge"
                placeholder="Min"
                value={filters.minAge} 
                onChange={handleFilterChange}
                className="w-12 py-1 bg-transparent text-sm font-medium text-gray-700 focus:outline-none text-center"
              />
              <span className="text-gray-300 mx-2">-</span>
              <input 
                type="number" 
                name="maxAge"
                placeholder="Max"
                value={filters.maxAge} 
                onChange={handleFilterChange}
                className="w-12 py-1 bg-transparent text-sm font-medium text-gray-700 focus:outline-none text-center"
              />
            </div>

            {/* Search Submit Button */}
            <button 
              type="submit"
              className="bg-[#2274A5] hover:bg-[#1A5C83] text-white py-2.5 px-6 rounded-full text-sm font-bold shadow-sm transition-colors ml-auto"
            >
              Apply
            </button>
            
          </form>
        </div>
      </div>

      {/* LEFT DRAWER (Filters) */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-[#0B3954]">More Filters</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          {/* Gender Select */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
            <select name="gender" value={filters.gender} onChange={handleFilterChange} className={`w-full ${pillStyle}`}>
              <option value="any">Any Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Housing Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className={`w-full ${pillStyle}`}>
              <option value="any">Any Status</option>
              <option value="needs_room">Looking for a room</option>
              <option value="has_room">Has available room</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="w-full bg-[#2274A5] text-white font-bold py-3 rounded-lg hover:bg-[#1A5C83] transition-colors"
          >
            Show Results
          </button>
        </div>
      </div>
    </>
  );
};

export default SearchPage;