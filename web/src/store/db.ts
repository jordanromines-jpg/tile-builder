/* The store (plan key 5a): Dexie over IndexedDB, on this iPad only (D2). Three tables, one row each for settings and
   the inventory, one row a project for progress (D20). A Home Screen app has its own store, kept apart from Safari's
   and exempt from Safari's seven-day clearing (kids-and-ipad.md). */
import Dexie, { type Table } from "dexie";
import type { Inventory, Progress, Settings } from "../engine/types";

export interface SettingsRow extends Settings {
  id: 1;
}
export interface InventoryRow extends Inventory {
  id: 1;
}

export const DEFAULT_SETTINGS: Settings = {
  age: null,
  voice: true,
  soundEffects: false,
  lang: "en-US",
  theme: "system",
  firstRunSeen: false,
  homeScreenCardSeen: false,
  persisted: null,
  lastBackup: null,
};

export const EMPTY_INVENTORY: Inventory = { brands: [], tallLeg: null, counts: {} };

class TileDB extends Dexie {
  settings!: Table<SettingsRow, number>;
  inventory!: Table<InventoryRow, number>;
  progress!: Table<Progress, string>;

  constructor() {
    super("tile-steps");
    this.version(1).stores({ settings: "id", inventory: "id", progress: "projectId" });
  }
}

export const db = new TileDB();

export async function getSettings(): Promise<Settings> {
  const row = await db.settings.get(1);
  if (!row) return DEFAULT_SETTINGS;
  const { id: _id, ...rest } = row;
  return { ...DEFAULT_SETTINGS, ...rest };
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  return db.transaction("rw", db.settings, async () => {
    const next = { ...(await getSettings()), ...patch };
    await db.settings.put({ id: 1, ...next });
    return next;
  });
}

export async function getInventory(): Promise<Inventory> {
  const row = await db.inventory.get(1);
  if (!row) return EMPTY_INVENTORY;
  const { id: _id, ...rest } = row;
  return rest;
}

export async function saveInventory(inv: Inventory): Promise<void> {
  await db.inventory.put({ id: 1, ...inv });
}

export async function getStep(projectId: string): Promise<number> {
  return (await db.progress.get(projectId))?.step ?? 0;
}

export async function saveStep(projectId: string, step: number): Promise<void> {
  await db.progress.put({ projectId, step, updatedAt: new Date().toISOString() });
}

export async function clearStep(projectId: string): Promise<void> {
  await db.progress.delete(projectId);
}

export async function eraseEverything(): Promise<void> {
  await db.transaction("rw", db.settings, db.inventory, db.progress, async () => {
    await Promise.all([db.settings.clear(), db.inventory.clear(), db.progress.clear()]);
  });
}
