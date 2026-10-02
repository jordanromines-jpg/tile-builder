/* Geometry for the checker (plan key 4e). A tile is a convex polygon (its shape's points) placed by `pos` and `rot`:
   world = pos + R · (px, py, 0), with R the rotation of Euler (rx, ry, 0) in order YXZ, exactly as the prototype and
   three.js. Units are square edges; EPS is the tolerance. The table is the plane y = 0. */
import { EQ_H, SHAPES, tallHeight, type Pt } from "./catalog";
import type { Placed } from "./types";

export type V3 = [number, number, number];
export type Seg = [V3, V3];

export const EPS = 1e-3;

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3): V3 => scale(a, 1 / len(a));

/** The face height of a triangle that leans in to make a roof. */
export function roofHeight(shape: Placed["shape"], leg: number): number {
  return shape === "tri-isosceles-tall" ? tallHeight(leg) : shape === "tri-equilateral" ? EQ_H : 1;
}

/** A roof triangle leans in until the four apexes meet over the middle of a unit square. */
export function roofTilt(shape: Placed["shape"], leg: number): number {
  return -Math.asin(0.5 / roofHeight(shape, leg));
}

/** The rotation actually used: a roof's tilt is worked out from its legs. */
export function rotOf(p: Placed, leg: number): [number, number] {
  return p.role === "roof" ? [roofTilt(p.shape, leg), p.rot[1]] : p.rot;
}

/** R(rx, ry) · (x, y, 0), Euler order YXZ. */
export function rotate(rx: number, ry: number, x: number, y: number, z = 0): V3 {
  // Rx first
  const y1 = y * Math.cos(rx) - z * Math.sin(rx);
  const z1 = y * Math.sin(rx) + z * Math.cos(rx);
  // then Ry
  return [x * Math.cos(ry) + z1 * Math.sin(ry), y1, -x * Math.sin(ry) + z1 * Math.cos(ry)];
}

export function localPoints(p: Placed, leg: number): Pt[] {
  return SHAPES[p.shape].points(leg);
}

export function worldPolygon(p: Placed, leg: number): V3[] {
  const [rx, ry] = rotOf(p, leg);
  return localPoints(p, leg).map(([x, y]) => add(p.pos as V3, rotate(rx, ry, x, y)));
}

export function normalOf(p: Placed, leg: number): V3 {
  const [rx, ry] = rotOf(p, leg);
  return rotate(rx, ry, 0, 0, 1);
}

export function edgesOf(poly: V3[]): Seg[] {
  return poly.map((a, i) => [a, poly[(i + 1) % poly.length]] as Seg);
}

function distToLine(p: V3, a: V3, dir: V3): number {
  return len(cross(sub(p, a), dir));
}

/** Two edges meet when they lie on one line (within EPS) and overlap by at least 98% of the shorter. */
export function edgesMeet(a: Seg, b: Seg): boolean {
  const da = sub(a[1], a[0]);
  const la = len(da);
  const lb = len(sub(b[1], b[0]));
  if (la < EPS || lb < EPS) return false;
  const u = scale(da, 1 / la);
  if (distToLine(b[0], a[0], u) > EPS || distToLine(b[1], a[0], u) > EPS) return false;
  const t0 = dot(sub(b[0], a[0]), u);
  const t1 = dot(sub(b[1], a[0]), u);
  const overlap = Math.min(la, Math.max(t0, t1)) - Math.max(0, Math.min(t0, t1));
  return overlap >= 0.98 * Math.min(la, lb) - EPS;
}

export function minY(poly: V3[]): number {
  return Math.min(...poly.map((p) => p[1]));
}

/** On the table: one edge, or the whole face, lies in y = 0. */
export function isOnTable(poly: V3[]): boolean {
  return edgesOf(poly).some(([a, b]) => Math.abs(a[1]) < EPS && Math.abs(b[1]) < EPS);
}

export function layerOf(poly: V3[]): number {
  return Math.floor(minY(poly) + EPS);
}

export type Orientation = "standing" | "flat" | "tilted";

export function orientationOf(n: V3): Orientation {
  if (Math.abs(n[1]) < EPS) return "standing";
  if (Math.abs(n[1]) > 1 - EPS) return "flat";
  return "tilted";
}

/** Edges whose two ends sit at the tile's lowest height. */
export function bottomEdges(poly: V3[]): number[] {
  const y = minY(poly);
  return edgesOf(poly)
    .map(([a, b], i) => (Math.abs(a[1] - y) < EPS && Math.abs(b[1] - y) < EPS ? i : -1))
    .filter((i) => i >= 0);
}

/** A 2D frame in a polygon's plane. */
function frame(poly: V3[], n: V3) {
  const u = norm(sub(poly[1], poly[0]));
  const v = cross(n, u);
  const o = poly[0];
  return (p: V3): [number, number] => {
    const d = sub(p, o);
    return [dot(d, u), dot(d, v)];
  };
}

function area2(pts: [number, number][]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

function ccw(pts: [number, number][]): [number, number][] {
  return area2(pts) < 0 ? [...pts].reverse() : pts;
}

/** Sutherland–Hodgman: the part of `subject` inside the convex, counter-clockwise `clip`. */
function clipPolygon(subject: [number, number][], clip: [number, number][]): [number, number][] {
  let out = subject;
  for (let i = 0; i < clip.length && out.length; i++) {
    const [ax, ay] = clip[i];
    const [bx, by] = clip[(i + 1) % clip.length];
    const inside = ([x, y]: [number, number]) => (bx - ax) * (y - ay) - (by - ay) * (x - ax) >= 0;
    const meet = (p: [number, number], q: [number, number]): [number, number] => {
      const a1 = by - ay;
      const b1 = ax - bx;
      const c1 = a1 * ax + b1 * ay;
      const a2 = q[1] - p[1];
      const b2 = p[0] - q[0];
      const c2 = a2 * p[0] + b2 * p[1];
      const det = a1 * b2 - a2 * b1;
      return [(b2 * c1 - b1 * c2) / det, (a1 * c2 - a2 * c1) / det];
    };
    const input = out;
    out = [];
    input.forEach((p, j) => {
      const q = input[(j + 1) % input.length];
      if (inside(q)) {
        if (!inside(p)) out.push(meet(p, q));
        out.push(q);
      } else if (inside(p)) out.push(meet(p, q));
    });
  }
  return out;
}

export function coplanar(a: V3[], na: V3, b: V3[], nb: V3): boolean {
  return len(cross(na, nb)) < EPS && b.every((p) => Math.abs(dot(sub(p, a[0]), na)) < EPS);
}

/** The area two tiles in one plane share; 0 when they are not in one plane. */
export function coplanarOverlapArea(a: V3[], na: V3, b: V3[], nb: V3): number {
  if (!coplanar(a, na, b, nb)) return 0;
  const to2 = frame(a, na);
  const pa = ccw(a.map(to2));
  const pb = ccw(b.map(to2));
  const c = clipPolygon(pb, pa);
  return c.length < 3 ? 0 : Math.abs(area2(c));
}

/** Whether a point of the polygon's plane is inside it by more than EPS. */
function insideBy(poly: V3[], n: V3, p: V3): boolean {
  const to2 = frame(poly, n);
  const pts = ccw(poly.map(to2));
  const [x, y] = to2(p);
  return pts.every(([ax, ay], i) => {
    const [bx, by] = pts[(i + 1) % pts.length];
    const l = Math.hypot(bx - ax, by - ay);
    return ((bx - ax) * (y - ay) - (by - ay) * (x - ax)) / l > EPS;
  });
}

/** Where a polygon cuts a plane (n · (x − o) = 0), as positions along the direction d: [min, max], or null. */
function cutInterval(poly: V3[], o: V3, n: V3, d: V3): [number, number] | null {
  const ts: number[] = [];
  edgesOf(poly).forEach(([p, q]) => {
    const dp = dot(sub(p, o), n);
    const dq = dot(sub(q, o), n);
    if (Math.abs(dp) < EPS) ts.push(dot(p, d));
    if (Math.abs(dq) < EPS) ts.push(dot(q, d));
    if ((dp < -EPS && dq > EPS) || (dp > EPS && dq < -EPS)) ts.push(dot(add(p, scale(sub(q, p), dp / (dp - dq))), d));
  });
  return ts.length ? [Math.min(...ts), Math.max(...ts)] : null;
}

/** Two tiles pass through each other: their planes meet in a line, and on that line they share a stretch whose middle
    is inside both by more than EPS. Tiles that only touch (a shared edge, an edge resting on a face) share a stretch on
    the edge of at least one of them, so they pass. Tiles in one plane are coplanarOverlapArea's job. */
export function crosses(a: V3[], na: V3, b: V3[], nb: V3): boolean {
  const c = cross(na, nb);
  if (len(c) < EPS) return false;
  const d = norm(c);
  const ia = cutInterval(a, b[0], nb, d);
  const ib = cutInterval(b, a[0], na, d);
  if (!ia || !ib) return false;
  const lo = Math.max(ia[0], ib[0]);
  const hi = Math.min(ia[1], ib[1]);
  if (hi - lo < EPS) return false;
  const mid = pointOnBoth(a[0], na, b[0], nb, d, (lo + hi) / 2);
  return insideBy(a, na, mid) && insideBy(b, nb, mid);
}

/** The point on the line where two planes meet, at position t along d. */
function pointOnBoth(oa: V3, na: V3, ob: V3, nb: V3, d: V3, t: number): V3 {
  // solve x · na = oa · na, x · nb = ob · nb, x · d = t
  const r: V3 = [dot(oa, na), dot(ob, nb), t];
  const det = dot(na, cross(nb, d));
  const cx = cross(nb, d);
  const cy = cross(d, na);
  const cz = cross(na, nb);
  return [
    (r[0] * cx[0] + r[1] * cy[0] + r[2] * cz[0]) / det,
    (r[0] * cx[1] + r[1] * cy[1] + r[2] * cz[1]) / det,
    (r[0] * cx[2] + r[1] * cy[2] + r[2] * cz[2]) / det,
  ];
}

/** A leaning triangle's apex: its third point. */
export function apexOf(poly: V3[]): V3 {
  return poly[2];
}

export interface Bounds {
  min: V3;
  max: V3;
}

export function boundsOf(poly: V3[]): Bounds {
  return {
    min: [0, 1, 2].map((k) => Math.min(...poly.map((p) => p[k]))) as V3,
    max: [0, 1, 2].map((k) => Math.max(...poly.map((p) => p[k]))) as V3,
  };
}

export function boundsTouch(a: Bounds, b: Bounds): boolean {
  return [0, 1, 2].every((k) => a.min[k] <= b.max[k] + EPS && b.min[k] <= a.max[k] + EPS);
}
