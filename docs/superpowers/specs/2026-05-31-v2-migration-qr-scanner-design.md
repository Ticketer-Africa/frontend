# Design: V2 Query Migration + QR Camera Scanner

**Date:** 2026-05-31  
**Branch:** staging  
**Status:** Approved

---

## Task 1: V2 Query Migration

### Goal

Migrate the explore page and organizer dashboard from v1 event endpoints to v2, so `displayPrice` (the attendee-facing price after feeMode calculation) is shown on event cards instead of the raw `price`.

### Scope

- `services/events/events-v2.ts` — add two fetch functions
- `services/events/events-v2.queries.ts` — add two hooks
- `app/explore/page.tsx` — swap to v2 hook and type
- `app/explore/explore-event-card.tsx` — accept `EventV2`, show `displayPrice`
- `app/explore/utils.ts` — update `getTicketStats` to accept `EventV2` (currently typed to `Event`)
- `app/organizer/page.tsx` — swap to v2 hook and type

Everything else (admin events, event detail page, tickets) stays on v1.

### Service Layer

Add to `services/events/events-v2.ts`:

```ts
getAllEventsV2(page?, name?, minPrice?, maxPrice?) → Promise<PaginatedResponse<EventV2>>
getOrganizerEventsV2() → Promise<EventV2[] | PaginatedResponse<EventV2>>
```

Both hit `GET /api/v2/events/` and `GET /api/v2/events/organizer/my` respectively, matching the same query-param shape as v1.

### Query Hooks

Add to `services/events/events-v2.queries.ts`:

```ts
useAllEventsV2(page?, name?, minPrice?, maxPrice?)
useOrganizerEventsV2()
```

Cache config mirrors v1: `staleTime: 5min`, `gcTime: 30min`, `refetchOnMount: false`, `refetchOnWindowFocus: false`.

### Explore Page

- Replace `useAllEvents` with `useAllEventsV2`
- Replace `Event` type with `EventV2`
- In `priceRangeError` fallback effect: use `cat.displayPrice` (not `cat.price`) when computing price bounds from events

### ExploreEventCard

- Prop type: `Event` → `EventV2`
- `lowestPrice` = `Math.min(...ticketCategories.map(t => t.displayPrice))`
- Ticket row label: show `displayPrice` instead of `price`

### Organizer Dashboard

- Replace `useOrganizerEvents` with `useOrganizerEventsV2`
- Replace `Event[]` type with `EventV2[]`
- Revenue stat: keeps `minted × cat.price` (organizer earnings, not attendee-facing price)
- No visual changes — `displayPrice` is not surfaced in the dashboard list

---

## Task 2: QR Camera Scanner

### Goal

Add a live camera-based QR scanner to `app/verify-ticket/page.tsx` so door staff can scan tickets directly from the browser. The existing URL-param flow is preserved for backward compatibility.

### Library

`@zxing/browser` + `@zxing/library` (peer dep). Dynamically imported (`dynamic(() => ..., { ssr: false })`) to avoid SSR issues with browser camera APIs.

### Page Modes

| Mode | Trigger | Behaviour |
|------|---------|-----------|
| `url-param` | `?data=` query param present on load | Auto-verifies immediately (existing flow, unchanged) |
| `camera` | No `?data=` param | Shows camera viewfinder, scans in real time |

A toggle button is always visible so staff can switch between modes.

### New Component: `QRCameraScanner`

Location: `app/verify-ticket/QRCameraScanner.tsx`

Responsibilities:
- Mounts a `<video>` element and starts `BrowserQRCodeReader` from `@zxing/browser`
- Calls `onScan(rawText: string)` on first successful decode then stops scanning (to prevent duplicate calls)
- Stops the reader on unmount (cleanup)
- Shows a permission-denied error state with fallback instructions if camera access is refused
- Accepts an `active` prop — when set to `false`, stops the reader (used when result is showing)

Props:
```ts
interface QRCameraScannerProps {
  onScan: (rawText: string) => void;
  active: boolean;
}
```

### Verify-Ticket Page Changes

1. **Mode detection on load:** if `searchParams.get('data')` is present → `url-param` mode. Otherwise → `camera` mode.
2. **`onScan` callback:** parses raw text via existing `parseTicketData`, calls `verifyTicket` mutation, sets `verification` state — same logic as the existing `useEffect`, extracted into a shared `handleVerify(parsedData)` function.
3. **After result:** scanner stops (`active={false}`). Result card renders with:
   - Existing pass/fail UI
   - **"Scan Next Ticket"** button in the action row (replaces or sits beside existing buttons)
   - Clicking it resets `verification`, `ticketData`, `error` and sets `active` back to `true`
4. **Toggle button:** "Use Camera" / "Switch to URL mode" — visible in both modes, allows manual override.
5. **Camera permission denied:** renders a message card explaining how to grant permission, with a retry button.

### Flow Diagram

```
Load (no ?data=)
  └─→ camera mode → viewfinder active
        └─→ QR decoded → handleVerify()
              └─→ verifying spinner
                    └─→ result card (pass / fail)
                          ├─→ [Scan Next Ticket] → reset → viewfinder active
                          └─→ [Close] → home

Load (?data= present)
  └─→ url-param mode → auto handleVerify() on mount → result card
```

### Scanner State Reset (Scan Next Ticket)

Resets: `verification = null`, `ticketData = null`, `error = ""`, scanner `active = true`.  
The `QRCameraScanner` component responds to `active` prop change and restarts `BrowserQRCodeReader`.
