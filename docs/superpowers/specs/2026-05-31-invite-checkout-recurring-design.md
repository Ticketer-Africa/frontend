# Invite Flows, Custom Fields & Recurring Occurrences — Design Spec

**Date:** 2026-05-31  
**Branch:** staging  
**Status:** Approved

---

## Overview

Four features added to the ticketing frontend:

1. Shareable invite OTP flow (`app/invite/shareable/page.tsx`)
2. Personal invite token resolution (`app/invite/page.tsx`)
3. Custom field responses at checkout (`app/checkout/page.tsx`)
4. Recurring occurrence selector on the event page (`app/events/[slug]/page.tsx`)

---

## 1. Shareable Invite OTP Flow

### Route
`app/invite/shareable/page.tsx` — reads `?s=[shareableToken]&eventSlug=[slug]` from the URL.

### UI
Hero gradient card (blue, `#1E88E5` → `#1565C0`) showing event name at the top. Form content swaps in-place between steps — the card never navigates away until step 3 redirect.

**Step 1 — Email entry**
- Fetch event info via `GET /api/v2/events/slug/:slug` to populate the hero (name, date, location)
- Email input + "Request Access" button
- On submit: `POST /api/v2/events/shareable/request-access` with `{ shareableToken, email }`
- On success: advance to step 2
- On error: inline error below the input

**Step 2 — OTP entry**
- "We sent a code to [email]" label
- Centered narrow input (~180px width), `font-size: 22px`, `letter-spacing: 8px`, `text-align: center`
- "Verify" button (full width)
- "Resend code" link (re-calls request-access) · "Change email" link (returns to step 1, clears email)
- On submit: `POST /api/v2/events/shareable/verify-otp` with `{ shareableToken, email, otp }`
- On success: redirect to `/events/[eventSlug]?accessToken=[accessToken]`
- On bad OTP: inline error below input; no toast
- On network failure: toast error

**Step 3 — Redirect**
No UI step; the router push happens immediately on successful verify.

### State
Local component state only (`step`, `email`, `otp`, `error`, `isLoading`). No React Query — these are one-shot mutations via `fetch` or axios directly.

### Error cases
- Missing or malformed `?s=` or `?eventSlug=` params → show "Invalid invite link" message, no form rendered
- Event fetch failure → show "Event not found" fallback

---

## 2. Personal Invite Token Resolution

### Route
`app/invite/page.tsx` — existing page, extended.

### Logic
When `?i=[token]` is present in the URL:
- On mount, call `GET /api/v2/events/invite/resolve?i=[token]`
- Response: `{ event, invitee: { name, email } }`
- Write to `sessionStorage`:
  ```json
  { "inviteToken": "...", "guestName": "Jane Doe", "guestEmail": "jane@example.com" }
  ```
- Redirect to `/events/[event.slug]` so the user can select tickets normally

The existing `?inviteId=&email=` path (auto-accept flow) is unchanged.

### Checkout integration
- Checkout page reads `sessionStorage.getItem("inviteSession")` on mount
- Pre-fills the first recipient's name and email fields (or a dedicated guest info section if no recipients toggle)
- Adds `inviteToken` to `BuyTicketsV2Payload`

### Type change
```ts
// types/tickets-v2.type.ts
export interface BuyTicketsV2Payload {
  eventId: string;
  ticketCategories: TicketPurchaseItemV2[];
  discountCode?: string;
  inviteToken?: string;           // added
  occurrenceId?: string;          // added
  customFieldResponses?: CustomFieldResponse[];  // added
}

export interface CustomFieldResponse {
  customFieldId: string;
  value: string;
}
```

---

## 3. Custom Fields at Checkout

### SessionStorage contract
Event page writes `customFields: EventCustomField[]` into `checkoutData` when navigating to checkout:
```json
{
  "eventId": "...",
  "eventName": "...",
  "tickets": [...],
  "occurrenceId": "...",
  "customFields": [...]
}
```

`CheckoutData` interface in `checkout/page.tsx` is updated to match.

### UI placement
When `checkoutData.customFields` is non-empty, render an **"Additional Info"** card in the main column, below the recipients card (or below the recipients toggle if no recipients).

### Field rendering (sorted by `position`)
| `fieldType` | Component |
|---|---|
| `TEXT` | `<Input type="text">` |
| `EMAIL` | `<Input type="email">` |
| `NUMBER` | `<Input type="number">` |
| `TEXTAREA` | `<Textarea>` |
| `SELECT` | shadcn `<Select>` with `options[]` |

Required fields show a red asterisk (`*`) next to the label.

### Validation
`validateCustomFields()` runs before `validateRecipients()` in `handlePurchase`. Required fields with empty values add to `validationErrors` under key `cf-[customFieldId]`. Inline error shown below the field.

### Payload
`customFieldResponses` is built from state at purchase time and spread into `BuyTicketsV2Payload`.

---

## 4. Recurring Occurrence Selector

### Placement
Inside the tickets panel (right column on desktop, below event info on mobile), above the ticket category cards. Only rendered when `event.isRecurring === true && event.occurrences?.length > 0`.

### UI
- Section label: "Select a date" 
- Pill chips: one per occurrence, showing short date (e.g. "Jun 7"). Full datetime + locationOverride shown as a subtitle under selected chip or via tooltip.
- Selected chip: `border-2 border-[#1E88E5] bg-blue-50 text-[#1E88E5]`
- Unselected: `border border-border bg-background text-foreground`
- Only active occurrences (`isActive: true`) are shown
- A warning nudge ("Pick a date to unlock tickets") is shown when no occurrence is selected

### Gating
When no occurrence is selected:
- Ticket category cards rendered with `opacity-40 blur-[1px] pointer-events-none`
- "Proceed to Checkout" / mobile CTA button disabled

When an occurrence is selected, gating lifts and tickets become interactive.

### State & sessionStorage
`selectedOccurrenceId: string | null` in component state. Written into `checkoutData.occurrenceId` when `handleCheckout` fires.

---

## Files Changed

| File | Change |
|---|---|
| `app/invite/shareable/page.tsx` | New file |
| `app/invite/page.tsx` | Add `?i=` branch |
| `app/checkout/page.tsx` | Custom fields section, inviteToken pre-fill, occurrenceId passthrough |
| `app/events/[slug]/page.tsx` | Occurrence selector |
| `types/tickets-v2.type.ts` | Add `inviteToken`, `occurrenceId`, `customFieldResponses` to payload |

No new services/queries needed — shareable OTP uses direct axios calls; everything else extends existing patterns.
