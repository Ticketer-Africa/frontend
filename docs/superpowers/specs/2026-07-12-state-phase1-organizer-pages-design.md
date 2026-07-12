# State Management Refactor — Phase 1: Organizer Dashboard & Event Forms

Status: Approved
Date: 2026-07-12
Scope: `frontend/` — `app/organizer/page.tsx` (dashboard) and the shared logic behind
`app/organizer/create-event/page.tsx` + `app/organizer/update-event/[id]/page.tsx`
(event forms). No other pages — see "Why not wallet/attendees" below.

## Context

This is Phase 1 of the multi-phase state-management refactor started in
[Phase 0](2026-07-11-state-foundations-design.md), which fixed shared foundations
(`AuthProvider`, React Query config, the `optimisticUpdate` cache-patching helper).
Phase 1 was originally scoped to "organizer-facing pages: dashboard, attendees, wallet,
event forms." An audit of all four before writing this spec found:

- **Wallet page** (`app/wallet/page.tsx` + `app/wallet/_components/`) is already fully
  decomposed and memoized — every sub-component (`BalanceCard`, `QuickStats`,
  `TransactionHistory`, `TransactionItem`) is wrapped in `memo`, derived stats use
  `useMemo`, handlers use `useCallback`. No work needed.
- **Attendees page**
  (`app/organizer/event/[id]/attendees/page.tsx`) already memoizes every derived list
  (`allRows`, `categoryOptions`, `filteredRows`, `rows`, `summary`) via `useMemo`. No
  work needed.
- **Organizer dashboard** (`app/organizer/page.tsx`) and **event forms**
  (`create-event`/`update-event`) both have real, concrete issues (below).

Phase 1 is therefore narrowed to just the dashboard and event forms.

## Problems found

### Dashboard (`app/organizer/page.tsx`)

1. **Every render recomputes every stat with no memoization.** `totalEvents`,
   `totalTicketsSold`, `totalRevenue`, and each event row's sold/total/revenue/percent
   are computed inline in the component body via `Array.reduce` — including on every
   `isDeleteDialogOpen`/`deleteEventId` state change, which happens purely from opening
   or closing the delete-confirmation dialog and has nothing to do with the event data.
2. **The per-event sold/total/revenue reduce logic is duplicated three times** inline
   in the JSX (the summary line, the progress-bar width calculation, and the "% sold"
   label) — the same `ticketCategories.reduce(...)` pattern copy-pasted with no shared
   source of truth.
3. **No row-level component boundary**, so opening the delete dialog for one event
   re-renders the entire event list (every row), not just the row and the dialog.
4. **`avgTicketsSold` is computed but never rendered anywhere in the file** — dead
   code, discovered while reading the component for this audit.

### Event forms (`app/organizer/create-event/page.tsx`,
`app/organizer/update-event/[id]/page.tsx`)

5. **`previewUrl` is computed directly in the render body as
   `bannerFile ? URL.createObjectURL(bannerFile) : ...`.** This allocates a *new* blob
   URL on every render where a banner file is present — including renders triggered by
   typing in an unrelated field, toggling a checkbox, or changing step — not just when
   the file actually changes. The existing cleanup effect (`useEffect(() => () =>
   URL.revokeObjectURL(previewUrl), [previewUrl])`) does revoke the previous URL on the
   next render because `previewUrl` is a new string every time, so this isn't an
   unbounded leak, but it's real wasted work on every keystroke and briefly invalidates
   the displayed preview image's `src` for no reason.
6. **`canProceedStep1`/`canProceedStep2` validation logic is duplicated** between the
   two pages, with one meaningful difference the duplication makes easy to miss:
   `create-event` requires `banner` to proceed past step 1 (`!!watch("banner")`),
   `update-event` does not (an existing event may already have a banner, so re-upload
   isn't required) — this is correct behavior, but because it's two independently
   maintained copies of similar-looking code, a future edit to one is easy to make
   without noticing it should also apply to the other.

## Design

### A. Dashboard: shared stats helper + memoized aggregate + memoized row

- Add a small pure helper, `getEventTicketStats(ticketCategories)`, in a new file
  `lib/event-stats.ts`, replacing the three duplicated reduce blocks. It takes a
  ticket-category array and returns `{ sold, total, revenue, percentSold }` in one
  pass instead of three separate `.reduce()` calls per usage site.
- Memoize the page-level aggregate (`totalEvents`, `totalTicketsSold`, `totalRevenue`)
  via `useMemo` keyed on `organizerEvents`, using `getEventTicketStats` per event.
  `avgTicketsSold` is dropped (dead code, per finding #4).
- Extract the event-list row into a `memo`-wrapped `EventRow` component. It receives
  the `event` object and stable callback props (`onNavigate`, `onEdit`,
  `onDeleteClick`, each taking the event id as an argument so the parent's callbacks
  don't need to close over per-row data and can be created once via `useCallback`).
  `EventRow` computes its own stats via `getEventTicketStats(event.ticketCategories)`
  inside a `useMemo` keyed on `event.ticketCategories`.
- Net effect: opening/closing the delete dialog changes only
  `isDeleteDialogOpen`/`deleteEventId` state in the parent; because `EventRow` is
  memoized and its props (the event object from React Query's cache, plus stable
  callbacks) don't change, no row re-renders. The dialog itself already only renders
  once (outside the list), so this was never the expensive part — the list was.

### B. Event forms: fix the preview-URL render-time side effect

- Replace the render-body `previewUrl` computation with `useState` +
  `useEffect(() => {...}, [bannerFile])` (and, for `update-event` only, also depending
  on the existing event's `bannerUrl` for the pre-populated-banner fallback case). The
  effect creates a new object URL only when `bannerFile` actually changes (RHF returns
  a stable `File` reference across renders until the field is actually set to a new
  value, so this dependency is safe), sets it in state, and returns a cleanup that
  revokes exactly that URL. No blob URL is created on renders where `bannerFile` hasn't
  changed.
- `update-event`'s existing fallback behavior (show `event.bannerUrl` when no new file
  has been selected) and its existing revoke condition (`if (previewUrl && bannerFile)`
  — don't revoke a URL that was never a blob URL, i.e. the `event.bannerUrl` case) are
  preserved exactly, just moved out of the render body and into the effect.

### C. Event forms: shared step-validation helpers

- Add two small pure functions to a new file
  `app/organizer/_components/event-form-validation.ts`:
  - `isStep1Valid({ name, description, category, banner, requireBanner })` — takes the
    already-`watch()`-ed field values plus an explicit `requireBanner: boolean` flag
    (`true` for create, `false` for update), so the one real behavioral difference
    between the two pages (finding #6) is an explicit, visible parameter instead of
    something a future reader has to notice by diffing two files.
  - `isStep2Valid({ location, date, time, ticketCategories })`.
  - Both take plain values (not the `watch` function or a form-schema-typed object),
    so they work identically against `EventFormData` and `UpdateEventFormData` without
    needing a shared type between the two schemas — each page still calls its own
    `watch(...)` as today and passes the results in.
- Each page wraps its own two calls in `useMemo`, keyed on the specific watched values
  each function needs (not the whole form), replacing the current unmemoized inline
  booleans.

### Non-goals

- No migration to `useWatch` or any other react-hook-form API change — the current
  per-field `watch()` calls are already reasonably scoped (each subscribes only to its
  named field), and a wholesale pattern change isn't justified by the concrete problems
  found.
- No changes to `app/wallet/*` or `app/organizer/event/[id]/attendees/page.tsx` — both
  audited and already in good shape (see Context).
- No new state library, no new dependencies.
- No changes to the event-form Zod schemas (`event-form-schema.ts`) or to any step
  component's own internal rendering — only the two derived booleans and the preview
  URL, computed in the two page-level files, are in scope.

## Data flow after this phase

```
Dashboard:
  organizerEvents (React Query cache, unchanged)
    → useMemo(dashboardStats) — recomputes only when organizerEvents changes
    → EventRow[] (memoized) — each recomputes its own stats only when its own
      event.ticketCategories changes; unaffected by isDeleteDialogOpen/deleteEventId

Event forms (both pages):
  watch("banner") → useEffect → previewUrl state — recreates the blob URL only when
    the watched File reference actually changes
  watch(step1 fields) → useMemo(isStep1Valid(...)) — recomputes only when those
    specific fields change
  watch(step2 fields) → useMemo(isStep2Valid(...)) — recomputes only when those
    specific fields change
```

## Error handling

No new error paths. `getEventTicketStats` and the two validation helpers are pure
functions over already-validated/typed inputs (React Query data, RHF watched values) —
no network calls, no new failure modes. The preview-URL effect's cleanup runs
unconditionally on every dependency change and on unmount, same as the existing
(render-body) version's cleanup does today.

## Testing

No frontend test runner exists in this repo (established in Phase 0). Manual
verification:
- Dashboard: open React DevTools Profiler (or add a temporary `console.count` inside
  `EventRow`), open and close the delete-confirmation dialog for one event, confirm
  only the dialog re-renders — not the event list.
- Dashboard: confirm the displayed totals (events count, tickets sold, revenue) and
  each row's sold/total/percent match what the current (pre-change) build shows for
  the same data — this is a refactor, not a behavior change, so the displayed numbers
  must be identical.
- Event forms: with browser DevTools open on the Network/Memory tab, select a banner
  image on step 1, then type in unrelated fields (name, description) on the same step
  and confirm no new blob: URL requests/allocations occur beyond the one from selecting
  the file.
- Event forms: confirm `update-event` on an event that already has a banner shows the
  existing banner as the preview without requiring a new upload to proceed past step 1
  (this is the `requireBanner: false` case — must not regress).
- `npx tsc --noEmit` stays at the established baseline (19 pre-existing, unrelated
  errors — see Phase 0 spec) with zero new errors.

## Follow-on phases (not part of this spec)

- Phase 2: admin pages.
- Phase 3: public/checkout pages.
