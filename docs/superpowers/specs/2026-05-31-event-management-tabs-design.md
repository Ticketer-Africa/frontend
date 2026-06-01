# Event Management Tabs — Design Spec

**Date:** 2026-05-31  
**Page:** `app/organizer/view-event/[id]/page.tsx`  
**Status:** Approved

---

## Overview

Add a tabbed management panel below the existing Analytics card on the organizer event dashboard. The panel has three tabs: **Discount Codes**, **Invites** (invite-only events only), and **Attendee Messaging**. Each tab is self-contained with its own queries and mutations.

---

## Service Layer

### Extend `services/discounts/discounts.ts`

Add organizer-side functions alongside the existing `applyDiscountCode`:

- `createDiscount(eventId: string, payload: CreateDiscountPayload): Promise<Discount>`  
  `POST /api/v2/events/:id/discounts`  
  Payload: `{ code, type: "PERCENT" | "FLAT", value, usageLimit?: number }`

- `listDiscounts(eventId: string): Promise<Discount[]>`  
  `GET /api/v2/events/:id/discounts`

Add to `services/discounts/discounts.queries.ts`:
- `useListDiscounts(eventId)` — `useQuery`, queryKey `["discounts", eventId]`
- `useCreateDiscount()` — `useMutation`, invalidates `["discounts", eventId]` on success

### New `services/invites/invites.ts`

- `listInvites(eventId): Promise<Invite[]>` — `GET /api/v2/events/:id/invites`
- `addInvitee(eventId, { email, name }): Promise<Invite>` — `POST /api/v2/events/:id/invites`
- `resendInvite(eventId, inviteId): Promise<void>` — `POST /api/v2/events/:id/invites/:inviteId/resend`
- `regenerateToken(eventId, inviteId): Promise<Invite>` — `POST /api/v2/events/:id/invites/:inviteId/regenerate-token`
- `removeInvitee(eventId, inviteId): Promise<void>` — `PATCH /api/v2/events/:id/invites/:inviteId/remove`
- `generateShareableLink(eventId): Promise<ShareableLink>` — `POST /api/v2/events/:id/invites/shareable`
- `revokeShareableLink(eventId): Promise<void>` — `DELETE /api/v2/events/:id/invites/shareable`

`services/invites/invites.queries.ts`:
- `useListInvites(eventId)` — `useQuery`, queryKey `["invites", eventId]`
- `useAddInvitee()` — `useMutation`, invalidates `["invites", eventId]`
- `useResendInvite()` — `useMutation`
- `useRegenerateToken()` — `useMutation`, invalidates `["invites", eventId]`
- `useRemoveInvitee()` — `useMutation`, invalidates `["invites", eventId]`
- `useGenerateShareableLink()` — `useMutation`, invalidates `["invites", eventId]`
- `useRevokeShareableLink()` — `useMutation`, invalidates `["invites", eventId]`

### New `services/messages/messages.ts`

- `sendMessage(eventId, { subject, body, scheduledFor?: string }): Promise<void>`  
  `POST /api/v2/events/:id/messages`

`services/messages/messages.queries.ts`:
- `useSendMessage()` — `useMutation`, shows success toast on completion

---

## Page Change: Fetch by ID

Replace the current `useOrganizerEvents()` + array filter pattern in `page.tsx` with a direct lookup:

Add `getEventByIdV2(id: string)` to `services/events/events-v2.ts`:
- `GET /api/v2/events/:id`

Add `useEventByIdV2(id)` to `services/events/events-v2.queries.ts`:
- queryKey `["eventV2", id]`, `enabled: !!id`

Update `page.tsx` to use this hook. The `EventV2` type already includes `accessType: "PUBLIC" | "INVITE_ONLY"` which is needed to gate the Invites tab.

---

## New Component: `EventManagementTabs.tsx`

**Location:** `app/organizer/view-event/[id]/EventManagementTabs.tsx`

**Props:**
```ts
interface EventManagementTabsProps {
  eventId: string;
  accessType: "PUBLIC" | "INVITE_ONLY";
  eventSlug: string;
}
```

**Structure:** shadcn `<Tabs>` with `<TabsList>` + `<TabsContent>` per section, wrapped in a white `<Card>` with `CardHeader` / `CardContent`, Framer Motion entrance animation (`initial={{ opacity: 0, y: 20 }}`).

### Tab: Discount Codes (always visible)

- **Create form:** fields for `code` (text), `type` (Select: PERCENT / FLAT), `value` (number), `usageLimit` (number, optional). Submit calls `useCreateDiscount`. Form resets on success.
- **List:** table with columns: Code, Type, Value, Usage Limit, Used. Populated by `useListDiscounts`. Shows `Loader2` while loading.

### Tab: Invites (only when `accessType === "INVITE_ONLY"`)

Subsection 1 — **Individual Invites:**
- Add form: `email` + `name` inputs, submit calls `useAddInvitee`. Resets on success.
- Table of invitees: Name, Email, Status, Actions (Resend | Regenerate Token | Remove). Each action calls the corresponding mutation and shows a toast.

Subsection 2 — **Shareable Link:**
- Derives from `useListInvites` response or a dedicated field on the invite list response indicating a shareable token exists.
- If a link exists: show `${window.location.origin}/invite/shareable?s={token}&eventSlug={slug}` in a monospace box with a Copy button, plus a Revoke button.
- If no link exists: show a "Generate Shareable Link" button calling `useGenerateShareableLink`.

### Tab: Attendee Messaging (always visible)

- Compose form: `subject` (text input), `body` (textarea), `scheduledFor` (datetime-local input, optional).
- Send button calls `useSendMessage`. Shows success toast. Form resets on success.

---

## Integration in `page.tsx`

After the Analytics card motion block, add:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.7 }}
  className="mt-8"
>
  <EventManagementTabs
    eventId={event.id}
    accessType={event.accessType}
    eventSlug={event.slug}
  />
</motion.div>
```

---

## Error Handling

- All mutations use `useToast()` for success and error feedback (same pattern as existing code).
- Loading states: `Loader2` spinner in each tab's list area while the query is fetching.
- Form fields are disabled while a mutation is in-flight (`isPending`).
- No optimistic updates — wait for server confirmation before invalidating queries.

---

## Out of Scope

- Pagination of discount/invite lists (not needed at current scale).
- Editing an existing discount code.
- Viewing message send history.
