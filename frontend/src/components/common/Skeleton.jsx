import React from "react";

export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/80 ${className}`}
      {...props}
    />
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
      <div>
        {/* Top Header badges & heart */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-20 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        </div>

        {/* Bio Preview */}
        <div className="mt-3 space-y-1.5">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-4/5 rounded-md" />
        </div>

        {/* Preference Details */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Skeleton className="h-6 w-28 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
        <Skeleton className="h-8 flex-1 rounded-xl" />
        <Skeleton className="h-8 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function MatchGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChatLayoutSkeleton() {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-slate-50/80 p-3 sm:p-6 lg:p-8">
      <div className="mx-auto flex h-[calc(100vh-6.5rem)] max-w-[1400px] gap-4 overflow-hidden">
        {/* Chat List Sidebar Skeleton */}
        <div className="hidden h-full w-[280px] shrink-0 flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:flex">
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-20 rounded-md" />
                <Skeleton className="h-2.5 w-28 rounded-md" />
              </div>
            </div>
          </div>
          <Skeleton className="mb-3 h-8 w-full rounded-xl" />
          <div className="flex-1 space-y-2.5 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl p-2.5">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-24 rounded-md" />
                    <Skeleton className="h-2.5 w-10 rounded-md" />
                  </div>
                  <Skeleton className="h-2.5 w-36 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window Skeleton */}
        <div className="flex h-full min-w-0 flex-1 flex-col rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {/* Window Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
          </div>

          {/* Message Bubbles */}
          <div className="flex-1 space-y-4 p-5 overflow-hidden">
            <div className="flex justify-start">
              <Skeleton className="h-12 w-64 rounded-2xl rounded-tl-sm" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-48 rounded-2xl rounded-tr-sm bg-blue-100/70" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-16 w-72 rounded-2xl rounded-tl-sm" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-12 w-56 rounded-2xl rounded-tr-sm bg-blue-100/70" />
            </div>
          </div>

          {/* Input Bar */}
          <div className="border-t border-gray-100 p-4">
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
        </div>

        {/* Desktop Meetup Panel Skeleton */}
        <aside className="hidden w-[290px] shrink-0 flex-col items-center rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:flex">
          <Skeleton className="h-4 w-24 rounded-md mb-2" />
          <Skeleton className="h-3 w-36 rounded-md mb-4" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </aside>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Skeleton className="h-28 w-28 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-3 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Skeleton className="h-6 w-44 rounded-md mx-auto sm:mx-0" />
                <Skeleton className="h-9 w-28 rounded-xl mx-auto sm:mx-0" />
              </div>
              <Skeleton className="h-4 w-32 rounded-md mx-auto sm:mx-0" />
              <div className="space-y-1.5 pt-2">
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-4/5 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Lifestyle & Preferences Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <Skeleton className="h-5 w-36 rounded-md" />
            <div className="space-y-2.5">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <Skeleton className="h-5 w-36 rounded-md" />
            <div className="space-y-2.5">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
