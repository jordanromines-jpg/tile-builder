/* Shared steps for the browser tests. */
import { expect, type Page } from "@playwright/test";

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

export function wordsToNumber(w: string): number {
  return w.split("-").reduce((n, part) => n + (TENS.includes(part) ? TENS.indexOf(part) * 10 : ONES.indexOf(part)), 0);
}

/** Hold the lock, read the sum, type the answer. */
export async function openGate(page: Page, holdMs = 3200) {
  const lock = page.getByRole("button", { name: "Hold to open" });
  await expect(lock).toBeVisible();
  const box = (await lock.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(holdMs);
  await page.mouse.up();
  const text = await page.getByText(/^What is .* plus .*\?$/).textContent();
  const m = /What is (.+) plus (.+)\?/.exec(text ?? "")!;
  const answer = wordsToNumber(m[1]) + wordsToNumber(m[2]);
  for (const d of String(answer)) await page.getByRole("group", { name: "Number pad" }).getByRole("button", { name: d, exact: true }).click();
  await page.getByRole("button", { name: "OK" }).click();
}

/** Open the grown-ups side and start from a set. */
export async function useSet(page: Page, name: string) {
  await page.goto("#/grownups/tiles");
  await openGate(page);
  await page.getByRole("button", { name }).click();
  await page.getByRole("button", { name: "Use this set" }).click();
}

/** Close the one-time grown-ups card on the Library if it shows. */
export async function dismissFirstRun(page: Page) {
  const ok = page.getByRole("button", { name: "Got it" });
  try {
    await ok.waitFor({ state: "visible", timeout: 3000 });
    await ok.click();
  } catch {
    /* not shown */
  }
}

/** Wait until the app has saved `step` (0-based) for a project: Next saves without waiting, so a reload straight after
    could otherwise come back one step short. Reads the app's own IndexedDB store. */
export async function savedStep(page: Page, projectId: string, step: number) {
  await expect
    .poll(() =>
      page.evaluate(
        (id) =>
          new Promise<number | null>((resolve) => {
            const open = indexedDB.open("tile-steps");
            open.onerror = () => resolve(null);
            open.onsuccess = () => {
              const db = open.result;
              const get = db.transaction("progress").objectStore("progress").get(id);
              get.onsuccess = () => {
                resolve(get.result?.step ?? null);
                db.close();
              };
              get.onerror = () => resolve(null);
            };
          }),
        projectId,
      ),
    )
    .toBe(step);
}

/** Shelves draw their cards as they scroll (2.4): swipe the shelf under this heading along until the card comes. */
export async function swipeTo(page: Page, shelf: string, card: RegExp) {
  const row = page.locator("section", { has: page.getByRole("heading", { name: shelf }) }).locator("div.overflow-x-auto");
  const button = page.getByRole("button", { name: card });
  for (let i = 0; i < 20 && !(await button.count()); i++) {
    await row.evaluate((d) => d.scrollTo({ left: d.scrollWidth }));
    await page.waitForTimeout(150);
  }
  return button;
}
