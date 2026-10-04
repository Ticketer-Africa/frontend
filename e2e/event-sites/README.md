# Event Sites E2E acceptance suite

## Status

These are **acceptance tests**, not evidence that the complete Event Sites MVP works. The suite covers organizer draft/publish flows, public behavior, responsive builder controls and click-through attribution against isolated local Next.js, NestJS, PostgreSQL and Redis services. A separate Nest/PostgreSQL integration suite verifies free-ticket purchase attribution and analytics. Billing activation, provider-backed paid purchase confirmation and real S3/CloudFront media transfer remain unverified. Browser pages and login use the real applications; application APIs are not intercepted or mocked.

Browser journeys require a disposable database, the repository-owned fixture seeder and a running frontend/backend. Missing configuration is a setup failure, not a detected product bug.

## Existing integrations verified by source inspection

- Next.js 14 application; organizer pages are under `/organizer`.
- Cookie login: `POST /v1/auth/login` with `{email,password}`, followed by `GET /v1/auth/me`.
- Middleware forwards `ticketer_sid`; real session cookies from login are used for UI and API requests.
- Existing transactional event URLs: `/events/{slug}`.
- Installed `playwright` exposes `playwright/test`; no new dependency is required.
- Backend uses NestJS URI versioning, Prisma and PostgreSQL. Event Site and visit migrations were applied to the isolated test database.

The Event Sites HTTP/Prisma suite passed 6/6 against PostgreSQL with the production ValidationPipe settings.

## Run

Seed only an isolated local database on port 55433 named `event_sites_test` after applying backend migrations:

```sh
cd backend
EVENT_SITES_TEST_DATABASE=1 DATABASE_URL='postgresql://admin@127.0.0.1:55433/event_sites_test' node test/seed-event-sites-browser.mjs
```

Start the real backend with disposable Redis and the real frontend with `NEXT_PUBLIC_API_BASE_URL` pointing to that backend. From `frontend`, run:

```sh
npm run test:e2e:list
./node_modules/.bin/tsc --project e2e/tsconfig.json
E2E_ISOLATED=1 E2E_BASE_URL=http://localhost:3000 E2E_API_URL=http://localhost:3301 node e2e/event-sites/run-local.mjs e2e/event-sites --project=chromium --project=mobile-chromium
```

The seeder writes mode-0600 `fixtures.json` and `accounts.json` to `/private/tmp/event-sites-browser` by default. Set `EVENT_SITES_E2E_OUTPUT` in both commands to choose another directory. The runner reads those files and supplies the credentials only to Playwright. Neither command starts services or loads production `.env` values.

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

Reports/traces and a recommended `e2e/fixtures.local.json` are gitignored. Traces can contain login requests; keep them private. The seeder writes directly through Prisma only after checking the isolated database name, host, port and explicit test flag; it adds no public test-setup endpoint.

## Proposed implementation contract

The following routes, accessible names and test attributes are the acceptance contract. Basic private preview and visitor reporting are implemented; some test fixture states remain future work. Keep behavioral assertions when adapting controls. Adapt them in the tests when the implementation chooses equivalent interfaces; retain the behavioral assertions.

### Routes

- `/organizer/event-sites`: list, Create Event Site action and creation dialog.
- `/organizer/event-sites/{id}`: builder; `/{id}/preview`: authenticated private preview.
- `/organizer/event-sites/{id}/analytics`: default date range includes the current test.
- `/e/{slug}`: published page, anonymously accessible; unpublished is HTTP 404.
- `/v1/event-sites/{id}`: authenticated GET/PATCH/DELETE.
- `/v1/event-sites/{id}/publish`: POST. Tests expect capability/entitlement rejection to return 403; successful UI publication must result in a successful server response. If expected-revision becomes a required request field, send the real current revision in the direct API tests rather than allowing validation errors to stand in for authorization results.
- `/v1/public/event-sites/{slug}/click`: public POST for an actionable ticket CTA; accepts its published section ID, linked edition ID and unique click ID.

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
- Ticket-button click totals use `data-testid="ticket-cta-clicks"` and deduplicate requests by click ID.
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

The expanded full desktop/mobile run passed **52/52 cases**: 49 desktop and three mobile-emulation runs. New browser cases verify click-ID propagation to checkout, drag ordering, and bounded mobile visibility controls in preview and public pages. Coverage includes six templates, all 14 section operations, saved draft persistence, public snapshot isolation, publication with zero editions, UI/API Free gating, preview privacy, ownership, grace states, nearest/specific edition routing, responsive layouts and anonymous browser uniqueness. A later targeted run against the final build passed 15/15 affected browser cases. See `VALIDATION.md` for details.

`@policy` marks assertions based on plan proposals rather than fully settled user decisions: post-grace unavailable page and browser-based visitor identity. They execute by default; review the proposed behavior before implementation.

The following still need executable coverage once their concrete integrations exist; do not treat this initial suite as full MVP certification:

1. Cache invalidation, Pro restoration and preservation of explicit unpublish. The backend HTTP/PostgreSQL suite now checks the exact `expiry + 7 days` cutoff at one millisecond before and at the boundary.
2. A provider-backed sandbox paid purchase, authoritative payment webhook, QR issuance/check-in, retry deduplication and refunds. A real free-ticket purchase now proves that a validated site click persists on a completed transaction and appears in organizer revenue/order analytics; paid confirmation remains unverified.
3. Edition linking/unlinking persistence and publish isolation, EVENT_LIST, live cancellations/deletion, date ties/timezones, ongoing editions and sales-window transitions.
4. Uploaded asset transfer against S3/CloudFront, media crop/overlay, schema migration beyond v1, malformed-media rendering and self-hosted font loading. The builder now has broader bounded theme/SEO controls, image upload fields and broken-image fallback, but real cloud transfer has not been verified.
5. Concurrent autosaves/publication, slug races, network recovery, stale revisions, granular editor/operations roles and non-cascading deletion.
6. Analytics reporting-period boundaries, unavailable storage, cookie expiry, bots and duplicate purchase ingestion. Click retries are deduplicated by a unique click ID.

Use real framework/database/request-path integration tests for these backend guarantees. Static type checks or mocked responses cannot establish compatibility.
