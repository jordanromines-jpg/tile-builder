/* A truck's route, compiled (4.0a). A Monster trucks build names the pieces of its course (features: lanes, ramps,
   decks, cars, walls…) and the route the truck takes over them. `compileRoute` turns the route into legs: straight
   pieces of the run with the points they join at, and, for a flight, the speed that carries the truck from the lip to
   its landing. R13 (run-rules.ts) proves the legs; the truck runs (4.0c) drive them.

   Points are where the wheels touch: x right, y up, z towards the child; a square is one unit. The truck is a box
   (truck-size.ts) that rides TRUCK_RIDE above its legs' points, along the surface's normal. */
import { worldPolygon, type V3 } from "./geometry";
import { ARC_STEP, EDGE_KEEP, GRAVITY, TRUCK_LENGTH, TRUCK_RIDE } from "./truck-size";
import type { Feature, Project, Surface } from "./types";

export type LegKind = "drive" | "climb" | "descend" | "fly" | "crush" | "smash";

/** A flight: the truck leaves the lip as its tail does, so its middle starts half a truck on. */
export interface Ballistic {
  /** where the wheels leave the surface */
  lip: V3;
  /** the middle of the truck as it leaves, and the direction on the ground (x, z) */
  start: V3;
  heading: [number, number];
  /** radians above level: 30° off a ramp, 0 off a deck */
  angle: number;
  /** squares per second, along the launch direction */
  speed: number;
  /** seconds in the air */
  time: number;
}

export interface Leg {
  kind: LegKind;
  /** where the wheels are at the start and at the end */
  from: V3;
  to: V3;
  /** the surface driven (a drive), or landed on (a fly); none for a waypoint or a smash */
  surface?: Surface;
  /** the feature driven on */
  feature?: string;
  /** the feature landed on (fly), crushed (crush) or smashed (smash) */
  target?: string;
  fly?: Ballistic;
  /** which item of the route it came from (0-based) */
  item: number;
  /** which run it belongs to: 0, then one more each time the child places the truck on a deck ({place}) */
  run: number;
}

/** A route that cannot be compiled: it names what is not there, or goes where a truck cannot. */
export class RouteError extends Error {
  constructor(
    public item: number,
    message: string,
  ) {
    super(message);
  }
}

type P2 = [number, number];
const sub2 = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
const dot2 = (a: P2, b: P2) => a[0] * b[0] + a[1] * b[1];
const xz = (p: V3): P2 => [p[0], p[2]];

/** A straight way along a surface: its start (middle of the starting edge), unit direction on the ground, length,
    width, and the height at each end. */
export interface Strip {
  start: P2;
  dir: P2;
  perp: P2;
  length: number;
  width: number;
  y0: number;
  y1: number;
}

const DIRS: Record<Feature["dir"], P2> = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };

export function stripOf(f: Feature, reverse = false): Strip {
  const s = f.surface;
  if (!s) throw new Error(`${f.name} has no surface`);
  let st: Strip;
  if (s.kind === "slope") {
    const d = sub2(xz(s.to), xz(s.from));
    const length = Math.hypot(...d);
    const dir: P2 = [d[0] / length, d[1] / length];
    st = { start: xz(s.from), dir, perp: [-dir[1], dir[0]], length, width: s.width, y0: s.from[1], y1: s.to[1] };
  } else {
    const xs = s.poly.map((p) => p[0]);
    const zs = s.poly.map((p) => p[1]);
    const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
    const dir = DIRS[f.dir];
    const along = dir[0] !== 0;
    const length = along ? x1 - x0 : z1 - z0;
    const start: P2 = [dir[0] > 0 ? x0 : dir[0] < 0 ? x1 : (x0 + x1) / 2, dir[1] > 0 ? z0 : dir[1] < 0 ? z1 : (z0 + z1) / 2];
    st = { start, dir, perp: [-dir[1], dir[0]], length, width: along ? z1 - z0 : x1 - x0, y0: s.y, y1: s.y };
  }
  if (!reverse) return st;
  const end: P2 = [st.start[0] + st.dir[0] * st.length, st.start[1] + st.dir[1] * st.length];
  const dir: P2 = [-st.dir[0], -st.dir[1]];
  return { ...st, start: end, dir, perp: [-dir[1], dir[0]], y0: st.y1, y1: st.y0 };
}

export function stripPoint(st: Strip, s: number, u: number): V3 {
  return [st.start[0] + st.dir[0] * s + st.perp[0] * u, st.y0 + (st.length > 0 ? ((st.y1 - st.y0) * s) / st.length : 0), st.start[1] + st.dir[1] * s + st.perp[1] * u];
}

/** The ground footprint of a surface, as a convex polygon in (x, z). */
export function footprint(f: Feature): P2[] {
  const s = f.surface!;
  if (s.kind === "flat") return s.poly.map((p) => [p[0], p[1]]);
  const st = stripOf(f);
  const h = st.width / 2;
  const end = (u: number) => xz(stripPoint(st, st.length, u));
  const beg = (u: number) => xz(stripPoint(st, 0, u));
  return [beg(-h), end(-h), end(h), beg(h)];
}

/** The plane of a surface at (x, z), extended past its edges: height, and the unit normal. */
export function planeAt(f: Feature, x: number, z: number): { y: number; normal: V3 } {
  const s = f.surface!;
  if (s.kind === "flat") return { y: s.y, normal: [0, 1, 0] };
  const st = stripOf(f);
  const sAlong = dot2([x - st.start[0], z - st.start[1]], st.dir);
  const slope = (st.y1 - st.y0) / st.length;
  const n = Math.hypot(slope, 1);
  return { y: st.y0 + slope * sAlong, normal: [(-slope * st.dir[0]) / n, 1 / n, (-slope * st.dir[1]) / n] };
}

/** Where a ray p + s·h (s ≥ 0 or not) is inside a convex polygon: [s0, s1], or null. */
export function chord(poly: P2[], p: P2, h: P2): [number, number] | null {
  let area = 0;
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    area += a[0] * b[1] - b[0] * a[1];
  });
  const sign = area >= 0 ? 1 : -1;
  let lo = -Infinity;
  let hi = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const e = sub2(poly[(i + 1) % poly.length], a);
    const n: P2 = [-sign * e[1], sign * e[0]];
    const dn = dot2(n, h);
    const off = dot2(n, sub2(p, a));
    if (Math.abs(dn) < 1e-9) {
      if (off < 0) return null;
    } else if (dn > 0) lo = Math.max(lo, -off / dn);
    else hi = Math.min(hi, -off / dn);
  }
  return lo < hi ? [lo, hi] : null;
}

/** How far a point is inside a convex polygon (negative when outside). */
export function depthInside(poly: P2[], p: P2): number {
  let area = 0;
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    area += a[0] * b[1] - b[0] * a[1];
  });
  const sign = area >= 0 ? 1 : -1;
  let depth = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const e = sub2(poly[(i + 1) % poly.length], a);
    const l = Math.hypot(...e);
    depth = Math.min(depth, (sign * (-e[1] * (p[0] - a[0]) + e[0] * (p[1] - a[1]))) / l);
  }
  return depth;
}

const kindOfRise = (dy: number): LegKind => (dy > 0.01 ? "climb" : dy < -0.01 ? "descend" : "drive");

/** Where a crash feature is: the middle of its footprint, the ground under it, and its tiles' corners (x, z). */
function crashSpot(project: Project, f: Feature, leg: number) {
  const polys = f.tiles.map((t) => worldPolygon(project.placed[t], leg));
  const pts = polys.flat();
  const xs = pts.map((p) => p[0]);
  const zs = pts.map((p) => p[2]);
  const centre: P2 = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2];
  return { centre, ground: Math.min(...pts.map((p) => p[1])), polys, pts };
}

/** Turn a project's route into legs. Throws a RouteError naming the item that cannot be driven. */
export function compileRoute(project: Project, leg: number): Leg[] {
  const course = project.course;
  if (!course || !course.route.length) throw new RouteError(-1, "this Monster trucks build has no route for the truck");
  const byName = new Map(course.features.map((f) => [f.name, f]));
  const legs: Leg[] = [];
  let run = 0;
  const push = (l: Omit<Leg, "run">) => legs.push({ ...l, run });
  const find = (i: number, name: string): Feature => {
    const f = byName.get(name);
    if (!f) throw new RouteError(i, `there is no "${name}" (the course has ${course.features.map((g) => g.name).join(", ") || "nothing"})`);
    return f;
  };
  /** the last leg of this run */
  const here = (): Leg | undefined => {
    const last = legs.at(-1);
    return last && last.run === run ? last : undefined;
  };

  /** drive along a feature's surface, joining it where the truck already is */
  const along = (i: number, f: Feature, reverse: boolean) => {
    if (!f.surface || !["lane", "ramp", "kicker", "deck", "tunnel"].includes(f.kind)) throw new RouteError(i, `${f.name} is a ${f.kind}: the truck can't drive along it. Crash it with {through: "${f.name}"}`);
    const st = stripOf(f, reverse);
    const keep = Math.max(0, st.width / 2 - EDGE_KEEP);
    let s = 0;
    let u = 0;
    const prev = here();
    if (prev) {
      const r = sub2(xz(prev.to), st.start);
      const sp = dot2(r, st.dir);
      const up = dot2(r, st.perp);
      if (Math.abs(up) <= st.width / 2 + 0.5 && sp >= -0.5 && sp <= st.length + 0.5) {
        s = Math.min(Math.max(sp, 0), st.length);
        // going straight on, the truck keeps to its line; turning a corner, it takes the middle
        const was = sub2(xz(prev.to), xz(prev.from));
        const turning = Math.hypot(...was) > 1e-6 && Math.abs(dot2(was, st.dir)) / Math.hypot(...was) < 0.5;
        u = turning ? 0 : Math.min(Math.max(up, -keep), keep);
      }
    }
    const from = stripPoint(st, s, u);
    const to = stripPoint(st, st.length, u);
    if (Math.hypot(to[0] - from[0], to[2] - from[2]) < 0.01) return;
    push({ kind: kindOfRise(to[1] - from[1]), from, to, surface: f.surface, feature: f.name, item: i });
  };

  const heading = (i: number, from: V3, to: V3): P2 => {
    const d = sub2(xz(to), xz(from));
    const l = Math.hypot(...d);
    if (l < 1e-6) {
      // straight down (a car crushed where the truck landed): carry on the way it was going
      const last = here();
      if (last?.fly) return last.fly.heading;
      throw new RouteError(i, "the truck has no direction here to go on in");
    }
    return [d[0] / l, d[1] / l];
  };

  const crashInto = (i: number, f: Feature) => {
    const prev = here();
    if (!prev) throw new RouteError(i, `the truck starts at ${f.name}: start on a lane, a deck or a ramp`);
    const spot = crashSpot(project, f, leg);
    const h = heading(i, prev.to, [spot.centre[0], 0, spot.centre[1]]);
    let to: V3;
    if (f.kind === "car") to = [spot.centre[0], spot.ground, spot.centre[1]];
    else if (f.kind === "wall") {
      const ext = Math.max(...spot.pts.map((p) => dot2([p[0] - spot.centre[0], p[2] - spot.centre[1]], h)));
      // the truck's middle gets through to just short of the far face: its nose is out the other side
      to = [spot.centre[0] + h[0] * (ext - 0.2), spot.ground, spot.centre[1] + h[1] * (ext - 0.2)];
    } else {
      // dominoes: the truck hits the nearest one and the rest fall
      const first = spot.polys
        .map((poly) => ({ c: [poly.reduce((a, p) => a + p[0], 0) / poly.length, poly.reduce((a, p) => a + p[2], 0) / poly.length] as P2, poly }))
        .sort((a, b) => Math.hypot(a.c[0] - prev.to[0], a.c[1] - prev.to[2]) - Math.hypot(b.c[0] - prev.to[0], b.c[1] - prev.to[2]))[0];
      const h2 = heading(i, prev.to, [first.c[0], 0, first.c[1]]);
      // the ones in the truck's way fall in turn, and it carries on through them
      const lateral = (q: P2) => Math.abs(dot2(sub2(q, xz(prev.to)), [-h2[1], h2[0]]));
      const inPath = spot.polys.filter((poly) => poly.every((q) => lateral(xz(q)) <= 0.6 + 0.5));
      const far = Math.max(...inPath.flat().map((q) => dot2(sub2(xz(q), xz(prev.to)), h2)));
      to = [prev.to[0] + h2[0] * (far + 0.5), spot.ground, prev.to[2] + h2[1] * (far + 0.5)];
    }
    push({ kind: f.kind === "car" ? "crush" : "smash", from: prev.to, to, target: f.name, item: i });
  };

  const flyTo = (i: number, T: Feature) => {
    const prev = here();
    if (!prev) throw new RouteError(i, `the truck has nowhere to jump from yet: start on a deck or a ramp`);
    if (prev.kind === "fly" || prev.kind === "crush" || prev.kind === "smash") throw new RouteError(i, `the truck can't jump straight after the ${prev.kind}`);
    if (!T.surface && T.kind !== "wall") throw new RouteError(i, `${T.name} is a ${T.kind}: there is nothing flat to land on. Crash it with {through: "${T.name}"}`);
    const h = heading(i, prev.from, prev.to);
    const lip = prev.to;
    const rise = prev.surface?.kind === "slope" ? lip[1] - prev.from[1] : 0;
    const theta = Math.atan2(rise, Math.hypot(lip[0] - prev.from[0], lip[2] - prev.from[2]));
    const [cos, sin] = [Math.cos(theta), Math.sin(theta)];
    const start: V3 = [lip[0] + h[0] * cos * (TRUCK_LENGTH / 2) - h[0] * sin * TRUCK_RIDE, lip[1] + sin * (TRUCK_LENGTH / 2) + cos * TRUCK_RIDE, lip[2] + h[1] * cos * (TRUCK_LENGTH / 2) - h[1] * sin * TRUCK_RIDE];
    if (!T.surface) {
      // a wall: fly into its front face a little above the lip (the truck's nose arrives at its face)
      const spot = crashSpot(project, T, leg);
      const [xs, zs] = [spot.pts.map((p) => p[0]), spot.pts.map((p) => p[2])];
      const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
      const front = chord([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], xz(lip), h);
      if (!front || front[1] <= 0.05) throw new RouteError(i, `straight on from the end of ${prev.feature ?? "the last leg"}, the truck never comes to ${T.name}`);
      const face = Math.max(front[0], 0);
      const yHit = Math.min(lip[1] + 0.6, Math.max(...spot.pts.map((p) => p[1])) - 0.7);
      const d = face - TRUCK_LENGTH / 2 - dot2(sub2(xz(start), xz(lip)), h);
      const denom = 2 * cos * cos * (d * Math.tan(theta) - (yHit - start[1]));
      if (d < 0.05) throw new RouteError(i, `${T.name} is too close to jump to from here`);
      if (denom <= 1e-6) throw new RouteError(i, `the truck can't get up to ${T.name} from here: it is higher than the jump can reach`);
      const speed = Math.sqrt((GRAVITY * d * d) / denom);
      const nose: V3 = [lip[0] + h[0] * face, yHit - TRUCK_RIDE, lip[2] + h[1] * face];
      push({ kind: "fly", from: lip, to: nose, target: T.name, fly: { lip, start, heading: h, angle: theta, speed, time: d / (speed * cos) }, item: i });
      return;
    }
    const ch = chord(footprint(T), xz(lip), h);
    if (!ch || ch[1] <= 0.05) throw new RouteError(i, `straight on from the end of ${prev.feature ?? "the last leg"}, the truck never comes to ${T.name}`);
    const s0 = Math.max(ch[0], 0);
    // aim a square in from where the surface begins (less if it is short, or if a short jump needs it), and solve
    const preferred = Math.min((ch[1] - s0) / 2, 1);
    let why = "";
    const options: { d: number; denom: number; speed: number }[] = [];
    for (const inside of [preferred, 0.8, 0.65, 0.5, 0.4, 0.3]) {
      if (inside > preferred + 1e-9) continue;
      const A: P2 = [lip[0] + h[0] * (s0 + inside), lip[2] + h[1] * (s0 + inside)];
      const plane = planeAt(T, A[0], A[1]);
      const mid: V3 = [A[0] + plane.normal[0] * TRUCK_RIDE, plane.y + plane.normal[1] * TRUCK_RIDE, A[1] + plane.normal[2] * TRUCK_RIDE];
      const d = dot2(sub2(xz(mid), xz(start)), h);
      const denom = 2 * cos * cos * (d * Math.tan(theta) - (mid[1] - start[1]));
      if (d < 0.05) why = `${T.name} is too close to jump to from here`;
      else if (denom <= 1e-6) why = `the truck can't get up to ${T.name} from here: it is higher than the jump can reach`;
      else options.push({ d, denom, speed: Math.sqrt((GRAVITY * d * d) / denom) });
    }
    if (!options.length) throw new RouteError(i, why);
    // the deepest aim that doesn't ask for a much faster launch than the gentlest
    const gentlest = Math.min(...options.map((o) => o.speed));
    const { d, speed } = options.find((o) => o.speed <= Math.max(gentlest * 3, gentlest + 4))!;
    // fly it, and find where the truck first comes down on the surface
    const at = (t: number): V3 => [start[0] + h[0] * speed * cos * t, start[1] + speed * sin * t - 0.5 * GRAVITY * t * t, start[2] + h[1] * speed * cos * t];
    // (the first time it is over the surface and down to it; if it never is, the time the aim was solved for)
    const over = footprint(T);
    let time = d / (speed * cos);
    for (let t = 0.02; t < 4; t += 0.002) {
      const c = at(t);
      const pl = planeAt(T, c[0], c[2]);
      if (pl.normal[1] * (c[1] - pl.y) <= TRUCK_RIDE && t > 2 * ARC_STEP && depthInside(over, [c[0], c[2]]) >= 0) {
        time = t;
        break;
      }
    }
    const c = at(time);
    const pl = planeAt(T, c[0], c[2]);
    const lx = c[0] - pl.normal[0] * TRUCK_RIDE;
    const lz = c[2] - pl.normal[2] * TRUCK_RIDE;
    const land: V3 = [lx, planeAt(T, lx, lz).y, lz];
    push({ kind: "fly", from: lip, to: land, surface: T.surface, target: T.name, fly: { lip, start, heading: h, angle: theta, speed, time }, item: i });
  };

  course.route.forEach((item, i) => {
    if (typeof item === "string") along(i, find(i, item), false);
    else if ("down" in item) along(i, find(i, item.down), true);
    else if ("jump" in item) flyTo(i, find(i, item.jump));
    else if ("place" in item) {
      // the child carries the truck to a deck (a tower can't be driven up) and starts a new run there
      const f = find(i, item.place);
      if (f.kind !== "deck") throw new RouteError(i, `only a deck can be a place to put the truck, and ${f.name} is a ${f.kind}`);
      run++;
      along(i, f, false);
    }
    else if ("through" in item) {
      const f = find(i, item.through);
      if (f.kind === "car" || f.kind === "wall" || f.kind === "dominoes") crashInto(i, f);
      else along(i, f, false);
    } else {
      const prev = here();
      // at the start, a point is where the truck is put down (a leg of no length)
      if (!prev) push({ kind: "drive", from: item.to, to: item.to, item: i });
      else push({ kind: kindOfRise(item.to[1] - prev.to[1]), from: prev.to, to: item.to, item: i });
    }
  });
  cutCorners(legs);
  return legs;
}

/** Two lanes that meet at a corner: the truck turns where the middles of the two lanes cross, so the one leg runs on
    to that point and the next begins there. */
function cutCorners(legs: Leg[]) {
  for (let k = 0; k + 1 < legs.length; k++) {
    const [a, b] = [legs[k], legs[k + 1]];
    if (a.run !== b.run || a.kind !== "drive" || b.kind !== "drive" || !a.feature || !b.feature || Math.abs(a.to[1] - b.from[1]) > 0.1) continue;
    const unit = (l: Leg): P2 => {
      const d = sub2(xz(l.to), xz(l.from));
      const m = Math.hypot(...d);
      return [d[0] / m, d[1] / m];
    };
    const [da, db] = [unit(a), unit(b)];
    const c = da[0] * db[1] - da[1] * db[0];
    if (Math.abs(c) < 0.5) continue;
    const r = sub2(xz(b.from), xz(a.from));
    const t = (r[0] * db[1] - r[1] * db[0]) / c;
    const hit: P2 = [a.from[0] + da[0] * t, a.from[2] + da[1] * t];
    if (Math.hypot(hit[0] - a.to[0], hit[1] - a.to[2]) <= 1.05 && Math.hypot(hit[0] - b.from[0], hit[1] - b.from[2]) <= 1.05) {
      a.to = [hit[0], a.to[1], hit[1]];
      b.from = [hit[0], b.from[1], hit[1]];
    }
  }
}
