import React from 'react';

// 1. THE TOP HORIZONTAL BAR
export const TopFilterBar = ({ filters, handleFilterChange, handleSearch, isDrawerOpen, setIsDrawerOpen }) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
          
          {/* Sliders Filter Icon Button */}
          <button 
            type="button"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-bold transition-colors border ${
              isDrawerOpen ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
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
              className="w-full bg-white border border-gray-300 text-gray-900 py-2 pl-10 pr-4 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2274A5] transition-colors"
            />
          </div>

          {/* Budget (ETB) Min/Max */}
          <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-1 focus-within:ring-2 focus-within:ring-[#2274A5]">
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
          <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-1 focus-within:ring-2 focus-within:ring-[#2274A5]">
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
            className="bg-[#2274A5] hover:bg-[#1A5C83] text-white py-2 px-6 rounded-full text-sm font-bold shadow-sm transition-colors ml-auto"
          >
            Apply
          </button>
          
        </form>
      </div>
    </div>
  );
};

// 2. THE PUSH SIDE-PANEL
export const SideFilterBar = ({ filters, handleFilterChange }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-64 overflow-hidden">
      
      {/* Header matching the image */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">Filter & Sort</h2>
        <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Clear all
        </button>
      </div>
      
      {/* Gender Accordion/Select */}
      <div className="p-4 border-b border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
        <select 
          name="gender" 
          value={filters.gender} 
          onChange={handleFilterChange} 
          className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2274A5]"
        >
          <option value="any">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* Status Accordion/Select */}
      <div className="p-4 border-b border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
        <select 
          name="status" 
          value={filters.status} 
          onChange={handleFilterChange} 
          className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2274A5]"
        >
          <option value="any">Any</option>
          <option value="needs_room">Looking for a room</option>
          <option value="has_room">Has available room</option>
        </select>
      </div>

    </div>
  );
};