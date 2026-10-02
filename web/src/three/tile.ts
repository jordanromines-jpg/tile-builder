/* A magnet tile in 3D (plan key 2l), from the prototype (docs/prototype/magnet-tile-castle.html, lines 221–251 and
   317–325): a solid rim (the frame), a translucent face (the glass) and a faint moulded ridge. Geometry is built once a
   shape and shared by every tile of that shape. */
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { DEFAULT_LEG, SHAPES, type Colour, type Pt, type ShapeId } from "../engine/catalog";

export const TH = 0.075; // thickness
export const RIM = 0.085; // frame width

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

function path<T extends THREE.Path>(pts: Pt[], into: T): T {
  into.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) into.lineTo(p[0], p[1]);
  into.closePath();
  return into;
}

/** A flat ring between a polygon and its inset, extruded to the tile's thickness. */
function ring(outer: Pt[], w: number): THREE.BufferGeometry {
  const s = path(outer, new THREE.Shape());
  s.holes.push(path(inset(outer, w).reverse(), new THREE.Path()));
  const g = new THREE.ExtrudeGeometry(s, { depth: TH, bevelEnabled: false });
  g.translate(0, 0, -TH / 2);
  return g;
}

function bar(x0: number, y0: number, x1: number, y1: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, TH);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, 0);
  return g.toNonIndexed();
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
  ridge: THREE.BufferGeometry;
}

const cache = new Map<string, TileGeometry>();

export function buildGeometry(shape: ShapeId, leg = DEFAULT_LEG): TileGeometry {
  const key = shape === "tri-isosceles-tall" ? `${shape}:${leg}` : shape;
  const hit = cache.get(key);
  if (hit) return hit;
  const def = SHAPES[shape];
  const pts = def.points(leg);
  const hole = holeOf(shape);
  const parts = [ring(pts, RIM).toNonIndexed()];
  if (hole) parts.push(ring(inset(hole, -RIM * 0.6), RIM * 0.6).toNonIndexed());
  if (def.noFace) {
    for (const x of [0.33, 0.66]) parts.push(bar(x - RIM / 2, RIM * 0.5, x + RIM / 2, 0.5 - RIM * 0.5));
  }
  for (const p of parts) p.deleteAttribute("uv");
  const frame = parts.length > 1 ? mergeGeometries(parts)! : parts[0];
  frame.computeVertexNormals();
  let glass: THREE.BufferGeometry | null = null;
  if (!def.noFace) {
    const face = path(inset(pts, RIM * 0.5), new THREE.Shape());
    if (hole) face.holes.push(path(inset(hole, -RIM * 0.6).reverse(), new THREE.Path()));
    glass = new THREE.ShapeGeometry(face);
  }
  const r = inset(pts, RIM * 2.2);
  const ridge = new THREE.BufferGeometry().setFromPoints([...r, r[0]].map((p) => new THREE.Vector3(p[0], p[1], 0)));
  const out = { frame, glass, ridge };
  cache.set(key, out);
  return out;
}

/** The prototype's colours, used when the page's tokens can't be read (tests, the first frame). */
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
