import { test, expect, publicPath, builderPath, login, apiURL } from "./support";

test("Last published site remains available inside the seven-day grace period", async ({ page, seed }) => {
  const site = seed.sites.grace;
  const response = await page.goto(publicPath(site.slug));
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: site.heading, exact: true })).toBeVisible();
});

for (const account of ["GRACE", "EXPIRED"] as const) {
  test(`${account} organizer keeps the saved draft but cannot republish`, async ({ page, context, seed }) => {
    const site = seed.sites[account === "GRACE" ? "grace" : "expired"];
    await login(context, account);
    await page.goto(builderPath(site.id));
    await expect(page.getByRole("textbox", { name: "Hero heading", exact: true })).toHaveValue(site.heading);
    const result = await context.request.post(apiURL(`/v1/event-sites/${site.id}/publish`));
    expect(result.status()).toBe(403);
  });
}

test("@policy After grace, saved branding is hidden behind an unavailable page", async ({ page, seed }) => {
  // Proposed post-grace policy from the plan; user confirmed the duration only.
  await page.goto(publicPath(seed.sites.expired.slug));
  await expect(page.getByRole("heading", { name: /site unavailable/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: seed.sites.expired.heading, exact: true })).toHaveCount(0);
  await page.goto(seed.events.basicPath);
  await expect(page.getByRole("link", { name: /buy tickets|get tickets/i }).or(page.getByRole("button", { name: /buy tickets|get tickets/i })).first()).toBeVisible();
});
