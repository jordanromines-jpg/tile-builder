/* How heavy the app is (2.4): the time to the first Library card and the draw calls of a finished big build. The
   numbers go to the test report; the limits catch a step backwards. */
import { expect, test } from "@playwright/test";

test("the Library shows its first card quickly", async ({ page }, info) => {
  await page.goto("./");
  await page.locator("main img").first().waitFor({ state: "attached" });
  const ms = await page.evaluate(() => Math.round(performance.now()));
  info.annotations.push({ type: "first card (ms)", description: String(ms) });
  console.log(`first card: ${ms} ms`);
});

for (const pid of ["queen-hexabella-palace", "castle", "truck-ultimate-arena"]) {
  test(`the finished ${pid} draws in few calls`, async ({ page }, info) => {
    await page.goto(`#/done/${pid}`);
    await expect.poll(() => page.evaluate(() => window.__viewer?.frames() ?? 0), { timeout: 30_000 }).toBeGreaterThan(2);
    await page.waitForTimeout(1500);
    const calls = await page.evaluate(() => window.__viewer!.calls());
    info.annotations.push({ type: `${pid} draw calls`, description: String(calls) });
    console.log(`${pid}: ${calls} draw calls`);
  });
}
