# State Management Refactor — Phase 0 (Foundations) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop `AuthProvider` from blocking the whole app render tree on every navigation, move dead/misplaced React Query freshness policy out of the global provider, and add one reusable optimistic-mutation helper proven on a real, live mutation — without adding any new library.

**Architecture:** Three independent, sequential changes in `frontend/`: (A) `lib/auth-context.tsx` + `components/layout/header.tsx` — render children immediately instead of gating on `isLoading`, fetch the user once on mount instead of on every route change, and give the header's auth slot its own tiny local loading skeleton so it doesn't flash "Sign In" while the background fetch is in flight. (B) `lib/provider.tsx` + two `*.queries.ts` files — delete a `refetchOnWindowFocus` allowlist that is mostly dead code and relocate the two entries that actually matter to the queries they govern. (C) `services/query-utils.ts` (new) + `services/discounts/discounts.queries.ts` — a small `optimisticUpdate` helper wrapping React Query's standard `onMutate`/`onError`/`onSettled` triangle, applied to the live `useCreateDiscount` mutation.

**Tech Stack:** Next.js (App Router), React, `@tanstack/react-query` v5, TypeScript. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-11-state-foundations-design.md`

---

## Before you start

This repo has no frontend test runner configured (no Jest/Vitest/Testing Library in
`package.json`, no `*.test.*`/`*.spec.*` files). Verification in this plan is therefore
`npx tsc --noEmit` after each code change plus manual checks in a running dev server
(`npm run dev`), not automated tests. Run all commands from `frontend/`.

Before Task 1, capture a baseline so later tasks can diff against it:

```bash
npx tsc --noEmit 2>&1 | tee /tmp/tsc-baseline.txt | wc -l
```

Expected: `19` (the pre-existing, unrelated errors documented in the spec). If you get a
different number, stop and figure out why before proceeding — later tasks assume this
baseline.

---

### Task 1: Un-block `AuthProvider`

**Files:**
- Modify: `lib/auth-context.tsx`

- [ ] **Step 1: Remove the full-page blocking loader and its now-unused import**

In `lib/auth-context.tsx`, delete the `Logo` import (line 3):

```ts
import { Logo } from "@/components/layout/logo";
```

Then delete the entire blocking-loader block, currently:

```tsx
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Logo
              size="lg"
              withText={true}
              text="Ticketer Africa"
              imgSrc="/logo.png"
              className="animate-pulse-glow"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
```

so that the function goes straight to:

```tsx
  return (
```

`AuthProvider` now always renders `children` immediately; `isLoading` is only exposed
via `useAuthStatus()` for consumers that want to react to it locally.

- [ ] **Step 2: Fetch the user once on mount, not on every route change**

Replace the effect that currently re-runs `fetchUser()` on every `pathname` change:

```tsx
  useEffect(() => {
    // Don't fetch user if we're on a public route AND there's no stored user hint
    const isPublicRoute = publicRoutes.some((route) =>
      pathname.startsWith(route)
    );

    const storedUser = localStorage.getItem("ticketer-user");

    // If we're on a public route AND no stored user → skip fetch entirely
    if (isPublicRoute && !storedUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Add pathname as dependency
```

with:

```tsx
  useEffect(() => {
    // Runs once on mount. middleware.ts is the actual route-protection boundary
    // (it redirects unauthenticated requests before the page renders), so this
    // client-side fetch only needs to happen once, to hydrate `user` for display.
    const isPublicRoute = publicRoutes.some((route) =>
      pathname.startsWith(route)
    );

    const storedUser = localStorage.getItem("ticketer-user");

    // If we're on a public route AND no stored user → skip fetch entirely
    if (isPublicRoute && !storedUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

Leave `fetchUser`, the `logout` function, and both context providers unchanged — only
the render-blocking and the effect's dependency array change.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit 2>&1 | wc -l
```

Expected: `19` (same as baseline — this task is a behavior change, not a type change).

- [ ] **Step 4: Commit**

```bash
git add lib/auth-context.tsx
git commit -m "fix: stop AuthProvider from blocking the app render tree

middleware.ts already gates protected routes at the edge before the
page renders, so the client-side /auth/me fetch only needs to hydrate
\`user\` for display — it doesn't need to block children behind a
full-page loader, and it doesn't need to re-run on every navigation."
```

---

### Task 2: Give the header's auth slot its own local loading state

**Files:**
- Modify: `components/layout/header.tsx`

Without this task, Task 1 introduces a visible regression: on a protected route, there
will be a brief window where `user` is still `null` while the background fetch
completes, during which the header would show "Sign In / Sign Up" even though the
visitor is authenticated (middleware already confirmed it). This task fixes that by
having the header show a small skeleton instead, scoped to just that slot.

- [ ] **Step 1: Import `useAuthStatus` alongside `useUser`**

Change line 15 from:

```tsx
import { useUser } from "@/lib/auth-context";
```

to:

```tsx
import { useUser, useAuthStatus } from "@/lib/auth-context";
```

- [ ] **Step 2: Read `isLoading` in the component**

Change line 58 from:

```tsx
  const { user, logout } = useUser();
```

to:

```tsx
  const { user, logout } = useUser();
  const { isLoading: authLoading } = useAuthStatus();
```

- [ ] **Step 3: Show a skeleton in the desktop auth slot while loading**

Find the desktop auth slot (the `<div className="hidden items-center gap-2 md:flex">`
block, currently starting around line 144):

```tsx
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
```

Change it to check `authLoading` first:

```tsx
          <div className="hidden items-center gap-2 md:flex">
            {authLoading ? (
              <div className="h-11 w-32 animate-pulse rounded-full bg-muted" />
            ) : user ? (
```

The rest of that ternary (the existing `user ? (...) : (...)` branches) is unchanged —
you're only adding one more branch in front of it, not touching what's inside.

The mobile slide-in menu's auth slot (further down, guarded by `isMenuOpen`) is left
as-is: it's not visible until the visitor opens the menu, so the same flash risk
doesn't apply there, and touching it isn't needed to fix the regression.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit 2>&1 | wc -l
```

Expected: `19`.

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Open a protected route (e.g. `/wallet`) while already logged in, with the network
throttled (DevTools → Network → Slow 3G) to make the loading window visible. Confirm
the header shows the pulsing skeleton briefly, then the avatar — never "Sign In / Sign
Up".

- [ ] **Step 6: Commit**

```bash
git add components/layout/header.tsx
git commit -m "fix: show a local skeleton in header auth slot while user loads

Task 1 made AuthProvider render children immediately instead of
blocking on isLoading, which means the header can briefly see
user === null on a protected route while the background fetch is in
flight. Without this, that briefly renders Sign In / Sign Up on an
authenticated page. Scope the fix to just the header's auth slot."
```

---

### Task 3: Delete the dead `refetchOnWindowFocus` allowlist, relocate the two live entries

**Files:**
- Modify: `lib/provider.tsx`
- Modify: `services/wallet/wallet.queries.ts`
- Modify: `services/tickets/tickets.queries.ts`

Per the spec's audit: of the five keys in the current allowlist (`"me"`,
`"wallet-balance"`, `"events"`, `"resaleListings"`, `"event"`), `"me"` isn't a React
Query key at all, and every query matching `"events"`/`"event"` already sets
`refetchOnWindowFocus: false` explicitly (which overrides the global default anyway).
Only `"wallet-balance"` and `"resaleListings"` currently depend on the allowlist.

- [ ] **Step 1: Replace the allowlist function with an explicit global default**

In `lib/provider.tsx`, change:

```ts
      refetchOnWindowFocus: (query) => {
        const queryKeys = [
          "me",
          "wallet-balance",
          "events",
          "resaleListings",
          "event",
        ];
        return queryKeys.some((key) => query.queryKey.includes(key));
      },
```

to:

```ts
      // Per-query opt-in only — see refetchOnWindowFocus: true on individual
      // useQuery calls (e.g. useWalletBalance, useResaleListings) for queries
      // that need focus-refetch.
      refetchOnWindowFocus: false,
```

(Deleting the key outright would silently flip the default to React Query's own
default of `true` for every query in the app — an unintended global behavior change.
Setting it to `false` explicitly is what actually preserves current behavior for the
three keys that were already redundant.)

- [ ] **Step 2: Opt `useWalletBalance` in directly**

In `services/wallet/wallet.queries.ts`, change:

```ts
export const useWalletBalance = () =>
  useQuery({
    queryKey: ["wallet-balance"],
    queryFn: checkWalletBalance,
  });
```

to:

```ts
export const useWalletBalance = () =>
  useQuery({
    queryKey: ["wallet-balance"],
    queryFn: checkWalletBalance,
    refetchOnWindowFocus: true,
  });
```

- [ ] **Step 3: Opt `useResaleListings` in directly**

In `services/tickets/tickets.queries.ts`, change:

```ts
export const useResaleListings = (eventId?: string) =>
  useQuery<TicketResale[]>({
    queryKey: ["resaleListings", eventId],
    queryFn: () => getResaleListings(eventId),
  });
```

to:

```ts
export const useResaleListings = (eventId?: string) =>
  useQuery<TicketResale[]>({
    queryKey: ["resaleListings", eventId],
    queryFn: () => getResaleListings(eventId),
    refetchOnWindowFocus: true,
  });
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit 2>&1 | wc -l
```

Expected: `19`.

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Open the wallet page, switch to another browser tab, switch back — confirm a network
request to the wallet-balance endpoint fires (React Query devtools panel, already
wired up in `lib/provider.tsx`, or the browser Network tab). Repeat for a page that
renders `useResaleListings` (an event page's resale tab, if present) or confirm via
React Query Devtools that the `resaleListings` query shows `refetchOnWindowFocus: true`
in its observer options.

- [ ] **Step 6: Commit**

```bash
git add lib/provider.tsx services/wallet/wallet.queries.ts services/tickets/tickets.queries.ts
git commit -m "refactor: move refetchOnWindowFocus policy out of global provider

The global allowlist covered five query keys but four of them were
already dead: 'me' isn't a React Query key (AuthProvider fetches it
via raw Axios), and every 'events'/'event' query already sets
refetchOnWindowFocus: false itself, which overrides the global default
regardless. Only wallet-balance and resaleListings depended on the
allowlist — moved to those two useQuery calls directly so freshness
policy lives next to the query it governs instead of in a shared
string list."
```

---

### Task 4: Add the `optimisticUpdate` helper

**Files:**
- Create: `services/query-utils.ts`

- [ ] **Step 1: Write the helper**

Create `services/query-utils.ts`:

```ts
import type { QueryClient, QueryKey } from "@tanstack/react-query";

interface OptimisticContext<TData> {
  previous: TData | undefined;
}

/**
 * Wraps the standard React Query onMutate/onError/onSettled triangle for an
 * optimistic cache update: snapshot the current value, apply `updater`
 * immediately, roll back on error, reconcile with the server via invalidate
 * once the mutation settles either way.
 *
 * Spread the result into a useMutation() call:
 *
 *   useMutation({
 *     mutationFn: ...,
 *     ...optimisticUpdate<Thing[], Payload>(queryClient, ["things", id], (old = [], payload) => [...old, toOptimisticThing(payload)]),
 *   })
 */
export function optimisticUpdate<TData, TVariables = unknown>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updater: (old: TData | undefined, variables: TVariables) => TData,
) {
  return {
    onMutate: async (
      variables: TVariables,
    ): Promise<OptimisticContext<TData>> => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TData>(queryKey);
      queryClient.setQueryData<TData>(queryKey, updater(previous, variables));
      return { previous };
    },
    onError: (
      _err: unknown,
      _variables: TVariables,
      context: OptimisticContext<TData> | undefined,
    ) => {
      if (context) {
        queryClient.setQueryData<TData>(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  };
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit 2>&1 | wc -l
```

Expected: `19` (the new file introduces no errors; nothing consumes it yet).

- [ ] **Step 3: Commit**

```bash
git add services/query-utils.ts
git commit -m "feat: add optimisticUpdate helper for React Query mutations

Thin wrapper over the standard onMutate/onError/onSettled triangle —
not a new abstraction over React Query, just the copy-pasted
snapshot/apply/rollback/reconcile logic centralized in one place. This
is the seam a future realtime push event and a local mutation would
both write through to update the same cache entry."
```

---

### Task 5: Apply `optimisticUpdate` to `useCreateDiscount`

**Files:**
- Modify: `services/discounts/discounts.queries.ts`

`useCreateDiscount` + `useListDiscounts` are live in
`app/organizer/view-event/[id]/EventManagementTabs.tsx`, so this proves the pattern
end-to-end in the running app.

- [ ] **Step 1: Import the helper**

In `services/discounts/discounts.queries.ts`, add to the top of the file (after the
existing imports):

```ts
import { optimisticUpdate } from "@/services/query-utils";
```

- [ ] **Step 2: Apply it to `useCreateDiscount`**

Change:

```ts
export const useCreateDiscount = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Discount, Error, CreateDiscountPayload>({
    mutationFn: (payload) => discountsAPI.createDiscount(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts", eventId] });
    },
  });
};
```

to:

```ts
export const useCreateDiscount = (eventId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["discounts", eventId];
  return useMutation<Discount, Error, CreateDiscountPayload>({
    mutationFn: (payload) => discountsAPI.createDiscount(eventId, payload),
    ...optimisticUpdate<Discount[], CreateDiscountPayload>(
      queryClient,
      queryKey,
      (old = [], payload) => [
        ...old,
        {
          id: `optimistic-${Date.now()}`,
          code: payload.code,
          type: payload.type,
          value: payload.value,
          usageLimit: payload.usageLimit ?? null,
          usedCount: 0,
        },
      ],
    ),
  });
};
```

The optimistic entry uses a temporary `optimistic-<timestamp>` id since the real id
only exists after the server responds; `onSettled`'s invalidate replaces it with the
real list (including the server-assigned id) regardless of success or failure.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit 2>&1 | wc -l
```

Expected: `19`.

- [ ] **Step 4: Manual check — success path**

```bash
npm run dev
```

As an organizer, open an event's management page, go to the Discounts tab, and create
a discount code. Confirm the new code appears in the list immediately (before the
network response can plausibly have returned — watch the Network tab to compare
timing), and that after the request resolves the list still shows it (now with the
real id from the server, visible if you inspect via React Query Devtools).

- [ ] **Step 5: Manual check — rollback path**

With DevTools Network tab set to "Offline" (or block the discount-creation request via
a request-blocking rule), attempt to create a discount code. Confirm it appears
immediately, then disappears once the mutation fails (the existing `onError` toast in
`EventManagementTabs.tsx` should also fire — that handler is untouched by this task and
runs independently of the rollback).

- [ ] **Step 6: Commit**

```bash
git add services/discounts/discounts.queries.ts
git commit -m "feat: apply optimisticUpdate to useCreateDiscount

Reference implementation for the optimisticUpdate helper: the new
discount now appears in the list immediately instead of waiting for
the invalidate-and-refetch round trip, and rolls back automatically if
the request fails."
```

---

### Task 6: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck diff against baseline**

```bash
npx tsc --noEmit 2>&1 > /tmp/tsc-final.txt
diff /tmp/tsc-baseline.txt /tmp/tsc-final.txt
```

Expected: no output (identical error sets — same pre-existing 19 errors, nothing new).
If there's a diff, read it: any *new* error means a task above introduced a real type
problem that needs fixing before continuing.

- [ ] **Step 2: Full manual pass**

```bash
npm run dev
```

Re-run all manual checks from Tasks 2, 3, and 5 in one session:
- Navigate between a public route and a protected route repeatedly — no full-page
  loader/remount after the first load.
- Header shows a skeleton (not "Sign In") on a protected route while `user` is loading.
- `wallet-balance` and `resaleListings` refetch on window focus.
- Creating a discount code updates the list optimistically and rolls back on a forced
  failure.

- [ ] **Step 3: Review the full diff**

```bash
git diff staging --stat
```

Confirm only the six files from Tasks 1–5 changed:
`lib/auth-context.tsx`, `components/layout/header.tsx`, `lib/provider.tsx`,
`services/wallet/wallet.queries.ts`, `services/tickets/tickets.queries.ts`,
`services/query-utils.ts` (new), `services/discounts/discounts.queries.ts`.

No further commit for this task — it's a verification checkpoint. If everything
passes, Phase 0 is complete and ready for Phase 1 (organizer-facing pages) as its own
future spec.
