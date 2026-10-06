import { test, expect, publicPath, sections } from "./support";

for (const width of [360, 768, 1440]) {
  test(`All section types remain usable at ${width}px without manual mobile overrides`, async ({ page, seed }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(publicPath(seed.sites.allSections.slug));
    await expect(page.getByRole("heading", { name: seed.sites.allSections.heading, exact: true })).toBeVisible();
    const blocks = page.locator("main [data-section-type]");
    await expect(blocks).toHaveCount(sections.length);
    for (let index = 0; index < sections.length; index++) {
      const block = blocks.nth(index);
      await block.scrollIntoViewIfNeeded();
      await expect(block).toBeVisible();
      const box = await block.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.x).toBeGreaterThanOrEqual(-1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.locator("summary").filter({ hasText: "What time do doors open?" }).click();
    await expect(page.getByText("Doors open at 6 PM.", { exact: true })).toBeVisible();
  });
}
