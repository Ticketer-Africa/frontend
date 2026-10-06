# Validation results — 2026-10-04

## Latest billing and S3 run

- Both `feat/event-sites-analytics` branches were pushed before the billing changes. The follow-up implements a provisional USD 20/month Bachs checkout, signed subscription webhook reconciliation, owner-only billing status, and a Publish-first upgrade dialog.
- Backend Nest/Prisma/PostgreSQL Event Sites suite: **7/7 passed**, including a local Bachs-compatible HTTP provider, signed webhook replay, Pro activation, cancellation and publication gating.
- Opt-in real S3 E2E suite: **1/1 passed**. It obtained a presigned URL, uploaded a PNG, confirmed it through the Event Sites API, verified both processed variants, and removed all test objects.
- Browser suite: **53/53 passed** across desktop and mobile, including the upgrade checkout navigation case. That case intercepts the external Bachs checkout response; it does not charge a card.
- Next production build completed and E2E TypeScript passed. The backend repository-wide TypeScript check still reports the pre-existing `test/app.e2e-spec.ts` Supertest import error.
- Direct Bachs sandbox API requests from this host receive Cloudflare error 1010 before API authentication. A sandbox product ID and webhook destination secret must be configured before the real provider checkout can be exercised. CloudFront image delivery remains unverified.

## Continued runtime validation

- Latest reproducible run: `backend/test/seed-event-sites-browser.mjs` created the disposable accounts/sites/editions; `frontend/e2e/event-sites/run-local.mjs` ran both Chrome projects. Final result: **49/49 Playwright cases passed together** in 2.5 minutes (46 desktop and three mobile-emulation cases). The backend site-list shape was corrected after the first full run exposed a client crash. An Event Site-specific unavailable page, narrow-heading wrap, and missing-event-banner fallback resolved the other runtime findings. The FAQ test now operates the native `<summary>` control, and event-page assertions match its actual heading and Select action.

- A production-built local Next.js frontend and real NestJS API ran against disposable PostgreSQL and Redis. One isolated Pro organizer and one isolated Free organizer were seeded directly in that database; payment/mail provider configuration used inert test values. No payment journey was run.
- Eight targeted Chromium cases passed: unique visitors across two browsers, Free draft persistence, Free API publish denial, zero-edition Pro publication, snapshot isolation, unpublish, owner draft preview and anonymous preview denial.
- The Event Sites backend HTTP/Prisma/PostgreSQL suite passed 4/4 with the same global ValidationPipe settings as the running app. The E2E TypeScript check passed before the production build. The final app build succeeded. The full browser suite is green; it does not cover the incomplete paid billing and confirmed-purchase attribution integrations.
- The Next.js worktree development server repeatedly recompiled and did not complete hydration during the first browser attempt; the production build completed and the selected browser cases passed. The Create Event Site button now stays disabled while site data is loading, preventing an early ineffective click.

## Initial suite validation

- Playwright discovery: 45 project cases in six spec files.
- E2E TypeScript compilation: passed.
- `git diff --check`: passed.
- Browser attempt: local Chrome launched with approved host access. The run then stopped at the suite isolation guard because `E2E_ISOLATED=1`, accounts and a real fixture manifest are not configured. Browser product behavior has not been verified.
- A first Event Sites implementation now exists. Real seeded accounts/entitlements, a fixture manifest and the remaining MVP features are still required. No browser journey or backend compatibility is reported as passing.

## Existing frontend tests

The first `npm test` run reported 73 failures and 12 passes; it also collected duplicate tests from a pre-existing `.claude/worktrees` checkout. A diagnostic repeat with `NODE_ENV=test` and that nested checkout excluded reported 37 failures and 7 passes. All 37 remaining assertion failures reported `act(...) is not supported in production builds of React.` No existing application/test bodies were modified to hide these failures.

Diagnostic command: `NODE_ENV=test npm test -- --exclude '.claude/**' --reporter=json --outputFile=/private/tmp/event-sites-existing-tests.json`.

Failed assertions:

- `components/pricing-section.test.tsx` — PricingSection explains the resale fee as event ticket resales
- `app/events/_shared/use-event-checkout.test.ts` — useEventCheckout stores checkout payload and navigates in live mode
- `app/events/_shared/use-event-checkout.test.ts` — useEventCheckout does not navigate in preview mode
- `app/events/_shared/use-ticket-selection.test.ts` — useTicketSelection toggles a category on and defaults its quantity to 1
- `app/events/_shared/use-ticket-selection.test.ts` — useTicketSelection caps combined quantity across categories at 10
- `app/events/_shared/use-ticket-selection.test.ts` — useTicketSelection removes a category from selection on second toggle
- `app/organizer/_components/event-form-step-layout-details.test.tsx` — EventFormStepLayoutDetails shows Lineup and FAQ editors for Hero Overlay
- `app/organizer/_components/event-form-step-layout-details.test.tsx` — EventFormStepLayoutDetails shows only FAQ for Ticket-First
- `app/organizer/_components/event-form-step-layout-details.test.tsx` — EventFormStepLayoutDetails shows pull quote, Good To Know, and FAQ for Editorial
- `app/organizer/_components/event-form-step-layout-details.test.tsx` — EventFormStepLayoutDetails shows Lineup and Show Timeline for Timeline
- `app/organizer/_components/event-form-step-layout.test.tsx` — EventFormStepLayout shows all 5 layout cards with title and description
- `app/organizer/_components/event-form-step-layout.test.tsx` — EventFormStepLayout calls onChange with the layout when a card is selected
- `app/organizer/_components/event-form-step-layout.test.tsx` — EventFormStepLayout opens the expand modal without changing the selection
- `app/organizer/_components/event-form-step-preview.test.tsx` — EventFormStepPreview renders a summary of the current form data, not the live buyer page
- `app/organizer/_components/event-form-step-preview.test.tsx` — EventFormStepPreview opens the live buyer preview when 'View as Buyer' is clicked
- `app/organizer/_components/event-form-step-preview.test.tsx` — EventFormStepPreview calls onPublish and onSaveDraft from their respective buttons
- `app/organizer/_components/faq-editor.test.tsx` — FaqEditor adds a question/answer row
- `app/organizer/_components/good-to-know-editor.test.tsx` — GoodToKnowEditor adds a point row
- `app/organizer/_components/layout-expand-modal.test.tsx` — LayoutExpandModal renders the live layout component with the dummy dataset when open
- `app/organizer/_components/layout-expand-modal.test.tsx` — LayoutExpandModal calls onClose when the close button is clicked
- `app/organizer/_components/layout-expand-modal.test.tsx` — LayoutExpandModal renders nothing when closed
- `app/organizer/_components/lineup-editor.test.tsx` — LineupEditor adds an artist row and calls onChange with the updated list
- `app/organizer/_components/lineup-editor.test.tsx` — LineupEditor removes an artist row
- `app/organizer/_components/show-timeline-editor.test.tsx` — ShowTimelineEditor adds a time slot row
- `app/events/_shared/layouts/editorial-layout.test.tsx` — EditorialLayout renders the presented-by byline, pull quote, and related events
- `app/events/_shared/layouts/editorial-layout.test.tsx` — EditorialLayout links each related event to its own event page
- `app/events/_shared/layouts/editorial-layout.test.tsx` — EditorialLayout opens a ticket selection modal instead of checking out directly
- `app/events/_shared/layouts/hero-overlay-layout.test.tsx` — HeroOverlayLayout renders the banner title, lineup, and FAQ
- `app/events/_shared/layouts/registry.test.tsx` — layout registry renders the component matching a given layout
- `app/events/_shared/layouts/split-screen-layout.test.tsx` — SplitScreenLayout defaults to the Overview tab and switches to Lineup on click
- `app/events/_shared/layouts/split-screen-layout.test.tsx` — SplitScreenLayout renders trust badges next to the buy panel
- `app/events/_shared/layouts/split-screen-layout.test.tsx` — SplitScreenLayout requires selecting a ticket category before it can be bought
- `app/events/_shared/layouts/ticket-first-layout.test.tsx` — TicketFirstLayout renders ticket tiers and FAQ
- `app/events/_shared/layouts/ticket-first-layout.test.tsx` — TicketFirstLayout does not render a Lineup section (Ticket-First has none)
- `app/events/_shared/layouts/timeline-layout.test.tsx` — TimelineLayout renders the show timeline in order and the lineup
- `app/events/_shared/layouts/timeline-layout.test.tsx` — TimelineLayout suggests other events to explore
- `app/events/_shared/layouts/timeline-layout.test.tsx` — TimelineLayout opens a ticket selection modal instead of checking out directly


## Final continuation — ticket clicks and editor Undo

- Added a public ticket-click endpoint backed by `EventSiteClick`. The API verifies a published section and linked edition, deduplicates retries by UUID click ID, and includes the 30-day click count in owner analytics. `test/event-sites.e2e-spec.ts` passed 4/4 through Nest, Prisma and PostgreSQL after both migrations were applied.
- Ticket actions on public pages report click IDs; private preview does not. Analytics displays unique visitors, page views and ticket button clicks. Added editor Undo for recent in-memory draft edits.
- Added browser acceptance for ticket-click analytics and Undo. The full final suite passed **48/48** desktop/mobile Playwright cases. E2E TypeScript compilation and `git diff --check` passed after reinstalling the local development dependencies. Next production build exited 0; its static sitemap fetch logged an expected network/DNS failure in the isolated environment.

## Event Site purchase attribution and builder expansion — 2026-10-04

- Added an Event Site click UUID to the existing event and checkout journey. Backend purchase validation accepts the click only for the same edition within seven days; the transaction stores the click ID. Analytics counts transaction starts, successful orders and completed-order amounts. A focused Nest/Prisma/PostgreSQL suite passed **6/6**, including an actual free ticket purchase through the v2 service, SQL analytics and rejected invalid/non-ticket CTA clicks. Paid provider confirmation remains outside this test.
- Added live countdown, gallery image layout and broken-image fallback, no-upcoming CTA fallback, drag reorder, broad bounded style controls, mobile visibility, contrast warnings and presigned site-media upload controls. The media API reuses the existing S3 confirmation pipeline, but actual S3/CloudFront transfer could not be exercised without configured cloud credentials.
- The expanded Playwright desktop/mobile acceptance run passed **52/52** on the production Next.js and Nest apps with isolated PostgreSQL and Redis. The first full run timed out one two-publish case at 45 seconds under suite load after its updated public page rendered; the case passed alone in 6.4 seconds. Its timeout was raised to 90 seconds, and the subsequent full run passed. Final code changes after that run passed 12/12 ticket/analytics/responsive browser checks and 3/3 builder checks. A production Next.js build and focused renderer/analytics component tests passed. Repository-wide TypeScript remains red from previously documented unrelated files.
- Remaining product scope: real Pro billing/upgrade lifecycle, confirmed paid order attribution/revenue/refund metrics, full PRD media/theme/SEO customization, team roles and their end-to-end tests. A sandbox payment journey was not run. Repository-wide Nest build still reports the pre-existing payout-admin return-type error. The frontend Vitest run reports 38 failures out of 76 tests with `act(...) is not supported in production builds of React`; the focused public renderer tests passed, and the Playwright suite passed.
- Exact expiry boundary: the backend Nest/Prisma/PostgreSQL suite passed the published-page check at `proExpiresAt + 7 days - 1 ms` and confirmed 404 at exactly `proExpiresAt + 7 days`.
- Global body/heading font controls now save with a draft and render in both the private preview and the published page; the focused test and full 49-case suite passed.
