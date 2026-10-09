/* Small geometry tools for the Pip truck: every part is built in the truck's own frame (spec.ts), painted with vertex
   colours, and merged by material so the whole truck is a handful of draw calls. */
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RIM, frameRing, inset, rounded, tileColour } from "../tile";
import type { Colour, Pt } from "../../engine/catalog";
import type { V3 } from "./spec";

/** The truck's paint: the six tile colours (read from the tokens, so light and dark themes show), and two darker
    shades of them for the tyres and the window tint. No white, black or grey. */
export interface Palette {
  red: THREE.Color;
  orange: THREE.Color;
  yellow: THREE.Color;
  green: THREE.Color;
  blue: THREE.Color;
  purple: THREE.Color;
  /** dark purple, for tyres and the smile */
  tyre: THREE.Color;
  /** deep blue, for window glass */
  tint: THREE.Color;
}

export function palette(): Palette {
  const c = (n: Colour) => new THREE.Color(tileColour(n));
  const purple = c("purple");
  const blue = c("blue");
  return {
    red: c("red"),
    orange: c("orange"),
    yellow: c("yellow"),
    green: c("green"),
    blue,
    purple,
    tyre: purple.clone().offsetHSL(0, -0.05, -0.27),
    tint: blue.clone().offsetHSL(0, -0.05, -0.18),
  };
}

export const UP = new THREE.Vector3(0, 1, 0);
export const v3 = (p: V3) => new THREE.Vector3(p[0], p[1], p[2]);

/** A geometry ready to merge: unindexed, position and normal only, then a colour for every vertex (with an alpha when
    `alpha` is given, for the glass). */
export function paint(g: THREE.BufferGeometry, colour: THREE.Color, alpha?: number): THREE.BufferGeometry {
  const out = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(out.attributes)) if (k !== "position" && k !== "normal") out.deleteAttribute(k);
  if (!out.getAttribute("normal")) out.computeVertexNormals();
  const n = out.getAttribute("position").count;
  const size = alpha === undefined ? 3 : 4;
  const data = new Float32Array(n * size);
  for (let i = 0; i < n; i++) {
    data[i * size] = colour.r;
    data[i * size + 1] = colour.g;
    data[i * size + 2] = colour.b;
    if (alpha !== undefined) data[i * size + 3] = alpha;
  }
  out.setAttribute("color", new THREE.BufferAttribute(data, size));
  return out;
}

export function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const g = mergeGeometries(parts);
  if (!g) throw new Error("truck: nothing to merge");
  return g;
}

/** Moves a geometry by a position, a quaternion and a scale (in place). */
export function put(g: THREE.BufferGeometry, pos: V3, q?: THREE.Quaternion, scale?: V3): THREE.BufferGeometry {
  const m = new THREE.Matrix4().compose(v3(pos), q ?? new THREE.Quaternion(), scale ? v3(scale) : new THREE.Vector3(1, 1, 1));
  return g.applyMatrix4(m);
}

export const quatY = (a: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a);
export const quatX = (a: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a);
export const quatZ = (a: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), a);

/** A round bar from a to b. */
export function rod(a: V3, b: V3, r: number, sides = 6): THREE.BufferGeometry {
  const A = v3(a);
  const B = v3(b);
  const d = B.clone().sub(A);
  const g = new THREE.CylinderGeometry(r, r, d.length(), sides, 1, true);
  return put(g, A.clone().add(B).multiplyScalar(0.5).toArray() as V3, new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()));
}

/** A round joint, or the rounded end of a bar. */
export function ball(p: V3, r: number, w = 6, h = 4): THREE.BufferGeometry {
  return put(new THREE.SphereGeometry(r, w, h), p);
}

/** A bar with a ball at each end, as a tube frame has. */
export function tube(points: V3[], r: number, sides = 6): THREE.BufferGeometry[] {
  const out: THREE.BufferGeometry[] = [];
  for (let i = 0; i + 1 < points.length; i++) out.push(rod(points[i], points[i + 1], r, sides));
  for (const p of points) out.push(ball(p, r * 1.18, sides, 3));
  return out;
}

/** A tile-like plane in the truck's frame: the point o, and the directions of the panel's own x (u) and y (v). Its
    face looks along u × v. */
export interface Plane {
  o: V3;
  u: V3;
  v: V3;
}
export const FRONT = (z: number, x = 0, y = 0): Plane => ({ o: [x, y, z], u: [1, 0, 0], v: [0, 1, 0] });
/** a panel on the truck's left (+x) side, looking out, whose own x runs toward the back */
export const LEFT = (x: number, z = 0, y = 0): Plane => ({ o: [x, y, z], u: [0, 0, -1], v: [0, 1, 0] });
/** a panel on the right (-x) side, looking out, whose own x runs toward the front */
export const RIGHT = (x: number, z = 0, y = 0): Plane => ({ o: [x, y, z], u: [0, 0, 1], v: [0, 1, 0] });
/** a panel lying flat, looking up: its own x is across the truck and its own y runs toward the back */
export const FLAT = (y: number, x = 0, z = 0): Plane => ({ o: [x, y, z], u: [1, 0, 0], v: [0, 0, -1] });

function basis(p: Plane): THREE.Matrix4 {
  const u = v3(p.u);
  const v = v3(p.v);
  const n = u.clone().cross(v);
  return new THREE.Matrix4().makeBasis(u, v, n).setPosition(v3(p.o));
}

/** The pieces of a bevelled tile panel: its frame, and its clear face. */
export interface Panel {
  frame: THREE.BufferGeometry;
  glass: THREE.BufferGeometry | null;
}

/** The panel thickness scale: a tile's frame is 0.1 thick; the truck's panels are drawn at this scale so they read as
    chunky tiles at the size they are. */
export const TILE_S = 0.5;

/** A tile panel: a polygon `pts` (counter-clockwise, in the panel's own x and y, in units of the truck), as a frame in
    `frameColour` and a clear face in `glassColour` (or none), optionally with a window opening `hole` that gets a
    pane of `pane` colour. The panel's middle plane is `plane`. */
export function panel(pts: Pt[], plane: Plane, frameColour: THREE.Color, glassColour: THREE.Color | null, opts: { s?: number; hole?: Pt[]; pane?: THREE.Color; paneAlpha?: number; glassAlpha?: number } = {}): { frame: THREE.BufferGeometry; glass: THREE.BufferGeometry[] } {
  const s = opts.s ?? TILE_S;
  const big = pts.map(([x, y]) => [x / s, y / s] as Pt);
  const hole = opts.hole?.map(([x, y]) => [x / s, y / s] as Pt);
  const m = basis(plane).multiply(new THREE.Matrix4().makeScale(s, s, s));
  const frameParts = [frameRing(big, inset(big, RIM), true)];
  if (hole) frameParts.push(frameRing(inset(hole, -RIM * 0.7), hole, true));
  const frame = merge(frameParts.map((g) => paint(g, frameColour))).applyMatrix4(m);
  const glass: THREE.BufferGeometry[] = [];
  if (glassColour) {
    const face = rounded(inset(big, RIM * 0.6), 0.035, new THREE.Shape());
    if (hole) face.holes.push(rounded([...inset(hole, -RIM * 0.5)].reverse(), 0.035, new THREE.Path()));
    glass.push(paint(new THREE.ShapeGeometry(face, 3), glassColour, opts.glassAlpha ?? 0.62).applyMatrix4(m));
  }
  if (hole && opts.pane) {
    // the window's pane: the opening filled with tinted clear plastic
    const shape = new THREE.Shape(inset(hole, -RIM * 0.4).map(([x, y]) => new THREE.Vector2(x, y)));
    glass.push(paint(new THREE.ShapeGeometry(shape), opts.pane, opts.paneAlpha ?? 0.4).applyMatrix4(m));
  }
  return { frame, glass };
}

/** A rectangle of w × h centred on the origin, counter-clockwise. */
export const box2 = (w: number, h: number): Pt[] => [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];

/** A coil spring along +y from 0 to `height`: a tube of radius `r` wound `turns` times at radius `R`. */
export function helix(R: number, r: number, turns: number, height: number, segsPerTurn = 8, sides = 4): THREE.BufferGeometry {
  const n = Math.round(turns * segsPerTurn);
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * turns * Math.PI * 2;
    const c = new THREE.Vector3(R * Math.cos(a), t * height, R * Math.sin(a));
    const tan = new THREE.Vector3(-R * Math.sin(a) * turns * Math.PI * 2, height, R * Math.cos(a) * turns * Math.PI * 2).normalize();
    const out = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const bin = tan.clone().cross(out).normalize();
    const nor = bin.clone().cross(tan).normalize();
    for (let j = 0; j < sides; j++) {
      const b = (j / sides) * Math.PI * 2;
      const p = c.clone().addScaledVector(nor, Math.cos(b) * r).addScaledVector(bin, Math.sin(b) * r);
      pos.push(p.x, p.y, p.z);
    }
  }
  for (let i = 0; i < n; i++)
    for (let j = 0; j < sides; j++) {
      const a = i * sides + j;
      const b = i * sides + ((j + 1) % sides);
      idx.push(a, b, a + sides, b, b + sides, a + sides);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Counts what a group will cost to draw: meshes (one call each) and triangles (instances counted). */
export function cost(root: THREE.Object3D): { calls: number; triangles: number } {
  let calls = 0;
  let triangles = 0;
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.visible) return;
    calls++;
    const g = m.geometry;
    const per = (g.index ? g.index.count : g.getAttribute("position").count) / 3;
    triangles += per * ((m as THREE.InstancedMesh).isInstancedMesh ? (m as THREE.InstancedMesh).count : 1);
  });
  return { calls, triangles };
}
