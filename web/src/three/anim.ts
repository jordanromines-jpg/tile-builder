/* The drop-in animation (plan key 6a), from the prototype (lines 303–348): each tile starts above and a little to the
   side of its place, tilted, and settles with a small overshoot. Tiles land one after another. */
export function mulberry(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function easeOutBack(k: number): number {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
}

/** How opaque a tile is part-way in: fully by a third of the way. */
export function fade(k: number): number {
  return Math.min(1, Math.max(0, k * 3));
}

export const DROP_S = 0.55;
export const DROP_S_REDUCED = 0.15;
/** The next tile starts when the one before is this far in. */
export const STAGGER = 0.35;

/** One frame of progress for every tile: those up to `shown` move toward 1, one after another; the rest drop to 0. */
export function stepProgress(progress: number[], shown: number, dt: number, duration: number): boolean {
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
    // waiting for the tile before to get far enough in
    if (gate < STAGGER) {
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
