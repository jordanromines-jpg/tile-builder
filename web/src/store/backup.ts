/* Backup and restore (plan key 5h): one JSON file with the settings, the tiles and the builds in progress, checked by
   the zod schema both ways. It is the only way data leaves the iPad, and only when a grown-up saves it. */
import { BackupZ } from "../engine/schema";
import type { Backup } from "../engine/types";
import { db, getInventory, getSettings, saveSettings } from "./db";

export async function makeBackup(now = new Date()): Promise<Backup> {
  const backup: Backup = {
    app: "tile-steps",
    version: 1,
    exportedAt: now.toISOString(),
    settings: await getSettings(),
    inventory: await getInventory(),
    progress: await db.progress.toArray(),
  };
  BackupZ.parse(backup);
  return backup;
}

export function backupFileName(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `tile-steps-backup-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}

/** Hand the file over: the share sheet where there is one (iPad: Save to Files), else a download. */
export async function exportBackup(): Promise<"shared" | "downloaded" | "cancelled"> {
  const now = new Date();
  const backup = await makeBackup(now);
  const name = backupFileName(now);
  const file = new File([JSON.stringify(backup, null, 2)], name, { type: "application/json" });
  let how: "shared" | "downloaded" | "cancelled" = "downloaded";
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: name });
      how = "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancelled";
      how = "downloaded";
    }
  }
  if (how === "downloaded") {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  await saveSettings({ lastBackup: now.toISOString() });
  return how;
}

export type ReadResult = { ok: true; backup: Backup; summary: string } | { ok: false; message: string };

export function tileCount(b: Backup): number {
  return Object.values(b.inventory.counts).reduce((n, c) => n + (c?.any ?? 0), 0);
}

export function readBackup(text: string): ReadResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, message: "This file isn't a Tile Steps backup." };
  }
  const r = raw as { app?: unknown; version?: unknown };
  if (r?.app === "tile-steps" && typeof r.version === "number" && r.version > 1) {
    return { ok: false, message: "This backup was made by a newer Tile Steps. Open the app's latest version, then try again." };
  }
  const parsed = BackupZ.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "This file isn't a Tile Steps backup, or it is damaged." };
  const backup = parsed.data as Backup;
  const n = backup.progress.length;
  return { ok: true, backup, summary: `${tileCount(backup)} tiles, ${n} ${n === 1 ? "build" : "builds"} in progress.` };
}

/** Replace everything on this iPad with the backup. */
export async function restoreBackup(b: Backup): Promise<void> {
  await db.transaction("rw", db.settings, db.inventory, db.progress, async () => {
    await Promise.all([db.settings.clear(), db.inventory.clear(), db.progress.clear()]);
    await db.settings.put({ id: 1, ...b.settings });
    await db.inventory.put({ id: 1, ...b.inventory });
    await db.progress.bulkPut(b.progress);
  });
}
