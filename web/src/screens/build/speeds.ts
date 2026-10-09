/* Watch it build (4.1): the three speeds, and what each does. Seconds a step stays on the screen (D1: every age). */
import type { Settings } from "../../engine/types";
import type { Pace } from "../../friend/pace";

export type WatchSpeed = Settings["watchSpeed"];
export const WATCH_SPEEDS: WatchSpeed[] = ["slow", "medium", "fast"];
export const WATCH_SECONDS: Record<WatchSpeed, number> = { slow: 6, medium: 3.5, fast: 1.5 };

/** Pip hurries at Fast. */
export function paceOf(speed: WatchSpeed): Pace {
  return speed === "fast" ? "fast" : "normal";
}

/** The step's line is said at Slow and Medium (when the voice is on), not at Fast: it would only talk over itself. */
export function sayAt(speed: WatchSpeed): boolean {
  return speed !== "fast";
}
