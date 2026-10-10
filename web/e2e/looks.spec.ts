/* The one look (5.4.3; the four looks of 3.6 are gone): its screens pass axe (contrast above all: the look sets its own
   colours, over the room plate) in light and dark. How the screens look is held by library.spec.ts and build.spec.ts. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { startBuild, useSet } from "./helpers";

async function inGround(page: Page, ground: "light" | "dark") {
  await page.addInitScript((g) => localStorage.setItem("tile-builder.theme", g), ground);
  await useSet(page, "Magna-Tiles Clear Colors 32");
}

for (const ground of ["light", "dark"] as const) {
  test(`the Library passes axe in ${ground}`, async ({ page }) => {
    await inGround(page, ground);
    await page.goto("#/");
    await page.getByRole("button", { name: "Got it" }).click();
    await page.getByRole("button", { name: "3 to 5" }).click();
    await expect(page.getByRole("heading", { name: "You can build these" })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("html")).toHaveAttribute("data-look", "vinyl");
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("a look picked before 5.4.3 is let go: the one look shows", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("tile-builder.look", "book"));
  await page.goto("#/");
  await expect(page.locator("html")).toHaveAttribute("data-look", "vinyl");
  expect(await page.evaluate(() => localStorage.getItem("tile-builder.look"))).toBeNull();
  await expect(page.getByRole("button", { name: "Change how it looks" })).toHaveCount(0);
});

{
  const look = "vinyl";
  test(`All steps passes axe`, async ({ page }) => {
    await inGround(page, "light");
    await page.goto("#/build/castle");
    await startBuild(page);
    await page.getByRole("button", { name: "All steps" }).click();
    await expect(page.getByRole("slider", { name: "Choose a step" })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    await expect(page).toHaveScreenshot("build-castle-steps-light.png");
  });

  test(`the Watch it build bar passes axe`, async ({ page }) => {
    await inGround(page, "light");
    await page.goto("#/build/castle");
    await startBuild(page);
    await page.getByRole("button", { name: "Watch it build" }).click();
    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("radiogroup", { name: "How fast" })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });

  test(`the tiles list passes axe`, async ({ page }) => {
    await inGround(page, "light");
    await page.goto("#/build/castle");
    await expect(page.getByRole("dialog", { name: "Get your tiles" })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });

  test(`a project that can't be had says so, and passes axe`, async ({ page }) => {
    await inGround(page, "light");
    await page.route("**/projects/castle.json", (r) => r.abort());
    await page.goto("#/build/castle");
    await expect(page.getByText("This one isn't on the iPad yet.", { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
    if (process.env.STATE_SHOTS) await page.screenshot({ path: `${process.env.STATE_SHOTS}/cant-${look}.png` });
    await page.getByRole("button", { name: "Back to the shelf" }).click();
    await expect(page).toHaveURL(/#\/$/);
  });
}
