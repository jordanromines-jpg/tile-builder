/* The Library (plan keys 6f, 6g): with a Magna-Tiles 32 and age 3–5, at least eight cards say "You can build it!"; the
   castle says what it needs; one tap opens build mode. Plates in both themes; axe. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { swipeTo, useSet } from "./helpers";

async function ready(page: Page, set = "Magna-Tiles Clear Colors 32") {
  await useSet(page, set);
  await page.goto("#/");
  await page.getByRole("button", { name: "Got it" }).click();
  await page.getByRole("button", { name: "3 to 5" }).click();
  await expect(page.getByRole("heading", { name: "You can build these" })).toBeVisible();
}

test("a Magna-Tiles 32 builds the 3–5 shelf; the castle says what it needs; one tap opens it", async ({ page }) => {
  await ready(page);
  const can = page.getByRole("button", { name: /You can build it!/ });
  expect(await can.count()).toBeGreaterThanOrEqual(8);
  const castle = await swipeTo(page, "For 9 to 10", /^The castle, 3 stars, Need \d+ more/);
  await expect(castle).toBeVisible();
  await page.getByRole("button", { name: /^A fish,/ }).click();
  await expect(page).toHaveURL(/#\/build\/fish$/);
});

test("with no tiles yet, the shelves still open and a line sends a grown-up to the door", async ({ page }) => {
  await page.goto("#/");
  await page.getByRole("button", { name: "Got it" }).click();
  await expect(page.getByText("A grown-up can add your tiles behind the door.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "For 3 to 5" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^A fish, 1 star$/ })).toBeVisible();
});

test("2.5: 0 to 3 puts the mosaics first; one opens with the grown-up's line and a row a step", async ({ page }) => {
  await ready(page, "Magna-Tiles Clear Colors 100");
  await page.getByRole("button", { name: "0 to 3" }).click();
  await (await swipeTo(page, "You can build these", /^Rainbow stripes, 1 star, You can build it!/)).click();
  await expect(page).toHaveURL(/#\/build\/baby-rainbow-stripes$/);
  await expect(page.getByText("For a grown-up to build, for a baby to look at.")).toBeVisible();
  await expect(page.getByText("Top row, left to right: 6 red squares.")).toBeVisible();
  await expect(page.getByRole("list", { name: "Step 1 of 6" })).toBeVisible();
});

test("2.7: a Monster trucks shelf after the age's shelves; the trucks chip shows only trucks; a card opens", async ({ page }) => {
  await ready(page, "Magna-Tiles Clear Colors 100");
  await expect(page.getByRole("heading", { name: "Monster trucks" })).toBeVisible();
  await page.getByRole("button", { name: "Monster trucks", exact: true }).click();
  await expect(page.getByRole("button", { name: /^A fish,/ })).toHaveCount(0);
  await (await swipeTo(page, "For 3 to 5", /^My first jump,/)).click();
  await expect(page).toHaveURL(/#\/build\/truck-first-jump$/);
});

test("2.9: a Wildflowers shelf after the age's shelves; the flower chip shows only wildflowers; a card opens", async ({ page }) => {
  await ready(page, "Magna-Tiles Clear Colors 100");
  await expect(page.getByRole("heading", { name: "Wildflowers" })).toBeVisible();
  await page.getByRole("button", { name: "Wildflowers", exact: true }).click();
  await expect(page.getByRole("button", { name: /^A fish,/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^My first jump,/ })).toHaveCount(0);
  await (await swipeTo(page, "For 3 to 5", /^(Kansas|Chicago|Carolina|North Carolina) /)).first().click();
  await expect(page).toHaveURL(/#\/build\/flower-/);
});

test("the theme filter shows one theme", async ({ page }) => {
  await ready(page);
  await page.getByRole("button", { name: "Space", exact: true }).click();
  await expect(page.getByRole("button", { name: /^A rocket,/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^A fish,/ })).toHaveCount(0);
});

for (const ground of ["light", "dark"] as const) {
  test(`the Library looks as it did and passes axe in ${ground}`, async ({ page }) => {
    await page.addInitScript((g) => localStorage.setItem("tile-builder.theme", g), ground);
    await ready(page);
    await page.evaluate(() => document.fonts.ready);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    await expect(page).toHaveScreenshot(`library-${ground}.png`);
  });
}
