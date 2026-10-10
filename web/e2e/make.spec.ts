/* Make your own (5.0): pick a tile, tap a glowing edge, put it on; the live physics keeps it up or lets it fall. The
   edges are picked through window.__makePick (as a tap on the edge's bar does), then the real buttons are pressed. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { dismissFirstRun } from "./helpers";

const make = (page: Page) => page.evaluate(() => window.__make ?? null);

async function open(page: Page) {
  await page.goto("#/make");
  await expect.poll(async () => (await make(page))?.ready, { timeout: 30_000 }).toBe(true);
  await page.getByRole("list", { name: "Pick a tile" }).getByRole("button").first().click();
}

/** Tap the edge from a to b, turn the tile `turns` times, put it on, and wait for the physics to have it. */
async function putOn(page: Page, a: number[], b: number[], turns = 0) {
  const before = (await make(page))!.placed;
  await expect.poll(() => page.evaluate(([x, y]) => window.__makePick?.(x, y) ?? false, [a, b])).toBe(true);
  // (a click sent to the button: under load the live 3D stage keeps the tray from ever reading as "stable" to a
  // pointer click, as with the Finish tap)
  for (let k = 0; k < turns; k++) await page.getByRole("button", { name: "Turn" }).dispatchEvent("click");
  await page.getByRole("button", { name: "Put it on" }).dispatchEvent("click");
  await expect.poll(async () => (await make(page))!.placed).toBe(before + 1);
}

test("a ring of four squares, put on edge by edge, stands; nothing falls", async ({ page }) => {
  await open(page);
  await putOn(page, [0, 0, 1], [1, 0, 1]);
  await putOn(page, [1, 0, 0], [1, 0, 1]);
  await putOn(page, [0, 0, 0], [1, 0, 0]);
  await putOn(page, [0, 0, 0], [0, 0, 1]);
  await page.waitForTimeout(3000);
  const m = (await make(page))!;
  expect(m.tiles).toBe(4);
  expect(m.fallen).toBe(0);
  expect(m.high).toBeGreaterThan(0.95);
});

test("a square held out flat from a lone wall's top edge: once the hand lets go, it comes down", async ({ page }) => {
  await open(page);
  await putOn(page, [0, 0, 0], [1, 0, 0]);
  await page.waitForTimeout(1500);
  await putOn(page, [0, 1, 0], [1, 1, 0], 3);
  await expect.poll(async () => (await make(page))!.fallen, { timeout: 10_000 }).toBeGreaterThan(0);
  await expect(page.getByText("It fell! A wall beside it holds it up.")).toBeVisible();
});

test("the Make screen passes axe, and the Library opens it", async ({ page }) => {
  await page.goto("#/");
  await dismissFirstRun(page);
  await page.getByRole("button", { name: /Make your own/ }).click();
  await expect(page).toHaveURL(/#\/make$/);
  await expect.poll(async () => (await make(page))?.ready, { timeout: 30_000 }).toBe(true);
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});

test("a design is kept: it is on My builds after a reload, opens again, and Make the steps builds it (5.0c)", async ({ page }) => {
  await open(page);
  await putOn(page, [0, 0, 1], [1, 0, 1]);
  await putOn(page, [1, 0, 0], [1, 0, 1]);
  await page.waitForTimeout(1500);
  await page.goto("#/");
  await dismissFirstRun(page);
  await expect(page.getByRole("heading", { name: "My builds" })).toBeVisible();
  await page.getByRole("button", { name: /My build 1/ }).click();
  await expect.poll(async () => (await make(page))?.placed, { timeout: 30_000 }).toBe(2);
  await page.getByRole("button", { name: "Make the steps" }).dispatchEvent("click");
  await expect(page).toHaveURL(/#\/build\/my-[a-z0-9]+$/);
  await expect.poll(() => page.evaluate(() => document.body.innerText.includes("Stand 2 blue squares on the table."))).toBe(true);
});
