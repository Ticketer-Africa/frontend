import { EventLayout, TicketCategoryV2 } from "./events-v2.type";

export interface EventLayoutViewModel {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  bannerUrl: string;
  organizerName: string;
  organizerImage?: string;
  date: string;
  doorsOpenAt?: string;
  venueName?: string;
  venueAddress?: string;
  layout: EventLayout;
  feeMode: "ORGANIZER" | "ATTENDEE";
  primaryFeeBps: number;
  ticketCategories: TicketCategoryV2[];
  lineup: string[];
  faq: { question: string; answer: string }[];
  goodToKnow: string[];
  pullQuote?: string;
  timelineSlots: { time: string; stage: string; performer: string }[];
  relatedEvents: {
    id: string;
    slug: string;
    name: string;
    category: string;
    date: string;
    venueName?: string;
    bannerUrl: string;
    fromPrice: number;
  }[];
}
