# Validation results — 2026-10-03

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
