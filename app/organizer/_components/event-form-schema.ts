import { z } from "zod";

// Valid event categories (title case for UI display)
export const EVENT_CATEGORIES = [
  "Music",
  "Concert",
  "Conference",
  "Workshop",
  "Sports",
  "Comedy",
  "Theatre",
  "Festival",
  "Exhibition",
  "Religion",
  "Networking",
  "Tech",
  "Fashion",
  "Party",
] as const;

// Uppercase categories for validation and backend
export const UPPERCASE_CATEGORIES = EVENT_CATEGORIES.map((cat) =>
  cat.toUpperCase()
) as unknown as [string, ...string[]];

// Base ticket category schema (with id for React state)
const ticketCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Category name is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  maxTickets: z.coerce.number().min(1, "At least 1 ticket is required"),
});

// Schema for backend submission (without id)
const ticketCategorySubmissionSchema = z.object({
  name: z.string().min(3, "Category name is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  maxTickets: z.coerce.number().min(1, "At least 1 ticket is required"),
});

// File validation schema
const bannerSchema = z
  .any()
  .refine(
    (file) => !file || file.size <= 10 * 1024 * 1024,
    "File size must be ≤10MB"
  )
  .refine(
    (file) => !file || ["image/png", "image/jpeg"].includes(file.type),
    "File must be PNG or JPG"
  )
  .optional();

// Zod Schema for frontend form handling (includes id for React state)
export const eventFormSchema = z.object({
  name: z.string().min(3, "Event name is required"),
  description: z.string().min(10, "Description is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(3, "Location is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  ticketCategories: z
    .array(ticketCategorySchema)
    .min(1, "At least one ticket category is required"),
  banner: bannerSchema,
});

// Zod Schema for update form with category enum validation
export const updateEventFormSchema = z.object({
  name: z.string().min(3, "Event name is required"),
  description: z.string().min(10, "Description is required"),
  category: z.enum(UPPERCASE_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  location: z.string().min(3, "Location is required"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => new Date(val) >= new Date(), "Date cannot be in the past"),
  time: z.string().min(1, "Time is required"),
  ticketCategories: z
    .array(ticketCategorySchema)
    .min(1, "At least one ticket category is required"),
  banner: bannerSchema,
});

// Zod Schema for backend submission (excludes id from ticket categories)
export const eventSubmissionSchema = z.object({
  name: z.string().min(3, "Event name is required"),
  description: z.string().min(10, "Description is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(3, "Location is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  ticketCategories: z
    .array(ticketCategorySubmissionSchema)
    .min(1, "At least one ticket category is required"),
  banner: bannerSchema,
});

// Types
export type EventFormData = z.infer<typeof eventFormSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventFormSchema>;
export type EventSubmissionData = z.infer<typeof eventSubmissionSchema>;

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  maxTickets: number;
}

// Default values for a new event
export const DEFAULT_FORM_VALUES: EventFormData = {
  name: "",
  description: "",
  category: "",
  location: "",
  date: "",
  time: "",
  ticketCategories: [{ id: "1", name: "Regular", price: 0, maxTickets: 1 }],
  banner: undefined,
};
