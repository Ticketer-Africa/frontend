/**
 * V2 Event Types - Backend Integration
 */

export interface TicketCategoryV2 {
  id: string;
  name: string;
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
  accessType: "PUBLIC" | "INVITE_ONLY";
  isVirtual: boolean;
  virtualLink?: string;
  virtualLinkReleaseAt?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  occurrences?: EventOccurrence[];
  customFields?: EventCustomField[];
  ticketCategories: TicketCategoryV2[];
}
