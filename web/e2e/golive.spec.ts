/* Verification at go-live (plan key 8a): V6 offline, V7 storage and backup, V9 two taps, V11 nothing leaves. */
import { expect, test } from "@playwright/test";
import { dismissFirstRun, openGate, savedStep, useSet } from "./helpers";

test("V6: after one load, with the network off, every route opens and the fish builds to the end", async ({ page, context }) => {
  await useSet(page, "Magna-Tiles Clear Colors 32");
  await page.goto("#/");
  await dismissFirstRun(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  for (const [hash, h1] of [
    ["#/", "Tile Steps"],
    ["#/grownups", "For grown-ups"],
    ["#/design", "The design page"],
  ]) {
    await page.goto(hash);
    await page.reload();
    await expect(page.locator("h1").first()).toHaveText(h1);
  }
  await page.goto("#/build/fish");
  await page.reload();
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "You made a fish! Can it swim across the table?" })).toBeVisible();
  await context.setOffline(false);
});

test("V7: tiles, settings and a saved step survive a reload; a backup restores them after erasing", async ({ page }) => {
  await useSet(page, "PicassoTiles PT100 Classic Starter");
  await page.getByRole("navigation").getByRole("link", { name: "Settings" }).click();
  await page.getByRole("switch", { name: "Read steps aloud" }).click();
  await page.goto("#/build/castle");
  for (let i = 0; i < 5; i++) await page.getByRole("button", { name: "Next", exact: true }).click();
  await savedStep(page, "castle", 5);
  await page.reload();
  await expect(page.getByRole("list", { name: "Step 6 of 25" })).toBeVisible();

  await page.goto("#/grownups");
  await openGate(page);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save a backup" }).click();
  const file = await (await download).path();

  await page.getByRole("navigation").getByRole("link", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Erase everything on this iPad" }).click();
  await page.getByRole("textbox").fill("ERASE");
  await page.getByRole("button", { name: "Erase", exact: true }).click();
  await page.getByRole("navigation").getByRole("link", { name: "Home" }).click();
  await expect(page.getByTestId("summary")).toContainText("No tiles yet");

  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByRole("dialog", { name: "Restore this backup?" })).toContainText("100 tiles, 1 build in progress.");
  await page.getByRole("button", { name: "Replace" }).click();
  await expect(page.getByTestId("summary")).toContainText("You have 100 tiles");
  await page.getByRole("navigation").getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("switch", { name: "Read steps aloud" })).toHaveAttribute("aria-checked", "true");
  await page.goto("#/build/castle");
  await expect(page.getByRole("list", { name: "Step 6 of 25" })).toBeVisible();
});

test("V9: from a cold start with tiles and an age, one tap on a card shows step 1", async ({ page, context }) => {
  await useSet(page, "Magna-Tiles Clear Colors 32");
  await page.goto("#/");
  await dismissFirstRun(page);
  await page.getByRole("button", { name: "3 to 5" }).click();
  const cold = await context.newPage();
  await cold.goto("#/");
  await cold.getByRole("button", { name: /^A flower,/ }).click();
  await expect(cold.getByRole("list", { name: "Step 1 of 6" })).toBeVisible();
});

test("V11: nothing leaves the site, on any route", async ({ page }) => {
  const away: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.protocol.startsWith("http") && u.host !== "127.0.0.1:4173") away.push(r.url());
  });
  await useSet(page, "Magna-Tiles Clear Colors 100");
  for (const hash of ["#/", "#/build/castle", "#/done/castle", "#/grownups/settings", "#/design"]) {
    await page.goto(hash);
    await page.waitForLoadState("networkidle");
  }
  expect(away).toEqual([]);
});
