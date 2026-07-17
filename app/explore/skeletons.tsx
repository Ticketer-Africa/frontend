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
      className="rounded-2xl overflow-hidden flex flex-col border"
      style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}
      /**
       * aria-hidden because this is purely decorative loading state
       * Screen readers will hear "Loading events..." from parent
       */
      aria-hidden="true"
    >
      {/* Image placeholder - exact same dimensions as real image */}
      <Skeleton
        className="w-full flex-shrink-0"
        style={{ height: `${EVENT_IMAGE_HEIGHT}px`, backgroundColor: "var(--home-card-elevated)" }}
      />

      {/* Price badge placeholder */}
      <div className="flex justify-end px-4 -mt-4 mb-2 flex-shrink-0 relative z-10">
        <Skeleton
          className="h-7 w-24 rounded-full"
          style={{ backgroundColor: "var(--home-card-elevated)" }}
        />
      </div>

      {/* Content section - padding/layout must match explore-event-card.tsx's
          content wrapper exactly (p-4 px-6, no gap classes) since that card
          has no space-y between sections; only its own min-heights create
          spacing. Any mismatch here reflows sibling cards on hydration. */}
      <div className="p-4 px-6 flex flex-col flex-grow">
        {/* Title placeholder - matches min-h-[2.5rem] */}
        <div className="min-h-[2.5rem] space-y-1">
          <Skeleton className="h-4 w-full" style={{ backgroundColor: "var(--home-card-elevated)" }} />
          <Skeleton className="h-4 w-3/4" style={{ backgroundColor: "var(--home-card-elevated)" }} />
        </div>

        {/* Date & Location placeholder - matches min-h-[60px] */}
        <div className="space-y-2 min-h-[60px]">
          <Skeleton className="h-5 w-3/4" style={{ backgroundColor: "var(--home-card-elevated)" }} />
          <Skeleton className="h-5 w-2/3" style={{ backgroundColor: "var(--home-card-elevated)" }} />
        </div>

        {/* Tickets section placeholder - matches min-h-[56px] on the real card */}
        <div className="min-h-[56px] pb-2 space-y-2">
          <Skeleton className="h-5 w-1/3" style={{ backgroundColor: "var(--home-card-elevated)" }} />
          <Skeleton className="h-5 w-full" style={{ backgroundColor: "var(--home-card-elevated)" }} />
        </div>

        {/* Button placeholder - matches Button size="lg" (h-12) */}
        <Skeleton
          className="h-12 w-full rounded-full mt-auto"
          style={{ backgroundColor: "var(--home-card-elevated)" }}
        />
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
 *
 * Structure must mirror FilterSection's real markup exactly (the outer
 * mb-8 wrapper around an inner p-6/border card, a search row sized for
 * both the Input and its Button, and an h-11 Filters button — Button's
 * default size — not an arbitrary h-10) or the page reflows on hydration.
 */
export function FiltersSkeleton() {
  return (
    <div className="mb-8">
      <div
        className="rounded-2xl p-6 border"
        style={{ backgroundColor: "var(--home-card)", borderColor: "var(--home-border)" }}
      >
        {/* Search row skeleton - Input (flex-1) + Button, both h-12 */}
        <div className="mb-4 flex gap-2">
          <Skeleton
            className="flex-1 h-12 rounded-full"
            style={{ backgroundColor: "var(--home-card-elevated)" }}
          />
          <Skeleton
            className="h-12 w-24 rounded-full shrink-0"
            style={{ backgroundColor: "var(--home-card-elevated)" }}
          />
        </div>

        {/* Filters button row - h-11 matches Button's default size */}
        <div className="flex items-center justify-between">
          <Skeleton
            className="h-11 w-24 rounded-full"
            style={{ backgroundColor: "var(--home-card-elevated)" }}
          />
          <Skeleton className="h-5 w-32" style={{ backgroundColor: "var(--home-card-elevated)" }} />
        </div>
      </div>
    </div>
  );
}
