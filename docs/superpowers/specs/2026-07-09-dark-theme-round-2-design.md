# Dark Theme Round 2: Public-Facing Pages — Design

## Source

No Figma reference for these pages (Figma file only designed Home). This round extrapolates the `.home-theme` design system established in the homepage redesign (`docs/superpowers/specs/2026-07-07-homepage-dark-redesign-design.md`) onto 7 additional public-facing pages, by systematic token substitution rather than bespoke per-page redesign.

## Scope

**Pages in this round:**
- `app/explore/page.tsx` (+ `explore-event-card.tsx`, `filter-section.tsx`, `events-grid.tsx`, `pagination-controls.tsx`, `empty-state.tsx`, `skeletons.tsx`)
- `app/events/[slug]/page.tsx` (+ `_components/event-header.tsx`, `_components/ticket-category-card.tsx`, and other `_components`)
- `app/checkout/page.tsx`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`
- `components/layout/header.tsx` (extend dark-route condition — shared component, high care required)

**New shared files:**
- `components/auth/auth-shell.tsx` (extracted from the 4 auth pages' identical copy-pasted shell)

**Explicitly out of scope (Round 2 of 2, not this round):** My Tickets, Organizer dashboard + Create/Update Event, Wallet, Settings, Admin dashboard, Terms, Service Agreement, Ticket/Verify pages. These stay on the current light theme. `Header`'s dark-route list must NOT include any of these paths.

**Out of scope entirely:** any change to the global `--background`/`--foreground` semantic tokens (used app-wide, including on pages staying light). `app/events/[slug]/page.tsx` currently uses these semantic tokens for its wrapper — this page gets the same treatment as the homepage did: an explicit `.home-theme` class + literal `var(--home-bg)` background override at the page root, not a global token flip.

## Header extension

Replace the boolean `isHome = pathname === "/"` with `isDarkRoute`:

```ts
const DARK_ROUTES = ["/", "/explore", "/checkout", "/login", "/register", "/forgot-password", "/reset-password"];
const isDarkRoute = DARK_ROUTES.includes(pathname) || pathname.startsWith("/events/");
```

Every existing `isHome ? X : Y` branch in `header.tsx` becomes `isDarkRoute ? X : Y` — same mechanism, wider condition. No other logic changes. All routes NOT in `DARK_ROUTES` and not under `/events/` keep the exact current light/sticky header behavior — this must be re-verified the same way the original Header task was (byte-for-byte diff of the non-dark branches against pre-change behavior for those routes).

## Design token application pattern

This is the reusable pattern every page in this round follows (no per-page reinvention):

| Element | Treatment |
|---|---|
| Page wrapper background | Flat `var(--home-bg)`, no radial glow (that stays unique to the Hero) |
| Card/panel surfaces | `HomeCard` (`tone="card"` default; `tone="elevated"` for a surface nested inside another card, e.g. an order summary inside a larger form) |
| Headings | `var(--home-text)` |
| Body/secondary text | `var(--home-muted)` |
| Small eyebrow/label text | `var(--home-text-highlight)` |
| Borders | `var(--home-border)` (subtle) / `var(--home-border-strong)` (emphasized, e.g. focus states) |
| Primary action button | `Button variant="homeAccent"` (already exists) |
| Secondary action button | `Button variant="homeOutline"` (**new**, this round) |
| Form inputs (Input/Select/Textarea/Checkbox) | NOT globally reskinned (shared components used by light-theme pages too) — each of the 7 pages overrides via `className` per instance |
| Decorative background circles (auth pages currently have blue blur circles) | Dropped, consistent with the Hero's flat/radial-gradient approach — no page in the redesign uses the old circle-animation language |

## New Button variant: `homeOutline`

Added to the existing `cva` variants map in `components/ui/button.tsx`, alongside `homeAccent`:

```ts
homeOutline:
  "border-[var(--home-border-strong)] bg-transparent text-[var(--home-text)] font-['Hanken_Grotesk'] font-semibold hover:bg-[var(--home-card)] transition-colors",
```

Used for: Explore's "Filters" button, Checkout's step-back/cancel actions, any secondary action alongside a `homeAccent` primary.

## Auth pages: shared shell extraction

Login, Register, Forgot Password, and Reset Password currently duplicate an identical shell (verified via code survey): `min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16` wrapper, `.my-tickets-bg-circle`/`.my-tickets-bg-circle-alt` decorative circles, `.auth-form-animate` wrapper, and a `bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20` card.

**New component:** `components/auth/auth-shell.tsx` — a dark-themed replacement for this shell, accepting `children` (the form content) and rendering:
- `home-theme` scoped wrapper, flat `var(--home-bg)` background, no decorative circles
- A `HomeCard` (`tone="card"`, `radius="card-lg"`) as the form container, replacing the `bg-white/80` card
- Preserves the existing `.auth-form-animate` entrance animation class (purely visual, not theme-dependent)

Each of the 4 auth pages is updated to use `<AuthShell>{...existing form JSX...}</AuthShell>` instead of its copy-pasted wrapper, with the form's own headings/labels/inputs/buttons restyled per the token table above (a `Card`/`CardHeader`/`CardContent` structure inside, where used, keeps its existing structure — only colors change).

This is a legitimate refactor-while-touching: the 4 files are already being edited for the theme change, and the shell is verified byte-identical duplication across all 4, so extracting it removes real redundancy rather than being speculative cleanup.

## Explore page

- Page wrapper: `min-h-screen` + `home-theme` + flat `var(--home-bg)`, replacing the `from-blue-50` gradient.
- `ExploreEventCard`: becomes a `HomeCard` (`tone="card"`) with the image as a **top thumbnail** (not full-bleed, per the "preserve info density" decision) — category badge and price badge overlaid on the thumbnail corners, then title/date/location/ticket-price/View Details button below in the card body, using the token table's text/border treatment. `View Details` button: `homeAccent`.
- `FilterSection`: dark `HomeCard`-style panel, inputs restyled via `className` overrides (dark bg/border/text/placeholder), "Filters" button → `homeOutline`, "Search" button → `homeAccent`.
- `PaginationControls`: page number buttons restyled with the border/text tokens; active page uses `homeAccent`-equivalent highlight.
- `EmptyState`/`EventsGridSkeleton`: dark background/card tones, skeleton shimmer uses `--home-card`/`--home-card-elevated` (same pattern as the homepage's `EventsSectionSkeleton`).

## Event details page (`app/events/[slug]`)

- Page wrapper: add `home-theme` class + explicit `style={{ backgroundColor: "var(--home-bg)" }}`, overriding the current `bg-background` (same override pattern used on the homepage itself, since `bg-background` is a global semantic token this page doesn't own).
- `EventHeaderV2`, ticket list (`TicketCategoryCardV2`), organizer card, order summary: converted to `HomeCard` surfaces with token-based text/borders.
- The amber (`bg-amber-50 border-amber-200`) occurrence-selector callout is recolored to use `--home-highlight-yellow` at low opacity for the background and `--home-border-strong` for the border, keeping the "this needs attention" semantic without an off-palette color.
- The `from-blue-500 to-indigo-600` avatar gradient fallback (organizer avatar placeholder) is recolored to a coral-based gradient consistent with `--home-accent`.
- Sticky mobile CTA bar and primary "Buy Tickets"-style actions: `homeAccent`. Back button: `homeOutline`.

## Checkout page

- All four return-path wrappers (loading, error, success, main form) get the flat `var(--home-bg)` + `home-theme` treatment, replacing both the `bg-background` states and the `from-blue-50/40` gradient state — checkout should look identically dark across every state, not just the happy path.
- `Card`/`CardHeader`/`CardContent` instances (shared with Register) are restyled via `className` overrides at each call site in this file only — the shared `Card` component's own defaults are not touched, since Register (also in scope) needs the same override pattern applied independently, and other pages using `Card` outside this round must stay light.
- Recipient forms, custom fields, discount code, buyer info sections: inputs restyled per the token table; primary "Continue"/"Pay Now" action: `homeAccent`; step-back/cancel: `homeOutline`.
- Success/error state icons and messaging: recolored using `--home-success`/`--home-success-text` (success) and a suitably desaturated warm tone from the existing palette for errors (no new error-specific token introduced — reuse `--home-accent` at reduced emphasis, since the palette has no dedicated red/error color and inventing one would be off-system).

## Assumptions / open items (flagged inline in code as comments, not blocking)

1. No dedicated error-state color exists in the `.home-theme` palette (it was derived entirely from the Home page Figma, which has no error states). Checkout's error messaging reuses existing tokens rather than introducing a new one — flagged for design follow-up if a true error-red is wanted later.
2. `/events/[slug]` is a dynamic route; the Header's dark-route check uses `pathname.startsWith("/events/")`, which will also match any future sub-routes under `/events/` — acceptable since no such sub-routes exist today, but worth re-checking if `/events/` grows new children later.
3. Since there is no Figma source for these 7 pages, "matching the design" for this round means "consistently applying the established token system," not "pixel-matching an external reference." Visual QA for this round is judgment-based (does it look coherent with the homepage?) rather than diffable against a source-of-truth screenshot.
