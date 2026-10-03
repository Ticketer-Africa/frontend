import { test, expect, publish, publicPath } from "./support";

test("@policy Repeat page loads count once; a separate browser adds one unique visitor", async ({ page, newSite, browser, baseURL }) => {
  const site = await newSite();
  await publish(page);
  // The builder/preview must not count as visitor traffic. Each test owns a new
  // site so absolute expected counts are independent of other test runs.
  const analyticsURL = `/organizer/event-sites/${site.id}/analytics`;
  await page.goto(analyticsURL);
  await expect(page.getByTestId("unique-visitors")).toHaveText("0");
  const first = await browser.newContext({ baseURL });
  const second = await browser.newContext({ baseURL });
  try {
    const a = await first.newPage();
    await a.goto(publicPath(site.slug));
    await expect.poll(async () => {
      await page.reload();
      return page.getByTestId("unique-visitors").textContent();
    }, { timeout: 30_000 }).toBe("1");
    await a.reload();
    await a.reload();
    await expect.poll(async () => {
      await page.reload();
      return page.getByTestId("site-views").textContent();
    }, { timeout: 30_000 }).toBe("3");
    await expect(page.getByTestId("unique-visitors")).toHaveText("1");
    const b = await second.newPage();
    await b.goto(publicPath(site.slug));
    await expect.poll(async () => {
      await page.reload();
      return page.getByTestId("site-views").textContent();
    }, { timeout: 30_000 }).toBe("4");
    await expect(page.getByTestId("unique-visitors")).toHaveText("2");
  } finally { await first.close(); await second.close(); }
});
