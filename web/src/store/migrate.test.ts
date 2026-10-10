/* Dexie v5 (5.0c) adds the designs: an iPad with 4.x's store keeps its settings, tiles and progress. */
import Dexie from "dexie";
import { expect, it } from "vitest";

it("an iPad on the store of 4.x keeps everything when designs come (v4 → v5)", async () => {
  const old = new Dexie("tile-steps");
  old.version(4).stores({ settings: "id", inventory: "id", progress: "projectId" });
  await old.open();
  await old.table("settings").put({ id: 1, age: "c", voice: false, soundEffects: true, lang: "en-US", theme: "dark", firstRunSeen: true, homeScreenCardSeen: true, persisted: null, lastBackup: null, watchSpeed: "fast" });
  await old.table("inventory").put({ id: 1, brands: ["magna"], tallLeg: 1.877, counts: { square: { any: 9 } } });
  await old.table("progress").put({ projectId: "castle", step: 4, updatedAt: "2026-10-01T00:00:00Z" });
  old.close();

  const { db, getInventory, getSettings, getStep } = await import("./db");
  expect((await getSettings()).watchSpeed).toBe("fast");
  expect((await getInventory()).counts.square?.any).toBe(9);
  expect(await getStep("castle")).toBe(4);
  expect(db.verno).toBe(5);
  expect(await db.designs.count()).toBe(0);
});
