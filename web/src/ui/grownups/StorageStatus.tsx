/* Where the family's tiles are kept (plan keys 2q, 5c), said plainly. */
import { Check, Warning } from "@phosphor-icons/react";

export function storageWords(persisted: boolean | null): string {
  return persisted ? "Kept on this iPad: yes." : "The iPad may clear this if space runs low. A backup is safer.";
}

export function lastBackupWords(d: Date | null): string {
  return d ? `Last backup: ${d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}.` : "No backup yet.";
}

export function StorageStatus({ persisted, lastBackup }: { persisted: boolean | null; lastBackup: Date | null }) {
  return (
    <div className="flex items-start gap-3">
      {persisted ? (
        <Check size={24} weight="bold" className="mt-0.5 shrink-0 text-can-ink" aria-hidden="true" />
      ) : (
        <Warning size={24} weight="bold" className="mt-0.5 shrink-0 text-wait-ink" aria-hidden="true" />
      )}
      <p>
        <span className="font-bold">{storageWords(persisted)}</span> <span className="text-ink-2">{lastBackupWords(lastBackup)}</span>
      </p>
    </div>
  );
}
