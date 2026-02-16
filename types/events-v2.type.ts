/**
 * V2 Event Types - Backend Integration
 * Matches the backend /v2/events/:slug response structure
 */

export interface TicketCategoryV2 {
  id: string;
  name: string;
  price: number;
  maxTickets: number;
  maxAdmissions: number;
  minted: number;
  eventId: string;
  displayPrice: number;
}

export interface OrganizerInfoV2 {
  name: string;
  email: string;
  profileImage: string;
}

export interface EventV2 {
  id: string;
  name: string;
  slug: string;
  description: string;
  organizerId: string;
  location: string;
  date: string;
  category: string;
  isActive: boolean;
  bannerUrl: string;
  organizer: OrganizerInfoV2;
  feeMode: "ORGANIZER" | "ATTENDEE";
  primaryFeeBps: number;
  ticketCategories: TicketCategoryV2[];
}
