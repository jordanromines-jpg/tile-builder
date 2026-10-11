/* Pip in 3D (5.3.3–5.3.8; the flat Pip of 3.9 is in pip.spec.ts): beside the build, a hop and a carried tile on Next, a cheer on the finish. It is drawn only
   with a GPU (without one the flat Pip stands in), so where there is none these skip; on a Mac they run. */
import { expect, test, type Page } from "@playwright/test";
import { startBuild } from "./helpers";

// on a Mac, this spec's browser gets the GPU (Metal), so the 3D Pip is there to test; CI has none, and it skips
if (!process.env.CI) test.use({ launchOptions: { args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] } });

async function pip(page: Page) {
  const has = await page.waitForFunction(() => !!window.__pip, null, { timeout: 8000 }).then(() => true).catch(() => false);
  test.skip(!has, "no GPU here: the flat Pip stands in, and the other specs cover it");
}

test("Pip stands clear of the build, and hops carrying the step's tile on Next", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("#/build/pitched-house");
  await startBuild(page);
  await pip(page);
  const [x, , z] = await page.evaluate(() => window.__pip!.at());
  // the build is about 2 squares across, centred: Pip stands off it
  expect(Math.hypot(x, z)).toBeGreaterThan(1.5);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__pip!.holding()), { timeout: 1000, intervals: [30] }).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__pip!.clip()), { timeout: 2000 }).toBe("hop");
});

test("Pip cheers on the finish", async ({ page }) => {
  await page.goto("#/done/castle");
  await pip(page);
  await expect.poll(() => page.evaluate(() => window.__pip!.clip()), { timeout: 5000 }).toBe("cheer");
});
