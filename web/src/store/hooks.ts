// Live views of the store for screens (plan key 5a): they update when any screen writes.
import { useLiveQuery } from "dexie-react-hooks";
import type { Inventory, Progress, Settings } from "../engine/types";
import { db, DEFAULT_SETTINGS, EMPTY_INVENTORY, getInventory, getSettings } from "./db";

export function useSettings(): Settings | undefined {
  return useLiveQuery(getSettings, [], undefined);
}

export function useInventory(): Inventory | undefined {
  return useLiveQuery(getInventory, [], undefined);
}

export function useProgress(): Record<string, number> | undefined {
  return useLiveQuery(async () => Object.fromEntries((await db.progress.toArray()).map((p: Progress) => [p.projectId, p.step])), [], undefined);
}

export { DEFAULT_SETTINGS, EMPTY_INVENTORY };
