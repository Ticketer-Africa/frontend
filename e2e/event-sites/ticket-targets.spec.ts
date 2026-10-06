import { test, expect, publicPath } from "./support";

test("NEXT_EVENT routes to the nearest start date rather than creation order", async ({ page, seed }) => {
  await page.goto(publicPath(seed.sites.nearest.slug));
  const target = page.getByTestId("primary-ticket-target");
  await expect(target).toContainText(seed.events.nearestName);
  const link = target.getByRole("link", { name: /buy tickets|get tickets/i });
  await link.click();
  await expect(page).toHaveURL(url => url.pathname === seed.events.nearestPath);
  await expect(page).toHaveURL(url => /^[0-9a-f-]{36}$/i.test(url.searchParams.get("siteClickId") || ""));
  await expect(page.getByRole("heading", { level: 1 })).toContainText(seed.events.nearestName);
});

for (const state of ["comingSoon", "soldOut"] as const) {
  test(`NEXT_EVENT keeps the nearest ${state} edition instead of a later on-sale one`, async ({ page, seed }) => {
    await page.goto(publicPath(seed.sites[state].slug));
    const target = page.getByTestId("primary-ticket-target");
    await expect(target).toContainText(seed.events.nearestName);
    await expect(target).toContainText(state === "comingSoon" ? /coming soon/i : /sold out/i);
    await expect(target.getByRole("link", { name: /buy tickets|get tickets/i })).toHaveCount(0);
    await expect(target).not.toContainText(seed.events.laterName);
  });
}

test("SPECIFIC_EVENT stays on the selected later edition", async ({ page, seed }) => {
  await page.goto(publicPath(seed.sites.specific.slug));
  await page.getByTestId("primary-ticket-target").getByRole("link", { name: /buy tickets|get tickets/i }).click();
  await expect(page).toHaveURL(url => url.pathname === seed.events.specificPath);
});

test("An Event Site click reaches checkout with its attribution ID", async ({ page, seed }) => {
  await page.goto(publicPath(seed.sites.nearest.slug));
  await page.getByTestId("primary-ticket-target").getByRole("link", { name: /get tickets/i }).click();
  await expect(page).toHaveURL(url => url.pathname === seed.events.nearestPath && Boolean(url.searchParams.get("siteClickId")));
  const clickId = new URL(page.url()).searchParams.get("siteClickId");
  expect(clickId).toMatch(/^[0-9a-f-]{36}$/i);
  await page.getByRole("button", { name: "Select", exact: true }).first().click();
  await page.getByRole("button", { name: /Buy Tickets/i }).last().click();
  await expect(page).toHaveURL(url => url.pathname === "/checkout");
  const checkout = await page.evaluate(() => JSON.parse(sessionStorage.getItem("checkoutData") || "null"));
  expect(checkout.siteClickId).toBe(clickId);
});

test("A cancelled specific edition is labelled and cannot send visitors to checkout", async ({ page, seed }) => {
  await page.goto(publicPath(seed.sites.cancelled.slug));
  const target = page.getByTestId("primary-ticket-target");
  await expect(target).toContainText(/cancelled/i);
  await expect(target.getByRole("link", { name: /buy tickets|get tickets/i })).toHaveCount(0);
});

test("Completed editions leave a readable site with its coming-soon fallback", async ({ page, seed }) => {
  await page.goto(publicPath(seed.sites.noUpcoming.slug));
  await expect(page.getByRole("heading", { name: seed.sites.noUpcoming.heading, exact: true })).toBeVisible();
  await expect(page.getByTestId("primary-ticket-target")).toContainText(/coming soon/i);
  await expect(page.getByTestId("primary-ticket-target").getByRole("link", { name: /buy tickets|get tickets/i })).toHaveCount(0);
});
