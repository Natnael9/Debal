import React from 'react';

// 1. THE TOP HORIZONTAL BAR
export const TopFilterBar = ({ filters, handleFilterChange, handleSearch, isDrawerOpen, setIsDrawerOpen }) => {
  return (
    <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 shadow-xs backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          
          {/* Sliders Filter Toggle Button */}
          <button 
            type="button"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold transition active:scale-98 ${
              isDrawerOpen 
                ? 'border-blue-200 bg-blue-50 text-blue-900 shadow-2xs' 
                : 'border-gray-200 bg-gray-50/60 text-gray-700 hover:border-gray-300 hover:bg-white'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Filters</span>
          </button>

          {/* Location Search Input */}
          <div className="relative min-w-[180px] flex-grow sm:max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              name="location"
              placeholder="Search neighborhood..." 
              value={filters.location} 
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 py-2 pl-9 pr-3.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
            />
          </div>

          {/* Budget Range (ETB) */}
          <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50/60 px-3.5 py-1.5 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-2">ETB</span>
            <input 
              type="number" 
              name="minBudget"
              placeholder="Min"
              value={filters.minBudget} 
              onChange={handleFilterChange}
              className="w-14 bg-transparent text-center text-xs font-semibold text-gray-800 placeholder-gray-400 outline-none"
            />
            <span className="mx-1 text-gray-300">–</span>
            <input 
              type="number" 
              name="maxBudget"
              placeholder="Max"
              value={filters.maxBudget} 
              onChange={handleFilterChange}
              className="w-14 bg-transparent text-center text-xs font-semibold text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>

          {/* Age Range */}
          <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50/60 px-3.5 py-1.5 transition focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-2">Age</span>
            <input 
              type="number" 
              name="minAge"
              placeholder="Min"
              value={filters.minAge} 
              onChange={handleFilterChange}
              className="w-10 bg-transparent text-center text-xs font-semibold text-gray-800 placeholder-gray-400 outline-none"
            />
            <span className="mx-1 text-gray-300">–</span>
            <input 
              type="number" 
              name="maxAge"
              placeholder="Max"
              value={filters.maxAge} 
              onChange={handleFilterChange}
              className="w-10 bg-transparent text-center text-xs font-semibold text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>

          {/* Submit Action */}
          <button 
            type="submit"
            className="ml-auto rounded-2xl bg-blue-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-800 active:scale-98"
          >
            Apply Filters
          </button>
          
        </form>
      </div>
    </div>
  );
};

// 2. THE PUSH SIDE-PANEL
export const SideFilterBar = ({ filters, handleFilterChange, onClearAll }) => {
  return (
    <div className="w-64 shrink-0 overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
            Filter & Sort
          </h2>
        </div>

        <button 
          type="button"
          onClick={onClearAll}
          className="text-[11px] font-semibold text-gray-400 transition hover:text-blue-900"
        >
          Clear all
        </button>
      </div>
      
      <div className="mt-4 space-y-4">
        
        {/* Gender Filter */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-gray-700">
            Gender
          </label>
          <div className="relative">
            <select 
              name="gender" 
              value={filters.gender} 
              onChange={handleFilterChange} 
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-xs font-medium text-gray-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
            >
              <option value="any">Any Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pet Preference */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-gray-700">
            Pets Policy
          </label>
          <div className="relative">
            <select 
              name="pet" 
              value={filters.pet} 
              onChange={handleFilterChange} 
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-xs font-medium text-gray-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
            >
              <option value="any">Any</option>
              <option value="yes">Comfortable with pets</option>
              <option value="no">Prefer no pets</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Cooking Habit */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-gray-700">
            Can Cook
          </label>
          <div className="relative">
            <select 
              name="cook" 
              value={filters.cook} 
              onChange={handleFilterChange} 
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-xs font-medium text-gray-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
            >
              <option value="any">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Housing Status */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-gray-700">
            Housing Status
          </label>
          <div className="relative">
            <select 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange} 
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-xs font-medium text-gray-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
            >
              <option value="any">Any Status</option>
              <option value="needs_room">Looking for a room</option>
              <option value="has_room">Has available room</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};