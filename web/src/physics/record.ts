/* A simulated run (run.ts) as the recording the iPad plays (engine/run-format.ts): the truck every frame, and each
   crash tile only from the frame it first moves to the frame it comes to rest. */
import type { PlayedTile, Quat, Recording, V3 } from "../engine/run-format";
import type { RunRecord } from "./run";

/** a tile has moved once it is this far (squares) or this turned (quaternion distance) from where it was built */
const MOVED = 0.002;
/** and is at rest once it stays this close to its last pose (0.4 mm; a pile of tiles jitters a little for ever) */
const STILL = 0.005;

/** q, or −q (the same turn), whichever is nearer the one before: so a channel never jumps */
function near(q: Quat, before: Quat | undefined): Quat {
  if (!before) return q;
  const d = q[0] * before[0] + q[1] * before[1] + q[2] * before[2] + q[3] * before[3];
  return d < 0 ? [-q[0], -q[1], -q[2], -q[3]] : q;
}

const far = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const turned = (a: Quat, b: Quat) => 1 - Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]);

export function toRecording(run: RunRecord): Recording {
  let q: Quat | undefined;
  const truck = run.truck.map((f) => {
    q = near(f.quat, q);
    return { pos: f.pos, quat: q, steer: f.wheels[0].steer, squash: f.wheels.map((w) => w.compress) as [number, number, number, number] };
  });
  const tiles = new Map<number, PlayedTile>();
  for (const [key, poses] of Object.entries(run.tiles)) {
    if (!poses.length) continue;
    const start = poses[0];
    const first = poses.findIndex((p) => far(p.t, start.t) > MOVED || turned(p.q, start.q) > MOVED);
    if (first < 0) continue;
    // the last frame it still moves in
    const end = poses[poses.length - 1];
    let last = poses.length - 1;
    while (last > first && far(poses[last].t, end.t) < STILL && turned(poses[last].q, end.q) < STILL) last--;
    let tq: Quat | undefined;
    const kept = poses.slice(Math.max(0, first - 1), last + 2);
    tiles.set(Number(key), {
      first: Math.max(0, first - 1),
      t: kept.map((p) => p.t),
      q: kept.map((p) => (tq = near(p.q, tq))),
    });
  }
  const events = run.events.map((e) => ({ frame: Math.min(truck.length - 1, Math.round(e.t * run.fps)), kind: e.kind, ...(e.tile !== undefined ? { tile: e.tile } : {}), ...(e.hit !== undefined ? { hit: e.hit } : {}) }));
  return { fps: run.fps, truck, tiles, events };
}
