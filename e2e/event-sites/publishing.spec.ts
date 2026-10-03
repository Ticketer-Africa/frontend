import { test, expect, login, apiURL, publicPath, builderPath, titleField, saved, publish } from "./support";

test("Free organizer saves a draft that survives a reload", async ({ page, newSite }) => {
  const site = await newSite("FREE");
  await page.reload();
  await expect(titleField(page)).toHaveValue(site.heading);
  await saved(page);
});

test("Free organizer cannot bypass the Pro publish gate through the API", async ({ page, context, newSite }) => {
  const site = await newSite("FREE");
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByRole("dialog", { name: /upgrade/i })).toBeVisible();
  const denied = await context.request.post(apiURL(`/v1/event-sites/${site.id}/publish`));
  expect(denied.status()).toBe(403);
  const publicResponse = await context.request.get(publicPath(site.slug));
  expect(publicResponse.status()).toBe(404);
});

test("Pro organizer publishes a coming-soon site with no editions", async ({ page, newSite, browser, baseURL }) => {
  const site = await newSite();
  await publish(page);
  const visitor = await browser.newContext({ baseURL });
  try {
    const publicPage = await visitor.newPage();
    const response = await publicPage.goto(publicPath(site.slug));
    expect(response?.status()).toBe(200);
    await expect(publicPage.getByRole("heading", { name: site.heading, exact: true })).toBeVisible();
    await expect(publicPage.getByRole("link", { name: /buy tickets|get tickets/i })).toHaveCount(0);
  } finally { await visitor.close(); }
});

test("Saved edits remain private until the next successful Publish", async ({ page, newSite, browser, baseURL }) => {
  const site = await newSite();
  await publish(page);
  const visitor = await browser.newContext({ baseURL });
  try {
    const publicPage = await visitor.newPage();
    await publicPage.goto(publicPath(site.slug));
    await expect(publicPage.getByRole("heading", { name: site.heading, exact: true })).toBeVisible();
    const updated = `${site.heading} updated`;
    await titleField(page).fill(updated);
    await saved(page);
    await page.reload();
    await expect(titleField(page)).toHaveValue(updated);
    await publicPage.reload();
    await expect(publicPage.getByRole("heading", { name: site.heading, exact: true })).toBeVisible();
    await expect(publicPage.getByRole("heading", { name: updated, exact: true })).toHaveCount(0);
    await publish(page);
    await publicPage.reload();
    await expect(publicPage.getByRole("heading", { name: updated, exact: true })).toBeVisible();
    await expect(publicPage.getByRole("heading", { name: site.heading, exact: true })).toHaveCount(0);
  } finally { await visitor.close(); }
});

test("Unpublish removes public access and preserves the editable draft", async ({ page, context, newSite }) => {
  const site = await newSite();
  await publish(page);
  await page.getByRole("button", { name: "Unpublish", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirm", exact: true }).click();
  await expect.poll(async () => (await context.request.get(publicPath(site.slug))).status()).toBe(404);
  await page.goto(builderPath(site.id));
  await expect(titleField(page)).toHaveValue(site.heading);
});

test("An anonymous visitor cannot read a private preview", async ({ browser, baseURL, newSite }) => {
  const site = await newSite();
  const visitor = await browser.newContext({ baseURL });
  try {
    const publicPage = await visitor.newPage();
    await publicPage.goto(`${builderPath(site.id)}/preview`);
    await expect(publicPage).toHaveURL(/\/login(?:\?|$)/);
    await expect(publicPage.getByRole("heading", { name: site.heading, exact: true })).toHaveCount(0);
  } finally { await visitor.close(); }
});

test("The owner can open the latest draft preview while the public slug stays private", async ({ page, context, newSite }) => {
  const site = await newSite("FREE");
  await page.goto(`${builderPath(site.id)}/preview`);
  await expect(page.getByRole("heading", { name: site.heading, exact: true })).toBeVisible();
  await expect(page.getByText("Private draft preview")).toBeVisible();
  const publicResponse = await context.request.get(publicPath(site.slug));
  expect(publicResponse.status()).toBe(404);
});

test("A different organizer cannot edit or publish someone else's site", async ({ context, seed }) => {
  const id = seed.sites.published.id;
  await login(context, "PRO");
  const owned = await context.request.get(apiURL(`/v1/event-sites/${id}`));
  expect(owned.status(), "Pro owner must be able to read the target before testing isolation").toBe(200);
  await login(context, "FOREIGN");
  for (const response of [
    await context.request.get(apiURL(`/v1/event-sites/${id}`)),
    await context.request.patch(apiURL(`/v1/event-sites/${id}`), { data: { name: "Unauthorized overwrite" } }),
    await context.request.post(apiURL(`/v1/event-sites/${id}/publish`)),
  ]) expect([403, 404]).toContain(response.status());
});
