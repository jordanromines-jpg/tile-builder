/* Where a tile can go in Make your own (5.0b), and how it sits there. A tile goes on by its base edge, as every build
   is written (Builder.add): its base edge lies on a level edge of the build, or on the table's grid, and it turns up
   from there: standing, leaning, a ramp, flat, or hanging down. Pure, so it is tested on its own. */
import { coplanarOverlapArea, crosses, edgesOf, normalOf, worldPolygon, type V3 } from "../../engine/geometry";
import { SHAPES, type Colour, type ShapeId } from "../../engine/catalog";
import type { Placed } from "../../engine/types";

/** How a tile turns up from the edge it stands on (its tilt about that edge), in the order Turn steps through. */
export const TILTS = [
  { rx: 0, say: "standing" },
  { rx: -Math.PI / 6, say: "leaning" },
  { rx: -Math.PI / 3, say: "a ramp" },
  { rx: -Math.PI / 2, say: "flat" },
  { rx: (-2 * Math.PI) / 3, say: "hanging down" },
] as const;

/** A place a tile can go: a level stretch of edge, from `a` to `b`. */
export interface Spot {
  a: V3;
  b: V3;
}

const EPS = 1e-4;
/** how far off level an edge may lie and still take a tile, squares */
const LEVEL = 0.02;
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const lerp = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const len = (v: V3) => Math.hypot(v[0], v[1], v[2]);
const r6 = (v: number) => Math.round(v * 1e6) / 1e6;
const keyOf = (s: Spot) => [...s.a, ...s.b].map(r6).join(",");

/** The length of a shape's base edge (squares, triangles: 1; a big square, a rectangle: 2). */
export function baseLength(shape: ShapeId, leg: number): number {
  const [p, q] = SHAPES[shape].points(leg);
  return Math.hypot(q[0] - p[0], q[1] - p[1]);
}

/** The tile on a spot, at a tilt; `flip` puts it on the other side of the edge. */
export function placeOn(spot: Spot, shape: ShapeId, colour: Colour, tilt: number, flip = false): Placed {
  const [a, b] = flip ? [spot.b, spot.a] : [spot.a, spot.b];
  const d = sub(b, a);
  const turn = Math.atan2(-d[2], d[0]);
  return { shape, colour, pos: [r6(a[0]), r6(a[1]), r6(a[2])], rot: [TILTS[tilt].rx, r6(turn)] };
}

/** Every level edge of the tiles as they now lie, cut into whole squares (so a big square can sit across two). */
function levelUnits(polys: V3[][]): Spot[] {
  const out: Spot[] = [];
  for (const poly of polys) {
    for (const [p0, q0] of edgesOf(poly)) {
      // (a tile the physics has settled lies a hair off level: a level edge within LEVEL, levelled)
      if (Math.abs(p0[1] - q0[1]) > LEVEL) continue;
      const y = (p0[1] + q0[1]) / 2;
      const p: V3 = [p0[0], y, p0[2]];
      const q: V3 = [q0[0], y, q0[2]];
      const l = len(sub(q, p));
      const n = Math.round(l);
      if (n < 1 || Math.abs(l - n) > 0.02) continue;
      for (let k = 0; k < n; k++) out.push({ a: lerp(p, q, k / n), b: lerp(p, q, (k + 1) / n) });
    }
  }
  return out;
}

/** The table's grid: unit edges on y = 0 over x0..x1, z0..z1. */
function grid(x0: number, x1: number, z0: number, z1: number): Spot[] {
  const out: Spot[] = [];
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
    if (x < x1) out.push({ a: [x, 0, z], b: [x + 1, 0, z] });
    if (z < z1) out.push({ a: [x, 0, z], b: [x, 0, z + 1] });
  }
  return out;
}

/** Joins unit spots end to end, along one line, into spots `n` squares long. */
function runs(units: Spot[], n: number): Spot[] {
  if (n === 1) return units;
  const byStart = new Map(units.map((u) => [[...u.a].map(r6).join(","), u]));
  const out: Spot[] = [];
  for (const u of units) {
    const dir = sub(u.b, u.a);
    let end = u;
    let ok = true;
    for (let k = 1; k < n && ok; k++) {
      const next = byStart.get([...end.b].map(r6).join(","));
      if (!next || len(sub(sub(next.b, next.a), dir)) > EPS) ok = false;
      else end = next;
    }
    if (ok) out.push({ a: u.a, b: end.b });
  }
  return out;
}

/** The spots a shape can go on: level edges of the build as it now lies (`polys`), and the table around it. */
export function spotsFor(shape: ShapeId, leg: number, polys: V3[][]): Spot[] {
  const n = Math.round(baseLength(shape, leg));
  const all = polys.flat();
  const xs = all.map((v) => v[0]);
  const zs = all.map((v) => v[2]);
  const [x0, x1, z0, z1] = all.length
    ? [Math.floor(Math.min(...xs)) - 2, Math.ceil(Math.max(...xs)) + 2, Math.floor(Math.min(...zs)) - 2, Math.ceil(Math.max(...zs)) + 2]
    : [-2, 2, -2, 2];
  const units = [...levelUnits(polys), ...grid(x0, x1, z0, z1)];
  // each stretch once, whichever way round it was found
  const seen = new Set<string>();
  const out: Spot[] = [];
  for (const s of runs(units, n)) {
    const k = keyOf(s);
    const back = keyOf({ a: s.b, b: s.a });
    if (seen.has(k) || seen.has(back)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

/** Would this tile go through a tile already there (or under the table)? */
export function blocked(tile: Placed, leg: number, polys: V3[][]): boolean {
  // a hair smaller than drawn: tiles the physics has settled lie a millimetre or two off, and a tile that only meets
  // another at an edge or a corner mustn't count as going through it
  const drawn = worldPolygon(tile, leg);
  const mid = drawn.reduce<V3>((m, v) => [m[0] + v[0] / drawn.length, m[1] + v[1] / drawn.length, m[2] + v[2] / drawn.length], [0, 0, 0]);
  const poly = drawn.map((v) => lerp(mid, v, 0.94));
  if (Math.min(...drawn.map((v) => v[1])) < -EPS) return true;
  const n = normalOf(tile, leg);
  return polys.some((q) => {
    const m = planeNormal(q);
    return coplanarOverlapArea(poly, n, q, m) > 1e-3 || crosses(poly, n, q, m);
  });
}

function planeNormal(q: V3[]): V3 {
  const u = sub(q[1], q[0]);
  const v = sub(q[2], q[0]);
  const c: V3 = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const l = len(c) || 1;
  return [c[0] / l, c[1] / l, c[2] / l];
}
