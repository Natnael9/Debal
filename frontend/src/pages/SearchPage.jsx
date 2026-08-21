import React from 'react';
import CustomDropdown from '../components/common/CustomDropdown';

// 1. CLEAN MINIMAL TOP FILTER BAR
export const TopFilterBar = ({ filters, handleFilterChange, handleSearch, isDrawerOpen, setIsDrawerOpen }) => {
  return (
    <div className="border-b border-gray-100 bg-white shadow-2xs">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Find Roommates & Rooms
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Connect with verified roommates matched to your lifestyle, location, and budget.
          </p>
        </div>

        {/* Clean Search Form */}
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          
          {/* Toggle More Filters Button */}
          <button 
            type="button"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition active:scale-95 ${
              isDrawerOpen 
                ? 'border-blue-200 bg-blue-50 text-blue-900 shadow-2xs' 
                : 'border-gray-200 bg-gray-50/70 text-gray-700 hover:border-gray-300 hover:bg-white'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>{isDrawerOpen ? 'Hide Filters' : 'More Filters'}</span>
          </button>

          {/* Location Input */}
          <div className="relative min-w-[220px] flex-grow sm:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              name="location"
              placeholder="Search neighborhood or area (e.g. Bole, Kazanchis)..." 
              value={filters.location} 
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 py-2 pl-9 pr-3.5 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/10"
            />
          </div>

          {/* Submit Search Button */}
          <button 
            type="submit"
            className="rounded-xl bg-blue-900 px-6 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-800 active:scale-95 flex items-center gap-1.5"
          >
            <span>Search</span>
          </button>
          
        </form>

      </div>
    </div>
  );
};

// 2. THE SIDE PANEL FOR ALL ADVANCED FILTERS (RELATIVE CONTAINER WITHOUT CLIPPING)
export const SideFilterBar = ({ filters, handleFilterChange, onClearAll }) => {
  return (
    <div className="w-64 shrink-0 rounded-3xl border border-gray-100 bg-white p-5 shadow-xs relative">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
          Filters
        </h2>

        <button 
          type="button"
          onClick={onClearAll}
          className="text-[11px] font-bold text-gray-400 transition hover:text-blue-900"
        >
          Reset all
        </button>
      </div>
      
      <div className="mt-4 space-y-4">
        
        {/* Housing Status Dropdown */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-gray-700">
            Housing Status
          </label>
          <CustomDropdown
            value={filters.status}
            onChange={(val) => handleFilterChange({ target: { name: "status", value: val } })}
            options={[
              { value: "any", label: "All Candidates" },
              { value: "has_room", label: "Has Available Room" },
              { value: "needs_room", label: "Seeking Room" },
            ]}
          />
        </div>

        {/* Budget Range (ETB) */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-gray-700">
            Monthly Budget (ETB)
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              name="minBudget"
              placeholder="Min"
              value={filters.minBudget} 
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-1.5 text-xs text-center font-semibold text-gray-800 outline-none focus:border-blue-900 focus:bg-white"
            />
            <span className="text-gray-300">–</span>
            <input 
              type="number" 
              name="maxBudget"
              placeholder="Max"
              value={filters.maxBudget} 
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-1.5 text-xs text-center font-semibold text-gray-800 outline-none focus:border-blue-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Gender Filter Dropdown */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-gray-700">
            Gender Preference
          </label>
          <CustomDropdown
            value={filters.gender}
            onChange={(val) => handleFilterChange({ target: { name: "gender", value: val } })}
            options={[
              { value: "any", label: "Any Gender" },
              { value: "male", label: "Male only" },
              { value: "female", label: "Female only" },
            ]}
          />
        </div>

        {/* Age Range */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-gray-700">
            Age Range
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              name="minAge"
              placeholder="Min (18)"
              value={filters.minAge} 
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-1.5 text-xs text-center font-semibold text-gray-800 outline-none focus:border-blue-900 focus:bg-white"
            />
            <span className="text-gray-300">–</span>
            <input 
              type="number" 
              name="maxAge"
              placeholder="Max (60)"
              value={filters.maxAge} 
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-1.5 text-xs text-center font-semibold text-gray-800 outline-none focus:border-blue-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Pet Preference Dropdown */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold text-gray-700">
            Pets Policy
          </label>
          <CustomDropdown
            value={filters.pet || "any"}
            onChange={(val) => handleFilterChange({ target: { name: "pet", value: val } })}
            options={[
              { value: "any", label: "Any policy" },
              { value: "yes", label: "Comfortable with pets" },
              { value: "no", label: "No pets preferred" },
            ]}
          />
        </div>

      </div>

    </div>
  );
};