/* The truck as a box (4.0a): a pose, and whether the box touches a tile. Used by R13c and R13d (run-rules.ts) to fly and
   drive the truck through a course and find the tiles in its way. The box is shrunk by CLEARANCE, so resting on a
   surface or brushing an edge is not a hit. */
import { CLEARANCE, TRUCK_HEIGHT, TRUCK_LENGTH, TRUCK_WIDTH } from "./truck-size";
import { cross, dot, len, type V3 } from "./geometry";

export interface Pose {
  centre: V3;
  /** nose, up and right, each a unit vector */
  u: V3;
  v: V3;
  w: V3;
}

const unit = (a: V3): V3 => {
  const l = len(a);
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** The truck at `centre`, nose along `heading` (x, z), nose up by `pitch` radians. */
export function poseOf(centre: V3, heading: [number, number], pitch: number): Pose {
  const [hx, hz] = heading;
  const c = Math.cos(pitch);
  const s = Math.sin(pitch);
  const u: V3 = [hx * c, s, hz * c];
  const v: V3 = [-hx * s, c, -hz * s];
  return { centre, u, v, w: unit(cross(u, v)) };
}

export interface Prepared {
  poly: V3[];
  normal: V3;
  edges: V3[];
  lo: V3;
  hi: V3;
}

/** A tile's polygon with what the box test needs worked out once. */
export function prepare(poly: V3[], normal: V3): Prepared {
  const edges = poly.map((p, i) => {
    const q = poly[(i + 1) % poly.length];
    return [q[0] - p[0], q[1] - p[1], q[2] - p[2]] as V3;
  });
  const lo: V3 = [Infinity, Infinity, Infinity];
  const hi: V3 = [-Infinity, -Infinity, -Infinity];
  for (const p of poly) for (let k = 0; k < 3; k++) (lo[k] = Math.min(lo[k], p[k]), (hi[k] = Math.max(hi[k], p[k])));
  return { poly, normal, edges, lo, hi };
}

const HALF: V3 = [TRUCK_LENGTH / 2 - CLEARANCE, TRUCK_HEIGHT / 2 - CLEARANCE, TRUCK_WIDTH / 2 - CLEARANCE];
const REACH = Math.hypot(...HALF);

/** Does the (shrunk) box touch the convex polygon? A separating-axis test over the box's axes, the polygon's normal
    and the products of the two. */
export function boxHits(pose: Pose, t: Prepared): boolean {
  const c = pose.centre;
  for (let k = 0; k < 3; k++) if (c[k] + REACH < t.lo[k] || c[k] - REACH > t.hi[k]) return false;
  const axes: V3[] = [pose.u, pose.v, pose.w, t.normal];
  for (const a of [pose.u, pose.v, pose.w]) for (const e of t.edges) {
    const x = cross(a, e);
    const l = len(x);
    if (l > 1e-9) axes.push([x[0] / l, x[1] / l, x[2] / l]);
  }
  for (const a of axes) {
    const r = HALF[0] * Math.abs(dot(pose.u, a)) + HALF[1] * Math.abs(dot(pose.v, a)) + HALF[2] * Math.abs(dot(pose.w, a));
    const mid = dot(c, a);
    let min = Infinity;
    let max = -Infinity;
    for (const p of t.poly) {
      const d = dot(p, a);
      if (d < min) min = d;
      if (d > max) max = d;
    }
    if (mid + r < min || mid - r > max) return false;
  }
  return true;
}
