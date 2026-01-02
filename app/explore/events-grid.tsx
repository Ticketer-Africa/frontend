"use client";

import { memo } from "react";
import { Event } from "@/types/events.type";
import { ExploreEventCard } from "./explore-event-card";

interface EventsGridProps {
  events: Event[];
}

/**
 * EventsGrid - Grid layout for event cards
 *
 * Performance optimizations:
 * - memo() prevents re-renders when filters panel changes
 * - Only first 3 cards get priority loading (above the fold on desktop)
 * - Uses CSS grid instead of JS for layout
 */
function EventsGridComponent({ events }: EventsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event, idx) => (
        <ExploreEventCard
          key={event.id}
          event={event}
          /**
           * Only first 3 cards get priority image loading
           * These are visible above the fold on most screens
           * Rest use lazy loading to reduce initial bandwidth
           */
          isPriority={idx < 3}
        />
      ))}
    </div>
  );
}

export const EventsGrid = memo(EventsGridComponent);
