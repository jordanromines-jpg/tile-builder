/* "Ready to use without Wi-Fi": shown once, for six seconds, at the top of the screen, when the app is cached. */
import { useEffect, useState } from "react";
import { S } from "./strings";

let show: (() => void) | null = null;
let pending = false;

export function showOfflineNote(): void {
  if (show) show();
  else pending = true;
}

export function OfflineNote() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    show = () => setOpen(true);
    if (pending) {
      pending = false;
      setOpen(true);
    }
    return () => {
      show = null;
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 6000);
    return () => clearTimeout(t);
  }, [open]);
  if (!open) return null;
  return (
    <div role="status" className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-ink-1 px-5 py-2 text-surface shadow-lg">
      {S.pwa.offlineReady}
    </div>
  );
}
