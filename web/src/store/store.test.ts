import { beforeEach, describe, expect, it } from "vitest";
import { inventoryFromSet } from "../engine/match";
import { setById } from "../engine/sets";
import { makeBackup, readBackup, restoreBackup } from "./backup";
import { clearStep, db, DEFAULT_SETTINGS, eraseEverything, getInventory, getSettings, getStep, saveInventory, saveSettings, saveStep } from "./db";

beforeEach(async () => {
  await eraseEverything();
});

describe("the store", () => {
  it("has settings with defaults, and keeps changes", async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
    await saveSettings({ age: "b", voice: false });
    expect(await getSettings()).toMatchObject({ age: "b", voice: false, lang: "en-US" });
  });

  it("keeps the inventory", async () => {
    const s = setById("magna-32")!;
    await saveInventory(inventoryFromSet(s.pieces, "magna", 1.877));
    expect((await getInventory()).counts.square?.any).toBe(14);
  });

  it("keeps one step a project (D20)", async () => {
    expect(await getStep("castle")).toBe(0);
    await saveStep("castle", 7);
    await saveStep("castle", 8);
    expect(await getStep("castle")).toBe(8);
    expect(await db.progress.count()).toBe(1);
    await clearStep("castle");
    expect(await getStep("castle")).toBe(0);
  });
});

describe("backup", () => {
  it("round-trips every table", async () => {
    const s = setById("picasso-100")!;
    await saveInventory(inventoryFromSet(s.pieces, "picasso", 1.867));
    await saveSettings({ age: "c", theme: "dark" });
    await saveStep("castle", 12);
    await saveStep("house", 2);
    const b = await makeBackup();
    const text = JSON.stringify(b);
    await eraseEverything();
    const r = readBackup(text);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.summary).toBe("100 tiles, 2 builds in progress.");
    await restoreBackup(r.backup);
    expect((await getSettings()).theme).toBe("dark");
    expect((await getInventory()).counts["tri-isosceles-tall"]?.any).toBe(14);
    expect(await getStep("castle")).toBe(12);
  });

  it("refuses a newer version and a stranger's file, in plain words", async () => {
    const b = { ...(await makeBackup()), version: 2 };
    const r = readBackup(JSON.stringify(b));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain("newer");
    const s = readBackup("{\"hello\":1}");
    expect(s.ok).toBe(false);
  });
});
