import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { test as base, expect, type BrowserContext, type Page } from "playwright/test";
import { z } from "zod";

export const sections = ["Hero", "About", "Upcoming Editions", "Ticket CTA", "Lineup", "Schedule", "Gallery", "Venue", "Sponsors", "FAQ", "Countdown", "Rich Content", "Social / Contact", "Footer"] as const;
export const templates = ["Blank", "Concert / Party", "Conference", "Workshop / Class", "Festival", "Corporate / Community"] as const;

const siteSchema = z.object({ id: z.string().min(1), slug: z.string().regex(/^[a-z0-9-]+$/), heading: z.string().min(1) });
const fixtureSchema = z.object({
  sites: z.object({
    published: siteSchema, grace: siteSchema, expired: siteSchema,
    nearest: siteSchema, comingSoon: siteSchema, soldOut: siteSchema,
    specific: siteSchema, cancelled: siteSchema, noUpcoming: siteSchema,
    allSections: siteSchema, foreign: siteSchema,
  }),
  events: z.object({
    nearestName: z.string().min(1), laterName: z.string().min(1),
    nearestPath: z.string().startsWith("/events/"),
    specificPath: z.string().startsWith("/events/"),
    basicPath: z.string().startsWith("/events/"),
    foreignId: z.string().min(1),
  }),
});
export type Seed = z.infer<typeof fixtureSchema>;
export type Account = "PRO" | "FREE" | "GRACE" | "EXPIRED" | "FOREIGN";
function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. See e2e/event-sites/README.md; no feature results can be inferred without real fixtures.`);
  return value;
}
export function apiURL(path: string) {
  return `${required("E2E_API_URL").replace(/\/$/, "")}${path}`;
}
export async function login(context: BrowserContext, account: Account = "PRO") {
  // This is the real existing NestJS cookie/session login, not a forged session.
  const response = await context.request.post(apiURL("/v1/auth/login"), {
    data: { email: required(`E2E_${account}_EMAIL`), password: required(`E2E_${account}_PASSWORD`) },
  });
  expect(response.status(), `Real ${account} login must succeed`).toBe(200);
  const me = await context.request.get(apiURL("/v1/auth/me"));
  expect(me.status(), "Session cookie must authenticate the next request").toBe(200);
  const body = await me.json();
  expect(body.user, "Authenticated response must contain the real user").toBeTruthy();
  // Mirror useLogin's client hint using the authenticated server response.
  // The server-issued cookie remains the authorization credential.
  await context.addInitScript(({ origin, user }) => {
    if (location.origin === origin) localStorage.setItem("ticketer-user", JSON.stringify(user));
  }, { origin: new URL(required("E2E_BASE_URL")).origin, user: body.user });
}
export const builderPath = (id: string) => `/organizer/event-sites/${encodeURIComponent(id)}`;
export const publicPath = (slug: string) => `/e/${slug}`;
export const titleField = (page: Page) => page.getByRole("textbox", { name: "Hero heading", exact: true });
export const preview = (page: Page) => page.getByTestId("site-preview");
export const renderedSections = (page: Page) => preview(page).locator("[data-section-type]");
export async function saved(page: Page) {
  await expect(page.getByRole("status", { name: "Save status" })).toHaveText("Saved");
}
export async function publish(page: Page) {
  // Await the actual response before reading the public site: an existing
  // "Published" label must never satisfy a subsequent publication prematurely.
  const response = page.waitForResponse(r => r.request().method() === "POST" && /\/event-sites\/[^/]+\/publish$/.test(new URL(r.url()).pathname));
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  expect((await response).ok(), "Publication must succeed on the server").toBe(true);
}

type Fixtures = {
  seed: Seed;
  newSite: (account?: Account, template?: typeof templates[number]) => Promise<{ id: string; slug: string; heading: string }>;
};
export const test = base.extend<Fixtures>({
  seed: async ({}, use) => {
    if (process.env.E2E_ISOLATED !== "1") throw new Error("Set E2E_ISOLATED=1 only for a disposable test installation. These tests create/delete test sites.");
    required("E2E_BASE_URL");
    required("E2E_API_URL");
    await use(fixtureSchema.parse(JSON.parse(readFileSync(required("E2E_FIXTURES"), "utf8"))));
  },
  newSite: async ({ page, context, seed }, use) => {
    const created: string[] = [];
    await use(async (account = "PRO", template = "Blank") => {
      await login(context, account);
      const slug = `e2e-${randomUUID()}`;
      const heading = `Event ${slug}`;
      await page.goto("/organizer/event-sites");
      await page.getByRole("button", { name: "Create Event Site", exact: true }).click();
      await page.getByRole("button", { name: template, exact: true }).click();
      await page.getByRole("textbox", { name: "Site name", exact: true }).fill(heading);
      await page.getByRole("textbox", { name: "Site slug", exact: true }).fill(slug);
      await page.getByRole("button", { name: "Create draft", exact: true }).click();
      await expect(page).toHaveURL(/\/organizer\/event-sites\/[^/?]+$/);
      const id = new URL(page.url()).pathname.split("/").at(-1)!;
      created.push(id);
      await titleField(page).fill(heading);
      await saved(page);
      return { id, slug, heading };
    });
    // Only delete IDs created by this test, never seeded events or other sites.
    for (const id of created) {
      const response = await context.request.delete(apiURL(`/v1/event-sites/${encodeURIComponent(id)}`));
      expect([200, 204], `Cleanup failed for test-created site ${id}`).toContain(response.status());
    }
  },
});
export { expect };
