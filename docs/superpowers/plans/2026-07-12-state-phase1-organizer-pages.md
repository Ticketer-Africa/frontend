# State Management Refactor — Phase 1 (Organizer Dashboard & Event Forms) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the organizer dashboard's event list from re-rendering on every delete-dialog toggle, de-duplicate its per-event stats math into one helper, and fix a render-time blob-URL leak plus duplicated validation logic across the two event-form pages.

**Architecture:** Three independent changes in `frontend/`: (1) `lib/event-stats.ts` (new) + `app/organizer/page.tsx` — extract a pure stats helper, memoize the page-level aggregate, extract a `memo`-wrapped `EventRow`. (2) `app/organizer/create-event/page.tsx` + `app/organizer/update-event/[id]/page.tsx` — move the `previewUrl` blob-URL creation out of the render body into a `useEffect` keyed on the actual `File` reference. (3) `app/organizer/_components/event-form-validation.ts` (new) + both event-form pages — extract the two duplicated step-validity checks into shared pure functions, wrapped in `useMemo` at each call site.

**Tech Stack:** Next.js (App Router), React, React Hook Form + Zod, TypeScript. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-12-state-phase1-organizer-pages-design.md`

---

## Before you start

Same as Phase 0: no frontend test runner exists in this repo. Verification is
`npx tsc --noEmit` plus manual dev-server checks. Run all commands from `frontend/`.

Before Task 1, capture the current baseline:

```bash
npx tsc --noEmit 2>&1 | wc -l
```

Expected: `19` (the same pre-existing, unrelated errors from Phase 0 — see
`docs/superpowers/specs/2026-07-11-state-foundations-design.md`). If you get a
different number, stop and figure out why before proceeding.

---

### Task 1: Dashboard — shared stats helper + memoized aggregate + memoized row

**Files:**
- Create: `lib/event-stats.ts`
- Modify: `app/organizer/page.tsx` (full-file rewrite — see Step 2)

- [ ] **Step 1: Create the stats helper**

Create `lib/event-stats.ts`:

```ts
export interface TicketCategoryStats {
  minted?: number;
  maxTickets: number;
  price: number;
}

export interface EventTicketStats {
  sold: number;
  total: number;
  revenue: number;
  percentSold: number;
}

export function getEventTicketStats(
  ticketCategories: TicketCategoryStats[] | undefined,
): EventTicketStats {
  const sold =
    ticketCategories?.reduce((sum, cat) => sum + (cat.minted || 0), 0) ?? 0;
  const total =
    ticketCategories?.reduce((sum, cat) => sum + (cat.maxTickets || 0), 0) ?? 0;
  const revenue =
    ticketCategories?.reduce(
      (sum, cat) => sum + (cat.minted || 0) * (cat.price || 0),
      0,
    ) ?? 0;
  const percentSold = total > 0 ? Math.round((sold / total) * 100) : 0;
  return { sold, total, revenue, percentSold };
}
```

- [ ] **Step 2: Rewrite `app/organizer/page.tsx`**

Replace the entire file with:

```tsx
"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Calendar,
  Users,
  BarChart3,
  Trash2,
  MoreVertical,
  Edit,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/helpers";
import { getEventTicketStats } from "@/lib/event-stats";
import { useUser } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useDeleteEvent } from "@/services/events/events.queries";
import { useOrganizerEventsV2 } from "@/services/events/events-v2.queries";
import { EventV2 } from "@/types/events-v2.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";

const EventRow = memo(function EventRow({
  event,
  index,
  onNavigate,
  onEdit,
  onDeleteClick,
}: {
  event: EventV2;
  index: number;
  onNavigate: (eventId: string) => void;
  onEdit: (eventId: string) => void;
  onDeleteClick: (eventId: string) => void;
}) {
  const stats = useMemo(
    () => getEventTicketStats(event.ticketCategories),
    [event.ticketCategories],
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onNavigate(event.id)}
    >
      <img
        src={event.bannerUrl || "/placeholder.svg"}
        alt={event.name}
        className="w-16 h-16 rounded-lg object-cover"
      />
      <div className="flex-1 w-full sm:w-auto">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
          <h3 className="font-semibold text-sm sm:text-base">{event.name}</h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
          {new Date(event.date).toLocaleDateString()} • {event.location}
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
          <span className="text-muted-foreground">
            {stats.sold}/{stats.total} sold
          </span>
          <span className="text-green-600 font-medium">
            {formatPrice(stats.revenue).toLocaleString()} revenue
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end w-full sm:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="right"
            className="bg-white shadow-lg rounded-md border border-gray-200 mt-2"
          >
            <DropdownMenuItem
              onClick={() => onEdit(event.id)}
              className="text-sm text-gray-700 hover:bg-gray-100 rounded-md p-2 transition-colors focus:outline-none flex items-center cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" /> Update Event
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200 h-px my-1" />
            <DropdownMenuItem
              onClick={() => onDeleteClick(event.id)}
              className="text-sm text-white bg-red-600 hover:bg-red-400 rounded-md p-2 transition-colors focus:outline-none flex items-center cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="w-full sm:w-24 bg-muted rounded-full h-2 mt-2">
          <div
            className="bg-gradient-to-r from-[#1E88E5] to-pink-600 h-2 rounded-full"
            style={{ width: `${stats.percentSold}%` }}
          />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-right">
          {stats.percentSold}% sold
        </p>
      </div>
    </motion.div>
  );
});

export default function OrganizerDashboard() {
  const { user: currentUser } = useUser();
  const router = useRouter();
  const { data: organizerEventList, isLoading: eventsLoading } =
    useOrganizerEventsV2();
  const { mutate: deleteEvent } = useDeleteEvent();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  // Handle both array and paginated response formats
  const organizerEvents: EventV2[] = Array.isArray(organizerEventList)
    ? organizerEventList
    : organizerEventList?.data ?? [];

  const dashboardStats = useMemo(() => {
    let totalTicketsSold = 0;
    let totalRevenue = 0;
    for (const event of organizerEvents) {
      const stats = getEventTicketStats(event.ticketCategories);
      totalTicketsSold += stats.sold;
      totalRevenue += stats.revenue;
    }
    return {
      totalEvents: organizerEvents.length,
      totalTicketsSold,
      totalRevenue,
    };
  }, [organizerEvents]);

  const handleNavigate = useCallback(
    (eventId: string) => router.push(`/organizer/view-event/${eventId}`),
    [router],
  );

  const handleEdit = useCallback(
    (eventId: string) => router.push(`/organizer/update-event/${eventId}`),
    [router],
  );

  const handleDeleteClick = useCallback((eventId: string) => {
    setDeleteEventId(eventId);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = () => {
    if (deleteEventId) {
      deleteEvent(deleteEventId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setDeleteEventId(null);
        },
        onError: (error) => {
          console.error("Failed to delete event:", error);
          setIsDeleteDialogOpen(false);
        },
      });
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeleteEventId(null);
  };

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#1E88E5] mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Welcome back, {currentUser && currentUser.name}!
              </p>
            </div>
            <Button
              asChild
              className="w-full sm:w-auto bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/organizer/create-event">
                <Plus className="h-4 w-4 mr-2" />
                Create New Event
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Total Events
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {dashboardStats.totalEvents}
                  </div>
                  <p className="text-xs text-muted-foreground">Active events</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Tickets Sold
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {dashboardStats.totalTicketsSold}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all events
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Net Earnings
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {formatPrice(Math.round(dashboardStats.totalRevenue))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Events List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Your Events</CardTitle>
              </CardHeader>
              <CardContent>
                {organizerEvents.length > 0 ? (
                  <div className="space-y-4">
                    {organizerEvents.map((event: EventV2, index: number) => (
                      <EventRow
                        key={event.id}
                        event={event}
                        index={index}
                        onNavigate={handleNavigate}
                        onEdit={handleEdit}
                        onDeleteClick={handleDeleteClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first event to start selling tickets and
                      managing attendees.
                    </p>
                    <Button asChild>
                      <Link href="/organizer/create-event">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Event
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
      {/* Global Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
        <DialogContent className="sm:max-w-[425px] bg-white/90 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl text-center font-semibold text-gray-900">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Are you sure you want to delete this event?
              <span className="block mt-2 text-red-600 font-medium">
                This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-4 sm:gap-32 mt-4">
            <Button
              variant="outline"
              onClick={cancelDelete}
              className="w-full sm:w-auto rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="w-full sm:w-auto rounded-xl"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

Note three intentional, in-scope cleanups bundled into this rewrite (each was already
dead/unused in the original file, discovered while auditing it for this plan — not new
scope creep, just not re-introduced):
- `avgTicketsSold` is dropped — it was computed but never rendered anywhere.
- The unused `TrendingUp` icon import and unused `useEffect` import are dropped.
- The unused `DialogTrigger` import (from `@radix-ui/react-dialog`) is dropped — the
  dialog is opened programmatically via `isDeleteDialogOpen` state, not a trigger
  element.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit 2>&1 | wc -l
```

Expected: `19`.

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

As an organizer with at least 2 events, open `/organizer`. Confirm the displayed totals
(Total Events, Tickets Sold, Net Earnings) and each event row's "sold/total" count,
revenue, and "% sold" progress bar match what they showed before this change (compare
against `git show HEAD:app/organizer/page.tsx` rendered mentally, or check against the
live `staging` deployment if available) — this is a refactor, not a behavior change.
Open the "⋮" menu on one event and click "Delete Event" to open the confirmation
dialog; with React DevTools' "Highlight updates when components render" enabled (or a
Profiler recording), confirm only the dialog renders — not the event rows.

- [ ] **Step 5: Commit**

```bash
git add lib/event-stats.ts app/organizer/page.tsx
git commit -m "refactor: memoize organizer dashboard stats and event rows

Every stat (page totals + each row's sold/total/revenue/percent) was
recomputed inline on every render, including on delete-dialog toggles
that have nothing to do with event data, and the per-event math was
duplicated three times inline. Extracted a shared getEventTicketStats
helper, memoized the page-level aggregate, and extracted a memo-wrapped
EventRow so dialog state changes no longer re-render the event list."
```

---

### Task 2: Event forms — fix the render-time blob-URL creation

**Files:**
- Modify: `app/organizer/create-event/page.tsx`
- Modify: `app/organizer/update-event/[id]/page.tsx`

- [ ] **Step 1: Fix `create-event/page.tsx`**

Change:

```tsx
  const bannerFile = watch("banner");
  const previewUrl = bannerFile ? URL.createObjectURL(bannerFile) : null;

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);
```

to:

```tsx
  const bannerFile = watch("banner");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!(bannerFile instanceof File)) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(bannerFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);
```

(`useState` and `useEffect` are both already imported at the top of this file — no
import changes needed for this step.)

- [ ] **Step 2: Fix `update-event/[id]/page.tsx`**

Change:

```tsx
  const bannerFile = watch("banner");
  const previewUrl = bannerFile ? URL.createObjectURL(bannerFile) : event?.bannerUrl || null;

  useEffect(() => {
    return () => { if (previewUrl && bannerFile) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl, bannerFile]);
```

to:

```tsx
  const bannerFile = watch("banner");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    event?.bannerUrl ?? null,
  );

  useEffect(() => {
    if (!(bannerFile instanceof File)) {
      setPreviewUrl(event?.bannerUrl ?? null);
      return;
    }
    const url = URL.createObjectURL(bannerFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile, event?.bannerUrl]);
```

This preserves the existing fallback-to-`event.bannerUrl` behavior (shown when no new
file has been selected, e.g. editing an event that already has a banner) and the
existing revoke condition (a URL sourced from `event.bannerUrl` is never
`URL.revokeObjectURL`'d, since it's never a blob URL — only URLs this effect itself
created via `URL.createObjectURL` are revoked, via the effect's own cleanup closure
over `url`).

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit 2>&1 | wc -l
```

Expected: `19`.

- [ ] **Step 4: Manual check**

```bash
npm run dev
```

On `/organizer/create-event` step 1, select a banner image. Confirm the preview shows
correctly. Then type in the Name/Description fields on the same step and confirm the
preview image doesn't flicker/reload (open DevTools Network tab filtered to `blob:` —
selecting the file should produce exactly one new blob URL; typing afterward should
produce none).

On `/organizer/update-event/<id>` for an event that already has a banner, confirm the
existing banner shows as the preview immediately (without selecting a new file) and
that you can proceed past step 1 without uploading a new one.

- [ ] **Step 5: Commit**

```bash
git add app/organizer/create-event/page.tsx "app/organizer/update-event/[id]/page.tsx"
git commit -m "fix: stop recreating banner preview blob URL on every render

previewUrl was computed directly in the render body via
URL.createObjectURL(bannerFile), allocating a new blob URL on every
render where a banner file was present -- including renders triggered
by typing in an unrelated field. Moved it into a useEffect keyed on
the bannerFile reference (stable across unrelated re-renders in
react-hook-form), so a new URL is only created when the file actually
changes."
```

---

### Task 3: Event forms — shared step-validation helpers

**Files:**
- Create: `app/organizer/_components/event-form-validation.ts`
- Modify: `app/organizer/create-event/page.tsx`
- Modify: `app/organizer/update-event/[id]/page.tsx`

- [ ] **Step 1: Create the shared validation helpers**

Create `app/organizer/_components/event-form-validation.ts`:

```ts
interface Step1Fields {
  name?: string;
  description?: string;
  category?: string;
  banner?: unknown;
  requireBanner: boolean;
}

export function isStep1Valid({
  name,
  description,
  category,
  banner,
  requireBanner,
}: Step1Fields): boolean {
  return !!name && !!description && !!category && (!requireBanner || !!banner);
}

interface Step2TicketCategory {
  name: string;
  price: number;
  maxTickets: number;
}

interface Step2Fields {
  location?: string;
  date?: string;
  time?: string;
  ticketCategories: Step2TicketCategory[];
}

export function isStep2Valid({
  location,
  date,
  time,
  ticketCategories,
}: Step2Fields): boolean {
  return (
    !!location &&
    !!date &&
    !!time &&
    ticketCategories.length > 0 &&
    ticketCategories.every((cat) => cat.name && cat.price >= 0 && cat.maxTickets >= 1)
  );
}
```

Each function takes plain already-`watch()`-ed values (not the `watch` function or a
form-schema type), so it works identically for `create-event`'s `EventFormData` and
`update-event`'s `UpdateEventFormData` without needing a shared type between the two
schemas. `requireBanner` makes the one real behavioral difference between the two pages
(create requires a banner to proceed past step 1; update does not, since an existing
event may already have one) an explicit parameter instead of two independently
maintained near-duplicate implementations.

- [ ] **Step 2: Wire it into `create-event/page.tsx`**

Add `useMemo` to the React import (currently `import React, { useEffect, useState }
from "react";`):

```tsx
import React, { useEffect, useMemo, useState } from "react";
```

Add the import for the new helpers, near the other `../_components/` imports:

```tsx
import { isStep1Valid, isStep2Valid } from "../_components/event-form-validation";
```

Change:

```tsx
  const ticketCategories = watch("ticketCategories") || [];

  const canProceedStep1 =
    !!watch("name") && !!watch("description") && !!watch("category") && !!watch("banner");
  const canProceedStep2 =
    !!watch("location") &&
    !!watch("date") &&
    !!watch("time") &&
    ticketCategories.length > 0 &&
    ticketCategories.every((cat) => cat.name && cat.price >= 0 && cat.maxTickets >= 1);
  const canProceedStep3 = true;
  const canProceedStep4 = true;
```

to:

```tsx
  const ticketCategories = watch("ticketCategories") || [];
  const name = watch("name");
  const description = watch("description");
  const category = watch("category");
  const banner = watch("banner");
  const location = watch("location");
  const date = watch("date");
  const time = watch("time");

  const canProceedStep1 = useMemo(
    () => isStep1Valid({ name, description, category, banner, requireBanner: true }),
    [name, description, category, banner],
  );
  const canProceedStep2 = useMemo(
    () => isStep2Valid({ location, date, time, ticketCategories }),
    [location, date, time, ticketCategories],
  );
  const canProceedStep3 = true;
  const canProceedStep4 = true;
```

(The line below this block, `const canProceed = [canProceedStep1, canProceedStep2,
canProceedStep4, canProceedStep3][currentStep - 1];`, is unchanged.)

- [ ] **Step 3: Wire it into `update-event/[id]/page.tsx`**

Add `useMemo` to the React import (currently `import React, { useEffect, useState }
from "react";`):

```tsx
import React, { useEffect, useMemo, useState } from "react";
```

Add the import for the new helpers, near the other `../../_components/` imports:

```tsx
import { isStep1Valid, isStep2Valid } from "../../_components/event-form-validation";
```

Change:

```tsx
  const ticketCategories = watch("ticketCategories") || [];

  const canProceedStep1 = !!watch("name") && !!watch("description") && !!watch("category");
  const canProceedStep2 =
    !!watch("location") &&
    !!watch("date") &&
    !!watch("time") &&
    ticketCategories.length > 0 &&
    ticketCategories.every((cat) => cat.name && cat.price >= 0 && cat.maxTickets >= 1);
```

to:

```tsx
  const ticketCategories = watch("ticketCategories") || [];
  const name = watch("name");
  const description = watch("description");
  const category = watch("category");
  const banner = watch("banner");
  const location = watch("location");
  const date = watch("date");
  const time = watch("time");

  const canProceedStep1 = useMemo(
    () => isStep1Valid({ name, description, category, banner, requireBanner: false }),
    [name, description, category, banner],
  );
  const canProceedStep2 = useMemo(
    () => isStep2Valid({ location, date, time, ticketCategories }),
    [location, date, time, ticketCategories],
  );
```

(The line below this block, `const canProceed = [canProceedStep1, canProceedStep2,
true, true][currentStep - 1];`, is unchanged.)

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit 2>&1 | wc -l
```

Expected: `19`.

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

On `/organizer/create-event`: fill in Name, Description, Category, and select a
banner — confirm "Next" becomes enabled only once all four are filled (matches
`requireBanner: true`). On `/organizer/update-event/<id>` for an existing event: with
the banner already pre-filled from the event, confirm "Next" is enabled once Name,
Description, and Category are filled — without needing to (re-)select a banner file
(matches `requireBanner: false`).

- [ ] **Step 6: Commit**

```bash
git add app/organizer/_components/event-form-validation.ts app/organizer/create-event/page.tsx "app/organizer/update-event/[id]/page.tsx"
git commit -m "refactor: extract shared step-validation helpers for event forms

canProceedStep1/canProceedStep2 were computed via unmemoized inline
watch() chains, duplicated near-verbatim between create-event and
update-event -- with one real behavioral difference (banner
requirement) easy to miss across two independently maintained copies.
Extracted isStep1Valid/isStep2Valid as shared pure functions with an
explicit requireBanner parameter, memoized at each call site."
```

---

### Task 4: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck diff against baseline**

```bash
npx tsc --noEmit 2>&1 | wc -l
```

Expected: `19` — identical to the baseline captured before Task 1. Any other number
means a task introduced a real type problem that needs fixing before continuing.

- [ ] **Step 2: Full manual pass**

```bash
npm run dev
```

Re-run all manual checks from Tasks 1–3 in one session:
- Dashboard totals and per-row stats match pre-change values; only the dialog
  re-renders on delete-click, not the event list.
- Banner preview doesn't regenerate its blob URL on unrelated keystrokes on either
  event-form page.
- Step-1 validity gating is correct on both pages (banner required on create, not on
  update).

- [ ] **Step 3: Review the full diff**

```bash
git diff staging --stat
```

Confirm exactly these files changed: `lib/event-stats.ts` (new),
`app/organizer/page.tsx`, `app/organizer/create-event/page.tsx`,
`app/organizer/update-event/[id]/page.tsx`,
`app/organizer/_components/event-form-validation.ts` (new).

No further commit for this task — it's a verification checkpoint. If everything
passes, Phase 1 is complete.
