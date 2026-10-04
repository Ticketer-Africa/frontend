import { test, expect, sections, templates, preview, renderedSections, saved, publish, publicPath } from "./support";

for (const template of templates) {
  test(`Template ${template} creates a saved editable draft`, async ({ page, newSite }) => {
    await newSite("PRO", template);
    await expect(renderedSections(page).first()).toBeVisible();
    const initialCount = await renderedSections(page).count();
    expect(initialCount).toBeGreaterThan(0);
    await page.reload();
    await expect(renderedSections(page)).toHaveCount(initialCount);
    await expect(preview(page).getByRole("heading").first()).toBeVisible();
  });
}

test("Undo restores the previous draft edit", async ({ page, newSite }) => {
  await newSite();
  const heading = page.getByRole("textbox", { name: "Hero heading", exact: true });
  const original = await heading.inputValue();
  await heading.fill("A temporary headline");
  await expect(heading).toHaveValue("A temporary headline");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(heading).toHaveValue(original);
});

test("Theme fonts persist to both preview and the published page", async ({ page, newSite }) => {
  const site = await newSite();
  await page.getByRole("combobox", { name: "Body font", exact: true }).selectOption("DM Sans");
  await page.getByRole("combobox", { name: "Heading font", exact: true }).selectOption("Playfair Display");
  await saved(page);
  await expect(preview(page).locator("h1")).toHaveCSS("font-family", /Playfair Display/);
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Body font", exact: true })).toHaveValue("DM Sans");
  await publish(page);
  await page.goto(publicPath(site.slug));
  await expect(page.getByRole("heading", { name: site.heading, exact: true })).toHaveCSS("font-family", /Playfair Display/);
});

for (const section of sections) {
  test(`${section} can be added, duplicated, hidden and deleted without losing persisted order`, async ({ page, newSite }) => {
    await newSite();
    const initialCount = await renderedSections(page).count();
    await page.getByRole("button", { name: "Add section", exact: true }).click();
    await page.getByRole("dialog", { name: "Section library" }).getByRole("button", { name: section, exact: true }).click();
    const list = page.getByRole("list", { name: "Sections", exact: true });
    const added = list.getByRole("listitem").last();
    await expect(added).toContainText(section);
    await expect(renderedSections(page)).toHaveCount(initialCount + 1);
    await added.getByRole("button", { name: "Duplicate section", exact: true }).click();
    await expect(renderedSections(page)).toHaveCount(initialCount + 2);
    const duplicate = list.getByRole("listitem").last();
    const duplicateId = await duplicate.getAttribute("data-section-id");
    expect(duplicateId).toBeTruthy();
    await duplicate.getByRole("button", { name: "Move section up", exact: true }).click();
    await saved(page);
    await page.reload();
    await expect(list.getByRole("listitem").nth(initialCount)).toHaveAttribute("data-section-id", duplicateId!);
    const moved = list.getByRole("listitem").nth(initialCount);
    await moved.getByRole("button", { name: "Hide section", exact: true }).click();
    await saved(page);
    await page.reload();
    await expect(renderedSections(page)).toHaveCount(initialCount + 1);
    await moved.getByRole("button", { name: "Show section", exact: true }).click();
    await expect(renderedSections(page)).toHaveCount(initialCount + 2);
    await moved.getByRole("button", { name: "Delete section", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
    await saved(page);
    await page.reload();
    await expect(renderedSections(page)).toHaveCount(initialCount + 1);
  });
}

test("Hero alignment persists and is applied on the public site", async ({ page, newSite, browser, baseURL }) => {
  const site = await newSite();
  await page.getByRole("combobox", { name: "Hero alignment", exact: true }).selectOption("right");
  await saved(page);
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Hero alignment", exact: true })).toHaveValue("right");
  await publish(page);
  const context = await browser.newContext({ baseURL });
  try {
    const visitor = await context.newPage();
    await visitor.goto(publicPath(site.slug));
    await expect(visitor.getByRole("heading", { name: site.heading, exact: true })).toHaveCSS("text-align", "right");
  } finally { await context.close(); }
});
