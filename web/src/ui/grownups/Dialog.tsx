/* Dialogs on Radix (plan key 2q): focus moves in, Escape and the close button leave, focus goes back. ConfirmDialog asks
   once, in words; with `typeWord` it asks the grown-up to type a word first (used for "Erase everything"). */
import * as D from "@radix-ui/react-dialog";
import { useState, type ReactNode } from "react";
import { X } from "../icons";
import { Button } from "./Button";

export function Dialog({ open, onOpenChange, title, description, children, wide }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <D.Content
          aria-describedby={description ? undefined : undefined}
          className={`fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-surface-2 p-6 text-ink-1 shadow-2xl ${wide ? "max-w-2xl" : "max-w-md"}`}
        >
          <div className="mb-3 flex items-start justify-between gap-4">
            <D.Title className="font-display text-[length:var(--fs-parent-heading)] font-semibold">{title}</D.Title>
            <D.Close aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-2">
              <X size={22} weight="bold" aria-hidden="true" />
            </D.Close>
          </div>
          {description ? <D.Description className="mb-4 text-ink-2">{description}</D.Description> : <D.Description className="sr-only">{title}</D.Description>}
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirm,
  onConfirm,
  danger,
  typeWord,
  also,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  confirm: string;
  onConfirm: () => void;
  danger?: boolean;
  typeWord?: string;
  /** a second way to go on, beside the main one */
  also?: { label: string; onClick: () => void };
}) {
  const [typed, setTyped] = useState("");
  const ready = !typeWord || typed.trim().toUpperCase() === typeWord;
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setTyped("");
        onOpenChange(o);
      }}
      title={title}
      description={description}
    >
      {typeWord && (
        <label className="mb-4 flex flex-col gap-1">
          <span>Type {typeWord} to go on</span>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoCapitalize="characters"
            autoComplete="off"
            className="min-h-11 rounded-md border-2 border-line bg-surface px-3 text-ink-1"
          />
        </label>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        <Button kind="line" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        {also && (
          <Button
            kind="line"
            onClick={() => {
              also.onClick();
              onOpenChange(false);
            }}
          >
            {also.label}
          </Button>
        )}
        <Button
          kind={danger ? "danger" : "lit"}
          disabled={!ready}
          onClick={() => {
            onConfirm();
            setTyped("");
            onOpenChange(false);
          }}
        >
          {confirm}
        </Button>
      </div>
    </Dialog>
  );
}
