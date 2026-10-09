/* The finish's falling tiles (4.2c): with motion on, the celebration draws, and then the stage stops drawing; a tap skips
   it; with motion reduced nothing falls. */
import { expect, test, type Page } from "@playwright/test";

const frames = (page: Page) => page.evaluate(() => window.__viewer?.frames() ?? 0);

test.describe("the finish with motion", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("tiles fall for a few seconds, then the stage stops drawing", async ({ page }) => {
    await page.goto("#/done/castle");
    // the first frames compile the shaders (seconds in software): measure once drawing is under way
    await expect.poll(() => frames(page), { timeout: 30_000 }).toBeGreaterThan(3);
    const f0 = await frames(page);
    await page.waitForTimeout(1000);
    expect(await frames(page)).toBeGreaterThan(f0 + 3);
    // the shower ends by itself (3.6 s) and the model rests: no frame is asked for after that
    await expect(page.getByRole("button", { name: "Well done" })).toHaveCount(0, { timeout: 15_000 });
    let last = -1;
    await expect
      .poll(
        async () => {
          const now = await frames(page);
          const same = now === last;
          last = now;
          await page.waitForTimeout(700);
          return same;
        },
        { timeout: 20_000 },
      )
      .toBe(true);
    const rest = await frames(page);
    await page.waitForTimeout(1500);
    expect(await frames(page)).toBe(rest);
    // the tiles stay where they landed: the panel is up beside them
    await expect(page.getByText("Put the iPad down and play with what you made.")).toBeVisible();
  });

  test("a tap skips it", async ({ page }) => {
    await page.goto("#/done/castle");
    const party = page.getByRole("button", { name: "Well done" });
    await expect(party).toBeVisible();
    await expect.poll(() => frames(page), { timeout: 30_000 }).toBeGreaterThan(3);
    await party.click();
    await expect(party).toHaveCount(0);
    await expect(page.getByText("Put the iPad down and play with what you made.")).toBeVisible();
  });
});

test("with motion reduced nothing falls: the finish settles at once", async ({ page }) => {
  await page.goto("#/done/castle");
  await expect.poll(() => frames(page), { timeout: 30_000 }).toBeGreaterThan(0);
  let last = -1;
  await expect
    .poll(
      async () => {
        const now = await frames(page);
        const same = now === last;
        last = now;
        await page.waitForTimeout(700);
        return same;
      },
      { timeout: 20_000 },
    )
    .toBe(true);
});
