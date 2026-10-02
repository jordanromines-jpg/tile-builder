/* The grown-ups' home (plan key 5d): the tiles summary, the two other places, the backup, and a tip on Guided Access. */
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { canBuildCount, inventoryTotal } from "../../engine/match";
import type { Backup } from "../../engine/types";
import { setTheme } from "../../ground";
import { PROJECTS } from "../../projects";
import { exportBackup, readBackup, restoreBackup } from "../../store/backup";
import { useInventory, useSettings } from "../../store/hooks";
import { BackupCard } from "../../ui/grownups/BackupCard";
import { ConfirmDialog } from "../../ui/grownups/Dialog";
import { useToast } from "../../ui/grownups/Toast";
import { Frame } from "./Frame";

export function summaryLine(tiles: number, can: number, of: number): string {
  if (!tiles) return "No tiles yet. Start from a set on the Tiles page.";
  return `You have ${tiles} tiles. You can build ${can} of ${of} projects.`;
}

export function GrownupsHome() {
  const inv = useInventory();
  const settings = useSettings();
  const toast = useToast();
  const [pending, setPending] = useState<{ backup: Backup; summary: string } | null>(null);
  const tiles = inv ? inventoryTotal(inv) : 0;
  const can = inv ? canBuildCount(PROJECTS, inv) : 0;
  const card = "flex min-h-11 flex-col rounded-lg border border-line bg-surface-2 p-4 font-bold";
  return (
    <Frame title="For grown-ups">
      <p className="text-[length:var(--fs-parent-heading)]" data-testid="summary">
        {summaryLine(tiles, can, PROJECTS.length)}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/grownups/tiles" className={card}>
          Tiles
          <span className="font-normal text-ink-2">Start from a set, then count up or down.</span>
        </Link>
        <Link to="/grownups/settings" className={card}>
          Settings
          <span className="font-normal text-ink-2">Voice, theme, where things are kept.</span>
        </Link>
      </div>
      <BackupCard
        lastBackup={settings?.lastBackup ? new Date(settings.lastBackup) : null}
        onSave={async () => {
          const how = await exportBackup();
          if (how !== "cancelled") toast("Backup saved.");
        }}
        onRestore={async (f) => {
          const r = readBackup(await f.text());
          if (!r.ok) toast(r.message);
          else setPending({ backup: r.backup, summary: r.summary });
        }}
      />
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title="Restore this backup?"
        description={`${pending?.summary ?? ""} Replace what is on this iPad?`}
        confirm="Replace"
        onConfirm={async () => {
          if (!pending) return;
          await restoreBackup(pending.backup);
          setTheme(pending.backup.settings.theme);
          toast("Restored.");
        }}
      />
      <section className="rounded-lg bg-surface-3 p-4">
        <h2 className="font-bold">A tip: Guided Access</h2>
        <p className="text-ink-2">
          To keep a child in Tile Steps, turn on Guided Access in the iPad's Settings, under Accessibility. Then press the top button three times while the
          app is open.
        </p>
      </section>
      <p className="text-ink-2">
        More for grown-ups, including how the backup works:{" "}
        <a className="font-bold text-ink-1 underline underline-offset-4" href="https://github.com/jordanromines-jpg/tile-builder/blob/main/docs/parents.md" target="_blank" rel="noreferrer">
          the page for grown-ups
        </a>
        .
      </p>
    </Frame>
  );
}
