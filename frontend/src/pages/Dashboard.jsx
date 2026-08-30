import React, { useState, useEffect, useMemo, useCallback } from "react";
import MatchCard from "../components/matchmaking/MatchCard";
import { MatchGridSkeleton } from "../components/common/Skeleton";
import CustomDropdown from "../components/common/CustomDropdown";
import { apiGet, apiPost, apiDelete } from "../services/api";
import { TopFilterBar, SideFilterBar } from "./SearchPage";
import { updateCachedBookmark } from "./BookmarksPage";

// In-memory module cache for instant navigation transitions
let cachedFeed = null;
let lastFeedFetchTime = 0;

const MatchFeed = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!cachedFeed);
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
  const [results, setResults] = useState(cachedFeed || []);
  const [page, setPage] = useState(1);

  // Load match feed from backend with SWR caching
  useEffect(() => {
    let cancelled = false;
    const now = Date.now();
    const isStale = now - lastFeedFetchTime > 30000; // 30s cache freshness

    if (!cachedFeed) {
      setIsLoading(true);
    }
    setError(null);

    // If cache is fresh and on page 1, avoid redundant network request
    if (cachedFeed && !isStale && page === 1) {
      setIsLoading(false);
      return;
    }

    apiGet(`/matches/feed?page=${page}&pageSize=24`)
      .then((data) => {
        if (cancelled) return;
        const matches = data?.data?.matches ?? [];
        if (page === 1) {
          cachedFeed = matches;
          lastFeedFetchTime = Date.now();
        }
        setResults(matches);
      })
      .catch((err) => {
        if (cancelled) return;
        if (!cachedFeed) {
          setError(err.message || "Failed to load match feed.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSearch = useCallback((e) => {
    if (e) e.preventDefault();
    setPage(1);
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Bookmark a candidate with optimistic cache and state update
  const handleBookmark = useCallback(async (candidateId, nextState) => {
    // 1. Optimistically update local results
    setResults((prev) =>
      prev.map((c) =>
        (c._id === candidateId || c.id === candidateId) ? { ...c, isBookmarked: nextState } : c
      )
    );

    // 2. Update cachedFeed module cache
    if (cachedFeed) {
      cachedFeed = cachedFeed.map((c) =>
        (c._id === candidateId || c.id === candidateId) ? { ...c, isBookmarked: nextState } : c
      );
    }

    // 3. Update Bookmarks page cache
    updateCachedBookmark(candidateId, nextState);

    // 4. Background network request
    try {
      if (nextState) {
        await apiPost("/bookmarks", { bookmarkedUserId: candidateId });
      } else {
        await apiDelete(`/bookmarks/${candidateId}`);
      }
    } catch (err) {
      console.warn("Bookmark toggle failed:", err.message);
    }
  }, []);

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
        // Candidate budget fields (handles both top-level & preferences)
        const cMax = candidate.budgetMax ?? candidate.preferences?.budgetMax;
        const cMin = candidate.budgetMin ?? candidate.preferences?.budgetMin;

        // Budget min filter
        if (filters.minBudget && cMax !== undefined) {
          if (cMax < Number(filters.minBudget)) return false;
        }
        // Budget max filter
        if (filters.maxBudget && cMin !== undefined) {
          if (cMin > Number(filters.maxBudget)) return false;
        }
        // Age min
        if (filters.minAge && candidate.age) {
          if (candidate.age < Number(filters.minAge)) return false;
        }
        // Age max
        if (filters.maxAge && candidate.age) {
          if (candidate.age > Number(filters.maxAge)) return false;
        }
        // Gender filter
        if (filters.gender !== "any" && candidate.gender) {
          if (candidate.gender.toLowerCase() !== filters.gender.toLowerCase()) return false;
        }
        
        // Pet filter (BULLETPROOF VERSION)
        if (filters.pet && filters.pet !== "any") {
          // 1. Check what the user selected (handles "true", true, "yes", "1")
          const wantsPets = ["true", true, "yes", "1"].includes(filters.pet);

          // 2. Safely check what the candidate's profile says (defaults to false if missing)
          const candidateAllowsPets = candidate.preferences?.petsOk === true || candidate.preferences?.petsOk === "true";

          // 3. If the candidate's preference doesn't match what the user wants, hide them
          if (candidateAllowsPets !== wantsPets) {
            return false;
          }
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
              <MatchGridSkeleton count={6} />
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
                    onBookmark={handleBookmark}
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