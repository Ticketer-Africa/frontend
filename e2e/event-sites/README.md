# Event Sites E2E acceptance suite

## Status

These are **acceptance tests**, not evidence that the complete Event Sites MVP works. The current build has Event Sites routes, a workspace plan field, a basic builder, templates, a public renderer and a unique-visitor/page-view analytics screen. Billing activation, conversion analytics, richer controls and seeded E2E fixtures remain to be built. The suite contains executable Playwright assertions, uses real browser pages and real session login, and does not intercept application APIs or mock page rendering. It intentionally has no `skip`, `fixme`, or expected-failure markers that could make missing functionality look green.

Test discovery and TypeScript checking can run now. Browser journeys require the new feature, real disposable fixtures and a running app/backend. Missing configuration is a setup failure, not a detected product bug. Nothing here creates a fake backend or implements the feature.

## Existing integrations verified by source inspection

- Next.js 14 application; organizer pages are under `/organizer`.
- Cookie login: `POST /v1/auth/login` with `{email,password}`, followed by `GET /v1/auth/me`.
- Middleware forwards `ticketer_sid`; real session cookies from login are used for UI and API requests.
- Existing transactional event URLs: `/events/{slug}`.
- Installed `playwright` exposes `playwright/test`; no new dependency is required.
- Backend uses NestJS URI versioning, Prisma and PostgreSQL. No database changes were made.

These source observations are not claims that the live backend integration passed.

## Run

From `frontend`:

```sh
npm run test:e2e:list
./node_modules/.bin/tsc --project e2e/tsconfig.json
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=mobile-chromium
```

Before browser execution, start the actual frontend and backend against an isolated test database/session store. Configure the frontend's `NEXT_PUBLIC_API_BASE_URL` to that backend. This suite deliberately does not auto-load `.env` or start production-configured services.

Set the following environment variables in the shell/CI secret store:

- `E2E_ISOLATED=1`: confirms this is a disposable installation.
- `E2E_BASE_URL`: frontend origin, normally `http://localhost:3000`.
- `E2E_API_URL`: backend origin, without `/v1`.
- `E2E_FIXTURES`: absolute path to the real seed manifest; its required shape is in `fixtures.example.json`.
- `E2E_PRO_EMAIL`, `E2E_PRO_PASSWORD`.
- `E2E_FREE_EMAIL`, `E2E_FREE_PASSWORD`.
- `E2E_GRACE_EMAIL`, `E2E_GRACE_PASSWORD`.
- `E2E_EXPIRED_EMAIL`, `E2E_EXPIRED_PASSWORD`.
- `E2E_FOREIGN_EMAIL`, `E2E_FOREIGN_PASSWORD`.

All accounts must be verified organizers. Use the same hostname for frontend/backend when relying on host-only cookies; configure real CORS and session cookies appropriately. No login or entitlement is fabricated by the suite. Use separate Pro workspaces for PRO and FOREIGN.

Reports/traces and a recommended `e2e/fixtures.local.json` are gitignored. Traces can contain login requests; keep them private. Example IDs below are documentation, not working seed data. Build the fixture seeder against the real new models when they exist; do not add public test-setup endpoints to production.

## Proposed implementation contract

The following routes, accessible names and test attributes are the acceptance contract. Basic private preview and visitor reporting are implemented; some test fixture states remain future work. Keep behavioral assertions when adapting controls. Adapt them in the tests when the implementation chooses equivalent interfaces; retain the behavioral assertions.

### Routes

- `/organizer/event-sites`: list, Create Event Site action and creation dialog.
- `/organizer/event-sites/{id}`: builder; `/{id}/preview`: authenticated private preview.
- `/organizer/event-sites/{id}/analytics`: default date range includes the current test.
- `/e/{slug}`: published page, anonymously accessible; unpublished is HTTP 404.
- `/v1/event-sites/{id}`: authenticated GET/PATCH/DELETE.
- `/v1/event-sites/{id}/publish`: POST. Tests expect capability/entitlement rejection to return 403; successful UI publication must result in a successful server response. If expected-revision becomes a required request field, send the real current revision in the direct API tests rather than allowing validation errors to stand in for authorization results.

Only newly created site IDs are deleted by the per-test cleanup. Seeded editions and sites are never automatically deleted. Reset/reseed the disposable installation between runs, particularly after failures before the builder returns a site ID. Future DELETE implementation must preserve independent editions/orders.

### Builder accessible controls

- Buttons: `Create Event Site`, each template name from `support.ts`, `Create draft`, `Publish`, `Unpublish`, `Add section`.
- Textboxes: `Site name`, `Site slug`, `Hero heading`.
- A labelled native select `Hero alignment` with `left`, `center`, `right` values. If implemented as a custom combobox, adapt that interaction to its actual accessible options.
- Status with accessible name `Save status`, whose settled value is `Saved`.
- List named `Sections`; each listitem has stable `data-section-id` and buttons `Duplicate section`, `Move section up`, `Hide section`/`Show section`, `Delete section`.
- Dialog named `Section library`, with section buttons matching `support.ts`.
- Delete confirmation dialog contains `Delete`; unpublish confirmation contains `Confirm`.
- Free publication opens an upgrade dialog.
- Preview root `data-testid="site-preview"`; visible rendered blocks have `data-section-type`. Hidden sections must not occupy rendered slots.

### Public/analytics boundaries

- Public sections under `main` use `data-section-type`; the all-sections fixture contains exactly one of each of the 14 types.
- `data-testid="primary-ticket-target"` wraps the selected edition name and CTA/status, so other edition cards cannot satisfy primary-target assertions accidentally.
- Actionable ticket links use accessible names Buy tickets or Get tickets and lead to the real existing transactional page.
- Analytics values use `data-testid="unique-visitors"` and `data-testid="site-views"` and render plain integer counts for these small test fixtures.
- FAQ fixture contains `What time do doors open?` with answer `Doors open at 6 PM.`

## Seed contract

Use actual application persistence and a real controlled server clock. Do not mock network responses or browser-only dates to simulate backend expiry.

| Manifest site | Required data |
| --- | --- |
| published | Published, owned by PRO; use for foreign-workspace denial. |
| grace | Published snapshot, owner GRACE; effective Pro expiry six days before server time. |
| expired | Published snapshot retained, owner EXPIRED; effective Pro expiry eight days before server time. |
| nearest | NEXT_EVENT; at least three future editions created in a different order from start dates. Nearest is on sale. |
| comingSoon | NEXT_EVENT; nearest future edition is not on sale, later edition is on sale. |
| soldOut | NEXT_EVENT; nearest future edition is sold out, later edition is on sale. |
| specific | SPECIFIC_EVENT points to a later edition even though an earlier one is eligible. |
| cancelled | SPECIFIC_EVENT points to a cancelled edition. |
| noUpcoming | All linked editions completed; configured Coming soon fallback. |
| allSections | All 14 sections visible, no mobile overrides, long titles/text and real media; FAQ as above. |
| foreign | Owned by FOREIGN, separate workspace. |

`nearestName`/`laterName` can be shared display names across independent fixture events. `nearestPath` must match nearest's resolved event; `specificPath` must match specific's selected edition. `basicPath` must be an on-sale transactional event owned by EXPIRED so the downgrade regression is meaningful. Dates must be generated relative to the controlled server time.

New builder tests create an independent site with a UUID slug, then remove it. Analytics tests use independent anonymous browser contexts and a fresh site; there is no dependence on global visit counts. They first wait for all four views to be ingested before comparing unique visitors.

## Coverage and limits

46 project test cases are currently discovered: 43 desktop cases plus three mobile-emulation runs. Eight targeted desktop cases passed against isolated local Next.js, NestJS, PostgreSQL and Redis services; the full suite has not passed. These cover six templates, all 14 section operations, saved draft persistence, public snapshot isolation, publication with zero editions, UI/API Free gating, preview privacy, ownership, grace states, nearest/specific edition routing, responsive layouts and anonymous browser uniqueness.

`@policy` marks assertions based on plan proposals rather than fully settled user decisions: post-grace unavailable page and browser-based visitor identity. They execute by default; review the proposed behavior before implementation.

The following still need executable coverage once their concrete integrations exist; do not treat this initial suite as full MVP certification:

1. Exact `expiry + 7 days` boundary, cache invalidation, Pro restoration and preservation of explicit unpublish. Current fixtures cover day six/day eight, not the exact cutoff.
2. A sandbox paid purchase, authoritative payment webhook, QR issuance/check-in, purchase attribution, retry deduplication and refunds. Current CTA tests reach the existing event page; they do not prove payment succeeds.
3. Edition linking/unlinking persistence and publish isolation, EVENT_LIST, live cancellations/deletion, date ties/timezones, ongoing editions and sales-window transitions.
4. Full theme/media/SEO controls; uploaded assets, schema migration, malicious input, broken media, missing assets and font loading.
5. Concurrent autosaves/publication, slug races, network recovery, stale revisions, undo, granular editor/operations roles and non-cascading deletion.
6. Analytics reporting-period boundaries, unavailable storage, cookie expiry, bots, CTA counts and duplicate event ingestion.

Use real framework/database/request-path integration tests for these backend guarantees. Static type checks or mocked responses cannot establish compatibility.
