/* The grown-ups side (plan keys 5d, 5e, 5g): the door blocks a child, opens for a sum, closes after ten idle minutes;
   a set fills the counts, a stepper changes one, and the counts hold after a reload. axe on each screen. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openGate, useSet } from "./helpers";

const axe = async (page: import("@playwright/test").Page) =>
  (await new AxeBuilder({ page }).analyze()).violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);

test("the door blocks, opens with the right sum, and closes after ten idle minutes", async ({ page }) => {
  await page.clock.install();
  await page.goto("#/grownups");
  await expect(page.getByRole("heading", { level: 1, name: "For grown-ups" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Tiles/ })).toHaveCount(0);
  await page.clock.runFor(10);
  await openGateWithClock(page);
  await expect(page.getByRole("link", { name: /^Tiles/ }).first()).toBeVisible();
  expect(await axe(page)).toEqual([]);
  await page.clock.runFor(10 * 60 * 1000 + 6000);
  await expect(page.getByRole("button", { name: "Hold to open" })).toBeVisible();
});

async function openGateWithClock(page: import("@playwright/test").Page) {
  const lock = page.getByRole("button", { name: "Hold to open" });
  const box = (await lock.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.clock.runFor(3200);
  await page.mouse.up();
  const text = (await page.getByText(/^What is .* plus .*\?$/).textContent()) ?? "";
  const { wordsToNumber } = await import("./helpers");
  const m = /What is (.+) plus (.+)\?/.exec(text)!;
  for (const d of String(wordsToNumber(m[1]) + wordsToNumber(m[2]))) await page.getByRole("group", { name: "Number pad" }).getByRole("button", { name: d, exact: true }).click();
  await page.getByRole("button", { name: "OK" }).click();
}

test("a set fills the counts; a change holds after a reload", async ({ page }) => {
  await useSet(page, "Magna-Tiles Clear Colors 32");
  await expect(page.getByTestId("summary")).toContainText("You have 32 tiles");
  await page.getByRole("button", { name: "More squares" }).click();
  await page.getByRole("button", { name: "More squares" }).click();
  await page.getByRole("button", { name: "Fewer tall triangles" }).click();
  await expect(page.getByRole("spinbutton", { name: "squares", exact: true })).toHaveAttribute("aria-valuenow", "16");
  expect(await axe(page)).toEqual([]);
  await page.reload();
  await openGate(page);
  await expect(page.getByRole("spinbutton", { name: "squares", exact: true })).toHaveAttribute("aria-valuenow", "16");
  await expect(page.getByRole("spinbutton", { name: "tall triangles", exact: true })).toHaveAttribute("aria-valuenow", "3");
  await expect(page.getByTestId("summary")).toContainText("You have 33 tiles");
});

test("settings save and pass axe", async ({ page }) => {
  await page.goto("#/grownups/settings");
  await openGate(page);
  const voice = page.getByRole("switch", { name: "Read steps aloud" });
  await expect(voice).toHaveAttribute("aria-checked", "true");
  await voice.click();
  await expect(voice).toHaveAttribute("aria-checked", "false");
  await page.getByText("Dark", { exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await axe(page)).toEqual([]);
});
