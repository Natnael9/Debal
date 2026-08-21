import React, { useState, useEffect } from "react";
import MatchCard from "../components/matchmaking/MatchCard";
import { apiGet, apiPost } from "../services/api";

// Search page components
import { TopFilterBar, SideFilterBar } from "./SearchPage";

const MatchFeed = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    location: "",
    minBudget: "",
    maxBudget: "",
    minAge: "",
    maxAge: "",
    gender: "any",
    status: "any",
  });

  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load match feed from backend
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    apiGet(`/matches/feed?page=${page}&pageSize=20`)
      .then((data) => {
        if (cancelled) return;
        const matches = data?.data?.matches ?? [];
        setResults(matches);
        setHasMore(matches.length === 20);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load match feed.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // reset to first page on new search
  };

  // Bookmark a candidate
  const handleBookmark = async (candidateId) => {
    try {
      await apiPost("/bookmarks", { bookmarkedUserId: candidateId });
    } catch (err) {
      console.warn("Bookmark failed:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-2">

      {/* Top Filter Bar */}
      <TopFilterBar
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleSearch={handleSearch}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      {/* Main Content */}
      <div className="mx-auto flex max-w-7xl items-start gap-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* Side Filter Bar */}
        <div
          className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
            isDrawerOpen
              ? "w-64 opacity-100"
              : "w-0 overflow-hidden opacity-0"
          }`}
        >
          <SideFilterBar
            filters={filters}
            handleFilterChange={handleFilterChange}
          />
        </div>

        {/* Match Feed */}
        <main className="min-w-0 flex-1 transition-all duration-300">

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#2274A5]" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 py-12 text-center">
              <p className="text-sm font-medium text-red-600">{error}</p>
              <button
                onClick={() => setPage(1)}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : results.length > 0 ? (

            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
              {results.map((match) => (
                <MatchCard
                  key={match._id}
                  matchData={match}
                  onBookmark={() => handleBookmark(match._id)}
                />
              ))}
            </div>

          ) : (

            <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                No matches found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or complete your profile to see more people.
              </p>
            </div>

          )}

        </main>
      </div>
    </div>
  );
};

export default MatchFeed;