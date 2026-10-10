/* Wi-Fi off: once the app has loaded and its service worker has cached it, it opens again with the network off. */
import { expect, test } from "@playwright/test";
import { dismissFirstRun } from "./helpers";

test("the app opens with the network off after the first load", async ({ page, context }) => {
  await page.goto("#/");
  await dismissFirstRun(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    if (!reg.active) throw new Error("no active worker");
  });
  // the worker takes the page over once it is active
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("h1")).toHaveText("Tile Steps");
  await expect(page.getByRole("button", { name: /^A fish,/ })).toBeVisible();
  await context.setOffline(false);
});

test("the set (5.4.1) is part of the install: its room, table and transcoder load with the network off", async ({ page, context }) => {
  await page.goto("#/");
  await dismissFirstRun(page);
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    if (!reg.active) throw new Error("no active worker");
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  const files = ["empty_play_room_1k.hdr", "empty_play_room_512.hdr", "wood_maple.ktx2", "wood_nor_gl.ktx2", "wood_rough.ktx2", "basis/basis_transcoder.js", "basis/basis_transcoder.wasm"];
  const got = await page.evaluate(async (files) => Promise.all(files.map(async (f) => {
    const r = await fetch(`set/${f}`);
    return `${f} ${r.status} ${(await r.arrayBuffer()).byteLength > 1000}`;
  })), files);
  expect(got).toEqual(files.map((f) => `${f} 200 true`));
  await context.setOffline(false);
});
