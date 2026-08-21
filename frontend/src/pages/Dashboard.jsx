import React, { useState, useEffect, useMemo } from "react";
import MatchCard from "../components/matchmaking/MatchCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import CustomDropdown from "../components/common/CustomDropdown";
import { apiGet, apiPost } from "../services/api";
import { TopFilterBar, SideFilterBar } from "./SearchPage";

const MatchFeed = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("score"); // 'score', 'budget_low', 'budget_high', 'age_asc'

  const initialFilters = {
    location: "",
    minBudget: "",
    maxBudget: "",
    minAge: "",
    maxAge: "",
    gender: "any",
    status: "any",
    pet: "any",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

  // Load match feed from backend
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    apiGet(`/matches/feed?page=${page}&pageSize=50`)
      .then((data) => {
        if (cancelled) return;
        const matches = data?.data?.matches ?? [];
        setResults(matches);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load match feed.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setPage(1);
  };

  const handleClearAll = () => {
    setFilters(initialFilters);
  };

  // Bookmark a candidate
  const handleBookmark = async (candidateId) => {
    try {
      await apiPost("/bookmarks", { bookmarkedUserId: candidateId });
    } catch (err) {
      console.warn("Bookmark failed:", err.message);
    }
  };

  // Client-side filtering & sorting for interactive responsiveness
  const filteredAndSortedResults = useMemo(() => {
    return results
      .filter((candidate) => {
        // Status filter
        if (filters.status !== "any" && candidate.housingStatus !== filters.status) {
          return false;
        }
        // Location filter
        if (
          filters.location &&
          !candidate.location?.toLowerCase().includes(filters.location.toLowerCase()) &&
          !candidate.name?.toLowerCase().includes(filters.location.toLowerCase())
        ) {
          return false;
        }
        // Budget min
        if (filters.minBudget && candidate.preferences?.budgetMax) {
          if (candidate.preferences.budgetMax < Number(filters.minBudget)) return false;
        }
        // Budget max
        if (filters.maxBudget && candidate.preferences?.budgetMax) {
          if (candidate.preferences.budgetMax > Number(filters.maxBudget)) return false;
        }
        // Age min
        if (filters.minAge && candidate.age) {
          if (candidate.age < Number(filters.minAge)) return false;
        }
        // Age max
        if (filters.maxAge && candidate.age) {
          if (candidate.age > Number(filters.maxAge)) return false;
        }
        // Gender
        if (filters.gender !== "any" && candidate.gender) {
          if (candidate.gender.toLowerCase() !== filters.gender.toLowerCase()) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "score") {
          return (b.score || 0) - (a.score || 0);
        }
        if (sortBy === "budget_low") {
          return (a.preferences?.budgetMax || 0) - (b.preferences?.budgetMax || 0);
        }
        if (sortBy === "budget_high") {
          return (b.preferences?.budgetMax || 0) - (a.preferences?.budgetMax || 0);
        }
        if (sortBy === "age_asc") {
          return (a.age || 0) - (b.age || 0);
        }
        return 0;
      });
  }, [results, filters, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Control Filter Bar */}
      <TopFilterBar
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleSearch={handleSearch}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Results Header Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-900">
              {filteredAndSortedResults.length}
            </span>
            <p className="text-xs font-bold text-gray-800">
              Matches Found
              {filters.location && <span className="font-normal text-gray-500"> in "{filters.location}"</span>}
            </p>
          </div>

          {/* Polished Custom Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sort:</span>
            <CustomDropdown
              value={sortBy}
              onChange={setSortBy}
              className="w-48"
              options={[
                { value: "score", label: "Best Match (Score)" },
                { value: "budget_low", label: "Budget: Low to High" },
                { value: "budget_high", label: "Budget: High to Low" },
                { value: "age_asc", label: "Age: Youngest First" },
              ]}
            />
          </div>
        </div>

        {/* Flex layout with drawer */}
        <div className="flex items-start gap-6">
          {/* Side Drawer Filter */}
          {isDrawerOpen && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-200">
              <SideFilterBar
                filters={filters}
                handleFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
              />
            </div>
          )}

          {/* Match Feed Cards Grid */}
          <main className="min-w-0 flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <LoadingSpinner size="lg" />
                <p className="mt-3 text-xs font-medium text-gray-500">
                  Calculating compatibility scores & fetching matches...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-100 bg-rose-50/60 p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 font-bold">
                  !
                </div>
                <h3 className="text-sm font-bold text-rose-900">Unable to load candidates</h3>
                <p className="mt-1 text-xs text-rose-600">{error}</p>
                <button
                  onClick={() => setPage(1)}
                  className="mt-4 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700"
                >
                  Retry
                </button>
              </div>
            ) : filteredAndSortedResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedResults.map((match) => (
                  <MatchCard
                    key={match._id || match.id}
                    matchData={match}
                    onBookmark={() => handleBookmark(match._id || match.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-gray-100 bg-white py-20 px-6 text-center shadow-xs">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-900">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="mb-1 text-lg font-bold text-gray-900">
                  No matching candidates found
                </h3>
                <p className="mx-auto max-w-sm text-xs text-gray-500 leading-relaxed">
                  We couldn't find roommates matching your active filters. Try broadening your budget range or clearing search filters.
                </p>
                <button
                  onClick={handleClearAll}
                  className="mt-5 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-800"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MatchFeed;