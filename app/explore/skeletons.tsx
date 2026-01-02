"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { EVENT_IMAGE_HEIGHT } from "./constants";

/**
 * EventCardSkeleton - Loading placeholder that matches exact card dimensions
 *
 * CRITICAL FOR CLS: This skeleton must exactly match the dimensions of ExploreEventCard
 * When real content loads, it should slot in without any layout shift
 */
export function EventCardSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col"
      /**
       * aria-hidden because this is purely decorative loading state
       * Screen readers will hear "Loading events..." from parent
       */
      aria-hidden="true"
    >
      {/* Image placeholder - exact same dimensions as real image */}
      <Skeleton
        className="w-full flex-shrink-0"
        style={{ height: `${EVENT_IMAGE_HEIGHT}px` }}
      />

      {/* Price badge placeholder */}
      <div className="flex justify-end px-4 -mt-4 mb-2 flex-shrink-0 relative z-10">
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      {/* Content section */}
      <div className="p-6 flex flex-col space-y-2">
        {/* Title placeholder - matches min-h-[3.5rem] */}
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-3/4" />

        {/* Date & Location placeholder - matches min-h-[60px] */}
        <div className="space-y-2 min-h-[60px]">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-2/3" />
        </div>

        {/* Tickets section placeholder - matches min-h-[100px] */}
        <div className="min-h-[100px] space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-1/4" />
        </div>

        {/* Button placeholder */}
        <Skeleton className="h-11 w-full rounded-full mt-auto" />
      </div>
    </div>
  );
}

/**
 * EventsGridSkeleton - Shows 6 skeleton cards in grid layout
 *
 * Performance: Renders immediately without waiting for data
 * Shows exact layout that will be filled with real cards
 */
export function EventsGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      role="status"
      aria-label="Loading events"
    >
      {/* 6 skeletons - typical above-the-fold count for desktop */}
      {Array.from({ length: 6 }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading events...</span>
    </div>
  );
}

/**
 * FiltersSkeleton - Loading state for filters section
 * Matches exact dimensions of real filter UI
 */
export function FiltersSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
      {/* Search input skeleton */}
      <Skeleton className="h-12 w-full rounded-xl mb-4" />

      {/* Filters button row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
  );
}
