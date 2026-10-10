import { beforeEach, describe, expect, it } from "vitest";
import { inventoryFromSet } from "../engine/match";
import { setById } from "../engine/sets";
import { makeBackup, readBackup, restoreBackup } from "./backup";
import { clearStep, db, DEFAULT_SETTINGS, deleteDesign, eraseEverything, getDesign, getInventory, getSettings, getStep, saveDesign, saveInventory, saveSettings, saveStep } from "./db";

const design = { id: "my-abc", name: "My tower", placed: [{ shape: "square" as const, colour: "red" as const, pos: [0, 0, 0] as [number, number, number], rot: [0, 0] as [number, number] }], updated: "2026-10-10T00:00:00Z" };

beforeEach(async () => {
  await eraseEverything();
});

describe("the store", () => {
  it("has settings with defaults, and keeps changes", async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
    await saveSettings({ age: "b", voice: false });
    expect(await getSettings()).toMatchObject({ age: "b", voice: false, lang: "en-US" });
  });

  it("remembers Watch it build's speed, Medium until chosen (4.1)", async () => {
    expect((await getSettings()).watchSpeed).toBe("medium");
    await saveSettings({ watchSpeed: "fast" });
    expect((await getSettings()).watchSpeed).toBe("fast");
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

  it("keeps a child's own designs, and lets one go with its step (5.0c)", async () => {
    await saveDesign(design);
    await saveStep(design.id, 1);
    expect((await getDesign(design.id))?.name).toBe("My tower");
    await deleteDesign(design.id);
    expect(await getDesign(design.id)).toBeUndefined();
    expect(await getStep(design.id)).toBe(0);
  });
});

describe("backup", () => {
  it("round-trips every table", async () => {
    const s = setById("picasso-100")!;
    await saveInventory(inventoryFromSet(s.pieces, "picasso", 1.867));
    await saveSettings({ age: "c", theme: "dark" });
    await saveStep("castle", 12);
    await saveStep("house", 2);
    await saveDesign(design);
    const b = await makeBackup();
    const text = JSON.stringify(b);
    await eraseEverything();
    const r = readBackup(text);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.summary).toBe("100 tiles, 2 builds in progress, 1 design of their own.");
    await restoreBackup(r.backup);
    expect((await getSettings()).theme).toBe("dark");
    expect((await getInventory()).counts["tri-isosceles-tall"]?.any).toBe(14);
    expect(await getStep("castle")).toBe(12);
    expect((await getDesign("my-abc"))?.placed).toHaveLength(1);
  });

  it("reads a backup from before designs (5.0c)", async () => {
    const { designs: _d, ...old } = await makeBackup();
    const r = readBackup(JSON.stringify(old));
    expect(r.ok).toBe(true);
    if (r.ok) await restoreBackup(r.backup);
    expect(await db.designs.count()).toBe(0);
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
