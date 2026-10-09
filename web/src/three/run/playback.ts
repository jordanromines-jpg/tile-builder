/* Playing a truck run's recording (4.0c): the truck's pose and each moving tile's pose at any moment, between the
   recorded frames (positions in a straight line, turns along the shortest arc). The wheels turn by the distance the
   truck has gone (the recording doesn't keep their spin). Pure: no three.js here, so it is tested on its own. */
import type { Quat, Recording, RunEventKind, V3 } from "../../engine/run-format";
import { TRUCK, type TruckPose, type Wheel } from "../truck/spec";

/** a real 1:64 jump is over in a fifth of a second: around a jump, a landing or a crash a run plays at this share of
    real speed (a toy camera's slow motion), easing in and out over SLOW_EASE seconds; the driving between is at speed */
export const SLOW = 0.55;
const SLOW_AROUND = 0.35;
const SLOW_EASE = 0.25;

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

export function slerp(a: Quat, b: Quat, k: number): Quat {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  const s = d < 0 ? -1 : 1;
  d *= s;
  let wa: number;
  let wb: number;
  if (d > 0.9995) {
    wa = 1 - k;
    wb = k * s;
  } else {
    const th = Math.acos(d);
    const sn = Math.sin(th);
    wa = Math.sin((1 - k) * th) / sn;
    wb = (Math.sin(k * th) / sn) * s;
  }
  const q: Quat = [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb, a[3] * wa + b[3] * wb];
  const l = Math.hypot(...q) || 1;
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
}

/** The ground the truck has covered by each frame, along its own forward (backing up turns the wheels back). */
export function distances(rec: Recording): number[] {
  const out = [0];
  for (let f = 1; f < rec.truck.length; f++) {
    const a = rec.truck[f - 1];
    const b = rec.truck[f];
    const [x, y, z, w] = b.quat;
    // the truck's forward (+z of its own frame)
    const fw: V3 = [2 * (x * z + w * y), 2 * (y * z - w * x), 1 - 2 * (x * x + y * y)];
    const d = (b.pos[0] - a.pos[0]) * fw[0] + (b.pos[1] - a.pos[1]) * fw[1] + (b.pos[2] - a.pos[2]) * fw[2];
    out.push(out[f - 1] + d);
  }
  return out;
}

export interface Player {
  /** seconds of the run (at real speed) */
  length: number;
  truck(t: number): TruckPose;
  /** a moving tile's body pose (its middle, and its turn since it was built) at t; null while it is still as built */
  tile(i: number, t: number): { p: V3; q: Quat } | null;
  /** where each moving tile's middle was built */
  start(i: number): V3 | null;
  moving: Set<number>;
  /** the run's moments, in seconds (at real speed) */
  events: { t: number; kind: RunEventKind; hit?: number }[];
  /** seconds it takes to play (slower around the action) */
  playLength: number;
  /** the run's moment (real seconds) after playing for `s` seconds */
  at(s: number): number;
}

/** How fast the run plays at its moment t: SLOW near a launch, landing or crash, 1 between, eased. */
export function rateAt(t: number, moments: number[]): number {
  let d = Infinity;
  for (const m of moments) d = Math.min(d, Math.abs(t - m));
  const k = Math.max(0, Math.min(1, (d - SLOW_AROUND) / SLOW_EASE));
  return SLOW + (1 - SLOW) * k * k * (3 - 2 * k);
}

export function player(rec: Recording): Player {
  const dist = distances(rec);
  const last = rec.truck.length - 1;
  const at = (t: number) => {
    const f = Math.max(0, Math.min(last, t * rec.fps));
    const i = Math.min(last - 1, Math.floor(f));
    return i < 0 ? { i: 0, j: 0, k: 0 } : { i, j: i + 1, k: f - i };
  };
  // the play's clock: real time against playing time, in small steps
  const moments = rec.events.filter((e) => e.kind !== "end").map((e) => e.frame / rec.fps);
  const length = last / rec.fps;
  const DT = 1 / 120;
  const played = [0];
  for (let t = DT; t < length + DT; t += DT) played.push(played[played.length - 1] + DT / rateAt(t - DT / 2, moments));
  return {
    length,
    playLength: played[played.length - 1],
    at(s) {
      if (s <= 0) return 0;
      // the step whose playing time holds s
      let lo = 0;
      let hi = played.length - 1;
      if (s >= played[hi]) return length;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (played[mid] <= s) lo = mid;
        else hi = mid;
      }
      return Math.min(length, (lo + (s - played[lo]) / (played[hi] - played[lo])) * DT);
    },
    moving: new Set(rec.tiles.keys()),
    events: rec.events.map((e) => ({ t: e.frame / rec.fps, kind: e.kind, hit: e.hit })),
    truck(t) {
      const { i, j, k } = at(t);
      const a = rec.truck[i];
      const b = rec.truck[j];
      const spin = lerp(dist[i], dist[j], k) / TRUCK.wheelRadius;
      const steer = lerp(a.steer, b.steer, k);
      const wheels = [0, 1, 2, 3].map((w): Wheel => ({ spin, steer: w < 2 ? steer : -0.3 * steer, compress: lerp(a.squash[w], b.squash[w], k) }));
      return { pos: lerp3(a.pos, b.pos, k), quat: slerp(a.quat, b.quat, k), wheels: wheels as TruckPose["wheels"] };
    },
    tile(n, t) {
      const tile = rec.tiles.get(n);
      if (!tile) return null;
      const f = t * rec.fps - tile.first;
      if (f <= 0) return null;
      const lastF = tile.t.length - 1;
      if (f >= lastF) return { p: tile.t[lastF], q: tile.q[lastF] };
      const i = Math.floor(f);
      const k = f - i;
      return { p: lerp3(tile.t[i], tile.t[i + 1], k), q: slerp(tile.q[i], tile.q[i + 1], k) };
    },
    start(n) {
      return rec.tiles.get(n)?.t[0] ?? null;
    },
  };
}
