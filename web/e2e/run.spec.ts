/* The truck runs (4.0c): a Monster-truck build's finish plays its recorded run after the party, then the words and
   "Run it again", which plays it once more; with motion reduced the run's end shows at once, with no Run it again. */
import { expect, test, type Page } from "@playwright/test";
import { tapParty } from "./helpers";

const run = (page: Page) => page.evaluate(() => window.__run ?? null);

test.describe("with motion", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("the first jump's finish plays its run to the end, and Run it again plays it again", async ({ page }) => {
    await page.goto("#/done/truck-first-jump");
    // skip the party: the run starts
    await tapParty(page);
    await expect.poll(async () => (await run(page))?.t ?? 0, { timeout: 30_000 }).toBeGreaterThan(0.2);
    expect((await run(page))!.done).toBe(false);
    // the words wait for the run's end
    await expect(page.getByText("Put the iPad down and play with what you made.")).toHaveCount(0);
    await expect.poll(async () => (await run(page))?.done, { timeout: 30_000 }).toBe(true);
    const again = page.getByRole("button", { name: "Run it again" });
    await expect(again).toBeVisible();
    await again.click();
    await expect.poll(async () => (await run(page))?.done, { timeout: 5_000 }).toBe(false);
    await expect.poll(async () => (await run(page))?.done, { timeout: 30_000 }).toBe(true);
  });

  test("a build that isn't a truck's has no run", async ({ page }) => {
    await page.goto("#/done/castle");
    await tapParty(page);
    await expect(page.getByText("Put the iPad down and play with what you made.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Run it again" })).toHaveCount(0);
    expect(await run(page)).toBeNull();
  });
});

test("with motion reduced, the run's end shows at once, with no Run it again", async ({ page }) => {
  await page.goto("#/done/truck-knock-down-wall");
  await expect.poll(async () => (await run(page))?.done, { timeout: 30_000 }).toBe(true);
  await expect(page.getByText("Put the iPad down and play with what you made.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Run it again" })).toHaveCount(0);
});
