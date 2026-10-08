/* A magnet tile in 3D (sprint 2, change 1): a thick, glossy plastic frame with rounded corners and bevelled edges, a
   clear tinted face with the moulded diamond texture, and chrome rivets at the corners, as on real tiles. Geometry is
   built once a shape and shared by every tile of that shape. */
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { DEFAULT_LEG, SHAPES, type Colour, type Pt, type ShapeId } from "../engine/catalog";

export const TH = 0.1; // thickness of the frame
export const RIM = 0.095; // width of the frame
const BEVEL = 0.014;
const CORNER = 0.07; // how far a corner is rounded along each edge
const INNER_CORNER = 0.035;

/** The polygon moved inward by w (convex, counter-clockwise). */
export function inset(pts: Pt[], w: number): Pt[] {
  const n = pts.length;
  const lines = pts.map((a, i) => {
    const b = pts[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    return { px: a[0] - (dy / len) * w, py: a[1] + (dx / len) * w, dx, dy };
  });
  return lines.map((l2, i) => {
    const l1 = lines[(i - 1 + n) % n];
    const cr = l1.dx * l2.dy - l1.dy * l2.dx;
    const t = ((l2.px - l1.px) * l2.dy - (l2.py - l1.py) * l2.dx) / cr;
    return [l1.px + l1.dx * t, l1.py + l1.dy * t] as Pt;
  });
}

/** A polygon with its corners rounded: each corner cut back by up to `r` along both edges and joined by a curve. */
function rounded<T extends THREE.Path>(pts: Pt[], r: number, into: T): T {
  const n = pts.length;
  const cut = (i: number, toward: number): Pt => {
    const [x, y] = pts[i];
    const [tx, ty] = pts[toward];
    const len = Math.hypot(tx - x, ty - y);
    const d = Math.min(r, len * 0.3) / len;
    return [x + (tx - x) * d, y + (ty - y) * d];
  };
  const start = cut(0, 1);
  into.moveTo(start[0], start[1]);
  for (let k = 1; k <= n; k++) {
    const i = k % n;
    const a = cut(i, (i - 1 + n) % n);
    const b = cut(i, (i + 1) % n);
    into.lineTo(a[0], a[1]);
    into.quadraticCurveTo(pts[i][0], pts[i][1], b[0], b[1]);
  }
  into.closePath();
  return into;
}

/** A bevelled frame between an outer outline and an inner opening, centred on z = 0; `light` with fewer curve and bevel
    segments. */
function frameRing(outer: Pt[], inner: Pt[], light = false): THREE.BufferGeometry {
  const s = rounded(inset(outer, BEVEL), CORNER, new THREE.Shape());
  s.holes.push(rounded([...inner].reverse(), INNER_CORNER, new THREE.Path()));
  const depth = TH - 2 * BEVEL;
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: light ? 1 : 3, curveSegments: light ? 3 : 6 });
  g.translate(0, 0, -depth / 2);
  return g;
}

function bar(x0: number, y0: number, x1: number, y1: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, TH * 0.8);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, 0);
  return g;
}

/** The opening in a window or door tile, counter-clockwise. */
export function holeOf(shape: ShapeId): Pt[] | null {
  const hole = SHAPES[shape].hole;
  if (hole === "window") return [[0.28, 0.28], [0.72, 0.28], [0.72, 0.72], [0.28, 0.72]];
  if (hole === "door") {
    const arch: Pt[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI;
      arch.push([0.5 + 0.2 * Math.cos(a), 0.55 + 0.2 * Math.sin(a)]);
    }
    return [[0.3, 0.14], [0.7, 0.14], ...arch.slice(0, -1), [0.3, 0.55]];
  }
  return null;
}

export interface TileGeometry {
  frame: THREE.BufferGeometry;
  glass: THREE.BufferGeometry | null;
  rivets: THREE.BufferGeometry;
  /** the outline, for the ghost that shows where a tile goes */
  outline: THREE.BufferGeometry;
}

const cache = new Map<string, TileGeometry>();

/** Lets every cached tile shape go; three uploads a shape again when a mesh still uses it. */
export function releaseGeometry() {
  cache.forEach((g) => [g.frame, g.glass, g.rivets, g.outline].forEach((x) => x?.dispose()));
  cache.clear();
}

function clean(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const out = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(out.attributes)) if (k !== "position" && k !== "normal") out.deleteAttribute(k);
  return out;
}

/** A tile's shapes. `light` (2.8.1): a lighter tile for big builds on the iPad, about a third of the triangles, with
    fewer segments in the bevels, the rounded corners and the rivets; the pictures and smaller builds keep the full one. */
export function buildGeometry(shape: ShapeId, leg = DEFAULT_LEG, light = false): TileGeometry {
  const key = (shape === "tri-isosceles-tall" ? `${shape}:${leg}` : shape) + (light ? ":light" : "");
  const hit = cache.get(key);
  if (hit) return hit;
  const def = SHAPES[shape];
  const pts = def.points(leg);
  const hole = holeOf(shape);
  const parts = [clean(frameRing(pts, inset(pts, RIM), light))];
  if (hole) parts.push(clean(frameRing(inset(hole, -RIM * 0.7), hole, light)));
  if (def.noFace) for (const x of [0.33, 0.66]) parts.push(clean(bar(x - RIM / 2, RIM * 0.6, x + RIM / 2, 0.5 - RIM * 0.6)));
  const frame = mergeGeometries(parts)!;
  frame.computeVertexNormals();

  let glass: THREE.BufferGeometry | null = null;
  if (!def.noFace) {
    const face = rounded(inset(pts, RIM * 0.6), INNER_CORNER, new THREE.Shape());
    if (hole) face.holes.push(rounded([...inset(hole, -RIM * 0.5)].reverse(), INNER_CORNER, new THREE.Path()));
    glass = new THREE.ShapeGeometry(face, light ? 3 : 6);
  }

  // a chrome rivet through each corner of the frame, showing on both sides
  const rv = inset(pts, RIM * 0.5).map(([x, y]) => {
    const c = new THREE.CylinderGeometry(0.026, 0.026, TH + 0.008, light ? 8 : 14);
    c.rotateX(Math.PI / 2);
    c.translate(x, y, 0);
    return clean(c);
  });
  const rivets = mergeGeometries(rv)!;

  const o = inset(pts, -0.02);
  const outline = new THREE.BufferGeometry().setFromPoints([...o, o[0]].map((p) => new THREE.Vector3(p[0], p[1], 0)));

  const out = { frame, glass, rivets, outline };
  cache.set(key, out);
  return out;
}

/** The plastic's colours: the tokens' tile hues, with the prototype's as a fallback (tests, the first frame). */
export const FALLBACK: Record<Colour, string> = {
  red: "#e5322e",
  orange: "#f5841f",
  yellow: "#f4c51b",
  green: "#39ad4a",
  blue: "#2a78dd",
  purple: "#8a4cc8",
};

/** A colour token's live value: `--tile-red`, `--stage`, `--ground`. */
export function cssColour(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
  return v || fallback;
}

export function tileColour(c: Colour): string {
  return cssColour(`tile-${c}`, FALLBACK[c]);
}

/** The rotation of a placed tile: Euler (rx, ry, 0) in order YXZ (tilt about the base edge, then turn), as the prototype. */
export function tileQuaternion(rx: number, ry: number): THREE.Quaternion {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, 0, "YXZ"));
}
