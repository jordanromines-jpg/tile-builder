/* Build mode and the end of a build (plan keys 7a to 7h). */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { savedStep, startBuild, useSet } from "./helpers";

const next = (page: Page) => page.getByRole("button", { name: "Next", exact: true });

test("the castle steps to the end with Next; a reload mid-way returns to the same step; the end clears it", async ({ page }) => {
  await useSet(page, "PicassoTiles PT100 Classic Starter");
  await page.goto("#/build/castle");
  await expect(page.getByRole("list", { name: "Step 1 of 21" })).toBeVisible();
  for (let i = 0; i < 10; i++) await next(page).click();
  await expect(page.getByRole("list", { name: "Step 11 of 21" })).toBeVisible();
  await savedStep(page, "castle", 10);
  await page.reload();
  await expect(page.getByRole("list", { name: "Step 11 of 21" })).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("list", { name: "Step 10 of 21" })).toBeVisible();
  for (let i = 0; i < 12; i++) await next(page).click();
  await expect(page).toHaveURL(/#\/done\/castle$/);
  await expect(page.getByRole("heading", { level: 1, name: "You built the castle! Look how tall the keep is." })).toBeVisible();
  await expect(page.getByText("Put the iPad down and play with what you made.")).toBeVisible();
  await page.getByRole("button", { name: "Back to the shelf" }).click();
  await expect(page).toHaveURL(/#\/$/);
  await page.goto("#/build/castle");
  await expect(page.getByRole("list", { name: "Step 1 of 21" })).toBeVisible();
});

test("short of tiles: the list says how many more, with Start anyway and Pick another", async ({ page }) => {
  await useSet(page, "Magna-Tiles Clear Colors 32");
  await page.goto("#/build/castle");
  const list = page.getByRole("dialog", { name: "Get your tiles" });
  await expect(list.getByRole("list", { name: "squares" })).toBeVisible();
  await expect(list.getByRole("heading", { name: /You need \d+ more tiles for this one\./ })).toBeVisible();
  await list.getByRole("button", { name: "Pick another" }).click();
  await expect(page).toHaveURL(/#\/$/);
  await page.goto("#/build/castle");
  await page.getByRole("button", { name: "Start anyway" }).click();
  await expect(list).toHaveCount(0);
});

test("a fresh build opens on its tiles; a resumed one doesn't; Tiles you need opens them again", async ({ page }) => {
  await useSet(page, "PicassoTiles PT100 Classic Starter");
  await page.goto("#/build/fish");
  const list = page.getByRole("dialog", { name: "Get your tiles" });
  await expect(list).toBeVisible();
  // the chips ("4 red squares") add up to the total
  const names = await list.getByRole("img").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? ""));
  const sum = names.map((n) => Number(/^(\d+) /.exec(n)?.[1] ?? 0)).reduce((a, b) => a + b, 0);
  const total = Number(/(\d+) tiles? in all/.exec((await list.getByText(/tiles? in all/).textContent()) ?? "")?.[1]);
  expect(sum).toBeGreaterThan(0);
  expect(sum).toBe(total);
  await list.getByRole("button", { name: "Start", exact: true }).click();
  await expect(list).toHaveCount(0);
  await expect(page.getByRole("list", { name: "Step 1 of 4" })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await savedStep(page, "fish", 1);
  await page.reload();
  await expect(page.getByRole("list", { name: "Step 2 of 4" })).toBeVisible();
  await expect(list).toHaveCount(0);
  await page.getByRole("button", { name: "Tiles you need" }).click();
  await expect(list).toBeVisible();
  await list.getByRole("button", { name: "Back to building" }).click();
  await expect(list).toHaveCount(0);
});

test("with a Magna-Tiles 100 the castle's spires are equilateral, marked instead", async ({ page }) => {
  await useSet(page, "Magna-Tiles Clear Colors 100");
  await page.goto("#/build/castle");
  await startBuild(page);
  for (let i = 0; i < 19; i++) await next(page).click();
  await expect(page.getByRole("list", { name: "Step 20 of 21" })).toBeVisible();
  await expect(page.getByRole("list", { name: "This step's tiles" }).getByRole("img", { name: "4 red triangles" })).toBeVisible();
  await expect(page.getByText(/Four short triangles make a lower roof/).first()).toBeVisible();
});

test("every age can jump to a step by its dot (3.8)", async ({ page }) => {
  await useSet(page, "PicassoTiles PT100 Classic Starter");
  await page.goto("#/build/fish");
  await startBuild(page);
  await page.getByRole("button", { name: "Step 3 of 4" }).click();
  await expect(page.getByRole("list", { name: "Step 3 of 4" })).toBeVisible();
});

test("All steps: the slider shows each step in 3D, and letting go keeps it", async ({ page }) => {
  await useSet(page, "PicassoTiles PT100 Classic Starter");
  await page.goto("#/build/castle");
  await startBuild(page);
  await page.getByRole("button", { name: "All steps" }).click();
  const slider = page.getByRole("slider", { name: "Choose a step" });
  await slider.focus();
  const before = await page.evaluate(() => window.__viewer!.shown());
  for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowRight");
  await expect(page.getByText("Step 7 of 21", { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__viewer!.shown())).toBeGreaterThan(before);
  await savedStep(page, "castle", 6);
  // a drag most of the way along
  const box = (await slider.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.29, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
  const now = Number(await slider.inputValue());
  expect(now).toBeGreaterThan(15);
  await savedStep(page, "castle", now);
  await page.getByRole("button", { name: "Build this step" }).click();
  await expect(page.getByRole("list", { name: `Step ${now + 1} of 21` })).toBeVisible();
});

test("All steps: a tap on a step's picture goes there", async ({ page }) => {
  await useSet(page, "PicassoTiles PT100 Classic Starter");
  await page.goto("#/build/castle");
  await startBuild(page);
  await page.getByRole("button", { name: "All steps" }).click();
  await page.getByRole("list", { name: "All steps" }).getByRole("button", { name: "Step 12 of 21" }).click();
  await savedStep(page, "castle", 11);
  await expect(page.getByText("Step 12 of 21", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close all steps" }).click();
  await expect(page.getByRole("list", { name: "Step 12 of 21" })).toBeVisible();
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
    // a fresh build opens on its tiles: start, so the model is shown
    await startBuild(page);
    await page.getByRole("button", { name: "Step 21 of 21" }).click();
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
    // tapped as a child does, without waiting for the button to hold still (it moves with the party, and on a slow
    // renderer the party could be over first)
    await party.click({ force: true });
    await expect(party).toHaveCount(0);
  });
});

for (const [pid, ground] of [["fish", "light"], ["pitched-house", "light"], ["castle", "light"], ["castle", "dark"]] as const) {
  test(`build mode for ${pid} looks as it did in ${ground}`, async ({ page }) => {
    await page.addInitScript((g) => localStorage.setItem("tile-builder.theme", g), ground);
    await useSet(page, "PicassoTiles PT100 Classic Starter");
    await page.goto(`#/build/${pid}`);
    // a fresh build opens on its tiles: start, so the plate shows the model
    await startBuild(page);
    await page.evaluate(() => document.fonts.ready);
    // the whole screen as a child sees it, 3D included: with motion reduced the model is still, and the runner's
    // software renderer draws it the same every time
    await expect(page).toHaveScreenshot(`build-${pid}-${ground}.png`);
  });
}
