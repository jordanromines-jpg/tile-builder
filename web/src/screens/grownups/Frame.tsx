/* The grown-ups side's frame (plan key 5d): the gate until it opens, then a header with the way back and the three
   places (Home, Tiles, Settings). A tap anywhere keeps the door open; ten minutes without one closes it. */
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { stop } from "../../speech/say";
import { GateDialog } from "../../ui/grownups/GateDialog";
import { ArrowLeft } from "../../ui/icons";
import { close, isOpen, onChange, open, touch } from "./gate";

export function Frame({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  useEffect(() => onChange(() => setTick((t) => t + 1)), []);
  useEffect(() => {
    stop();
    const id = setInterval(() => {
      if (!isOpen()) close();
    }, 5_000);
    return () => clearInterval(id);
  }, []);
  const leave = () => void navigate({ to: "/" });
  if (!isOpen()) {
    return (
      <main className="safe grid min-h-dvh place-items-center">
        <GateDialog onOpen={() => open()} onLeave={leave} />
      </main>
    );
  }
  const tab = "inline-flex min-h-11 items-center rounded-md px-4 py-2 font-bold text-ink-2 [&.active]:bg-accent-soft [&.active]:text-ink-1";
  return (
    <div className="safe mx-auto flex min-h-dvh max-w-3xl flex-col gap-6" onPointerDown={() => touch()} onKeyDown={() => touch()}>
      <header className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={leave} className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 font-bold text-ink-1">
          <ArrowLeft size={22} weight="bold" aria-hidden="true" /> Back to the shelf
        </button>
        <nav aria-label="Grown-ups" className="ml-auto flex gap-1">
          <Link to="/grownups" className={tab} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/grownups/tiles" className={tab}>
            Tiles
          </Link>
          <Link to="/grownups/settings" className={tab}>
            Settings
          </Link>
        </nav>
      </header>
      <main className="flex flex-col gap-6">
        <h1 className="font-display text-[length:var(--fs-parent-title)] font-semibold">{title}</h1>
        {children}
      </main>
    </div>
  );
}
