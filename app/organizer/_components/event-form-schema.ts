import { z } from "zod";

export const EVENT_CATEGORIES = [
  "Music", "Concert", "Conference", "Workshop", "Sports",
  "Comedy", "Theatre", "Festival", "Exhibition", "Religion",
  "Networking", "Tech", "Fashion", "Party",
] as const;

export const UPPERCASE_CATEGORIES = EVENT_CATEGORIES.map((cat) =>
  cat.toUpperCase(),
) as unknown as [string, ...string[]];

export const EVENT_LAYOUTS = [
  "HERO_OVERLAY",
  "SPLIT_SCREEN",
  "EDITORIAL",
  "TICKET_FIRST",
  "TIMELINE",
] as const;

const ticketCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Category name is required"),
  description: z.string().max(200).optional(),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  maxTickets: z.coerce.number().min(1, "At least 1 ticket is required"),
  maxAdmissions: z.coerce.number().min(1).default(1),
});

const ticketCategorySubmissionSchema = z.object({
  name: z.string().min(3),
  description: z.string().max(200).optional(),
  price: z.coerce.number().min(0),
  maxTickets: z.coerce.number().min(1),
  maxAdmissions: z.coerce.number().min(1).default(1),
});

export const occurrenceSchema = z.object({
  id: z.string(),
  startsAt: z.string().min(1, "Start date is required"),
  endsAt: z.string().optional(),
  locationOverride: z.string().optional(),
});

export const customFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Field label is required"),
  fieldType: z.enum(["TEXT", "TEXTAREA", "SELECT", "NUMBER", "EMAIL"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

export const lineupArtistSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Artist name is required"),
});

export const faqItemSchema = z.object({
  id: z.string(),
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

export const goodToKnowPointSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "This can't be empty"),
});

export const showTimelineSlotSchema = z.object({
  id: z.string(),
  time: z.string().min(1, "Time is required"),
  stage: z.string().min(1, "Stage is required"),
  performer: z.string().min(1, "Performer is required"),
});

const bannerSchema = z
  .any()
  .refine((file) => file instanceof File, "Event banner is required")
  .refine((file) => !file || file.size <= 10 * 1024 * 1024, "File size must be ≤10MB")
  .refine(
    (file) => !file || ["image/png", "image/jpeg", "image/webp"].includes(file.type),
    "File must be PNG, JPG, or WebP",
  );

const bannerSchemaOptional = z
  .any()
  .refine((file) => !file || file.size <= 10 * 1024 * 1024, "File size must be ≤10MB")
  .refine(
    (file) => !file || ["image/png", "image/jpeg", "image/webp"].includes(file.type),
    "File must be PNG, JPG, or WebP",
  )
  .optional();

const advancedFields = {
  isVirtual: z.boolean().default(false),
  virtualLink: z.string().optional(),
  virtualLinkReleaseAt: z.string().optional(),
  isRecurring: z.boolean().default(false),
  occurrences: z.array(occurrenceSchema).optional(),
  customFields: z.array(customFieldSchema).optional(),
};

const layoutContentFields = {
  layout: z.enum(EVENT_LAYOUTS),
  editorialPullQuote: z.string().max(200).optional(),
  lineup: z.array(lineupArtistSchema).optional(),
  faq: z.array(faqItemSchema).optional(),
  goodToKnow: z.array(goodToKnowPointSchema).optional(),
  timelineSlots: z.array(showTimelineSlotSchema).optional(),
};

function applyLayoutContentValidation(
  data: { layout: string; lineup?: unknown[]; faq?: unknown[]; timelineSlots?: unknown[] },
  ctx: z.RefinementCtx,
) {
  const needsLineup = ["HERO_OVERLAY", "SPLIT_SCREEN", "TIMELINE"].includes(data.layout);
  if (needsLineup && (!data.lineup || data.lineup.length === 0)) {
    ctx.addIssue({ code: "custom", path: ["lineup"], message: "Add at least one artist" });
  }

  const needsFaq = ["HERO_OVERLAY", "SPLIT_SCREEN", "EDITORIAL", "TICKET_FIRST"].includes(data.layout);
  if (needsFaq && (!data.faq || data.faq.length === 0)) {
    ctx.addIssue({ code: "custom", path: ["faq"], message: "Add at least one FAQ entry" });
  }

  if (data.layout === "TIMELINE" && (!data.timelineSlots || data.timelineSlots.length === 0)) {
    ctx.addIssue({ code: "custom", path: ["timelineSlots"], message: "Add at least one timeline slot" });
  }
}

export const eventFormSchema = z
  .object({
    name: z.string().min(3, "Event name is required").max(100, "Event name must be 100 characters or fewer"),
    description: z.string().min(10, "Description is required"),
    category: z.string().min(1, "Category is required"),
    venueName: z.string().min(3, "Venue name is required"),
    venueAddress: z.string().min(3, "Venue address is required"),
    doorsOpenAt: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    feeMode: z.enum(["ORGANIZER", "ATTENDEE"]).default("ORGANIZER"),
    accessType: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
    ticketCategories: z.array(ticketCategorySchema).min(1, "At least one ticket category is required"),
    banner: bannerSchema,
    ...layoutContentFields,
    ...advancedFields,
  })
  .superRefine((data, ctx) => {
    if (data.isVirtual && !data.virtualLink) {
      ctx.addIssue({ code: "custom", path: ["virtualLink"], message: "Virtual link is required for virtual events" });
    }
    if (data.isRecurring && (!data.occurrences || data.occurrences.length === 0)) {
      ctx.addIssue({ code: "custom", path: ["occurrences"], message: "Add at least one occurrence" });
    }
    if (data.customFields) {
      data.customFields.forEach((field, i) => {
        if (field.fieldType === "SELECT" && (!field.options || field.options.length === 0)) {
          ctx.addIssue({ code: "custom", path: ["customFields", i, "options"], message: "Dropdown fields need at least one option" });
        }
      });
    }
    applyLayoutContentValidation(data, ctx);
  });

export const updateEventFormSchema = z
  .object({
    name: z.string().min(3, "Event name is required").max(100, "Event name must be 100 characters or fewer"),
    description: z.string().min(10, "Description is required"),
    category: z.enum(UPPERCASE_CATEGORIES, { errorMap: () => ({ message: "Please select a valid category" }) }),
    venueName: z.string().min(3, "Venue name is required"),
    venueAddress: z.string().min(3, "Venue address is required"),
    doorsOpenAt: z.string().optional(),
    date: z.string().min(1, "Date is required").refine((val) => new Date(val) >= new Date(), "Date cannot be in the past"),
    time: z.string().min(1, "Time is required"),
    feeMode: z.enum(["ORGANIZER", "ATTENDEE"]).default("ORGANIZER"),
    accessType: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
    ticketCategories: z.array(ticketCategorySchema).min(1, "At least one ticket category is required"),
    banner: bannerSchemaOptional,
    ...layoutContentFields,
    ...advancedFields,
  })
  .superRefine((data, ctx) => {
    if (data.isVirtual && !data.virtualLink) {
      ctx.addIssue({ code: "custom", path: ["virtualLink"], message: "Virtual link is required for virtual events" });
    }
    if (data.isRecurring && (!data.occurrences || data.occurrences.length === 0)) {
      ctx.addIssue({ code: "custom", path: ["occurrences"], message: "Add at least one occurrence" });
    }
    if (data.customFields) {
      data.customFields.forEach((field, i) => {
        if (field.fieldType === "SELECT" && (!field.options || field.options.length === 0)) {
          ctx.addIssue({ code: "custom", path: ["customFields", i, "options"], message: "Dropdown fields need at least one option" });
        }
      });
    }
    applyLayoutContentValidation(data, ctx);
  });

export const eventSubmissionSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10),
  category: z.string().min(1),
  venueName: z.string().min(3),
  venueAddress: z.string().min(3),
  doorsOpenAt: z.string().optional(),
  date: z.string().min(1),
  time: z.string().min(1),
  feeMode: z.enum(["ORGANIZER", "ATTENDEE"]).default("ORGANIZER"),
  accessType: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  ticketCategories: z.array(ticketCategorySubmissionSchema).min(1),
  banner: bannerSchemaOptional,
  ...layoutContentFields,
  ...advancedFields,
});

export type EventFormData = z.infer<typeof eventFormSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventFormSchema>;
export type EventSubmissionData = z.infer<typeof eventSubmissionSchema>;
export type OccurrenceFormData = z.infer<typeof occurrenceSchema>;
export type CustomFieldFormData = z.infer<typeof customFieldSchema>;

export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  price: number;
  maxTickets: number;
  maxAdmissions?: number;
}

export const DEFAULT_FORM_VALUES: Partial<EventFormData> = {
  name: "",
  description: "",
  category: "",
  venueName: "",
  venueAddress: "",
  doorsOpenAt: "",
  date: "",
  time: "20:00",
  feeMode: "ORGANIZER",
  accessType: "PUBLIC",
  layout: undefined,
  editorialPullQuote: "",
  lineup: [],
  faq: [],
  goodToKnow: [],
  timelineSlots: [],
  isVirtual: false,
  virtualLink: "",
  virtualLinkReleaseAt: "",
  isRecurring: false,
  occurrences: [],
  customFields: [],
  ticketCategories: [{ id: "1", name: "Regular", description: "", price: 0, maxTickets: 1, maxAdmissions: 1 }],
  banner: undefined,
};
