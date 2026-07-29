import { EventV2 } from "@/types/events-v2.type";
import { EventLayoutViewModel } from "@/types/event-layout.type";

function sortByPosition<T extends { position: number }>(items: T[] = []): T[] {
  return [...items].sort((a, b) => a.position - b.position);
}

export function toViewModelFromApiEvent(event: EventV2): EventLayoutViewModel {
  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    description: event.description,
    category: event.category,
    bannerUrl: event.bannerUrl,
    organizerName: event.organizer.name,
    organizerImage: event.organizer.profileImage,
    date: event.date,
    doorsOpenAt: event.doorsOpenAt,
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    layout: event.layout,
    feeMode: event.feeMode,
    primaryFeeBps: event.primaryFeeBps,
    ticketCategories: event.ticketCategories,
    lineup: sortByPosition(event.lineup).map((artist) => artist.name),
    faq: sortByPosition(event.faq).map(({ question, answer }) => ({ question, answer })),
    goodToKnow: sortByPosition(event.goodToKnow).map((point) => point.text),
    pullQuote: event.editorialPullQuote,
    timelineSlots: sortByPosition(event.timelineSlots).map(
      ({ time, stage, performer }) => ({ time, stage, performer }),
    ),
    relatedEvents: (event.relatedEvents ?? []).map((related) => ({
      id: related.id,
      slug: related.slug,
      name: related.name,
      category: related.category,
      date: related.date,
      venueName: related.venueName,
      bannerUrl: related.bannerUrl,
      fromPrice: related.fromPrice,
    })),
  };
}
