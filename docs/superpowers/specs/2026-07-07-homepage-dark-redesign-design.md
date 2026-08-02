# Homepage Dark Redesign — Design

## Source

Figma: `Ticketer Africa` file, node `118:2759` ("Home" frame).
https://www.figma.com/design/slxWZ4Id2gwsEbPPrt5fRx/Ticketer-Africa?node-id=118-2759

The Figma file contains only this one full page composition (plus shared nav/logo/animation symbols) — no other routes are designed there.

## Scope

**UI only. Homepage route (`/`) only.** No backend, data-fetching, or routing logic changes. Other routes (`/explore`, `/checkout`, `/login`, etc.) are untouched and keep their current light theme.

Files in scope:
- `app/page.tsx`
- `components/hero-section.tsx`
- `components/events-section.tsx`
- `components/features-section.tsx`
- `components/pricing-section.tsx`
- `components/faq-section.tsx`
- `components/layout/footer.tsx`
- `components/layout/header.tsx` (route-aware variant only — see below)
- `components/ui/button.tsx` (additive variant only)
- `app/globals.css` (additive, scoped tokens only)
- New: `components/home/home-card.tsx`

Out of scope: any other page, the global unauthenticated/authenticated theme tokens (`--background`, `--foreground`, etc.), backend/API changes.

## Header handling

`Header` is rendered once in `app/layout.tsx` and shared by every route — it cannot be replaced outright without affecting other pages. Instead:

- `Header` gains a `usePathname() === "/"` check.
- On `/`: renders a dark/transparent variant matching Figma — coral wordmark, nav links (Home / Explore / Resale Market), single "Sign In" pill button (no "Sign Up"), no sticky background/blur (sits over the hero image).
- On every other route: unchanged — today's light sticky header with the full auth-aware menu (Sign In/Sign Up or user avatar dropdown, mobile menu, etc.).
- Auth-aware logic (avatar dropdown, organizer/admin nav, logout) is preserved as-is under both variants; only the container/link styling branches by route.

"Resale Market" has no dedicated route in the app today — it links to `/explore` as the closest existing destination (documented inline as `TODO: point at a dedicated resale route if/when one exists`).

## Design system

All new tokens are scoped under a `.home-theme` class applied to the root wrapper in `app/page.tsx`, so they cannot leak into other routes' styling. Colors/fonts are additive to `app/globals.css` — no existing `--background`/`--foreground`/etc. tokens are modified.

### Color tokens

```css
.home-theme {
  /* surfaces */
  --home-bg: #0b0e14;             /* page / footer / hero base — unified across the page */
  --home-card: #141b2b;           /* feature card */
  --home-card-elevated: #191f2f;  /* FAQ row */
  --home-card-highlight: #232a3a; /* pricing card */

  /* borders */
  --home-border: rgba(86, 66, 62, 0.3);
  --home-border-subtle: rgba(86, 66, 62, 0.1);
  --home-border-strong: #56423e;

  /* text */
  --home-text: #dce2f7;           /* headings */
  --home-text-highlight: #ffb4a5; /* eyebrow badge text, nav active link, footer wordmark, hero/trending divider */
  --home-muted: #ddc0ba;          /* body / nav / descriptions */
  --home-muted-dim: #a48b86;      /* footer copyright */

  /* accent + semantic */
  --home-accent: #e2725b;
  --home-accent-fg: #5a0d02;      /* text on accent-colored bg */
  --home-success: #42a73b;
  --home-success-fg: #003403;
  --home-success-text: #92fa83;   /* standalone green copy, not on a chip */
  --home-highlight-yellow: #f4d03f;
}
```

### Typography

- Headings: `Syne` (already loaded sitewide via existing `@import` in `globals.css`) — extrabold for hero (72px, tracking -1.2px), bold for section headings (~48–58px), medium for card titles (20–24px).
- Body/nav/badges: `Hanken Grotesk` — new `@import` added to `globals.css`, only referenced within `.home-theme` scope. Regular 14–18px for body copy, semibold/bold for nav links and badges.

### Radii

- `--home-radius-card: 16px` (feature cards, FAQ rows)
- `--home-radius-card-lg: 24px` (pricing cards)
- Buttons/badges: `rounded-full`

### Shared primitives

- **`Button` `variant="homeAccent"`** — added to the existing shadcn-style `components/ui/button.tsx` variants map. Coral background (`--home-accent`), `--home-accent-fg` text, pill shape. Used by: Hero CTA ("Become an Organizer"), Pricing CTA ("Start Selling Tickets"), and the Home-only "Sign In" pill in `Header`. Figma actually gives the Hero/Pricing CTAs a coral drop-shadow glow and no border, while the Header's Sign In pill has a border and no glow — the shared variant carries neither by default, and each usage adds its own `className` for the glow or border as needed.
- **`HomeCard`** (new, `components/home/home-card.tsx`) — thin wrapper applying `bg-[var(--home-card)] border border-[var(--home-border)] rounded-[var(--home-radius-card)]` (or the elevated/highlight background via a prop), accepts `className` for per-use padding/layout. Used by: Feature cards, Pricing cards (with `background` prop for the 3 distinct card tones), FAQ rows.

## Section-by-section changes

### Hero (`hero-section.tsx`)
- Full-bleed section, `--home-bg` background (same base tone as the rest of the page) with a radial coral gradient overlay (decorative — no real photo asset since this isn't event-driven data; a CSS gradient standing in for the Figma photo backdrop).
- Small eyebrow text ("Experience the Rhythm") inside a bordered/blurred pill badge, Syne extrabold 3-line headline ("Buy. Sell. Enjoy" / "Events" / "Effortlessly.") with the last line in `--home-accent` (not `--home-text-highlight`).
- Hanken Grotesk subcopy, single `Button variant="homeAccent"` CTA ("Become an Organizer") with arrow icon, routes to `/register?intent=organizer` (unchanged from current behavior).
- The current `HeroSearchBar` is removed (not present in Figma design).
- CSS background-circle decorations removed/replaced by the new gradient treatment.

### Events → "Trending Events" (`events-section.tsx`)
- Data wiring unchanged: `useAllEvents()`, `event.bannerUrl`, `event.slug` navigation all stay exactly as-is.
- Section header restyled: "Trending Events" heading + a short coral (`--home-text-highlight`) divider + a coral "View All" link with a bottom border (not underlined) (routes to `/explore`), replacing the current centered "Upcoming Events" header + bottom CTA button.
- Cards: full-bleed `event.bannerUrl` image at 514px tall, gradient overlay fading from `--home-bg` (not black) into transparency, full-brightness (`--home-text`) 32px bold Syne title, a calendar-icon + date row also in full-brightness text (16px semibold Hanken Grotesk, not muted), rounded-2xl corners. Still `events.slice(0, 3)`.

### Features → "Everything you need for events" (`features-section.tsx`)
- Header restyled: Syne bold heading + Hanken Grotesk subcopy.
- 4 `HomeCard`s, each with a tinted icon badge (`bg-[color]/10` per feature, matching Figma's coral/green/yellow/pink tints), Syne medium title, Hanken Grotesk muted description.
- The resale card keeps its "NEW" badge, restyled as a green pill (`--home-success` bg, `--home-success-fg` text) instead of the current gradient `Badge`.
- Same 4 features/copy as today — no content changes.

### Pricing → "Simple, Transparent Pricing" (`pricing-section.tsx`)
- Replaces the current single-column stacked layout with two side-by-side `HomeCard`s (stacking on mobile):
  - **Left, highlighted**: `--home-card-highlight` bg, 2px `--home-accent` border, floating "FOR ORGANIZERS" pill badge, "5% per paid ticket", green "Free tickets? Totally free." line, supporting copy.
  - **Right**: `--home-card` bg, "15% flat fee" in `--home-highlight-yellow`, organizer/platform split bullets.
- Same fee figures and copy as today (5%/15%, 10%/5% split) — just restructured into two cards instead of one stacked column, matching Figma.
- `Button variant="homeAccent"` CTA below ("Start Selling Tickets"), same destination (`/register?intent=organizer`).

### FAQ (`faq-section.tsx`)
- Same data/accordion logic (`FAQS` array, `openIndex` state, `visibleFAQs` show-more) — unchanged.
- Each `FAQItem` becomes a `HomeCard` (elevated tone) instead of a white card; chevron recolored to `--home-accent`; "Show More" button restyled as a dark pill matching Figma.

### Footer (`footer.tsx`)
- Restructured from the current 4-column layout (Brand / Quick Links / Support / Contact) to Figma's 3-column layout:
  - **Brand** (spans 2 cols): "Ticketer Africa" wordmark in `--home-text-highlight`, tagline copy, 2 social icon buttons (Facebook, Instagram — matching the two icons present in Figma).
  - **PLATFORM**: Find Events (`/explore`), Resale Market (`/explore`, placeholder), Create Event (`/organizer/create-event`), Mobile App (`#`, placeholder — no route exists).
  - **SUPPORT**: Help Center (`#`, placeholder), Privacy Policy (`/terms`, closest existing page), Terms of Service (`/terms`), Contact Us (`mailto:ticketerafrica@gmail.com`).
- Dark `--home-bg` background, `--home-border-subtle` top border, centered copyright line in `--home-muted-dim`.
- The current phone-number contact line and 4th "Contact Info" column are dropped — not present in Figma.

## Assumptions / open items (flagged inline in code as comments, not blocking)

1. "Resale Market" (nav + footer) and "Mobile App" / "Help Center" (footer) have no dedicated route yet — pointed at the nearest existing page or `#`.
2. Hero background is a CSS gradient stand-in, not the literal Figma photo asset (per earlier decision — imagery should come from real content/backend, not a static export).
3. Footer drops the phone number and dedicated "Contact Info" column since Figma doesn't include them — email contact is preserved via "Contact Us".
