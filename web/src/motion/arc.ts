/* The ballistic arc (4.2d): the path of a thing thrown from one point to another in a given time under constant
   gravity. The launch velocity is solved so it lands exactly on the point at that time. Any number of dimensions. */
export type Vec = readonly number[];

export interface Arc {
  from: Vec;
  v0: Vec;
  g: Vec;
  /** seconds from launch to landing */
  time: number;
}

/** From `from` to `to` in `time` seconds under gravity vector `g` (for y up, g = [0, −G, 0]). */
export function arcBetween(from: Vec, to: Vec, time: number, g: Vec): Arc {
  const v0 = from.map((f, i) => (to[i] - f) / time - 0.5 * g[i] * time);
  return { from, v0, g, time };
}

/** A hop whose highest point is `lift` above the higher end, with the gravity solved for it (a "cartoon gravity": a
    level hop of any length or time rises by `lift`). Dimension `up` is the vertical one; pass `down` when y counts
    downward, as on a screen. The other dimensions move steadily. */
export function hopBetween(from: Vec, to: Vec, time: number, lift: number, up = 1, down = false): Arc {
  const s = down ? -1 : 1;
  const rise = s * (to[up] - from[up]);
  const top = Math.max(0, rise) + lift;
  const root = (Math.sqrt(2 * top) + Math.sqrt(2 * (top - rise))) / time;
  const g = from.map((_, i) => (i === up ? -s * root * root : 0));
  return arcBetween(from, to, time, g);
}

/** Where it is at t seconds (the formula goes on past the landing). Writes into `out` when given. */
export function arcAt(a: Arc, t: number, out: number[] = []): number[] {
  for (let i = 0; i < a.from.length; i++) out[i] = a.from[i] + a.v0[i] * t + 0.5 * a.g[i] * t * t;
  return out;
}

export function arcVelocity(a: Arc, t: number, out: number[] = []): number[] {
  for (let i = 0; i < a.from.length; i++) out[i] = a.v0[i] + a.g[i] * t;
  return out;
}

/** n + 1 evenly spaced samples from launch to landing: the keyframes of a hop. */
export function sampleArc(a: Arc, n: number): number[][] {
  return Array.from({ length: n + 1 }, (_, k) => arcAt(a, (a.time * k) / n));
}
