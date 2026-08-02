# Dark Theme Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the established dark/coral UI system to every remaining frontend screen without changing product behavior.

**Architecture:** Page roots opt into `home-theme`; route-local Tailwind/style overrides retain light-theme primitives for unscoped pages. The Header derives dark presentation from exact route families, and loading states use the existing route loader with the active palette.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui, Lucide.

## Global Constraints

- Do not change API requests, mutations, schemas, guards, navigation destinations, or legal copy.
- Do not alter global semantic color tokens or shared defaults used by non-scoped routes.
- Use `home-theme`, `--home-bg`, `--home-card`, `--home-card-elevated`, `--home-text`, `--home-muted`, and `--home-border` plus existing `homeAccent` and `homeOutline` actions.
- Preserve responsive layout, keyboard focus, labels, scanner/camera lifecycle, QR/barcode rendering, and all empty/error/success/loading states.

---

## File Structure

- `components/layout/header.tsx`: dark-route predicate.
- `components/route-loader.tsx`: palette-aware loader.
- `app/{settings,wallet,ticket/[id]}/...`: account and ticket visual treatment.
- `app/organizer/...`: event-management treatment.
- `app/{verify-otp,verify-ticket}/...`: visual-only verification treatment.
- `app/{terms,service-agreement}/page.tsx`: readable legal documents.

### Task 1: Shared routing and loading state

**Files:**

- Modify: `components/layout/header.tsx`
- Modify: `components/route-loader.tsx`
- Test: `npm run lint`

**Interfaces:** Keeps `isHome: boolean` as the existing header presentation flag and consumes `pathname` from `usePathname()`.

- [ ] Extend the predicate with the exact route families below; retain existing public route checks.

```ts
const isHome =
  DARK_ROUTES.includes(pathname) || pathname.startsWith("/events/") ||
  pathname.startsWith("/resale/") || pathname.startsWith("/ticket/") ||
  pathname.startsWith("/organizer/") ||
  ["/organizer", "/wallet", "/settings", "/verify-otp", "/verify-ticket", "/terms", "/service-agreement"].includes(pathname);
```

- [ ] Make `RouteLoader` render its existing spinner/accessible label on a `home-theme` `--home-bg` surface when the active path belongs to that same scope.
- [ ] Run `npm run lint` from `frontend`; expect exit code 0.
- [ ] Commit with `git commit -m "feat: extend dark navigation and loading states"`.

### Task 2: Account, wallet, and ticket detail screens

**Files:**

- Modify: `app/settings/page.tsx`, `app/settings/loading.tsx`
- Modify: `app/wallet/page.tsx`, `app/wallet/loading.tsx`
- Modify: `app/ticket/[id]/page.tsx`, `app/ticket/[id]/loading.tsx`
- Verify: `app/my-tickets/page.tsx`, `app/my-tickets/loading.tsx`

**Interfaces:** Consumes existing forms, hooks, and ticket/wallet data; produces token-scoped visual wrappers only.

- [ ] Add `home-theme` and `style={{ backgroundColor: "var(--home-bg)" }}` to each non-null page root and every conditional return path.
- [ ] Replace route-local white/gray surfaces, copy, borders, controls, lists, and table rows with home-token equivalents; use `homeAccent` for primary actions and `homeOutline` for secondary actions.
- [ ] Preserve ticket/QR markup, image upload, password mutation, wallet data, and every event handler unchanged.
- [ ] Confirm `app/my-tickets/page.tsx` remains the existing redirect to `/explore`.
- [ ] Run `npm run lint` from `frontend`; expect exit code 0.
- [ ] Commit with `git commit -m "feat: dark-theme account and ticket screens"`.

### Task 3: Organizer dashboard and event management

**Files:**

- Modify: `app/organizer/page.tsx`, `app/organizer/loading.tsx`
- Modify: `app/organizer/create-event/page.tsx`, `app/organizer/create-event/loading.tsx`
- Modify: `app/organizer/update-event/[id]/page.tsx`
- Modify: `app/organizer/view-event/[id]/page.tsx`
- Modify: `app/organizer/event/[id]/attendees/page.tsx`

**Interfaces:** Consumes existing CRUD hooks, charts, form registration, attendee filters, and export/action handlers; produces no behavioral interface changes.

- [ ] Add dark token-scoped roots and loading surfaces.
- [ ] Restyle stat cards, charts, lists, empty/error panels, form sections, inputs, tables, status badges, and destructive actions with high-contrast home tokens.
- [ ] Preserve all `register`, `onSubmit`, upload, mutation, filtering, export, and confirmation calls exactly.
- [ ] Run `npm run lint` from `frontend`; expect exit code 0.
- [ ] Commit with `git commit -m "feat: dark-theme organizer screens"`.

### Task 4: Verification screens

**Files:**

- Modify: `app/verify-otp/page.tsx`, `app/verify-otp/loading.tsx`
- Modify: `app/verify-ticket/page.tsx`, `app/verify-ticket/loading.tsx`

**Interfaces:** Consumes existing OTP, camera, scanner, and validation logic; produces presentation-only changes.

- [ ] Add `home-theme` roots and dark loading-state wrappers.
- [ ] Restyle tabs, scanner/manual-entry panels, forms, result cards, and messaging with existing home tokens.
- [ ] Do not edit `Html5Qrcode`, media permissions, cleanup, ticket validation, or OTP submission logic.
- [ ] Run `npm run lint` from `frontend`; expect exit code 0.
- [ ] Commit with `git commit -m "feat: dark-theme verification screens"`.

### Task 5: Legal document screens

**Files:**

- Modify: `app/terms/page.tsx`
- Modify: `app/service-agreement/page.tsx`

**Interfaces:** Keeps all legal text, links, semantic headings, and navigation unchanged.

- [ ] Add full-height `home-theme` wrappers using `var(--home-bg)`.
- [ ] Place existing prose in centered `max-w-4xl` dark cards; use `--home-text` for headings, `--home-muted` for body copy, and `--home-border` for dividers.
- [ ] Run `npm run lint` from `frontend`; expect exit code 0.
- [ ] Commit with `git commit -m "feat: dark-theme legal pages"`.

### Task 6: Verification and build

**Files:** Verify all files changed by Tasks 1–5.

- [ ] Run `npm run lint` from `frontend`; expect exit code 0.
- [ ] Run `npm run build` from `frontend`; expect a successful Next.js production build with no TypeScript errors.
- [ ] Inspect loading and primary states for `/settings`, `/wallet`, `/ticket/<id>`, `/organizer`, `/organizer/create-event`, `/verify-otp`, `/verify-ticket`, `/terms`, and `/service-agreement` at mobile and desktop widths.
- [ ] Search scoped files with this command; resolve only unintentional light page surfaces.

```bash
rg -n "bg-white|bg-gray-(50|100)|text-gray-(900|800)|from-blue|to-indigo" app/settings app/wallet app/ticket app/organizer app/verify-otp app/verify-ticket app/terms app/service-agreement
```

- [ ] Commit verification corrections with `git commit -m "fix: polish remaining dark-theme screens"`.
