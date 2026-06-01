# V2 Query Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the explore page and organizer dashboard from v1 event endpoints to v2 so `displayPrice` (attendee-facing price after fee calculation) is shown on event cards instead of raw `price`.

**Architecture:** Add `getAllEventsV2` and `getOrganizerEventsV2` service functions and matching React Query hooks to the existing v2 files. Update utils, grid, and card components to use `EventV2` types. Swap hook imports in the two pages. Revenue in the organizer dashboard stays on `cat.price` (organizer earnings).

**Tech Stack:** Next.js App Router, React Query (`@tanstack/react-query`), TypeScript, Tailwind CSS, shadcn/ui

---

## File Map

| File | Action | Change |
|------|--------|--------|
| `services/events/events-v2.ts` | Modify | Add `getAllEventsV2`, `getOrganizerEventsV2` |
| `services/events/events-v2.queries.ts` | Modify | Add `useAllEventsV2`, `useOrganizerEventsV2` |
| `app/explore/utils.ts` | Modify | Change `Event` → `EventV2` throughout |
| `app/explore/events-grid.tsx` | Modify | Change prop type `Event[]` → `EventV2[]` |
| `app/explore/explore-event-card.tsx` | Modify | Change prop type to `EventV2`, use `displayPrice` |
| `app/explore/page.tsx` | Modify | Swap hook and type imports to v2 |
| `app/organizer/page.tsx` | Modify | Swap hook and type imports to v2 |

---

## Task 1: Add v2 service functions

**Files:**
- Modify: `services/events/events-v2.ts`

- [ ] **Step 1: Add `getAllEventsV2` and `getOrganizerEventsV2` to the service file**

Open `services/events/events-v2.ts`. After the existing `getEventByIdV2` function, add:

```ts
export const getAllEventsV2 = async (
  page?: number,
  name?: string,
  minPrice?: number,
  maxPrice?: number,
) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (name) params.append("name", name);
  if (minPrice !== undefined) params.append("minPrice", minPrice.toString());
  if (maxPrice !== undefined) params.append("maxPrice", maxPrice.toString());

  const endpoint = buildEndpoint(
    API_VERSION,
    `events${params.toString() ? "?" + params.toString() : ""}`,
  );
  const res = await axios.get(endpoint);
  return res.data;
};

export const getOrganizerEventsV2 = async () => {
  const endpoint = buildEndpoint(API_VERSION, "events/organizer/my");
  const res = await axios.get(endpoint);
  return res.data;
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/admin/Documents/ticketerafrica/frontend
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to `events-v2.ts`.

- [ ] **Step 3: Commit**

```bash
git add services/events/events-v2.ts
git commit -m "feat(v2): add getAllEventsV2 and getOrganizerEventsV2 service functions"
```

---

## Task 2: Add v2 query hooks

**Files:**
- Modify: `services/events/events-v2.queries.ts`

- [ ] **Step 1: Add `useAllEventsV2` and `useOrganizerEventsV2` hooks**

Open `services/events/events-v2.queries.ts`. At the top, update the import to include the new functions:

```ts
import * as eventsV2API from "@/services/events/events-v2";
```

(It already imports this — no change needed. Just add the hooks below the existing ones.)

Add after `useUpdateEventV2`:

```ts
export const useAllEventsV2 = (
  page?: number,
  name?: string,
  minPrice?: number,
  maxPrice?: number,
) => {
  return useQuery({
    queryKey: ["eventsV2", page, name, minPrice, maxPrice],
    queryFn: () => eventsV2API.getAllEventsV2(page, name, minPrice, maxPrice),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });
};

export const useOrganizerEventsV2 = () => {
  return useQuery({
    queryKey: ["eventsV2", "organizer"],
    queryFn: eventsV2API.getOrganizerEventsV2,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add services/events/events-v2.queries.ts
git commit -m "feat(v2): add useAllEventsV2 and useOrganizerEventsV2 hooks"
```

---

## Task 3: Update explore utils to use EventV2

**Files:**
- Modify: `app/explore/utils.ts`

- [ ] **Step 1: Replace `Event` with `EventV2` throughout utils.ts**

Replace the entire file content:

```ts
import { EventV2 } from "@/types/events-v2.type";

export function extractLocations(events: EventV2[]): string[] {
  const locationSet = new Set<string>();

  for (const event of events) {
    if (!event.location) continue;
    const parts = event.location.split(",");
    const loc = parts.length > 1 ? parts[1].trim() : event.location.trim();
    if (loc) locationSet.add(loc);
  }

  return Array.from(locationSet);
}

export function filterEvents(
  events: EventV2[],
  selectedLocation: string,
  selectedCategory: string,
): EventV2[] {
  if (!selectedLocation && !selectedCategory) {
    return events;
  }

  return events.filter((event) => {
    const matchesLocation =
      !selectedLocation || event.location.includes(selectedLocation);
    const matchesCategory =
      !selectedCategory ||
      event.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesLocation && matchesCategory;
  });
}

export function getTicketStats(event: EventV2) {
  const ticketCategories = event.ticketCategories || [];
  const maxTickets = ticketCategories.reduce((sum, t) => sum + t.maxTickets, 0);
  const mintedTickets = ticketCategories.reduce((sum, t) => sum + t.minted, 0);
  const ticketsAvailable = maxTickets - mintedTickets;

  return { ticketCategories, maxTickets, mintedTickets, ticketsAvailable };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: type errors in `events-grid.tsx` and `explore-event-card.tsx` (still on `Event`) — that's correct, they'll be fixed in the next tasks.

- [ ] **Step 3: Commit**

```bash
git add app/explore/utils.ts
git commit -m "feat(v2): update explore utils to use EventV2 types"
```

---

## Task 4: Update EventsGrid and ExploreEventCard to EventV2

**Files:**
- Modify: `app/explore/events-grid.tsx`
- Modify: `app/explore/explore-event-card.tsx`

- [ ] **Step 1: Update EventsGrid prop type**

In `app/explore/events-grid.tsx`, replace:

```ts
import { Event } from "@/types/events.type";

interface EventsGridProps {
  events: Event[];
}
```

With:

```ts
import { EventV2 } from "@/types/events-v2.type";

interface EventsGridProps {
  events: EventV2[];
}
```

- [ ] **Step 2: Update ExploreEventCard**

In `app/explore/explore-event-card.tsx`, make the following changes:

Replace the import:
```ts
import { Event } from "@/types/events.type";
```
With:
```ts
import { EventV2 } from "@/types/events-v2.type";
```

Replace the props interface:
```ts
interface ExploreEventCardProps {
  event: EventV2;
  isPriority?: boolean;
}
```

Replace the `lowestPrice` calculation (currently uses `t.price`) with `displayPrice`:
```ts
const lowestPrice = ticketCategories.length
  ? Math.min(...ticketCategories.map((t) => t.displayPrice))
  : 0;
```

In the ticket row JSX, replace:
```tsx
<span className="line-clamp-1">
  {ticket.name} (
  {ticket.price === 0 ? "Free" : formatPrice(ticket.price)})
</span>
```
With:
```tsx
<span className="line-clamp-1">
  {ticket.name} (
  {ticket.displayPrice === 0 ? "Free" : formatPrice(ticket.displayPrice)})
</span>
```

Also update the component function signature:
```ts
function ExploreEventCardComponent({
  event,
  isPriority = false,
}: ExploreEventCardProps) {
```
(No change to the signature itself — just ensure the type flows through correctly.)

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: errors now only in `app/explore/page.tsx` (still using `Event` and v1 hooks) — correct.

- [ ] **Step 4: Commit**

```bash
git add app/explore/events-grid.tsx app/explore/explore-event-card.tsx
git commit -m "feat(v2): update EventsGrid and ExploreEventCard to use EventV2 with displayPrice"
```

---

## Task 5: Migrate explore page to v2

**Files:**
- Modify: `app/explore/page.tsx`

- [ ] **Step 1: Replace imports**

In `app/explore/page.tsx`, replace:

```ts
import { useAllEvents, usePriceRange } from "@/services/events/events.queries";
import { Event } from "@/types/events.type";
```

With:

```ts
import { usePriceRange } from "@/services/events/events.queries";
import { useAllEventsV2 } from "@/services/events/events-v2.queries";
import { EventV2 } from "@/types/events-v2.type";
```

- [ ] **Step 2: Replace hook call**

Find:
```ts
const {
  data: response,
  isLoading: eventsLoading,
  isFetching,
} = useAllEvents(
  currentPage,
  appliedSearch || undefined,
  priceSliderRange && priceSliderRange[0] > priceBounds.min
    ? priceSliderRange[0]
    : undefined,
  priceSliderRange && priceSliderRange[1] < priceBounds.max
    ? priceSliderRange[1]
    : undefined,
);
```

Replace with:
```ts
const {
  data: response,
  isLoading: eventsLoading,
  isFetching,
} = useAllEventsV2(
  currentPage,
  appliedSearch || undefined,
  priceSliderRange && priceSliderRange[0] > priceBounds.min
    ? priceSliderRange[0]
    : undefined,
  priceSliderRange && priceSliderRange[1] < priceBounds.max
    ? priceSliderRange[1]
    : undefined,
);
```

- [ ] **Step 3: Update the events/meta destructure type annotation**

Find:
```ts
const { events, meta } = useMemo(() => {
  let events: Event[] = [];
```

Replace with:
```ts
const { events, meta } = useMemo(() => {
  let events: EventV2[] = [];
```

- [ ] **Step 4: Update the price-bounds fallback effect**

Find the effect that computes price bounds from events (the `priceRangeError` effect). Replace:

```ts
events.forEach((event) => {
  // Check event.price
  if (event.price > 0) {
    minFound = Math.min(minFound, event.price);
    maxFound = Math.max(maxFound, event.price);
  }
  // Check ticket categories
  event.ticketCategories?.forEach((cat) => {
    if (cat.price > 0) {
      minFound = Math.min(minFound, cat.price);
      maxFound = Math.max(maxFound, cat.price);
    }
  });
});
```

With:

```ts
events.forEach((event) => {
  event.ticketCategories?.forEach((cat) => {
    if (cat.displayPrice > 0) {
      minFound = Math.min(minFound, cat.displayPrice);
      maxFound = Math.max(maxFound, cat.displayPrice);
    }
  });
});
```

- [ ] **Step 5: Verify TypeScript compiles with no errors**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in explore files.

- [ ] **Step 6: Commit**

```bash
git add app/explore/page.tsx
git commit -m "feat(v2): migrate explore page to useAllEventsV2 with displayPrice"
```

---

## Task 6: Migrate organizer dashboard to v2

**Files:**
- Modify: `app/organizer/page.tsx`

- [ ] **Step 1: Replace imports**

In `app/organizer/page.tsx`, replace:

```ts
import {
  useDeleteEvent,
  useOrganizerEvents,
} from "@/services/events/events.queries";
import { Event } from "@/types/events.type";
```

With:

```ts
import { useDeleteEvent } from "@/services/events/events.queries";
import { useOrganizerEventsV2 } from "@/services/events/events-v2.queries";
import { EventV2 } from "@/types/events-v2.type";
```

- [ ] **Step 2: Replace hook call**

Find:
```ts
const { data: organizerEventList, isLoading: eventsLoading } =
  useOrganizerEvents();
```

Replace with:
```ts
const { data: organizerEventList, isLoading: eventsLoading } =
  useOrganizerEventsV2();
```

- [ ] **Step 3: Update Event type references**

Find:
```ts
const organizerEvents: Event[] = Array.isArray(organizerEventList)
  ? organizerEventList
  : organizerEventList?.data ?? [];
```

Replace with:
```ts
const organizerEvents: EventV2[] = Array.isArray(organizerEventList)
  ? organizerEventList
  : organizerEventList?.data ?? [];
```

Find in the events list map:
```ts
{organizerEvents?.map((event: Event, index: number) => (
```

Replace with:
```ts
{organizerEvents?.map((event: EventV2, index: number) => (
```

Find in totalRevenue calculation:
```ts
const totalRevenue =
  organizerEvents?.reduce((sum, event: Event) => {
```

Replace with:
```ts
const totalRevenue =
  organizerEvents?.reduce((sum, event: EventV2) => {
```

Find in totalTicketsSold calculation:
```ts
organizerEvents?.reduce((eventsum, event: Event) => {
```

Replace with:
```ts
organizerEvents?.reduce((eventsum, event: EventV2) => {
```

- [ ] **Step 4: Verify TypeScript compiles with no errors**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/organizer/page.tsx
git commit -m "feat(v2): migrate organizer dashboard to useOrganizerEventsV2"
```

---

## Task 7: Manual browser verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify explore page**

Open `http://localhost:3000/explore`. Confirm:
- Events load and display correctly
- Price badge on cards shows the correct display price (should match what the attendee pays)
- Ticket option rows show the display price
- Search and filter still work
- Pagination still works

- [ ] **Step 3: Verify organizer dashboard**

Log in as an organizer and open `http://localhost:3000/organizer`. Confirm:
- Events list loads
- Stats cards (Total Events, Tickets Sold, Net Earnings) show correct values
- Net Earnings uses `cat.price` (organizer earnings), not `displayPrice`

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -p
git commit -m "fix(v2): address browser verification issues"
```
