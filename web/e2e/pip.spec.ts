/* Pip helps (3.9): he goes to the new tiles and comes back, tells a tip once, stays in his place with motion reduced,
   and his idle life never makes the 3D view draw. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { startBuild, useSet } from "./helpers";

const pip = (page: Page) => page.locator(".ts-guide .ts-pip");
/** How far Pip is from his place on the step panel's top edge, above Next. */
async function fromHome(page: Page) {
  const p = (await pip(page).boundingBox())!;
  const a = (await page.locator("aside").boundingBox())!;
  return Math.hypot(p.x - (a.x + a.width - 40 - p.width), p.y - (a.y - 76));
}
async function open(page: Page, pid = "castle") {
  await useSet(page, "PicassoTiles PT100 Classic Starter");
  await page.goto(`#/build/${pid}`);
  await startBuild(page);
}

test("the roof step shows its tip by Pip, and it passes axe", async ({ page }) => {
  await open(page);
  // the castle's first roof step
  await page.getByRole("button", { name: "Step 17 of 21" }).click();
  const tip = page.getByRole("note").filter({ hasText: "Hold the walls steady while the roof goes on." });
  await expect(tip).toBeVisible();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  // told once: not on the next step
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(tip).toHaveCount(0);
});

test("with motion reduced Pip stays in his place", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(250);
    expect(await fromHome(page)).toBeLessThan(2);
  }
});

test.describe("with motion", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("Pip carries the tiles over and comes back", async ({ page }) => {
    await open(page);
    // Start sends him with the first tiles: wait until he is back
    await expect.poll(() => fromHome(page), { timeout: 10_000 }).toBeLessThan(2);
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect.poll(() => fromHome(page), { timeout: 5000 }).toBeGreaterThan(80);
    await expect.poll(() => fromHome(page), { timeout: 10_000 }).toBeLessThan(2);
  });

  test("Pip's idle life never makes the 3D view draw", async ({ page }) => {
    // the fish (3–5): its view never turns by itself, so it comes to rest
    await open(page, "fish");
    await expect(page.locator(".friend-alive")).toHaveCount(1);
    // wait for the view to come to rest (Pip goes back, the new tiles land and stop glowing)
    let last = -1;
    await expect.poll(async () => {
      const now = await page.evaluate(() => window.__viewer!.frames());
      const still = now === last;
      last = now;
      return still;
    }, { intervals: [1500], timeout: 20_000 }).toBe(true);
    const f0 = await page.evaluate(() => window.__viewer!.frames());
    await page.waitForTimeout(3000);
    expect(await page.evaluate(() => window.__viewer!.frames())).toBe(f0);
  });
});
