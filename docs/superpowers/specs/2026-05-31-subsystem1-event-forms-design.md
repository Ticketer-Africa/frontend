# Subsystem 1: Event Creation/Update Forms — Design Spec

**Date:** 2026-05-31  
**Status:** Approved  
**Scope:** Redesign existing 3-step event form + add Step 4 (Advanced Settings) for recurring events, custom checkout fields, virtual events, and access type.

---

## Context

The frontend event creation/update forms (`/organizer/create-event` and `/organizer/update-event/[id]`) currently support 3 steps: Event Details, Date/Location/Tickets, and Review/Pricing. The backend v2 API supports several features that the form does not yet expose: access type (public vs invite-only), virtual events, recurring occurrences, and custom checkout fields. The existing steps also need a responsive visual overhaul.

---

## Decision Log

- **Step structure:** Add Step 4 (Advanced Settings) rather than distributing new fields across existing steps — keeps the core flow fast for simple events.
- **Recurring events UI:** Manual occurrence list only (no pattern generator) — generator is a follow-up.
- **Custom field types:** Core 5 only — TEXT, TEXTAREA, SELECT, NUMBER, EMAIL. RADIO/CHECKBOX/PHONE deferred.
- **Visual approach:** Full card-based overhaul, mobile-first, same design language (blue `#1E88E5`, shadcn/ui, Framer Motion).

---

## Responsive Breakpoints

| Breakpoint | Behaviour |
|---|---|
| `< sm` (mobile) | Single column, full-width inputs, min 44px tap targets |
| `sm–md` (tablet) | 2-column grid for paired fields (date+time, price+tickets) |
| `lg+` (desktop) | Same as tablet with more generous padding |

---

## Step Redesigns

### Step 1 — Event Details
- Name + description: full width, stacked
- Category: pill/button grid (existing pattern, kept)
- Banner: large drop-zone card with drag-and-drop hint text, preview on selection
- All fields in a single white card with a "Event Details" header

### Step 2 — Date, Location & Tickets
- Location: full-width input (becomes optional when virtual event is enabled in Step 4)
- Date + time: 2-column grid
- Ticket categories: each category in its own card, remove button in card header row; price/maxTickets/maxAdmissions in 3-col grid on sm+, stacked on mobile

### Step 3 — Review & Pricing
- Two-panel summary on desktop (event details left, ticket categories right), stacked on mobile
- Fee mode toggle (existing, kept)
- Revenue projection card at bottom (existing, kept)
- Confirmation checkbox (existing, kept)

### Step 4 — Advanced Settings (new)
Four toggle-gated sections. Each section starts collapsed. Toggling on reveals fields with a Framer Motion height animation.

#### Section A: Access Type
- Toggle label: "Invite-Only Event"
- Default: off (`accessType = PUBLIC`)
- When on: `accessType = INVITE_ONLY` + info callout: *"Only invited people can purchase tickets. Manage invites from your event dashboard after creating."*
- No extra fields — invitees managed post-creation (Subsystem 2)

#### Section B: Virtual Event
- Toggle label: "This is a virtual event"
- Default: off (`isVirtual = false`)
- When on:
  - `virtualLink`: URL input (required when isVirtual = true)
  - `virtualLinkReleaseAt`: datetime-local input, optional — when to release the link to attendees

#### Section C: Recurring Occurrences
- Toggle label: "This event has multiple occurrences"
- Default: off (`isRecurring = false`)
- When on:
  - Occurrence list — each card contains: `startsAt` (date), time, optional `locationOverride`
  - "Add Occurrence" button appends a new blank card
  - Individual remove button on each card (min 1 required when toggle is on)
  - `endsAt` optional per occurrence (end time input)

#### Section D: Custom Checkout Fields
- Toggle label: "Collect extra info at checkout"
- Default: off
- When on:
  - Field builder list — each field card contains:
    - `label`: text input
    - `fieldType`: select (Text / Long Text / Dropdown / Number / Email)
    - `required`: toggle
    - `options`: tag-style multi-input, only visible when fieldType = SELECT/Dropdown
  - "Add Field" button appends a new blank field card
  - Up/down reorder buttons per field
  - Remove button per field

---

## Schema Changes

### `event-form-schema.ts`

New sub-schemas:
```ts
occurrenceSchema = z.object({
  id: z.string(),                     // local React key only
  startsAt: z.string().min(1),
  endsAt: z.string().optional(),
  locationOverride: z.string().optional(),
})

customFieldSchema = z.object({
  id: z.string(),                     // local React key only
  label: z.string().min(1),
  fieldType: z.enum(["TEXT","TEXTAREA","SELECT","NUMBER","EMAIL"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
})
```

New fields added to `eventFormSchema` and `updateEventFormSchema`:
```ts
accessType: z.enum(["PUBLIC","INVITE_ONLY"]).default("PUBLIC")
isVirtual: z.boolean().default(false)
virtualLink: z.string().url().optional()
virtualLinkReleaseAt: z.string().optional()
isRecurring: z.boolean().default(false)
occurrences: z.array(occurrenceSchema).optional()
customFields: z.array(customFieldSchema).optional()
```

Validation rules:
- `virtualLink` required when `isVirtual = true`
- `occurrences` must have length ≥ 1 when `isRecurring = true`
- `customFields[*].options` must have length ≥ 1 when `fieldType = SELECT`

### `types/events-v2.type.ts`

Add:
```ts
interface EventOccurrence {
  id: string
  startsAt: string
  endsAt?: string
  locationOverride?: string
  isActive: boolean
}

interface EventCustomField {
  id: string
  label: string
  fieldType: "TEXT" | "TEXTAREA" | "SELECT" | "NUMBER" | "EMAIL"
  required: boolean
  options?: string[]
  position: number
}
```

Extend `EventV2`:
```ts
accessType: "PUBLIC" | "INVITE_ONLY"
isVirtual: boolean
virtualLink?: string
virtualLinkReleaseAt?: string
isRecurring: boolean
recurrenceRule?: string
occurrences?: EventOccurrence[]
customFields?: EventCustomField[]
```

---

## Service Layer

No new endpoints. `events-v2.ts` `createEvent` and `updateEvent` already use `FormData`. New array fields (`occurrences`, `customFields`) are `JSON.stringify`-ed before appending, matching the existing pattern for `ticketCategories`. Scalar booleans (`isVirtual`, `isRecurring`) appended as strings (`"true"`/`"false"`).

---

## Files Changed

| File | Change |
|---|---|
| `app/organizer/_components/event-form-schema.ts` | Extend schema + types |
| `app/organizer/_components/event-form-step1.tsx` | Visual overhaul |
| `app/organizer/_components/event-form-step2.tsx` | Visual overhaul |
| `app/organizer/_components/event-form-step3.tsx` | Visual overhaul |
| `app/organizer/_components/event-form-step4.tsx` | New — Advanced Settings |
| `app/organizer/_components/progress-bar.tsx` | 3 → 4 steps |
| `app/organizer/_components/form-navigation.tsx` | 3 → 4 steps |
| `app/organizer/create-event/page.tsx` | Wire step 4 |
| `app/organizer/update-event/[id]/page.tsx` | Wire step 4 |
| `services/events/events-v2.ts` | Send new fields in FormData |
| `types/events-v2.type.ts` | Add new types |

---

## Out of Scope

- Recurring event pattern generator (manual occurrence list only for now)
- RADIO, CHECKBOX, PHONE custom field types
- Invitee management UI (Subsystem 2)
- Shareable invite link generation (Subsystem 2)
