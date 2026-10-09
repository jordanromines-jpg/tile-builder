/* Quality tiers (3.0): how much 3D polish this iPad can afford. Jordan isn't sure which iPads families have (D3), so the
   tier chooses itself: it starts from what the device says (no GPU: low; four cores or fewer: mid; else high), steps
   down when frames drop and back up when they recover (the viewer's FrameWatch calls `slower` and `faster`).
   Looks read it for their effects (looks/stage.ts): `low` has none. */
import { useSyncExternalStore } from "react";
import type { Tier } from "../looks/stage";
import { softwareGL } from "../gpu";

const ORDER: Tier[] = ["low", "mid", "high"];

function start(): Tier {
  if (typeof navigator === "undefined" || softwareGL()) return "low";
  return (navigator.hardwareConcurrency ?? 8) <= 4 ? "mid" : "high";
}

let tier: Tier | null = null;
const listeners = new Set<() => void>();

export function currentTier(): Tier {
  return (tier ??= start());
}

function set(t: Tier) {
  if (t === tier) return;
  tier = t;
  listeners.forEach((l) => l());
}

/** Frames are dropping: one tier down. */
export function slower(): void {
  set(ORDER[Math.max(0, ORDER.indexOf(currentTier()) - 1)]);
}

/** Frames keep up again: one tier up, but never above where the device started. */
export function faster(): void {
  set(ORDER[Math.min(ORDER.indexOf(start()), ORDER.indexOf(currentTier()) + 1)]);
}

export function useTier(): Tier {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    currentTier,
    currentTier,
  );
}
