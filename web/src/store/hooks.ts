// Live views of the store for screens (plan key 5a): they update when any screen writes.
import { useLiveQuery } from "dexie-react-hooks";
import type { Design } from "../engine/design";
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

/** The build touched last and its step, for "keep building" (3.1); null when nothing is half done. */
export function useLatestProgress(): { projectId: string; step: number } | null | undefined {
  return useLiveQuery(async () => {
    const rows = (await db.progress.toArray()) as (Progress & { updatedAt?: string })[];
    const last = rows.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))[0];
    return last ? { projectId: last.projectId, step: last.step } : null;
  }, [], undefined);
}

/** The child's own designs (5.0c), the last changed first. */
export function useDesigns(): Design[] | undefined {
  return useLiveQuery(() => db.designs.orderBy("updated").reverse().toArray(), [], undefined);
}

export { DEFAULT_SETTINGS, EMPTY_INVENTORY };
