/**
 * V2 Event Types - Backend Integration
 */

export type EventLayout =
  | "HERO_OVERLAY"
  | "SPLIT_SCREEN"
  | "EDITORIAL"
  | "TICKET_FIRST"
  | "TIMELINE";

export interface TicketCategoryV2 {
  id: string;
  name: string;
  description?: string;
  price: number;
  maxTickets: number;
  maxAdmissions: number;
  minted?: number;
  eventId: string;
  displayPrice: number;
}

export interface OrganizerInfoV2 {
  name: string;
  email: string;
  profileImage: string;
}

export interface EventOccurrence {
  id: string;
  startsAt: string;
  endsAt?: string;
  locationOverride?: string;
  isActive: boolean;
}

export interface EventCustomField {
  id: string;
  label: string;
  fieldType: "TEXT" | "TEXTAREA" | "SELECT" | "NUMBER" | "EMAIL";
  required: boolean;
  options?: string[];
  position: number;
}

export interface EventLineupArtist {
  id: string;
  name: string;
  position: number;
}

export interface EventFaqItem {
  id: string;
  question: string;
  answer: string;
  position: number;
}

export interface EventGoodToKnowPoint {
  id: string;
  text: string;
  position: number;
}

export interface EventShowTimelineSlot {
  id: string;
  time: string;
  stage: string;
  performer: string;
  position: number;
}

export interface RelatedEventV2 {
  id: string;
  slug: string;
  name: string;
  category: string;
  date: string;
  venueName?: string;
  bannerUrl: string;
  fromPrice: number;
}

export interface EventV2 {
  id: string;
  name: string;
  slug: string;
  description: string;
  organizerId: string;
  venueName?: string;
  venueAddress?: string;
  date: string;
  doorsOpenAt?: string;
  layout: EventLayout;
  editorialPullQuote?: string;
  category: string;
  isActive: boolean;
  bannerUrl: string;
  organizer: OrganizerInfoV2;
  feeMode: "ORGANIZER" | "ATTENDEE";
  primaryFeeBps: number;
  accessType: "PUBLIC" | "INVITE_ONLY";
  isVirtual: boolean;
  virtualLink?: string;
  virtualLinkReleaseAt?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  occurrences?: EventOccurrence[];
  customFields?: EventCustomField[];
  ticketCategories: TicketCategoryV2[];
  lineup?: EventLineupArtist[];
  faq?: EventFaqItem[];
  goodToKnow?: EventGoodToKnowPoint[];
  timelineSlots?: EventShowTimelineSlot[];
  relatedEvents?: RelatedEventV2[];
}
