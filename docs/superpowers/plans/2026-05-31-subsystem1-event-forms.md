# Subsystem 1: Event Creation/Update Forms — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the 3-step event creation/update form with a polished card-based layout, add a Step 4 (Advanced Settings) exposing access type, virtual events, recurring occurrences, and custom checkout fields, and wire everything through the v2 API.

**Architecture:** Extend the existing Zod schema and step components in `app/organizer/_components/`. Add a new `event-form-step4.tsx`. Update `create-event/page.tsx` and `update-event/[id]/page.tsx` to handle 4 steps. Add v2 create/update functions to `services/events/events-v2.ts`.

**Tech Stack:** Next.js App Router, React Hook Form + Zod, TanStack Query, Framer Motion, shadcn/ui, Tailwind CSS

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `types/events-v2.type.ts` | Modify | Add `EventOccurrence`, `EventCustomField`, extend `EventV2` |
| `app/organizer/_components/event-form-schema.ts` | Modify | Add occurrence, customField sub-schemas + new fields |
| `services/events/events-v2.ts` | Modify | Add `createEventV2`, `updateEventV2` |
| `services/events/events-v2.queries.ts` | Modify | Add `useCreateEventV2`, `useUpdateEventV2` hooks |
| `app/organizer/_components/event-form-step1.tsx` | Modify | Visual overhaul — card-based layout |
| `app/organizer/_components/event-form-step2.tsx` | Modify | Visual overhaul — card-based layout |
| `app/organizer/_components/event-form-step3.tsx` | Modify | Visual overhaul — card-based layout |
| `app/organizer/_components/event-form-step4.tsx` | Create | Advanced Settings — 4 toggle-gated sections |
| `app/organizer/_components/progress-bar.tsx` | Modify | Support 4 steps + new labels |
| `app/organizer/_components/form-navigation.tsx` | Modify | Support 4 steps |
| `app/organizer/create-event/page.tsx` | Modify | Wire step 4, use v2 service, send new fields |
| `app/organizer/update-event/[id]/page.tsx` | Modify | Wire step 4, use v2 service, populate new fields |

---

## Task 1: Extend Types

**Files:**
- Modify: `types/events-v2.type.ts`

- [ ] **Step 1: Replace `types/events-v2.type.ts` with extended version**

```typescript
/**
 * V2 Event Types - Backend Integration
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `events-v2.type.ts`

- [ ] **Step 3: Commit**

```bash
git add types/events-v2.type.ts
git commit -m "feat: extend EventV2 types with occurrences, customFields, accessType, virtual"
```

---

## Task 2: Extend Form Schema

**Files:**
- Modify: `app/organizer/_components/event-form-schema.ts`

- [ ] **Step 1: Replace `event-form-schema.ts` with extended version**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors from schema file

- [ ] **Step 3: Commit**

```bash
git add app/organizer/_components/event-form-schema.ts
git commit -m "feat: extend event form schema with advanced fields (accessType, virtual, recurring, customFields)"
```

---

## Task 3: Add V2 Service Functions

**Files:**
- Modify: `services/events/events-v2.ts`
- Modify: `services/events/events-v2.queries.ts`

- [ ] **Step 1: Replace `services/events/events-v2.ts`**

```typescript
import axios from "@/services/axios";
import { buildEndpoint } from "@/services/api-config";
import { EventV2 } from "@/types/events-v2.type";

const API_VERSION = "v2";

export const getEventBySlugV2 = async (slug: string): Promise<EventV2> => {
  const endpoint = buildEndpoint(API_VERSION, `events/slug/${slug}`);
  const res = await axios.get(endpoint);
  return res.data;
};

export const createEventV2 = async (formData: FormData): Promise<EventV2> => {
  const endpoint = buildEndpoint(API_VERSION, "events/create");
  const res = await axios.post<EventV2>(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateEventV2 = async (
  eventId: string,
  formData: FormData,
): Promise<EventV2> => {
  const endpoint = buildEndpoint(API_VERSION, `events/${eventId}`);
  const res = await axios.patch<EventV2>(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
```

- [ ] **Step 2: Replace `services/events/events-v2.queries.ts`**

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as eventsV2API from "@/services/events/events-v2";
import { EventV2 } from "@/types/events-v2.type";

export const useEventBySlugV2 = (slug: string) => {
  return useQuery<EventV2, Error>({
    queryKey: ["eventV2", slug],
    queryFn: () => eventsV2API.getEventBySlugV2(slug),
    enabled: !!slug,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateEventV2 = () => {
  const queryClient = useQueryClient();
  return useMutation<EventV2, Error, FormData>({
    mutationFn: (formData) => eventsV2API.createEventV2(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizerEvents"] });
    },
  });
};

export const useUpdateEventV2 = () => {
  const queryClient = useQueryClient();
  return useMutation<EventV2, Error, { eventId: string; formData: FormData }>({
    mutationFn: ({ eventId, formData }) =>
      eventsV2API.updateEventV2(eventId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizerEvents"] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
    },
  });
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add services/events/events-v2.ts services/events/events-v2.queries.ts
git commit -m "feat: add createEventV2 and updateEventV2 service functions"
```

---

## Task 4: Redesign Step 1 — Event Details

**Files:**
- Modify: `app/organizer/_components/event-form-step1.tsx`

- [ ] **Step 1: Replace `event-form-step1.tsx`**

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, ImagePlus } from "lucide-react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { EventFormData, EVENT_CATEGORIES } from "./event-form-schema";

interface Step1Props {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  watch: UseFormWatch<EventFormData>;
  setValue: UseFormSetValue<EventFormData>;
  previewUrl: string | null;
  isDisabled: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EventFormStep1({
  register,
  errors,
  watch,
  setValue,
  previewUrl,
  isDisabled,
  onFileChange,
}: Step1Props) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Info</p>

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium">Event Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            placeholder="e.g. Afrobeats Night 2026"
            className="h-11 rounded-xl"
            {...register("name")}
            disabled={isDisabled}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium">Description <span className="text-red-500">*</span></Label>
          <Textarea
            id="description"
            placeholder="Describe your event — what to expect, who it's for, dress code, etc."
            className="min-h-[120px] rounded-xl whitespace-pre-wrap resize-none"
            {...register("description")}
            disabled={isDisabled}
          />
          <p className="text-xs text-gray-400">Line breaks and formatting are preserved</p>
          {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
        </div>
      </div>

      {/* Category */}
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category <span className="text-red-500">*</span></p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {EVENT_CATEGORIES.map((category) => {
            const isSelected = watch("category") === category.toUpperCase();
            return (
              <button
                key={category}
                type="button"
                onClick={() => setValue("category", category.toUpperCase())}
                disabled={isDisabled}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                  isSelected
                    ? "bg-[#1E88E5] text-white border-[#1E88E5] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1E88E5] hover:text-[#1E88E5]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
      </div>

      {/* Banner */}
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Banner <span className="text-red-500">*</span></p>
        <div
          className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-[#1E88E5] transition-colors"
          onClick={() => !isDisabled && document.getElementById("banner")?.click()}
        >
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl} alt="Banner preview" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">Click to change</p>
              </div>
            </div>
          ) : (
            <div className="py-10 flex flex-col items-center gap-3 text-gray-400">
              <ImagePlus className="h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Click to upload banner</p>
                <p className="text-xs">PNG or JPG, up to 10MB</p>
              </div>
            </div>
          )}
        </div>
        <input
          type="file"
          id="banner"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={onFileChange}
          disabled={isDisabled}
        />
        {errors.banner && (
          <p className="text-xs text-red-500">
            {typeof errors.banner?.message === "string" ? errors.banner.message : null}
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Start dev server and verify Step 1 renders correctly on mobile and desktop**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend && npm run dev
```

Navigate to `http://localhost:3000/organizer/create-event`. Check:
- Cards render with rounded corners and gray background
- Category pills highlight blue when selected
- Banner drop zone shows preview when image selected
- No console errors

- [ ] **Step 3: Commit**

```bash
git add app/organizer/_components/event-form-step1.tsx
git commit -m "feat: redesign event form step 1 with card-based layout"
```

---

## Task 5: Redesign Step 2 — Date, Location & Tickets

**Files:**
- Modify: `app/organizer/_components/event-form-step2.tsx`

- [ ] **Step 1: Replace `event-form-step2.tsx`**

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { EventFormData, TicketCategory } from "./event-form-schema";

interface Step2Props {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  watch: UseFormWatch<EventFormData>;
  setValue: UseFormSetValue<EventFormData>;
  ticketCategories: TicketCategory[];
  isDisabled: boolean;
  onAddCategory: () => void;
  onRemoveCategory: (id: string) => void;
  existingTicketCategories?: Array<{ soldTickets?: number }>;
}

export function EventFormStep2({
  register,
  errors,
  watch,
  setValue,
  ticketCategories,
  isDisabled,
  onAddCategory,
  onRemoveCategory,
  existingTicketCategories,
}: Step2Props) {
  return (
    <div className="space-y-6">
      {/* Date & Location */}
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">When & Where</p>

        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-sm font-medium">Location <span className="text-red-500">*</span></Label>
          <Input
            id="location"
            placeholder="e.g. Muri Okunola Park, Lagos"
            className="h-11 rounded-xl"
            {...register("location")}
            disabled={isDisabled}
          />
          {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-sm font-medium">Date <span className="text-red-500">*</span></Label>
            <Input
              id="date"
              type="date"
              className="h-11 rounded-xl"
              {...register("date")}
              disabled={isDisabled}
            />
            {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="time" className="text-sm font-medium">Time <span className="text-red-500">*</span></Label>
            <Input
              id="time"
              type="time"
              className="h-11 rounded-xl"
              {...register("time")}
              disabled={isDisabled}
            />
            {errors.time && <p className="text-xs text-red-500">{errors.time.message}</p>}
          </div>
        </div>
      </div>

      {/* Ticket Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket Categories <span className="text-red-500">*</span></p>
        </div>

        {ticketCategories.map((category, index) => (
          <div
            key={category.id}
            className="bg-gray-50/70 rounded-2xl p-5 space-y-4 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Category {index + 1}</span>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => onRemoveCategory(category.id)}
                  disabled={isDisabled}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Category Name</Label>
              <Input
                placeholder="e.g. VIP, General Admission, Early Bird"
                className="h-11 rounded-xl"
                {...register(`ticketCategories.${index}.name`)}
                disabled={isDisabled}
              />
              {errors.ticketCategories?.[index]?.name && (
                <p className="text-xs text-red-500">{errors.ticketCategories[index]?.name?.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Price (₦)</Label>
                <Input
                  type="number"
                  placeholder="0 for free"
                  className="h-11 rounded-xl"
                  min="0"
                  step="100"
                  {...register(`ticketCategories.${index}.price`)}
                  disabled={isDisabled}
                />
                {errors.ticketCategories?.[index]?.price && (
                  <p className="text-xs text-red-500">{errors.ticketCategories[index]?.price?.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Total Tickets</Label>
                <Input
                  type="number"
                  placeholder="Available qty"
                  className="h-11 rounded-xl"
                  min={existingTicketCategories?.[index]?.soldTickets || 1}
                  {...register(`ticketCategories.${index}.maxTickets`)}
                  disabled={isDisabled}
                />
                {errors.ticketCategories?.[index]?.maxTickets && (
                  <p className="text-xs text-red-500">{errors.ticketCategories[index]?.maxTickets?.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Admissions / Ticket</Label>
                <Input
                  type="number"
                  placeholder="1"
                  className="h-11 rounded-xl"
                  min="1"
                  {...register(`ticketCategories.${index}.maxAdmissions`)}
                  disabled={isDisabled}
                />
                {errors.ticketCategories?.[index]?.maxAdmissions && (
                  <p className="text-xs text-red-500">{errors.ticketCategories[index]?.maxAdmissions?.message}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400">Admissions per ticket: how many people enter with 1 ticket (use &gt;1 for group tickets)</p>
          </div>
        ))}

        {errors.ticketCategories && typeof errors.ticketCategories.message === "string" && (
          <p className="text-xs text-red-500">{errors.ticketCategories.message}</p>
        )}

        <button
          type="button"
          onClick={onAddCategory}
          disabled={isDisabled}
          className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-[#1E88E5] hover:text-[#1E88E5] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Another Category
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser — navigate to Step 2, confirm layout on mobile viewport (375px)**

Check:
- Price/Tickets/Admissions grid stacks on mobile, 3-col on sm+
- Add Category button renders as dashed border
- Removing second category works

- [ ] **Step 3: Commit**

```bash
git add app/organizer/_components/event-form-step2.tsx
git commit -m "feat: redesign event form step 2 with card-based layout"
```

---

## Task 6: Redesign Step 3 — Review & Pricing

**Files:**
- Modify: `app/organizer/_components/event-form-step3.tsx`

- [ ] **Step 1: Replace `event-form-step3.tsx`**

```typescript
"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { EventFormData, TicketCategory } from "./event-form-schema";
import { formatPrice } from "@/lib/helpers";

interface Step3Props {
  watch: UseFormWatch<EventFormData>;
  setValue: UseFormSetValue<EventFormData>;
  ticketCategories: TicketCategory[];
  previewUrl: string | null;
  isConfirmed?: boolean;
  onConfirmChange?: (confirmed: boolean) => void;
}

export function EventFormStep3({
  watch,
  setValue,
  ticketCategories,
  previewUrl,
  isConfirmed = false,
  onConfirmChange,
}: Step3Props) {
  const category = watch("category");
  const feeMode = watch("feeMode");
  const formattedCategory = category ? category.charAt(0) + category.slice(1).toLowerCase() : "";

  const totalGrossRevenue = ticketCategories.reduce(
    (sum, cat) => sum + (cat.price || 0) * (cat.maxTickets || 0),
    0,
  );
  const estimatedServiceFee = Math.round(totalGrossRevenue * 0.05);
  const netRevenue = totalGrossRevenue - estimatedServiceFee;

  return (
    <div className="space-y-5">
      {/* Summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Details</p>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Name</p>
              <p className="font-medium">{watch("name")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Category</p>
              <p className="font-medium">{formattedCategory}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Description</p>
              <p className="text-xs text-gray-600 line-clamp-3 whitespace-pre-wrap">{watch("description")}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Location</p>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Location</p>
              <p className="font-medium">{watch("location")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date & Time</p>
              <p className="font-medium">
                {watch("date") && new Date(watch("date")).toLocaleDateString()} at {watch("time")}
              </p>
            </div>
          </div>
          {previewUrl && (
            <img src={previewUrl} alt="Banner" className="w-full h-24 object-cover rounded-xl mt-2" />
          )}
        </div>
      </div>

      {/* Ticket summary */}
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket Categories</p>
        <div className="space-y-2">
          {ticketCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-gray-400">
                  {cat.maxTickets} ticket{cat.maxTickets !== 1 ? "s" : ""}
                  {cat.maxAdmissions && cat.maxAdmissions > 1 ? ` · ${cat.maxAdmissions} people/ticket` : ""}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(cat.price)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Mode */}
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Fees</p>
        <p className="text-xs text-gray-500">Who pays the platform service fees?</p>
        <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setValue("feeMode", "ORGANIZER")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              feeMode === "ORGANIZER"
                ? "bg-[#1E88E5] text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            You Pay
          </button>
          <button
            type="button"
            onClick={() => setValue("feeMode", "ATTENDEE")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              feeMode === "ATTENDEE"
                ? "bg-[#1E88E5] text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Attendees Pay
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
          {feeMode === "ORGANIZER"
            ? "Platform fee (~5%) is deducted from your revenue"
            : "Attendees pay the platform fee on top of the ticket price"}
        </div>
      </div>

      {/* Revenue projection */}
      {ticketCategories.some((cat) => cat.price > 0) && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-green-800 uppercase tracking-wider">Revenue Projection (if all tickets sell)</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Gross Revenue</span>
              <span className="font-medium">{formatPrice(totalGrossRevenue)}</span>
            </div>
            {feeMode === "ORGANIZER" && (
              <>
                <div className="flex justify-between text-red-500">
                  <span>Platform Fee (~5%)</span>
                  <span className="font-medium">-{formatPrice(estimatedServiceFee)}</span>
                </div>
                <div className="flex justify-between text-green-800 font-bold pt-2 border-t border-green-200">
                  <span>Your Net Revenue</span>
                  <span className="text-base">{formatPrice(netRevenue)}</span>
                </div>
              </>
            )}
            {feeMode === "ATTENDEE" && (
              <p className="text-xs text-green-700 pt-1">
                You keep the full {formatPrice(totalGrossRevenue)}. Attendees pay ~{formatPrice(estimatedServiceFee)} extra in platform fees.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation */}
      {onConfirmChange && (
        <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
          />
          <span className="text-sm text-gray-700">I have reviewed all event details and confirm they are correct.</span>
        </label>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser — navigate to Step 3, check two-panel layout on desktop and stacked on mobile**

- [ ] **Step 3: Commit**

```bash
git add app/organizer/_components/event-form-step3.tsx
git commit -m "feat: redesign event form step 3 with card-based layout"
```

---

## Task 7: Build Step 4 — Advanced Settings

**Files:**
- Create: `app/organizer/_components/event-form-step4.tsx`

- [ ] **Step 1: Create `event-form-step4.tsx`**

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UseFormWatch, UseFormSetValue, UseFormRegister, FieldErrors } from "react-hook-form";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EventFormData, OccurrenceFormData, CustomFieldFormData } from "./event-form-schema";

interface Step4Props {
  watch: UseFormWatch<EventFormData>;
  setValue: UseFormSetValue<EventFormData>;
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  isDisabled: boolean;
}

const FIELD_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "TEXTAREA", label: "Long Text" },
  { value: "SELECT", label: "Dropdown" },
  { value: "NUMBER", label: "Number" },
  { value: "EMAIL", label: "Email" },
] as const;

export function EventFormStep4({ watch, setValue, register, errors, isDisabled }: Step4Props) {
  const accessType = watch("accessType") ?? "PUBLIC";
  const isVirtual = watch("isVirtual") ?? false;
  const isRecurring = watch("isRecurring") ?? false;
  const occurrences = watch("occurrences") ?? [];
  const customFields = watch("customFields") ?? [];

  const [optionInputs, setOptionInputs] = useState<Record<number, string>>({});

  // — Occurrences —
  const addOccurrence = () => {
    const newOccurrence: OccurrenceFormData = {
      id: crypto.randomUUID(),
      startsAt: "",
      endsAt: "",
      locationOverride: "",
    };
    setValue("occurrences", [...occurrences, newOccurrence]);
  };

  const removeOccurrence = (id: string) => {
    setValue("occurrences", occurrences.filter((o) => o.id !== id));
  };

  const updateOccurrence = (id: string, field: keyof OccurrenceFormData, value: string) => {
    setValue(
      "occurrences",
      occurrences.map((o) => (o.id === id ? { ...o, [field]: value } : o)),
    );
  };

  // — Custom Fields —
  const addCustomField = () => {
    const newField: CustomFieldFormData = {
      id: crypto.randomUUID(),
      label: "",
      fieldType: "TEXT",
      required: false,
      options: [],
    };
    setValue("customFields", [...customFields, newField]);
  };

  const removeCustomField = (id: string) => {
    setValue("customFields", customFields.filter((f) => f.id !== id));
  };

  const updateCustomField = (id: string, patch: Partial<CustomFieldFormData>) => {
    setValue(
      "customFields",
      customFields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    );
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...customFields];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newFields.length) return;
    [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];
    setValue("customFields", newFields);
  };

  const addOption = (fieldId: string, fieldIndex: number) => {
    const val = (optionInputs[fieldIndex] || "").trim();
    if (!val) return;
    const field = customFields.find((f) => f.id === fieldId);
    if (!field) return;
    updateCustomField(fieldId, { options: [...(field.options ?? []), val] });
    setOptionInputs((prev) => ({ ...prev, [fieldIndex]: "" }));
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = customFields.find((f) => f.id === fieldId);
    if (!field) return;
    updateCustomField(fieldId, {
      options: (field.options ?? []).filter((_, i) => i !== optionIndex),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">All sections below are optional. Enable only what applies to your event.</p>

      {/* Access Type */}
      <Section
        title="Invite-Only Event"
        description="Restrict ticket purchases to people you personally invite"
        enabled={accessType === "INVITE_ONLY"}
        onToggle={(on) => setValue("accessType", on ? "INVITE_ONLY" : "PUBLIC")}
        disabled={isDisabled}
      >
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
          Only invited people can purchase tickets. You can manage invites from your event dashboard after creating the event.
        </div>
      </Section>

      {/* Virtual Event */}
      <Section
        title="Virtual Event"
        description="Add a meeting or stream link for online attendees"
        enabled={isVirtual}
        onToggle={(on) => setValue("isVirtual", on)}
        disabled={isDisabled}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Meeting / Stream Link <span className="text-red-500">*</span></Label>
            <Input
              placeholder="https://meet.google.com/..."
              className="h-11 rounded-xl"
              {...register("virtualLink")}
              disabled={isDisabled}
            />
            {errors.virtualLink && <p className="text-xs text-red-500">{errors.virtualLink.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Release Link to Attendees At (optional)</Label>
            <Input
              type="datetime-local"
              className="h-11 rounded-xl"
              {...register("virtualLinkReleaseAt")}
              disabled={isDisabled}
            />
            <p className="text-xs text-gray-400">Leave blank to release immediately after purchase</p>
          </div>
        </div>
      </Section>

      {/* Recurring Occurrences */}
      <Section
        title="Multiple Occurrences"
        description="This event happens on multiple dates (e.g. weekly shows, multi-day festival)"
        enabled={isRecurring}
        onToggle={(on) => setValue("isRecurring", on)}
        disabled={isDisabled}
      >
        <div className="space-y-3">
          {occurrences.map((occ, i) => (
            <div key={occ.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Occurrence {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeOccurrence(occ.id)}
                  disabled={isDisabled}
                  className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Start Date & Time <span className="text-red-500">*</span></Label>
                  <Input
                    type="datetime-local"
                    className="h-10 rounded-xl text-sm"
                    value={occ.startsAt}
                    onChange={(e) => updateOccurrence(occ.id, "startsAt", e.target.value)}
                    disabled={isDisabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">End Date & Time (optional)</Label>
                  <Input
                    type="datetime-local"
                    className="h-10 rounded-xl text-sm"
                    value={occ.endsAt ?? ""}
                    onChange={(e) => updateOccurrence(occ.id, "endsAt", e.target.value)}
                    disabled={isDisabled}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Location Override (optional)</Label>
                <Input
                  placeholder="Leave blank to use main event location"
                  className="h-10 rounded-xl text-sm"
                  value={occ.locationOverride ?? ""}
                  onChange={(e) => updateOccurrence(occ.id, "locationOverride", e.target.value)}
                  disabled={isDisabled}
                />
              </div>
            </div>
          ))}

          {(errors as any).occurrences && (
            <p className="text-xs text-red-500">
              {typeof (errors as any).occurrences?.message === "string"
                ? (errors as any).occurrences.message
                : "Add at least one occurrence"}
            </p>
          )}

          <button
            type="button"
            onClick={addOccurrence}
            disabled={isDisabled}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-[#1E88E5] hover:text-[#1E88E5] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Occurrence
          </button>
        </div>
      </Section>

      {/* Custom Checkout Fields */}
      <Section
        title="Custom Checkout Fields"
        description="Ask attendees for extra info when they buy a ticket (e.g. phone number, dietary requirements, t-shirt size)"
        enabled={customFields.length > 0}
        onToggle={(on) => {
          if (on) addCustomField();
          else setValue("customFields", []);
        }}
        disabled={isDisabled}
      >
        <div className="space-y-3">
          {customFields.map((field, i) => (
            <div key={field.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Field {i + 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveField(i, "up")}
                    disabled={isDisabled || i === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveField(i, "down")}
                    disabled={isDisabled || i === customFields.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCustomField(field.id)}
                    disabled={isDisabled}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Label <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="e.g. Phone Number"
                    className="h-10 rounded-xl text-sm"
                    value={field.label}
                    onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                    disabled={isDisabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Field Type</Label>
                  <select
                    value={field.fieldType}
                    onChange={(e) => updateCustomField(field.id, { fieldType: e.target.value as CustomFieldFormData["fieldType"], options: [] })}
                    disabled={isDisabled}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateCustomField(field.id, { required: e.target.checked })}
                  disabled={isDisabled}
                  className="h-4 w-4 rounded border-gray-300 text-[#1E88E5]"
                />
                <span className="text-xs text-gray-600">Required field</span>
              </label>

              {field.fieldType === "SELECT" && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Options <span className="text-red-500">*</span></Label>
                  <div className="flex flex-wrap gap-1.5 min-h-8">
                    {(field.options ?? []).map((opt, oi) => (
                      <span
                        key={oi}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs"
                      >
                        {opt}
                        <button
                          type="button"
                          onClick={() => removeOption(field.id, oi)}
                          disabled={isDisabled}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add option..."
                      className="h-9 rounded-xl text-sm"
                      value={optionInputs[i] ?? ""}
                      onChange={(e) => setOptionInputs((prev) => ({ ...prev, [i]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(field.id, i); } }}
                      disabled={isDisabled}
                    />
                    <button
                      type="button"
                      onClick={() => addOption(field.id, i)}
                      disabled={isDisabled}
                      className="px-3 py-1.5 bg-[#1E88E5] text-white rounded-xl text-sm hover:bg-blue-500"
                    >
                      Add
                    </button>
                  </div>
                  {(errors as any).customFields?.[i]?.options && (
                    <p className="text-xs text-red-500">Add at least one option</p>
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addCustomField}
            disabled={isDisabled}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-[#1E88E5] hover:text-[#1E88E5] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Field
          </button>
        </div>
      </Section>
    </div>
  );
}

// Reusable toggle section shell
function Section({
  title,
  description,
  enabled,
  onToggle,
  disabled,
  children,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (on: boolean) => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50/70 rounded-2xl p-5 space-y-4 border border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={disabled}
          className="mt-0.5 shrink-0"
        />
      </div>
      <AnimatePresence initial={false}>
        {enabled && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser — navigate to Step 4**

Check:
- Each section starts collapsed
- Toggling shows/hides with animation
- Invite-Only shows info callout
- Virtual Event shows link + release time inputs
- Recurring shows occurrence builder; Add Occurrence appends new card
- Custom Fields shows field builder; Dropdown type reveals options input
- Up/down reorder buttons work

- [ ] **Step 3: Commit**

```bash
git add app/organizer/_components/event-form-step4.tsx
git commit -m "feat: add event form step 4 — advanced settings (access type, virtual, recurring, custom fields)"
```

---

## Task 8: Update Progress Bar & Navigation

**Files:**
- Modify: `app/organizer/_components/progress-bar.tsx`
- Modify: `app/organizer/_components/form-navigation.tsx`

- [ ] **Step 1: Update `progress-bar.tsx` default props for 4 steps**

Change the default values in `ProgressBar`:

```typescript
export function ProgressBar({
  currentStep,
  totalSteps = 4,
  labels = ["Event Details", "Date & Tickets", "Review & Fees", "Advanced"],
}: ProgressBarProps) {
```

Also update the connector width from `w-16` to `w-8 sm:w-12` so 4 steps fit on mobile:

```typescript
<div
  className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 transition-colors ${
    step < currentStep ? "bg-[#1E88E5]" : "bg-gray-200"
  }`}
/>
```

- [ ] **Step 2: Update `form-navigation.tsx` default**

Change `totalSteps = 3` → `totalSteps = 4`:

```typescript
export function FormNavigation({
  currentStep,
  totalSteps = 4,
  // ...rest unchanged
```

- [ ] **Step 3: Verify progress bar renders 4 steps correctly on mobile (375px viewport)**

- [ ] **Step 4: Commit**

```bash
git add app/organizer/_components/progress-bar.tsx app/organizer/_components/form-navigation.tsx
git commit -m "feat: update progress bar and navigation to support 4 steps"
```

---

## Task 9: Wire Step 4 into Create Event Page

**Files:**
- Modify: `app/organizer/create-event/page.tsx`

- [ ] **Step 1: Replace `create-event/page.tsx`**

```typescript
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useCreateEventV2 } from "@/services/events/events-v2.queries";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  eventFormSchema,
  EventFormData,
  DEFAULT_FORM_VALUES,
} from "../_components/event-form-schema";
import { ProgressBar } from "../_components/progress-bar";
import { EventFormStep1 } from "../_components/event-form-step1";
import { EventFormStep2 } from "../_components/event-form-step2";
import { EventFormStep3 } from "../_components/event-form-step3";
import { EventFormStep4 } from "../_components/event-form-step4";
import { FormNavigation } from "../_components/form-navigation";
import { EventSuccessScreen } from "../_components/event-success-screen";
import { LoadingScreen } from "../_components/status-screens";

const TOTAL_STEPS = 4;

export default function CreateEventPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { mutateAsync: createEvent, isPending } = useCreateEventV2();
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: DEFAULT_FORM_VALUES as EventFormData,
  });

  const bannerFile = watch("banner");
  const previewUrl = bannerFile ? URL.createObjectURL(bannerFile) : null;

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const ticketCategories = watch("ticketCategories") || [];

  const canProceedStep1 =
    !!watch("name") && !!watch("description") && !!watch("category") && !!watch("banner");
  const canProceedStep2 =
    !!watch("location") &&
    !!watch("date") &&
    !!watch("time") &&
    ticketCategories.length > 0 &&
    ticketCategories.every((cat) => cat.name && cat.price >= 0 && cat.maxTickets >= 1);
  const canProceedStep3 = true; // step 3 has no required inputs beyond what step 2 already validated
  const canProceedStep4 = true; // step 4 is all optional unless toggles are on (validated at submit)

  const canProceed = [canProceedStep1, canProceedStep2, canProceedStep3, canProceedStep4][currentStep - 1];

  const onSubmit = async (data: EventFormData) => {
    const fullDate = new Date(`${data.date}T${data.time}`);
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("location", data.location);
    formData.append("date", fullDate.toISOString());
    formData.append("feeMode", data.feeMode);
    formData.append("accessType", data.accessType);
    formData.append("isVirtual", String(data.isVirtual));
    formData.append("isRecurring", String(data.isRecurring));

    if (data.isVirtual && data.virtualLink) {
      formData.append("virtualLink", data.virtualLink);
    }
    if (data.isVirtual && data.virtualLinkReleaseAt) {
      formData.append("virtualLinkReleaseAt", data.virtualLinkReleaseAt);
    }
    if (data.isRecurring && data.occurrences?.length) {
      formData.append(
        "occurrences",
        JSON.stringify(data.occurrences.map(({ id, ...rest }) => rest)),
      );
    }
    if (data.customFields?.length) {
      formData.append(
        "customFields",
        JSON.stringify(data.customFields.map(({ id, ...rest }) => rest)),
      );
    }

    formData.append(
      "ticketCategories",
      JSON.stringify(ticketCategories.map(({ id, ...rest }) => rest)),
    );

    if (data.banner instanceof File) {
      formData.append("banner", data.banner);
    }

    try {
      await createEvent(formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Event creation failed:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setValue("banner", file);
  };

  const handleAddCategory = () => {
    setValue("ticketCategories", [
      ...ticketCategories,
      { id: crypto.randomUUID(), name: "", price: 0, maxTickets: 1, maxAdmissions: 1 },
    ]);
  };

  const handleRemoveCategory = (id: string) => {
    if (ticketCategories.length === 1) return;
    setValue("ticketCategories", ticketCategories.filter((cat) => cat.id !== id));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS && canProceed) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 2) setIsConfirmed(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setIsConfirmed(false);
    }
  };

  const handleCreateAnother = () => {
    reset(DEFAULT_FORM_VALUES as EventFormData);
    setCurrentStep(1);
    setIsSubmitted(false);
    setIsConfirmed(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      (e.target as HTMLElement).tagName !== "TEXTAREA" &&
      (e.target as HTMLElement).tagName !== "BUTTON"
    ) {
      e.preventDefault();
    }
  };

  if (authLoading) return <LoadingScreen message="Loading..." subMessage="Verifying your session" />;
  if (isSubmitted) return <EventSuccessScreen eventName={watch("name")} title="Event Created!" onCreateAnother={handleCreateAnother} />;

  const stepTitles = ["Event Details", "Date & Tickets", "Review & Fees", "Advanced Settings"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" className="bg-transparent" asChild disabled={isPending || isSubmitting}>
            <Link href="/organizer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Create Event</h1>
            <p className="text-gray-600">Step {currentStep} of {TOTAL_STEPS}</p>
          </div>
          <div className="w-32" />
        </div>

        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div className="step-content-animate">
          <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl">{stepTitles[currentStep - 1]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} id="event-form">
                {currentStep === 1 && (
                  <EventFormStep1
                    register={register} errors={errors} watch={watch} setValue={setValue}
                    previewUrl={previewUrl} isDisabled={isPending || isSubmitting}
                    onFileChange={handleFileChange}
                  />
                )}
                {currentStep === 2 && (
                  <EventFormStep2
                    register={register} errors={errors} watch={watch} setValue={setValue}
                    ticketCategories={ticketCategories} isDisabled={isPending || isSubmitting}
                    onAddCategory={handleAddCategory} onRemoveCategory={handleRemoveCategory}
                  />
                )}
                {currentStep === 3 && (
                  <EventFormStep3
                    watch={watch} setValue={setValue} ticketCategories={ticketCategories}
                    previewUrl={previewUrl} isConfirmed={isConfirmed} onConfirmChange={setIsConfirmed}
                  />
                )}
                {currentStep === 4 && (
                  <EventFormStep4
                    watch={watch} setValue={setValue} register={register}
                    errors={errors} isDisabled={isPending || isSubmitting}
                  />
                )}

                <FormNavigation
                  currentStep={currentStep}
                  totalSteps={TOTAL_STEPS}
                  canProceed={canProceed}
                  isSubmitting={isPending || isSubmitting}
                  submitLabel="Create Event"
                  submittingLabel="Creating..."
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  formId="event-form"
                  requiresConfirmation={currentStep === 3}
                  isConfirmed={isConfirmed}
                />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test full create flow end-to-end in browser**

1. Fill Steps 1–3 for a basic public event, submit — confirm event is created (check network tab for `POST /api/v2/events/create`)
2. Create another event: enable Invite-Only in Step 4, submit — confirm `accessType: "INVITE_ONLY"` in request payload
3. Create another: enable Virtual Event, add link, submit — confirm `isVirtual: "true"` and `virtualLink` in payload
4. Create another: enable Recurring, add 2 occurrences, submit — confirm `occurrences` JSON in payload
5. Create another: add 2 custom fields (one Dropdown with options), submit — confirm `customFields` JSON in payload

- [ ] **Step 3: Commit**

```bash
git add app/organizer/create-event/page.tsx
git commit -m "feat: wire step 4 into create event page, switch to v2 API"
```

---

## Task 10: Wire Step 4 into Update Event Page

**Files:**
- Modify: `app/organizer/update-event/[id]/page.tsx`

- [ ] **Step 1: Replace `update-event/[id]/page.tsx`**

Read the full current file first, then apply changes. The key changes from the current version are:
1. Import `useUpdateEventV2` instead of `useUpdateEvent`
2. Import `EventFormStep4`
3. Increase `TOTAL_STEPS` to 4
4. Populate new fields from `event` in the `useEffect`
5. Update `onSubmit` to append new fields to FormData
6. Add `currentStep === 4` render block

```typescript
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useUpdateEventV2 } from "@/services/events/events-v2.queries";
import { getEventById } from "@/services/events/events";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  updateEventFormSchema,
  UpdateEventFormData,
  DEFAULT_FORM_VALUES,
} from "../../_components/event-form-schema";
import { ProgressBar } from "../../_components/progress-bar";
import { EventFormStep1 } from "../../_components/event-form-step1";
import { EventFormStep2 } from "../../_components/event-form-step2";
import { EventFormStep3 } from "../../_components/event-form-step3";
import { EventFormStep4 } from "../../_components/event-form-step4";
import { FormNavigation } from "../../_components/form-navigation";
import { EventSuccessScreen } from "../../_components/event-success-screen";
import { LoadingScreen, ErrorScreen } from "../../_components/status-screens";

const TOTAL_STEPS = 4;

export default function UpdateEventPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutateAsync: updateEvent, isPending } = useUpdateEventV2();
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    data: event,
    isLoading: eventLoading,
    error,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById(eventId!),
    enabled: !!eventId,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateEventFormData>({
    resolver: zodResolver(updateEventFormSchema),
    defaultValues: DEFAULT_FORM_VALUES as UpdateEventFormData,
  });

  useEffect(() => {
    if (event && !eventLoading) {
      const eventDate = new Date(event.date);
      const date = eventDate.toISOString().split("T")[0];
      const time = eventDate.toTimeString().slice(0, 5);

      setValue("name", event.name);
      setValue("description", event.description);
      setValue("category", event.category);
      setValue("location", event.location);
      setValue("date", date);
      setValue("time", time);
      setValue("feeMode", event.feeMode ?? "ORGANIZER");
      setValue("accessType", event.accessType ?? "PUBLIC");
      setValue("isVirtual", event.isVirtual ?? false);
      setValue("virtualLink", event.virtualLink ?? "");
      setValue("virtualLinkReleaseAt", event.virtualLinkReleaseAt ?? "");
      setValue("isRecurring", event.isRecurring ?? false);
      setValue(
        "occurrences",
        (event.occurrences ?? []).map((o: any) => ({
          id: o.id ?? crypto.randomUUID(),
          startsAt: o.startsAt ?? "",
          endsAt: o.endsAt ?? "",
          locationOverride: o.locationOverride ?? "",
        })),
      );
      setValue(
        "customFields",
        (event.customFields ?? []).map((f: any) => ({
          id: f.id ?? crypto.randomUUID(),
          label: f.label ?? "",
          fieldType: f.fieldType ?? "TEXT",
          required: f.required ?? false,
          options: f.options ?? [],
        })),
      );
      setValue(
        "ticketCategories",
        event.ticketCategories?.length
          ? event.ticketCategories.map((cat: any, index: number) => ({
              id: (index + 1).toString(),
              name: cat.name,
              price: cat.price,
              maxTickets: cat.maxTickets,
              maxAdmissions: cat.maxAdmissions ?? 1,
            }))
          : [{ id: "1", name: "Regular", price: event.price || 0, maxTickets: event.maxTickets || 1, maxAdmissions: 1 }],
      );
    }
  }, [event, eventLoading, setValue]);

  const bannerFile = watch("banner");
  const previewUrl = bannerFile ? URL.createObjectURL(bannerFile) : event?.bannerUrl || null;

  useEffect(() => {
    return () => { if (previewUrl && bannerFile) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl, bannerFile]);

  const ticketCategories = watch("ticketCategories") || [];

  const canProceedStep1 = !!watch("name") && !!watch("description") && !!watch("category");
  const canProceedStep2 =
    !!watch("location") &&
    !!watch("date") &&
    !!watch("time") &&
    ticketCategories.length > 0 &&
    ticketCategories.every((cat) => cat.name && cat.price >= 0 && cat.maxTickets >= 1);

  const canProceed = [canProceedStep1, canProceedStep2, true, true][currentStep - 1];

  const onSubmit = async (data: UpdateEventFormData) => {
    const fullDate = new Date(`${data.date}T${data.time}`);
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("location", data.location);
    formData.append("date", fullDate.toISOString());
    formData.append("feeMode", data.feeMode);
    formData.append("accessType", data.accessType);
    formData.append("isVirtual", String(data.isVirtual));
    formData.append("isRecurring", String(data.isRecurring));

    if (data.isVirtual && data.virtualLink) formData.append("virtualLink", data.virtualLink);
    if (data.isVirtual && data.virtualLinkReleaseAt) formData.append("virtualLinkReleaseAt", data.virtualLinkReleaseAt);
    if (data.isRecurring && data.occurrences?.length) {
      formData.append("occurrences", JSON.stringify(data.occurrences.map(({ id, ...rest }) => rest)));
    }
    if (data.customFields?.length) {
      formData.append("customFields", JSON.stringify(data.customFields.map(({ id, ...rest }) => rest)));
    }
    formData.append("ticketCategories", JSON.stringify(ticketCategories.map(({ id, ...rest }) => rest)));
    if (data.banner instanceof File) formData.append("banner", data.banner);

    try {
      await updateEvent({ eventId: eventId!, formData });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Event update failed:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setValue("banner", file);
  };

  const handleAddCategory = () => {
    setValue("ticketCategories", [
      ...ticketCategories,
      { id: crypto.randomUUID(), name: "", price: 0, maxTickets: 1, maxAdmissions: 1 },
    ]);
  };

  const handleRemoveCategory = (id: string) => {
    if (ticketCategories.length === 1) return;
    setValue("ticketCategories", ticketCategories.filter((cat) => cat.id !== id));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS && canProceed) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA" && (e.target as HTMLElement).tagName !== "BUTTON") {
      e.preventDefault();
    }
  };

  if (authLoading || eventLoading) return <LoadingScreen message="Loading..." subMessage="Fetching event details" />;
  if (error) return <ErrorScreen message="Failed to load event" />;
  if (isSubmitted) return <EventSuccessScreen eventName={watch("name")} title="Event Updated!" />;

  const stepTitles = ["Event Details", "Date & Tickets", "Review & Fees", "Advanced Settings"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" className="bg-transparent" asChild disabled={isPending || isSubmitting}>
            <Link href="/organizer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Update Event</h1>
            <p className="text-gray-600">Step {currentStep} of {TOTAL_STEPS}</p>
          </div>
          <div className="w-32" />
        </div>

        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div className="step-content-animate">
          <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl">{stepTitles[currentStep - 1]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} id="event-form">
                {currentStep === 1 && (
                  <EventFormStep1
                    register={register} errors={errors} watch={watch as any} setValue={setValue as any}
                    previewUrl={previewUrl} isDisabled={isPending || isSubmitting}
                    onFileChange={handleFileChange}
                  />
                )}
                {currentStep === 2 && (
                  <EventFormStep2
                    register={register} errors={errors} watch={watch as any} setValue={setValue as any}
                    ticketCategories={ticketCategories} isDisabled={isPending || isSubmitting}
                    onAddCategory={handleAddCategory} onRemoveCategory={handleRemoveCategory}
                    existingTicketCategories={event?.ticketCategories?.map((cat: any) => ({ soldTickets: cat.minted }))}
                  />
                )}
                {currentStep === 3 && (
                  <EventFormStep3
                    watch={watch as any} setValue={setValue as any}
                    ticketCategories={ticketCategories} previewUrl={previewUrl}
                  />
                )}
                {currentStep === 4 && (
                  <EventFormStep4
                    watch={watch as any} setValue={setValue as any}
                    register={register as any} errors={errors as any}
                    isDisabled={isPending || isSubmitting}
                  />
                )}

                <FormNavigation
                  currentStep={currentStep}
                  totalSteps={TOTAL_STEPS}
                  canProceed={canProceed}
                  isSubmitting={isPending || isSubmitting}
                  submitLabel="Save Changes"
                  submittingLabel="Saving..."
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  formId="event-form"
                />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test update flow end-to-end**

1. Open an existing event's update form — confirm existing fields populate in Steps 1–3
2. Navigate to Step 4 — confirm `accessType`, `isVirtual`, `isRecurring` toggle states load from event
3. Toggle on Virtual Event, change link, save — check `PATCH /api/v2/events/:id` payload
4. Confirm success screen shows "Event Updated!"

- [ ] **Step 3: Run TypeScript check**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend && npx tsc --noEmit 2>&1 | head -40
```

Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add app/organizer/update-event/[id]/page.tsx
git commit -m "feat: wire step 4 into update event page, switch to v2 API"
```
