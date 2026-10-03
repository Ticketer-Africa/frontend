export const SECTION_OPTIONS = [
  ["HERO", "Hero"], ["ABOUT", "About"], ["UPCOMING_EDITIONS", "Upcoming Editions"],
  ["TICKET_CTA", "Ticket CTA"], ["LINEUP", "Lineup"], ["SCHEDULE", "Schedule"],
  ["GALLERY", "Gallery"], ["VENUE", "Venue"], ["SPONSORS", "Sponsors"],
  ["FAQ", "FAQ"], ["COUNTDOWN", "Countdown"], ["RICH_CONTENT", "Rich Content"],
  ["SOCIAL_CONTACT", "Social / Contact"], ["FOOTER", "Footer"],
] as const;
export type SectionType = (typeof SECTION_OPTIONS)[number][0];
export interface SiteSection {
  id: string;
  type: SectionType;
  hidden: boolean;
  content: Record<string, unknown>;
  styles: Record<string, unknown>;
}
export interface SiteDocument {
  schemaVersion: 1;
  name: string;
  slug: string;
  theme: Record<string, unknown>;
  seo: Record<string, unknown>;
  sections: SiteSection[];
  linkedEditionIds: string[];
  ticketTarget: { mode: "NEXT_EVENT" | "SPECIFIC_EVENT" | "EVENT_LIST" | "NO_TICKET_CTA"; eventId?: string };
}
export interface SiteRecord {
  id: string;
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
  slug: string | null;
  draftRevision: number;
  publishedVersionId?: string | null;
  document: SiteDocument;
}
export interface PublicSite {
  id: string;
  slug: string;
  versionId: string;
  document: SiteDocument;
  editions: Array<{ id: string; name: string; date: string; venueName: string | null; state: "BUY" | "COMING_SOON" | "SOLD_OUT"; url: string | null }>;
  ticketTarget: { eventId: string | null; eventName: string | null; state: "BUY" | "COMING_SOON" | "SOLD_OUT" | "CANCELLED" | "ENDED" | "MISSING"; url: string | null };
}
export interface SitePreview extends SiteRecord {
  editions: PublicSite["editions"];
  ticketTarget: PublicSite["ticketTarget"];
}
export const sectionLabel = (type: SectionType) => SECTION_OPTIONS.find(item => item[0] === type)?.[1] ?? type;
export const text = (value: unknown) => typeof value === "string" ? value : "";
export function newSection(type: SectionType): SiteSection {
  const heading = sectionLabel(type);
  return {
    id: crypto.randomUUID(), type, hidden: false,
    content: type === "HERO" ? { heading: "Your event name", subtitle: "Tell people why they should come." }
      : type === "FAQ" ? { heading, items: [{ question: "What should guests know?", answer: "Add the answer here." }] }
      : type === "TICKET_CTA" ? { heading: "Ready to join us?", body: "Book your place today." }
      : { heading, body: "Add your content here." },
    styles: { alignment: "left" },
  };
}
export const TEMPLATE_SECTIONS: Record<string, SectionType[]> = {
  "Blank": ["HERO", "TICKET_CTA"],
  "Concert / Party": ["HERO", "LINEUP", "GALLERY", "UPCOMING_EDITIONS", "VENUE", "TICKET_CTA", "FAQ"],
  "Conference": ["HERO", "ABOUT", "LINEUP", "SCHEDULE", "SPONSORS", "VENUE", "TICKET_CTA", "FAQ"],
  "Workshop / Class": ["HERO", "ABOUT", "LINEUP", "RICH_CONTENT", "SCHEDULE", "VENUE", "TICKET_CTA", "FAQ"],
  "Festival": ["HERO", "LINEUP", "SCHEDULE", "GALLERY", "SPONSORS", "VENUE", "UPCOMING_EDITIONS", "FAQ"],
  "Corporate / Community": ["HERO", "ABOUT", "LINEUP", "SCHEDULE", "SPONSORS", "VENUE", "TICKET_CTA"],
};
