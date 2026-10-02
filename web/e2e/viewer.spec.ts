/* The 3D viewer by age (plan keys 6b, 6c), on the design page's viewer row. */
import { expect, test, type Page } from "@playwright/test";

async function open(page: Page, age: "a" | "b" | "c") {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("#/design");
  await page.getByRole("group", { name: "Viewer age" }).getByRole("button", { name: age, exact: true }).click();
  const v = page.getByRole("img", { name: "The castle in 3D" });
  await v.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => window.__viewer?.age)).toBe(age);
  return { v, errors };
}

const yaw = (page: Page) => page.evaluate(() => window.__viewer!.yaw());

for (const age of ["a", "b", "c"] as const) {
  test(`age ${age}: ▶ turns the model a quarter, "back to my side" turns it back`, async ({ page }) => {
    const { errors } = await open(page, age);
    await page.getByRole("button", { name: "Turn right" }).first().click();
    await expect.poll(() => yaw(page)).toBeCloseTo(Math.PI / 2, 2);
    await page.getByRole("button", { name: "Back to my side" }).first().click();
    await expect.poll(() => yaw(page)).toBeCloseTo(0, 2);
    expect(errors).toEqual([]);
  });
}

test("age a: dragging does nothing and it never turns by itself", async ({ page }) => {
  const { v } = await open(page, "a");
  const before = await v.screenshot();
  const box = (await v.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 200, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.__viewer!.autoRotate())).toBe(false);
  expect((await v.screenshot()).equals(before)).toBe(true);
});

test.describe("with motion", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("age c turns slowly by itself until touched, and keeps drawing", async ({ page }) => {
    const { v } = await open(page, "c");
    expect(await page.evaluate(() => window.__viewer!.autoRotate())).toBe(true);
    const f0 = await page.evaluate(() => window.__viewer!.frames());
    await page.waitForTimeout(2000);
    const f1 = await page.evaluate(() => window.__viewer!.frames());
    expect(f1 - f0).toBeGreaterThan(2); // it keeps drawing; the frame-time check is on the build screen (e2e/build.spec.ts)
    const box = (await v.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2, { steps: 4 });
    await page.mouse.up();
    await expect.poll(() => page.evaluate(() => window.__viewer!.autoRotate())).toBe(false);
  });
});
