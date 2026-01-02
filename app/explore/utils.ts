import { Event } from "@/types/events.type";

/**
 * Extract unique locations from events
 * Memoized at call site to prevent recalculation on every render
 */
export function extractLocations(events: Event[]): string[] {
  const locationSet = new Set<string>();

  for (const event of events) {
    if (!event.location) continue;
    const parts = event.location.split(",");
    const loc = parts.length > 1 ? parts[1].trim() : event.location.trim();
    if (loc) locationSet.add(loc);
  }

  return Array.from(locationSet);
}

/**
 * Filter events by location and category
 * Separated from component for cleaner code and potential memoization
 */
export function filterEvents(
  events: Event[],
  selectedLocation: string,
  selectedCategory: string
): Event[] {
  if (!selectedLocation && !selectedCategory) {
    return events;
  }

  return events.filter((event) => {
    const matchesLocation =
      !selectedLocation || event.location.includes(selectedLocation);
    const matchesCategory =
      !selectedCategory ||
      event.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesLocation && matchesCategory;
  });
}

/**
 * Calculate ticket availability stats for an event
 * Extracted to avoid recalculating in render loop
 */
export function getTicketStats(event: Event) {
  const ticketCategories = event.ticketCategories || [];
  const maxTickets = ticketCategories.reduce((sum, t) => sum + t.maxTickets, 0);
  const mintedTickets = ticketCategories.reduce((sum, t) => sum + t.minted, 0);
  const ticketsAvailable = maxTickets - mintedTickets;

  return { ticketCategories, maxTickets, mintedTickets, ticketsAvailable };
}
