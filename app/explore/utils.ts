import { EventV2 } from "@/types/events-v2.type";

export function extractLocations(events: EventV2[]): string[] {
  const locationSet = new Set<string>();

  for (const event of events) {
    if (!event.location) continue;
    const parts = event.location.split(",");
    const loc = parts.length > 1 ? parts[1].trim() : event.location.trim();
    if (loc) locationSet.add(loc);
  }

  return Array.from(locationSet);
}

export function filterEvents(
  events: EventV2[],
  selectedLocation: string,
  selectedCategory: string,
): EventV2[] {
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

export function getTicketStats(event: EventV2) {
  const ticketCategories = event.ticketCategories || [];
  const maxTickets = ticketCategories.reduce((sum, t) => sum + t.maxTickets, 0);
  const mintedTickets = ticketCategories.reduce((sum, t) => sum + (t.minted ?? 0), 0);
  const ticketsAvailable = maxTickets - mintedTickets;

  return { ticketCategories, maxTickets, mintedTickets, ticketsAvailable };
}
