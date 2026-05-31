import { z } from "zod";

export const EVENT_CATEGORIES = [
  "Music", "Concert", "Conference", "Workshop", "Sports",
  "Comedy", "Theatre", "Festival", "Exhibition", "Religion",
  "Networking", "Tech", "Fashion", "Party",
] as const;

export const UPPERCASE_CATEGORIES = EVENT_CATEGORIES.map((cat) =>
  cat.toUpperCase(),
) as unknown as [string, ...string[]];

const ticketCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Category name is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  maxTickets: z.coerce.number().min(1, "At least 1 ticket is required"),
  maxAdmissions: z.coerce.number().min(1).default(1),
});

const ticketCategorySubmissionSchema = z.object({
  name: z.string().min(3),
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

const bannerSchema = z
  .any()
  .refine((file) => file instanceof File, "Event banner is required")
  .refine((file) => !file || file.size <= 10 * 1024 * 1024, "File size must be ≤10MB")
  .refine(
    (file) => !file || ["image/png", "image/jpeg"].includes(file.type),
    "File must be PNG or JPG",
  );

const bannerSchemaOptional = z
  .any()
  .refine((file) => !file || file.size <= 10 * 1024 * 1024, "File size must be ≤10MB")
  .refine(
    (file) => !file || ["image/png", "image/jpeg"].includes(file.type),
    "File must be PNG or JPG",
  )
  .optional();

const advancedFields = {
  accessType: z.enum(["PUBLIC", "INVITE_ONLY"]).default("PUBLIC"),
  isVirtual: z.boolean().default(false),
  virtualLink: z.string().optional(),
  virtualLinkReleaseAt: z.string().optional(),
  isRecurring: z.boolean().default(false),
  occurrences: z.array(occurrenceSchema).optional(),
  customFields: z.array(customFieldSchema).optional(),
};

export const eventFormSchema = z
  .object({
    name: z.string().min(3, "Event name is required"),
    description: z.string().min(10, "Description is required"),
    category: z.string().min(1, "Category is required"),
    location: z.string().min(3, "Location is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    feeMode: z.enum(["ORGANIZER", "ATTENDEE"]).default("ORGANIZER"),
    ticketCategories: z.array(ticketCategorySchema).min(1, "At least one ticket category is required"),
    banner: bannerSchema,
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
  });

export const updateEventFormSchema = z
  .object({
    name: z.string().min(3, "Event name is required"),
    description: z.string().min(10, "Description is required"),
    category: z.enum(UPPERCASE_CATEGORIES, { errorMap: () => ({ message: "Please select a valid category" }) }),
    location: z.string().min(3, "Location is required"),
    date: z.string().min(1, "Date is required").refine((val) => new Date(val) >= new Date(), "Date cannot be in the past"),
    time: z.string().min(1, "Time is required"),
    feeMode: z.enum(["ORGANIZER", "ATTENDEE"]).default("ORGANIZER"),
    visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
    ticketCategories: z.array(ticketCategorySchema).min(1, "At least one ticket category is required"),
    banner: bannerSchemaOptional,
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
  });

export const eventSubmissionSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(1),
  location: z.string().min(3),
  date: z.string().min(1),
  time: z.string().min(1),
  feeMode: z.enum(["ORGANIZER", "ATTENDEE"]).default("ORGANIZER"),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  ticketCategories: z.array(ticketCategorySubmissionSchema).min(1),
  banner: bannerSchemaOptional,
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
  price: number;
  maxTickets: number;
  maxAdmissions?: number;
}

export const DEFAULT_FORM_VALUES: Partial<EventFormData> = {
  name: "",
  description: "",
  category: "",
  location: "",
  date: "",
  time: "",
  feeMode: "ORGANIZER",
  accessType: "PUBLIC",
  isVirtual: false,
  virtualLink: "",
  virtualLinkReleaseAt: "",
  isRecurring: false,
  occurrences: [],
  customFields: [],
  ticketCategories: [{ id: "1", name: "Regular", price: 0, maxTickets: 1, maxAdmissions: 1 }],
  banner: undefined,
};
