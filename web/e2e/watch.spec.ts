/* Watch it build (4.1): the build plays itself at a chosen speed, in its own place; only Build from here moves the
   child's saved step. */
import { expect, test, type Page } from "@playwright/test";
import { savedStep, startBuild, useSet } from "./helpers";

const watchButton = (page: Page) => page.getByRole("button", { name: "Watch it build" });
const bar = (page: Page) => page.locator(".ts-watch");
const speed = (page: Page, name: string) => bar(page).getByRole("radio", { name });
const shown = async (page: Page) => Number(/Step (\d+) of/.exec((await bar(page).locator("p").textContent()) ?? "")?.[1]);
const stage = (page: Page) => page.getByRole("img", { name: /, in 3D$/ });

/** The speed row of the settings store, read from the app's own IndexedDB. */
async function storedSpeed(page: Page) {
  return page.evaluate(
    () =>
      new Promise<string | null>((resolve) => {
        const open = indexedDB.open("tile-steps");
        open.onerror = () => resolve(null);
        open.onsuccess = () => {
          const db = open.result;
          const get = db.transaction("settings").objectStore("settings").get(1);
          get.onsuccess = () => {
            resolve(get.result?.watchSpeed ?? null);
            db.close();
          };
          get.onerror = () => resolve(null);
        };
      }),
  );
}

async function openBuild(page: Page, pid: string) {
  await useSet(page, "PicassoTiles PT100 Classic Starter");
  await page.goto(`#/build/${pid}`);
  await startBuild(page);
}

test("Fast on the fish plays to the finish and leaves the saved step alone", async ({ page }) => {
  await openBuild(page, "fish");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await savedStep(page, "fish", 2);
  await watchButton(page).click();
  await expect(bar(page)).toBeVisible();
  await speed(page, "Fast").click();
  await expect(page).toHaveURL(/#\/done\/fish\?watched=1$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // the child was not the one who built it: their place stays
  await page.waitForTimeout(500);
  await savedStep(page, "fish", 2);
});

test("a tap on the stage pauses; Play carries on", async ({ page }) => {
  await openBuild(page, "castle");
  await watchButton(page).click();
  await speed(page, "Fast").click();
  await expect.poll(() => shown(page)).toBeGreaterThan(1);
  await stage(page).click({ position: { x: 300, y: 300 } });
  await expect(bar(page).getByRole("button", { name: "Play" })).toBeVisible();
  const at = await shown(page);
  await page.waitForTimeout(2500);
  expect(await shown(page)).toBe(at);
  await bar(page).getByRole("button", { name: "Play" }).click();
  await expect.poll(() => shown(page)).toBeGreaterThan(at);
});

test("watching leaves the saved step; Build from here saves the watched one; Stop watching goes back", async ({ page }) => {
  await openBuild(page, "castle");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await savedStep(page, "castle", 1);
  await watchButton(page).click();
  await speed(page, "Fast").click();
  await expect.poll(() => shown(page)).toBeGreaterThan(3);
  await bar(page).getByRole("button", { name: "Pause" }).click();
  await savedStep(page, "castle", 1);
  // Stop watching: back at the child's own step
  await bar(page).getByRole("button", { name: "Stop watching" }).click();
  await expect(page.getByRole("list", { name: "Step 2 of 21" })).toBeVisible();
  await savedStep(page, "castle", 1);
  // watch again, then Build from here
  await watchButton(page).click();
  await speed(page, "Fast").click();
  await expect.poll(() => shown(page)).toBeGreaterThan(3);
  await bar(page).getByRole("button", { name: "Pause" }).click();
  const n = await shown(page);
  await bar(page).getByRole("button", { name: "Build from here" }).click();
  await expect(page.getByRole("list", { name: `Step ${n} of 21` })).toBeVisible();
  await expect(bar(page)).toHaveCount(0);
  await savedStep(page, "castle", n - 1);
});

test("the Tiles list and All steps pause the watch", async ({ page }) => {
  await openBuild(page, "castle");
  await watchButton(page).click();
  await expect(bar(page).getByRole("button", { name: "Pause" })).toBeVisible();
  await page.getByRole("button", { name: "Tiles you need" }).click();
  await expect(bar(page).getByRole("button", { name: "Play" })).toBeVisible();
  await page.getByRole("dialog", { name: "Get your tiles" }).getByRole("button", { name: "Back to building" }).click();
  await bar(page).getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "All steps" }).click();
  await expect(page.getByRole("slider", { name: "Choose a step" })).toBeVisible();
  await page.getByRole("button", { name: "Close all steps" }).click();
  await expect(bar(page).getByRole("button", { name: "Play" })).toBeVisible();
});

test("the speed survives a reload", async ({ page }) => {
  await openBuild(page, "castle");
  await watchButton(page).click();
  await expect(speed(page, "Medium")).toBeChecked();
  await speed(page, "Slow").click();
  await expect.poll(() => storedSpeed(page)).toBe("slow");
  await page.reload();
  await watchButton(page).click();
  await expect(speed(page, "Slow")).toBeChecked();
});

test.describe("with motion", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("Fast on the fish, with Pip hopping over, still reaches the finish", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await openBuild(page, "fish");
    await watchButton(page).click();
    await speed(page, "Fast").click();
    await expect(page).toHaveURL(/#\/done\/fish\?watched=1$/, { timeout: 25_000 });
    expect(errors).toEqual([]);
  });
});
