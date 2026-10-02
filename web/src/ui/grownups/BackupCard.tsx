/* The backup card (plan key 2q): save a file, or restore from one. The work is done by the store (PR 5.3). */
import { useRef } from "react";
import { DownloadSimple, UploadSimple } from "../icons";
import { Button } from "./Button";
import { lastBackupWords } from "./StorageStatus";

export function BackupCard({ lastBackup, onSave, onRestore }: { lastBackup: Date | null; onSave: () => void; onRestore: (f: File) => void }) {
  const file = useRef<HTMLInputElement>(null);
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-2 p-4">
      <h2 className="font-display text-[length:var(--fs-parent-heading)] font-semibold">Backup</h2>
      <p className="text-ink-2">
        A backup is one small file with your tiles, settings and builds in progress. Keep it in Files or send it to yourself. {lastBackupWords(lastBackup)}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button kind="lit" onClick={onSave}>
          <DownloadSimple size={20} weight="bold" aria-hidden="true" /> Save a backup
        </Button>
        <Button kind="line" onClick={() => file.current?.click()}>
          <UploadSimple size={20} weight="bold" aria-hidden="true" /> Restore from a backup
        </Button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onRestore(f);
            e.target.value = "";
          }}
        />
      </div>
    </section>
  );
}
