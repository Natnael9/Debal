import React, { useState } from "react";
import MatchCard from "../components/matchmaking/MatchCard";

// Search page components
import { TopFilterBar, SideFilterBar } from "./SearchPage";

const MatchFeed = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    location: "",
    minBudget: "",
    maxBudget: "",
    minAge: "",
    maxAge: "",
    gender: "any",
    status: "any",
  });

  // Temporary mock candidates
  // Each candidate has a unique _id so we can open
  // a different profile page for each person.
  const [results, setResults] = useState([
    {
      _id: "1",
      name: "Elias",
      age: 21,
      gender: "male",
      bio: "Looking for a chill roommate. I study computer science.",
      avatarUrl: "",
      preferences: {
        budgetMax: 6000,
        cleanliness: 4,
        sleepSchedule: "night_owl",
      },
    },

    {
      _id: "2",
      name: "Sara",
      age: 20,
      gender: "female",
      bio: "Architecture student! Very tidy and organized.",
      avatarUrl: "",
      preferences: {
        budgetMax: 8000,
        cleanliness: 5,
        sleepSchedule: "early_bird",
      },
    },

    {
      _id: "3",
      name: "Daniel",
      age: 23,
      gender: "male",
      bio: "Easygoing person who enjoys cooking and watching movies.",
      avatarUrl: "",
      preferences: {
        budgetMax: 7000,
        cleanliness: 4,
        sleepSchedule: "flexible",
      },
    },

    {
      _id: "4",
      name: "Hana",
      age: 22,
      gender: "female",
      bio: "Medical student looking for a quiet and clean roommate.",
      avatarUrl: "",
      preferences: {
        budgetMax: 9000,
        cleanliness: 5,
        sleepSchedule: "early_bird",
      },
    },
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();

    setIsLoading(true);

    console.log("Applying filters:", filters);

    // TODO:
    // Replace this with the backend search API later.

    setTimeout(() => {
      setIsLoading(false);
    }, 800);
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
          ) : results.length > 0 ? (

            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">

              {results.map((match) => (
                <MatchCard
                  key={match._id}
                  matchData={match}
                />
              ))}

            </div>

          ) : (

            <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                No matches found
              </h3>

              <p className="text-gray-500">
                Try adjusting your filters to see more people.
              </p>
            </div>

          )}

        </main>
      </div>
    </div>
  );
};

export default MatchFeed;