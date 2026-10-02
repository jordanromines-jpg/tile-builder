/* Build mode and the end of a build (plan keys 7a to 7h). */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { savedStep, useSet } from "./helpers";

const next = (page: Page) => page.getByRole("button", { name: "Next", exact: true });

test("the castle steps to the end with Next; a reload mid-way returns to the same step; the end clears it", async ({ page }) => {
  await useSet(page, "PicassoTiles PT100 Classic Starter");
  await page.goto("#/build/castle");
  await expect(page.getByRole("list", { name: "Step 1 of 25" })).toBeVisible();
  for (let i = 0; i < 10; i++) await next(page).click();
  await expect(page.getByRole("list", { name: "Step 11 of 25" })).toBeVisible();
  await savedStep(page, "castle", 10);
  await page.reload();
  await expect(page.getByRole("list", { name: "Step 11 of 25" })).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("list", { name: "Step 10 of 25" })).toBeVisible();
  for (let i = 0; i < 16; i++) await next(page).click();
  await expect(page).toHaveURL(/#\/done\/castle$/);
  await expect(page.getByRole("heading", { level: 1, name: "You built the castle! Look how tall the keep is." })).toBeVisible();
  await expect(page.getByText("Put the iPad down and play with what you made.")).toBeVisible();
  await page.getByRole("button", { name: "Back to the shelf" }).click();
  await expect(page).toHaveURL(/#\/$/);
  await page.goto("#/build/castle");
  await expect(page.getByRole("list", { name: "Step 1 of 25" })).toBeVisible();
});

test("short of tiles: the note comes first, with Start anyway and Pick another", async ({ page }) => {
  await useSet(page, "Magna-Tiles Clear Colors 32");
  await page.goto("#/build/castle");
  await expect(page.getByRole("heading", { name: /You need \d+ more tiles for this one\./ })).toBeVisible();
  await page.getByRole("button", { name: "Pick another" }).click();
  await expect(page).toHaveURL(/#\/$/);
  await page.goto("#/build/castle");
  await page.getByRole("button", { name: "Start anyway" }).click();
  await expect(page.getByRole("heading", { name: /You need/ })).toHaveCount(0);
});

test("with a Magna-Tiles 100 the castle's spires are equilateral, marked instead", async ({ page }) => {
  await useSet(page, "Magna-Tiles Clear Colors 100");
  await page.goto("#/build/castle");
  await page.getByRole("button", { name: "Start anyway" }).click();
  for (let i = 0; i < 23; i++) await next(page).click();
  await expect(page.getByRole("list", { name: "Step 24 of 25" })).toBeVisible();
  await expect(page.getByRole("list", { name: "This step's tiles" }).getByRole("img", { name: "4 red triangles" })).toBeVisible();
  await expect(page.getByText(/Four short triangles make a lower roof/).first()).toBeVisible();
});

test("9–10 can jump to any step by its dot", async ({ page }) => {
  await useSet(page, "PicassoTiles PT100 Classic Starter");
  await page.goto("#/build/castle");
  await page.getByRole("button", { name: "Step 7 of 25" }).click();
  await expect(page.getByRole("list", { name: "Step 7 of 25" })).toBeVisible();
});

test("it fell down: calm help, then a grown-up after two falls on one step", async ({ page }) => {
  await useSet(page, "Magna-Tiles Clear Colors 32");
  await page.goto("#/build/tower");
  for (let i = 0; i < 6; i++) await next(page).click();
  await page.getByRole("button", { name: "It fell down" }).click();
  await expect(page.getByRole("dialog", { name: "Towers fall sometimes. Builders fix them." })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "It fell down" }).click();
  await expect(page.getByText("Ask a grown-up to hold it while you add the next tile.")).toBeVisible();
  await page.getByRole("button", { name: "Start this layer again" }).click();
  await expect(page.getByRole("list", { name: "Step 6 of 9" })).toBeVisible();
});

test("after 90 s with no tap the panel rests; a tap brings it back", async ({ page }) => {
  await page.clock.install();
  await useSet(page, "Magna-Tiles Clear Colors 32");
  await page.goto("#/build/fish");
  await expect(page.getByRole("list", { name: "Step 1 of 4" })).toBeVisible();
  await page.clock.runFor(91_000);
  const rest = page.getByRole("button", { name: "Keep building" });
  await expect(rest).toBeVisible();
  await rest.click();
  await expect(rest).toHaveCount(0);
});

for (const pid of ["fish", "twin-bridge", "castle"]) {
  test(`build mode for ${pid} passes axe and keeps kid targets big`, async ({ page }) => {
    await useSet(page, "PicassoTiles PT100 Classic Starter");
    await page.goto(`#/build/${pid}`);
    await expect(next(page)).toBeVisible();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    const box = (await next(page).boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(104);
    expect(page.viewportSize()!.height - (box.y + box.height)).toBeGreaterThanOrEqual(32);
  });
}

test.describe("with motion", () => {
  // one device pixel a CSS pixel: the browser here draws in software, where cost grows with pixels; an iPad's GPU does not
  test.use({ contextOptions: { reducedMotion: "no-preference" }, deviceScaleFactor: 1 });

  test("the castle keeps drawing while a step lands and glows (6c)", async ({ page }) => {
    await useSet(page, "PicassoTiles PT100 Classic Starter");
    await page.goto("#/build/castle");
    // this set is 6 squares short: start anyway, so the model is shown
    await page.getByRole("button", { name: "Start anyway" }).click();
    await page.getByRole("button", { name: "Step 25 of 25" }).click();
    // the first frames compile the shaders, a one-off cost (seconds in software): measure once drawing is under way
    const start = await page.evaluate(() => window.__viewer!.frames());
    await expect.poll(() => page.evaluate(() => window.__viewer!.frames()), { timeout: 30_000 }).toBeGreaterThan(start + 3);
    const f0 = await page.evaluate(() => window.__viewer!.frames());
    await page.waitForTimeout(3000);
    const f1 = await page.evaluate(() => window.__viewer!.frames());
    // the glow keeps frames coming. The runner draws in software, so this checks the loop, not an iPad's speed
    // (an iPad's GPU draws the full look; software gets a lighter one, gpu.ts)
    expect(f1 - f0).toBeGreaterThanOrEqual(6);
  });

  test("the end: the celebration plays and a tap skips it", async ({ page }) => {
    await page.goto("#/done/fish");
    const party = page.getByRole("button", { name: "Well done" });
    await expect(party).toBeVisible();
    await party.click();
    await expect(party).toHaveCount(0);
  });
});

for (const [pid, ground] of [["fish", "light"], ["pitched-house", "light"], ["castle", "light"], ["castle", "dark"]] as const) {
  test(`build mode for ${pid} looks as it did in ${ground}`, async ({ page }) => {
    await page.addInitScript((g) => localStorage.setItem("tile-builder.theme", g), ground);
    await useSet(page, "PicassoTiles PT100 Classic Starter");
    await page.goto(`#/build/${pid}`);
    await expect(next(page)).toBeVisible();
    // a project this set is short for opens on its note: start, so the plate shows the model
    const start = page.getByRole("button", { name: "Start anyway" });
    if (await start.isVisible()) await start.click();
    await page.evaluate(() => document.fonts.ready);
    // the whole screen as a child sees it, 3D included: with motion reduced the model is still, and the runner's
    // software renderer draws it the same every time
    await expect(page).toHaveScreenshot(`build-${pid}-${ground}.png`);
  });
}
