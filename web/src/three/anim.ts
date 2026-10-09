/* The building animation (sprint 2, change 4; 4.2d): a step's tiles show as ghosts for a moment, then each is tossed in
   along a true ballistic arc (src/motion/arc.ts), turning as it flies, to 3 mm short of its place, and the magnets
   pull it in with a stiff damped spring (4.2b), one tile after another. In All steps, tiles drop 0.4 square under gravity with one bounce, and leave by
   lifting and fading. Seeded, so it is the same every time. */
import { arcAt, arcBetween, arcVelocity, type Arc, type Vec } from "../motion/arc";
import { fall } from "../motion/fall";
import { spring, springAt } from "../motion/spring";

export function mulberry(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function easeOutBack(k: number, c1 = 1.4): number {
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
}

/** The glide's easing: fast in, a 4% overshoot as the magnets catch, then still. */
export function snap(k: number): number {
  return k >= 1 ? 1 : easeOutBack(k, 0.9);
}

/** How opaque a tile is part-way in: fully by a third of the way. */
export function fade(k: number): number {
  return Math.min(1, Math.max(0, k * 3));
}

export const DROP_S = 0.5;
/** The scene's gravity (squares/s²): a third of real (128.7), so a 0.36 s toss reads as a toss, not a slam. */
export const SCENE_G = 128.7 / 3;
/** The flight takes this much of DROP_S; the rest is the magnets catching the tile. */
export const FLIGHT_S = 0.36;
/** The progress at which the tile touches down (the click is heard then). */
export const LAND_K = FLIGHT_S / DROP_S;
/** The magnets' pull (4.2b): the toss comes down 3 mm short of the tile's place, and the magnets pull it the rest of
    the way, a stiff spring (ω 60, ζ 0.55: one small overshoot), keeping a quarter of the speed it came in with. */
export const SNAP_GAP = 3 / 76.2;
const CATCH = spring(3600, 66);
const CATCH_SHARE = 0.25;

export interface Flight {
  arc: Arc;
  /** the unit direction it was travelling at touch-down, and its speed */
  dir: Vec;
  speed: number;
  to: Vec;
}

/** The toss from `from` to `to`: launch velocity solved to land on `to` at FLIGHT_S under SCENE_G. */
export function makeFlight(from: Vec, to: Vec): Flight {
  // the way it comes in, then the same toss aimed SNAP_GAP short of its place along that way
  const v0 = arcVelocity(arcBetween(from, to, FLIGHT_S, [0, -SCENE_G, 0]), FLIGHT_S);
  const s0 = Math.hypot(...v0) || 1;
  const short = to.map((c, i) => c - (v0[i] / s0) * SNAP_GAP) as Vec;
  const arc = arcBetween(from, short, FLIGHT_S, [0, -SCENE_G, 0]);
  const v = arcVelocity(arc, FLIGHT_S);
  const speed = Math.hypot(...v) || 1;
  return { arc, dir: v.map((c) => c / speed), speed, to };
}

/** Where the tile is at progress k of DROP_S, and how far through its turn (0 to 1). Writes the place into `out`. */
export function flightAt(f: Flight, k: number, out: number[]): number {
  const t = Math.min(1, Math.max(0, k)) * DROP_S;
  if (t < FLIGHT_S) {
    arcAt(f.arc, t, out);
    return t / FLIGHT_S;
  }
  // the magnets pull it in the last 3 mm, a little past along the way it was going, then hold it exactly in place
  const x = k >= 1 ? 0 : springAt(CATCH, t - FLIGHT_S, -SNAP_GAP, f.speed * CATCH_SHARE).x;
  for (let i = 0; i < 3; i++) out[i] = f.to[i] + f.dir[i] * x;
  return 1;
}

/** All steps (3.8, 4.2d): an arriving tile drops from 0.4 square with one bounce (e 0.25), under 180 ms. */
export const ARRIVE = fall({ height: 0.4, g: 128.7, e: 0.25 });
export const ARRIVE_S = ARRIVE.duration;
/** A leaving tile lifts this far and fades in LEAVE_S. */
export const LEAVE_S = 0.12;
export const LEAVE_LIFT = 0.3;
export const DROP_S_REDUCED = 0.15;
/** How long a step's ghosts show before its tiles glide in. */
export const GHOST_S = 0.45;
/** How long a new step's tiles glow and its ghost pulses before they hold still (and the stage stops drawing). */
export const GLOW_S = 2.5;
/** The next tile starts when the one before is this far in. */
export const STAGGER = 0.35;

/** One frame of progress for every tile: those up to `shown` move toward 1, one after another; the rest drop to 0.
    Tiles from `startable` on wait (their ghosts are showing). */
export function stepProgress(progress: number[], shown: number, dt: number, duration: number, startable = shown): boolean {
  let moving = false;
  let gate = 1;
  for (let i = 0; i < progress.length; i++) {
    if (i >= shown) {
      if (progress[i] !== 0) moving = true;
      progress[i] = 0;
      continue;
    }
    if (progress[i] >= 1) {
      gate = 1;
      continue;
    }
    // waiting for the ghost moment, or for the tile before to get far enough in
    if (i >= startable || gate < STAGGER) {
      moving = true;
      gate = 0;
      continue;
    }
    progress[i] = Math.min(1, progress[i] + dt / duration);
    gate = progress[i];
    moving = true;
  }
  return moving;
}

/** All steps: tiles up to `shown` drop in together (progress to 1 in `arriveS`); the rest lift away (back to 0 in
    `leaveS`). True while anything is still moving. */
export function browseProgress(progress: number[], shown: number, dt: number, arriveS: number, leaveS: number): boolean {
  let moving = false;
  for (let i = 0; i < progress.length; i++) {
    const p = progress[i];
    const next = i < shown ? Math.min(1, p + dt / arriveS) : Math.max(0, p - dt / leaveS);
    progress[i] = next;
    if (next !== p || (i < shown ? next < 1 : next > 0)) moving = true;
  }
  return moving;
}
