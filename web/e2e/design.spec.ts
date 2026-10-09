/* The design page: axe in both themes, every chip named, the 3D row draws, and every kid target is at least its age's
   size (88, 80, 64 px; the grown-ups door is a grown-up's 44 px on purpose). */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function open(page: Page, ground: "light" | "dark") {
  await page.addInitScript((g) => localStorage.setItem("tile-builder.theme", g), ground);
  await page.goto("#/design");
  await expect(page.getByRole("heading", { level: 1, name: "The design page" })).toBeVisible();
}

for (const ground of ["light", "dark"] as const) {
  test(`the design page passes axe in ${ground}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await open(page, ground);
    await expect(page.getByRole("img", { name: "red square" }).first()).toBeVisible();
    await expect(page.getByRole("img", { name: "purple tall triangle", exact: true })).toBeVisible();
    await expect(page.locator("canvas").first()).toBeVisible();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const [age, min] of [["a", 88], ["b", 80], ["c", 64]] as const) {
  test(`every kid target is at least ${min} px for age ${age}`, async ({ page }) => {
    await open(page, "light");
    await page.getByRole("group", { name: "Age for kid sizes" }).getByRole("button", { name: age, exact: true }).click();
    const small = await page.$$eval(
      "button.kid",
      (els, m) =>
        els
          .filter((e) => e.getAttribute("aria-label") !== "Grown-ups")
          .map((e) => ({ name: e.getAttribute("aria-label") ?? e.textContent, r: e.getBoundingClientRect() }))
          .filter(({ r }) => Math.min(r.width, r.height) < m - 0.5)
          .map(({ name, r }) => `${name}: ${Math.round(r.width)}×${Math.round(r.height)}`),
      min,
    );
    expect(small).toEqual([]);
  });
}

test.describe("with motion", () => {
  // the turntable and the bounce move only with motion on
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("the Pip truck row draws, and its views and bounce work", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await open(page, "light");
    const row = page.getByRole("img", { name: "The Pip truck in 3D" });
    await row.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => window.__truck?.frames() ?? 0)).toBeGreaterThan(3);
    for (const v of ["Front", "Side", "Back", "Top", "Turn"]) await page.getByRole("group", { name: "Truck view" }).getByRole("button", { name: v }).click();
    await page.evaluate(() => window.__truck?.bounce());
    const before = await page.evaluate(() => window.__truck?.frames() ?? 0);
    await expect.poll(() => page.evaluate(() => window.__truck?.frames() ?? 0)).toBeGreaterThan(before + 3);
    expect(errors).toEqual([]);
  });
});

for (const ground of ["light", "dark"] as const) {
  test(`the design page looks as it did in ${ground}`, async ({ page }) => {
    await open(page, ground);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`design-${ground}.png`, { fullPage: true, mask: [page.locator("canvas")] });
  });
}
