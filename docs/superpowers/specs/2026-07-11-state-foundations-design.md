# State Management Refactor — Phase 0: Foundations

Status: Approved
Date: 2026-07-11
Scope: `frontend/` app-wide plumbing only (`lib/auth-context.tsx`, `lib/provider.tsx`, `services/*.queries.ts` conventions). No page-level work — that is Phase 1+.

## Context

This is Phase 0 of a multi-phase effort to move the frontend toward a Linear-inspired
reactive architecture: server state and UI state cleanly separated, state kept as local
as possible, derived state memoized, and mutations applying optimistically so the UI
stays responsive. The eventual goal is to prepare the app for realtime features (exact
feature and transport not yet chosen) without over-building for them now.

Later phases apply the resulting pattern to organizer-facing pages (dashboard,
attendees, wallet, event forms), then admin, then public/checkout pages. Phase 0 only
touches the shared foundations every page depends on, because fixing those first means
every later phase inherits the fix instead of working around the problem.

**Current state (verified in this repo):**
- Server state: React Query (`@tanstack/react-query`), one `*.queries.ts` file per
  feature under `services/`. This part already follows good practice — no change to
  this pattern itself in Phase 0.
- Auth state: `lib/auth-context.tsx` already splits `UserContext` (rarely changes) from
  `AuthStatusContext` (`isLoading`) — a prior refactor did this split correctly. Phase 0
  builds on it rather than redoing it.
- No global UI-state library (Redux/Zustand/Jotai/Valtio) exists today, and none is
  being introduced.
- No realtime transport (WebSocket/SSE/polling-for-push) exists today.
- `middleware.ts` already performs an edge-level auth check (`GET /v1/auth/me`) for
  every protected route (`/admin`, `/organizer`, `/wallet`, `/ticket`, `/my-tickets`,
  `/settings`, `/verify-ticket`) and redirects unauthenticated requests to `/login`
  before the React tree ever mounts.

**Problems this phase fixes:**

1. **`AuthProvider` blocks the entire app render tree.** In `lib/auth-context.tsx`,
   `AuthProvider` early-returns a full-page loading screen while `isLoading` is true,
   and the `useEffect` that triggers `fetchUser()` depends on `pathname`, so it re-runs
   on every client-side navigation. Because `middleware.ts` has already verified auth
   for protected routes before the page renders, this client-side fetch-and-block is
   redundant work that unmounts and re-renders the entire app on every route change.
   This is the app's single biggest source of unnecessary cascading rerenders.

2. **Global React Query config carries feature-specific policy.** `lib/provider.tsx`
   hardcodes a query-key allowlist for `refetchOnWindowFocus`
   (`["me", "wallet-balance", "events", "resaleListings", "event"]`). Any feature that
   wants to opt in or out of focus-refetch has to edit this shared file instead of its
   own query definition — a hidden global dependency that doesn't scale and obscures
   per-feature freshness intent.

3. **No shared optimistic-update convention.** Mutations today invalidate-and-refetch
   rather than patching the query cache directly, and the
   snapshot/apply/rollback/reconcile logic is not centralized anywhere. This means (a)
   every mutation pays a network round-trip before the UI reflects the change, and (b)
   there is no single seam where a future realtime push event and a local mutation
   would apply to the same cache entry the same way.

## Design

### A. Un-block `AuthProvider`

- Remove the full-page blocking loader. `AuthProvider` renders `children` immediately;
  it never gates the whole tree on `isLoading`.
- `fetchUser()` runs once on mount, not on every `pathname` change. The existing
  "skip fetch entirely on a public route with no stored user hint" optimization is
  kept, since it's a real inbound-traffic optimization, not a rerender concern.
  Session invalidation mid-visit continues to be handled by the existing 401/403
  interceptor-and-redirect path in `fetchUser`'s catch block — unchanged.
- `isLoading` continues to be exposed via `useAuthStatus()`. Consumers that need a
  loading affordance (e.g. the header's avatar/menu slot) render their own small local
  skeleton keyed off `useAuthStatus()`, scoped to just that UI, instead of the app
  white-screening.
- Net effect: navigating the app no longer remounts the entire tree behind a spinner.
  Protected-route correctness is unaffected because `middleware.ts` is the actual
  authorization boundary; the client fetch only hydrates `user` for display purposes.

### B. Move freshness policy out of the global provider

- `lib/provider.tsx` keeps only genuinely global, safe-for-everything defaults:
  `gcTime`, `staleTime`, the 401/403-aware `retry` function, `refetchOnReconnect`,
  `refetchOnMount`.
- The `refetchOnWindowFocus` allowlist (`["me", "wallet-balance", "events",
  "resaleListings", "event"]`) is deleted from `provider.tsx`. Auditing every query
  that key list was meant to cover shows most of it is already dead:
  - `"me"` isn't a React Query key at all — `AuthProvider` fetches the current user via
    a raw `Axios.get` call (see part A), not `useQuery`, so this entry has never done
    anything.
  - `"events"` and `"event"` are matched by seven different `useQuery` calls in
    `services/events/events.queries.ts` (`usePriceRange`, `useAllEvents`,
    `useEventById`, `useEventBySlug`, `useUserEvents`, `useOrganizerEvents`,
    `useUpcomingEvents`), and every one of them already sets
    `refetchOnWindowFocus: false` explicitly. Per-query options always win over
    `defaultOptions`, so the global allowlist's entries for these two keys have no
    effect today.
  - Only two keys actually depend on the global allowlist for their current behavior:
    `"wallet-balance"` (`useWalletBalance` in `services/wallet/wallet.queries.ts`) and
    `"resaleListings"` (`useResaleListings` in `services/tickets/tickets.queries.ts`),
    neither of which sets `refetchOnWindowFocus` itself.
  - These two get `refetchOnWindowFocus: true` added directly to their `useQuery`
    calls, preserving current behavior. Nothing else needs to change to stay
    behavior-preserving.

### C. Shared optimistic-mutation helper

- Add `services/query-utils.ts` exporting one function:

  ```ts
  optimisticUpdate<TData>(
    queryClient: QueryClient,
    queryKey: QueryKey,
    updater: (old: TData | undefined) => TData,
  ): { onMutate: () => Promise<{ previous: TData | undefined }>;
       onError: (err: unknown, vars: unknown, ctx: { previous: TData | undefined } | undefined) => void;
       onSettled: () => void }
  ```

  It wraps the standard React Query triangle: `onMutate` cancels in-flight queries for
  that key, snapshots the current cache value, applies `updater` optimistically;
  `onError` rolls back to the snapshot; `onSettled` invalidates the key to reconcile
  with the server. This is a thin wrapper over existing React Query primitives, not a
  new abstraction layer over them — call sites still use `useMutation` directly and
  spread the returned handlers in.
- Applied to one real mutation as the reference implementation: `useCreateDiscount`
  (`services/discounts/discounts.queries.ts`), which appends a `Discount` to the
  `["discounts", eventId]` list cached by `useListDiscounts`. This pair is live today
  in `app/organizer/view-event/[id]/EventManagementTabs.tsx` (an organizer-facing
  page, in scope for Phase 1), so the pattern can be exercised end-to-end in the
  running app rather than only unit-tested in isolation.
  - (Two other candidates were considered and rejected: attendee
    edit/remove/regenerate mutations do not exist in the current codebase — that
    functionality was removed along with the invite-only flow in `fa92ae6` — and
    `useToggleEventStatus` / `useAdminToggleEvent` exist but are not wired into any
    component yet, so exercising them would require building UI out of scope for
    Phase 0.)
- Every other mutation is left as invalidate-and-refetch for now — Phase 0 does not
  rewrite all mutations, only proves the pattern.

### Non-goals

- No new state-management library. React Query + Context remains sufficient.
- No WebSocket/SSE/polling-for-push wiring. Phase 0 only ensures the cache-patching
  seam (part C) exists so a future push event has one obvious place to write to.
- No page-level component-splitting or memoization work (list virtualization, context
  splitting per page, etc.) — that is Phase 1, scoped to organizer-facing pages
  (dashboard, attendees, wallet, event forms).
- No change to the `services/*.queries.ts` per-feature file structure — it already
  matches the "server state colocated by feature" goal.

## Data flow after this phase

```
Route change
  → middleware.ts (edge auth check, unchanged)
  → page renders immediately (no client-side auth block)
  → useUser()/useAuthStatus() hydrate in the background
  → feature components read server state via their own *.queries.ts hooks
  → useCreateDiscount applies optimistically via query-utils.optimisticUpdate,
    rolls back on error, reconciles via invalidate
  → all other mutations: unchanged invalidate-and-refetch
```

## Error handling

- `fetchUser` catch block: unchanged behavior (clear `user`, clear localStorage hint,
  redirect to `/login` only for unauthenticated errors on non-public routes).
- `optimisticUpdate`'s `onError` always rolls back to the pre-mutation snapshot before
  any caller-supplied `onError` (e.g. a toast) runs, so the UI never shows a stuck
  optimistic value after a failed mutation.

## Testing

- Manual verification (this app has no existing frontend test suite to extend):
  - Navigate between at least one public and one protected route repeatedly; confirm
    no full-page loader/remount occurs after initial load.
  - Confirm `wallet-balance` and `resaleListings` still refetch on window focus
    (unchanged behavior, just relocated).
  - On an organizer's event management page, create a discount code; confirm it
    appears in the list immediately (before the network response returns) and rolls
    back correctly if the request is forced to fail (e.g. via devtools network
    throttling/offline).
  - `npx tsc --noEmit` clean (no new errors beyond the pre-existing 19 documented in
    the prior staging-merge work).

## Follow-on phases (not part of this spec)

- Phase 1: apply localized-state, derived-state memoization, and the optimistic-update
  pattern to organizer-facing pages (dashboard, attendees, wallet, event forms).
- Phase 2: admin pages.
- Phase 3: public/checkout pages.
- Realtime transport selection and wiring: deferred until a concrete feature needs it;
  Phase 0's `optimisticUpdate` cache-patching seam is the intended integration point.
