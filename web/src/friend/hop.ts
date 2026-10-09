/* Pip's moves as keyframes sampled from exact formulas (4.2d): a hop is a ballistic arc (16 samples, gravity solved so
   a level hop rises HOP_LIFT px), the landing squashes him and springs back, and the tiles he tosses fly on an arc and
   spin. Pure: Guide plays them with the Web Animations API, linear between samples. */
import { hopBetween, sampleArc } from "../motion/arc";
import { spring, springAt } from "../motion/spring";

export const HOP_LIFT = 36;
export const HOP_SAMPLES = 16;
export const TOSS_LIFT = 60;
/** a toss turns the tiles this many degrees on the way */
export const TOSS_SPIN = 540;

export interface Pt {
  x: number;
  y: number;
}

/** The hop from `from` to `to` over `ms`: an arc on screen (y counts down), one `translate` a sample. */
export function hopKeyframes(from: Pt, to: Pt, ms: number): { translate: string }[] {
  const arc = hopBetween([from.x, from.y], [to.x, to.y], ms / 1000, HOP_LIFT, 1, true);
  return sampleArc(arc, HOP_SAMPLES).map(([x, y]) => ({ translate: `${x.toFixed(2)}px ${y.toFixed(2)}px` }));
}

/** The squash when he lands: scaleY 0.86 and scaleX 1.08, springing back (a little past, as a stretch, once). */
export const SQUASH = spring(900, 22);
export const SQUASH_MS = 380;
export const SQUASH_SAMPLES = 14;

export function squashKeyframes(): { transform: string }[] {
  return Array.from({ length: SQUASH_SAMPLES + 1 }, (_, i) => {
    const x = i === SQUASH_SAMPLES ? 0 : springAt(SQUASH, (SQUASH_MS / 1000) * (i / SQUASH_SAMPLES)).x;
    return { transform: `scale(${(1 + 0.08 * x).toFixed(4)}, ${(1 - 0.14 * x).toFixed(4)})` };
  });
}

/** The tiles he tosses, from where they are held (0, 0) by (dx, dy) in `ms`: on an arc, spinning, shrinking, and
    gone as they arrive. */
export function tossKeyframes(dx: number, dy: number, ms: number): { transform: string; opacity: number }[] {
  const arc = hopBetween([0, 0], [dx, dy], ms / 1000, TOSS_LIFT, 1, true);
  return sampleArc(arc, HOP_SAMPLES).map(([x, y], i) => {
    const u = i / HOP_SAMPLES;
    return {
      transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${(TOSS_SPIN * u).toFixed(1)}deg) scale(${(1 - 0.6 * u).toFixed(3)})`,
      opacity: u < 0.7 ? 1 : Math.max(0, 1 - (u - 0.7) / 0.3),
    };
  });
}
