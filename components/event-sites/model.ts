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
  ticketTarget: { mode: "NEXT_EVENT" | "SPECIFIC_EVENT" | "EVENT_LIST" | "NO_TICKET_CTA"; eventId?: string; fallback?: "COMING_SOON" | "HIDE_CTA" };
}
const LEGACY_DEFAULT_THEME = { background: "#ffffff", text: "#141414", accent: "#c74d33" };
export const TICKETER_SITE_THEME = { background: "#0b0e14", text: "#dce2f7", accent: "#e2725b" };

/** Upgrade the original generic template palette while preserving organizer custom themes. */
export function applySiteThemeDefaults(document: SiteDocument): SiteDocument {
  const theme = document.theme;
  const hasLegacyTheme = theme.background === LEGACY_DEFAULT_THEME.background && theme.text === LEGACY_DEFAULT_THEME.text && theme.accent === LEGACY_DEFAULT_THEME.accent;
  const hasStockHero = document.sections.some(section => section.type === "HERO" && section.content.subtitle === "Tell people why they should come.");
  if (!hasLegacyTheme && !hasStockHero) return document;

  const types = new Set(document.sections.map(section => section.type));
  const template = types.has("RICH_CONTENT") ? "Workshop / Class"
    : types.has("LINEUP") && types.has("GALLERY") && types.has("UPCOMING_EDITIONS") ? types.has("SCHEDULE") ? "Festival" : "Concert / Party"
      : types.has("SCHEDULE") && types.has("SPONSORS") && types.has("ABOUT") ? types.has("FAQ") ? "Conference" : "Corporate / Community"
        : "Blank";
  const suggestedSections = makeTemplateSections(template, document.name);
  const sections = document.sections.map((section, index) => {
    const suggestion = suggestedSections[index];
    if (!suggestion || suggestion.type !== section.type) return section;
    const stockContent = newSection(section.type).content;
    const content = { ...section.content };
    for (const [key, suggestedValue] of Object.entries(suggestion.content)) {
      if (content[key] === undefined || content[key] === stockContent[key]) content[key] = suggestedValue;
    }
    return { ...section, content, styles: { ...suggestion.styles, ...section.styles } };
  });
  return {
    ...document,
    theme: hasLegacyTheme ? { ...theme, ...TICKETER_SITE_THEME } : theme,
    sections,
    ticketTarget: document.ticketTarget.mode === "NO_TICKET_CTA" && hasStockHero
      ? { mode: "NEXT_EVENT", fallback: "COMING_SOON" }
      : document.ticketTarget,
  };
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
  ticketTarget: { eventId: string | null; eventName: string | null; startsAt?: string | null; venueName?: string | null; state: "BUY" | "COMING_SOON" | "SOLD_OUT" | "CANCELLED" | "ENDED" | "MISSING" | "HIDDEN"; url: string | null };
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

const TEMPLATE_COPY: Record<string, Partial<Record<SectionType, { heading: string; body: string }>>> = {
  "Blank": {
    HERO: { heading: "Your event brand", body: "A home for the dates, people, and moments your community comes back for." },
    TICKET_CTA: { heading: "Be there for the next one", body: "Link an event to show dates and ticket availability here." },
  },
  "Concert / Party": {
    HERO: { heading: "Your event brand", body: "Live music, late nights, and a room full of your people." },
    LINEUP: { heading: "On the bill", body: "Meet the artists bringing the night to life." },
    GALLERY: { heading: "The nights we remember", body: "Add photos from past editions and set the mood for the next one." },
    UPCOMING_EDITIONS: { heading: "Find your next night", body: "Choose a date and make a plan." },
    VENUE: { heading: "Find us", body: "Add the venue, directions, and anything guests should know before they arrive." },
    TICKET_CTA: { heading: "Save your place", body: "Your next night out starts here." },
  },
  "Conference": {
    HERO: { heading: "Ideas worth meeting for", body: "A gathering for the people building what comes next." },
    ABOUT: { heading: "A room for new ideas", body: "Share what this gathering is about and who should be in the room." },
    LINEUP: { heading: "People to hear from", body: "Introduce the speakers and voices shaping the conversation." },
    SCHEDULE: { heading: "Plan your day", body: "Add session times and details as the programme comes together." },
    SPONSORS: { heading: "Made possible together", body: "Recognise the partners supporting this gathering." },
    VENUE: { heading: "Getting here", body: "Add the venue, directions, and arrival details." },
    TICKET_CTA: { heading: "Join the conversation", body: "Save your place at the next edition." },
  },
  "Workshop / Class": {
    HERO: { heading: "Make something together", body: "Hands-on sessions for curious people ready to learn by doing." },
    ABOUT: { heading: "What you will take away", body: "Describe what guests will learn, make, or practise." },
    LINEUP: { heading: "Meet your host", body: "Introduce the people guiding the session." },
    RICH_CONTENT: { heading: "A little preparation", body: "Share what to bring and how to get ready." },
    SCHEDULE: { heading: "How the session flows", body: "Add the key moments and timings." },
    VENUE: { heading: "Where we will meet", body: "Add the venue and arrival details." },
    TICKET_CTA: { heading: "Save your seat", body: "Small groups make room for better questions." },
  },
  "Festival": {
    HERO: { heading: "A whole world in one place", body: "Music, food, art, and the people who make it feel alive." },
    LINEUP: { heading: "Across the stages", body: "Meet the artists and performers joining this edition." },
    SCHEDULE: { heading: "Build your day", body: "Add set times and moments you do not want to miss." },
    GALLERY: { heading: "Festival, in full colour", body: "Bring the atmosphere to life with photos from past editions." },
    SPONSORS: { heading: "In good company", body: "Thank the partners helping bring the festival to life." },
    VENUE: { heading: "Make your way here", body: "Add the festival grounds, entry points, and travel notes." },
    UPCOMING_EDITIONS: { heading: "The next gathering", body: "Pick your date and get ready to come together." },
  },
  "Corporate / Community": {
    HERO: { heading: "Good people. Shared purpose.", body: "A place for your community to meet, celebrate, and move ideas forward." },
    ABOUT: { heading: "Why we come together", body: "Tell guests what connects this community." },
    LINEUP: { heading: "People making it happen", body: "Introduce the hosts, organisers, and contributors." },
    SCHEDULE: { heading: "The day at a glance", body: "Add the moments and timings guests can plan around." },
    SPONSORS: { heading: "With support from", body: "Recognise the partners who make this possible." },
    VENUE: { heading: "Meet us here", body: "Add the venue and practical arrival details." },
    TICKET_CTA: { heading: "Be part of it", body: "Save your place at the next gathering." },
  },
};

export function makeTemplateSections(template: string, siteName: string): SiteSection[] {
  const sections = (TEMPLATE_SECTIONS[template] ?? TEMPLATE_SECTIONS.Blank).map(newSection);
  const copy = TEMPLATE_COPY[template] ?? TEMPLATE_COPY.Blank;
  for (const section of sections) {
    const content = copy[section.type];
    if (content) section.content = { ...section.content, ...content };
    if (section.type === "HERO") {
      section.content.heading = siteName || content?.heading || "Your event brand";
      section.content.subtitle = section.content.body || content?.body || "A home for the dates, people, and moments your community comes back for.";
      delete section.content.body;
      section.content.eyebrow = template === "Concert / Party" || template === "Festival" ? "The next night starts here" : "A Ticketer event space";
      section.styles = { ...section.styles, layout: "full", spacing: "spacious", overlay: "high" };
      if (template === "Concert / Party" || template === "Festival") {
        section.content.imageUrl = "/images/event-sites/concert-hero.jpg";
        section.styles.mediaPosition = "right";
      }
    }
    if (section.type === "TICKET_CTA") section.styles = { ...section.styles, layout: "contained", spacing: "spacious" };
    if (section.type === "FAQ" && Array.isArray(section.content.items)) {
      section.content.items = [{ question: "When will event details be announced?", answer: "We will share updates here as soon as they are confirmed." }];
    }
  }
  return sections;
}
