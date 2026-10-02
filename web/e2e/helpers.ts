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
