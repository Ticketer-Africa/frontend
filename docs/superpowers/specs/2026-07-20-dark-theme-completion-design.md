# Dark Theme Completion: Remaining Frontend Screens — Design

## Decision

Extend the existing dark, coral-accent visual system from `feature/ui-redesign` to every remaining frontend route, including legal pages. Preserve all user-facing behavior, data flows, validation, permissions, and route structure. This is a visual-system rollout, not an information-architecture rewrite.

## Scope

### Account and ticket-holder routes

- `app/my-tickets/page.tsx` and its loading state
- `app/ticket/[id]/page.tsx` and its loading state
- `app/wallet/page.tsx` and its loading state
- `app/settings/page.tsx` and its loading state

### Organizer routes

- `app/organizer/page.tsx` and its loading state
- `app/organizer/create-event/page.tsx` and its loading state
- `app/organizer/update-event/[id]/page.tsx`
- `app/organizer/view-event/[id]/page.tsx`
- `app/organizer/event/[id]/attendees/page.tsx`

### Verification and legal routes

- `app/verify-otp/page.tsx` and its loading state
- `app/verify-ticket/page.tsx` and its loading state
- `app/terms/page.tsx`
- `app/service-agreement/page.tsx`

### Shared work

- Extend the header's dark-route detection to the listed route families.
- Restyle only call sites or page-local styles; do not globally alter shared primitives that light pages or external surfaces depend on.
- Update route loading/empty/error states to use the dark palette and avoid a white transition flash.

## Visual system

All scoped page roots receive `home-theme` and `var(--home-bg)`. Existing design tokens remain the source of truth:

| Element | Treatment |
| --- | --- |
| Page background | `var(--home-bg)` |
| Panels, cards, tables | dark card/elevated card surfaces with `--home-border` |
| Primary actions and active states | existing coral home-accent button treatment |
| Secondary actions | existing home-outline treatment |
| Primary and muted copy | `--home-text` and `--home-muted` |
| Form controls | local dark background/border/text/placeholder overrides |
| Success, warning, and error states | existing palette semantics with clear contrast; no arbitrary blue-gradient replacements |

## Route-level treatment

### Account and tickets

Keep tickets, wallet balances, transaction history, profile updates, password changes, QR/ticket information, and actions exactly as they work today. Restyle summary cards, ticket cards, lists, dialogs, form controls, and all loading/empty states. Ticket information must remain easy to scan on mobile and QR/barcode rendering must not be changed.

### Organizer

Keep all event CRUD, ticket configuration, attendee data, filters, export/action controls, and authorization behavior unchanged. Apply dark table/list surfaces, clear table headers and row dividers, and form-section hierarchy that is comfortable for long event-creation forms. Destructive actions retain visual distinction and confirmation behavior.

### Verification

Keep scanner/camera lifecycle, OTP submission, result states, and manual validation controls intact. Apply the new palette around these interaction surfaces only; browser/media APIs and scan logic are out of scope.

### Legal pages

Use a restrained dark document surface with readable maximum line width, elevated section headings, clear numbered/list hierarchy, and the existing legal copy unchanged.

## Header and navigation

The header should render its dark route variant for all scoped route families. Route matching must cover dynamic ticket and organizer pages without accidentally changing unrelated admin or API routes. Active navigation and mobile-menu contrast must remain accessible.

## Guardrails

- Do not change API requests, mutations, validation schemas, authentication guards, or navigation destinations.
- Do not modify global semantic colors or shared UI defaults in ways that alter non-scoped routes.
- Preserve existing responsive breakpoints and all accessibility labels/focus behavior.
- Do not remove loading, empty, error, success, or permission-denied states while restyling pages.

## Verification

- Type-check/lint the frontend after the rollout.
- Inspect each scoped route's loading and primary state at mobile and desktop widths where local development access permits.
- Confirm no light-theme classes remain on scoped page wrappers or route-specific surfaces except intentionally semantic status colors.
- Verify the working tree only includes the approved design-spec commit before implementation begins.
