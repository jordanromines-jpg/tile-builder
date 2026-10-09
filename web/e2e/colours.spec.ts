/* Builds in the family's colours (4.3): a set brings its brand's colours, the build is drawn and named in them, and the
   tiles list says so; the grown-ups' Tiles screen offers only the colours the brand makes. */
import { expect, test } from "@playwright/test";
import { useSet } from "./helpers";

/** Open the squares' colours on the grown-ups' Tiles screen, if they aren't open. */
async function openColours(page: import("@playwright/test").Page) {
  const d = page.locator("details").first();
  if (!(await d.evaluate((e) => (e as HTMLDetailsElement).open))) await d.locator("summary").click();
}

const tilesList = (page: import("@playwright/test").Page) => page.getByRole("dialog", { name: "Get your tiles" });

test("with PicassoTiles 100, the castle is built in its colours, light blue and pink too, and the list says so", async ({ page }) => {
  await useSet(page, "PicassoTiles PT100 Classic Starter");
  await page.goto("#/build/castle");
  const list = tilesList(page);
  await expect(list).toBeVisible();
  await expect(list.getByText("Built in your colours. The picture shows the colours it was made in.")).toBeVisible();
  await expect(list.getByRole("img", { name: /light blue/ }).or(list.getByRole("button", { name: /light blue/ })).first()).toBeVisible();
  await expect(list.getByRole("img", { name: /pink/ }).or(list.getByRole("button", { name: /pink/ })).first()).toBeVisible();
});

test("with no tiles entered, the castle keeps the colours it was made in", async ({ page }) => {
  await page.goto("#/build/castle");
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
  await expect(page.getByText("Built in your colours", { exact: false })).toHaveCount(0);
});

test("a set fills in its colours: six for Magna-Tiles, eight for PicassoTiles", async ({ page }) => {
  await useSet(page, "Magna-Tiles Clear Colors 100");
  await openColours(page);
  await expect(page.getByRole("group", { name: "red squares" })).toBeVisible();
  await expect(page.getByRole("group", { name: "pink squares" })).toHaveCount(0);
  await page.goto("#/grownups/tiles");
  await page.getByRole("button", { name: "PicassoTiles PT100 Classic Starter" }).click();
  await page.getByRole("button", { name: "Use this set" }).click();
  await openColours(page);
  await expect(page.getByRole("group", { name: "pink squares" })).toBeVisible();
  await expect(page.getByRole("group", { name: "light blue squares" })).toBeVisible();
});
