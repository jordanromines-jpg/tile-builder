/* The looks (3.6): each look's Library passes axe (contrast above all: a look sets its own colours) in light and dark,
   and the Library and a build step look as they did, so a change to the shared screens can't quietly break a look.
   Classic is covered by library.spec.ts and build.spec.ts. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { startBuild, useSet } from "./helpers";

const LOOKS = ["toy", "book", "studio"] as const;
const ALL = ["classic", ...LOOKS] as const;

async function inLook(page: Page, look: string, ground: "light" | "dark") {
  await page.addInitScript(
    ([l, g]) => {
      localStorage.setItem("tile-builder.look", l);
      localStorage.setItem("tile-builder.theme", g);
    },
    [look, ground],
  );
  await useSet(page, "Magna-Tiles Clear Colors 32");
}

for (const look of LOOKS) {
  for (const ground of ["light", "dark"] as const) {
    test(`${look}: the Library passes axe and looks as it did in ${ground}`, async ({ page }) => {
      await inLook(page, look, ground);
      await page.goto("#/");
      await page.getByRole("button", { name: "Got it" }).click();
      await page.getByRole("button", { name: "3 to 5" }).click();
      await expect(page.getByRole("heading", { name: "You can build these" })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
      await expect(page).toHaveScreenshot(`look-${look}-library-${ground}.png`);
    });
  }

  test(`${look}: build mode looks as it did`, async ({ page }) => {
    await inLook(page, look, "light");
    await page.goto("#/build/castle");
    await startBuild(page);
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`look-${look}-build.png`);
  });
}

for (const look of ALL) {
  test(`${look}: the tiles list passes axe`, async ({ page }) => {
    await inLook(page, look, "light");
    await page.goto("#/build/castle");
    await expect(page.getByRole("dialog", { name: "Get your tiles" })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });

  test(`${look}: a project that can't be had says so, and passes axe`, async ({ page }) => {
    await inLook(page, look, "light");
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
