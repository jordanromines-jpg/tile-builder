/* Wi-Fi off: once the app has loaded and its service worker has cached it, it opens again with the network off. */
import { expect, test } from "@playwright/test";

test("the app opens with the network off after the first load", async ({ page, context }) => {
  await page.goto("#/");
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
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.setOffline(false);
});
