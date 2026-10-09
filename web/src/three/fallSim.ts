/* The finish's falling tiles (4.2c), by formula, no engine (D9). Twenty-eight little tiles are let go above the
   finished build and fall under the scene's gravity (anim.ts SCENE_G) with spin, bounce off its top surface (a height
   field, heightField.ts) and the table with restitution 0.3 and Coulomb friction, slide off slopes too steep to hold
   them, and each comes to rest lying flat. Between touches a tile's path is an exact parabola; it is stepped at 120 Hz
   only to find the touches. The whole fall is worked out once, seeded and the same every time, and recorded at 60 Hz;
   the stage plays the recording and stops drawing when the last piece is still. A tile at rest is part of the surface,
   so the next one lands on it, not through it. */
import * as THREE from "three";
import { SHAPES, type Colour, type ShapeId } from "../engine/catalog";
import { SCENE_G, mulberry } from "./anim";
import { CELL, cloneField, heightAt, stamp, type HeightField } from "./heightField";
import { TH } from "./tile";

/** The celebration's length: the circle and the shower end by this (the same 3.6 s as the DOM shower had). */
export const CONFETTI_MS = 3600;
export const PIECES = 28;
/** bounce: each touch leaves at this fraction of the speed it arrived at */
export const RESTITUTION = 0.3;
/** plastic on plastic */
export const FRICTION = 0.45;
export const FRAME_S = 1 / 60;
const DT = 1 / 120;
const COLOURS: Colour[] = ["red", "orange", "yellow", "green", "blue", "purple"];
const SHAPE_IDS: ShapeId[] = ["square", "tri-equilateral", "tri-right"];
/** arriving slower than this, a touch is no bounce, only contact */
const BOUNCE_MIN = 1.2;
const STILL_STEPS = 12;
/** past this a piece that is still sliding is held by a much stickier table, so the shower always ends */
const GRIP_AFTER = 2.3;
const LIMIT_S = 8;
/** a rise in the surface bigger than this, met sideways, is a wall (a tile can step up onto less) */
const STEP = 0.4;
/** a tile whose middle is on the highest point it touches, with under this share of its footprint there, is balanced on
    a point and tips off; how hard it is pushed */
const HELD = 0.55;
const PERCH_A = 30;

export interface Piece {
  shape: ShapeId;
  colour: Colour;
  /** uniform size: the shape drawn this many times its real size */
  scale: number;
  /** the shape's middle, in its own (unscaled) points: the piece turns about it */
  centre: [number, number];
  /** from the middle to the farthest corner, scaled */
  radius: number;
  /** seconds before it is let go */
  delay: number;
}

export interface Resting {
  x: number;
  y: number;
  z: number;
  /** what it lies on: the table, the build, or another tile already at rest */
  on: "table" | "build" | "tile";
  /** the surface height under it, where it lies */
  floor: number;
}

export interface FallResult {
  pieces: Piece[];
  /** seconds from the first to the last still piece */
  duration: number;
  frames: number;
  /** per piece, `frames` poses of 7 numbers: x y z and the quaternion x y z w (the middle of the tile) */
  track: Float32Array[];
  /** the first frame each piece is in the air */
  first: number[];
  rest: Resting[];
  /** every piece lay still before the limit */
  settled: boolean;
}

interface Body {
  p: THREE.Vector3;
  v: THREE.Vector3;
  q: THREE.Quaternion;
  w: THREE.Vector3;
  contact: boolean;
  still: number;
  /** steps spent tipping off a point */
  tipped: number;
  done: boolean;
}

const UP = new THREE.Vector3(0, 1, 0);

/** The pose that is flat from `q`: its face turned to point straight up (or down), the turn about the vertical kept. */
function flatOf(q: THREE.Quaternion, out = new THREE.Quaternion()): THREE.Quaternion {
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  const target = n.y >= 0 ? UP : UP.clone().negate();
  return out.setFromUnitVectors(n, target).multiply(q);
}

export function tiltOf(q: THREE.Quaternion): number {
  return q.angleTo(flatOf(q));
}

/** The pieces: the same variety as the DOM shower had (colour by index, three shapes, sizes by index), only a bit smaller
    than a real tile (70 to 100%) so they read as little ones. */
export function makePieces(): Piece[] {
  return Array.from({ length: PIECES }, (_, i) => {
    const shape = SHAPE_IDS[i % SHAPE_IDS.length];
    const pts = SHAPES[shape].points();
    const centre: [number, number] = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
    const scale = 0.7 + (((i * 7) % 14) / 14) * 0.3;
    const radius = scale * Math.max(...pts.map((p) => Math.hypot(p[0] - centre[0], p[1] - centre[1])));
    return { shape, colour: COLOURS[i % COLOURS.length], scale, centre, radius, delay: ((i * 53) % 900) / 1000 };
  });
}

export function simulate(base: HeightField, seed = 11): FallResult {
  const field = cloneField(base);
  const rand = mulberry(seed);
  const pieces = makePieces();
  const spanX = Math.max(1, base.max[0] - base.min[0]);
  const spanZ = Math.max(1, base.max[1] - base.min[1]);
  const bodies: Body[] = pieces.map((pc, i) => {
    // spread across the build's footprint (a low-discrepancy walk), a little beyond it, high above its top
    const fx = (0.5 + i * 0.7548776662) % 1;
    const fz = (0.5 + i * 0.5698402910) % 1;
    const x = base.min[0] - 0.3 + fx * (spanX + 0.6) + (rand() - 0.5) * 0.3;
    const z = base.min[1] - 0.3 + fz * (spanZ + 0.6) + (rand() - 0.5) * 0.3;
    const y = base.top + 1.5 + rand() * 3;
    const axis = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    return {
      p: new THREE.Vector3(x, y, z),
      v: new THREE.Vector3((rand() - 0.5) * 2, 0, (rand() - 0.5) * 2),
      q: new THREE.Quaternion(rand() - 0.5, rand() - 0.5, rand() - 0.5, rand() - 0.5 + 0.01).normalize(),
      w: axis.multiplyScalar(3 + rand() * 6),
      contact: false,
      still: 0,
      tipped: 0,
      done: false,
    };
  });
  const supports = (x: number, z: number, r: number): number => supportsOf(field, x, z, r);
  const rest: Resting[] = pieces.map(() => ({ x: 0, y: 0, z: 0, on: "table", floor: 0 }));
  const frames: number[][] = pieces.map(() => []);
  const first: number[] = pieces.map(() => -1);
  const normal = new THREE.Vector3();
  const dq = new THREE.Quaternion();
  const flat = new THREE.Quaternion();
  const steps = Math.round(LIMIT_S / DT);
  const every = Math.round(FRAME_S / DT);
  let lastFrame = 0;
  let allDone = false;
  for (let s = 0; s <= steps && !allDone; s++) {
    const t = s * DT;
    allDone = true;
    pieces.forEach((pc, i) => {
      const b = bodies[i];
      if (b.done) return;
      allDone = false;
      if (t < pc.delay) return;
      if (first[i] < 0) first[i] = Math.round(t / FRAME_S);
      const half = (TH * pc.scale) / 2;
      // free flight: an exact parabola over the step, and a tumble about the spin axis
      const x0 = b.p.x;
      const z0 = b.p.z;
      b.p.x += b.v.x * DT;
      b.p.z += b.v.z * DT;
      b.p.y += b.v.y * DT - 0.5 * SCENE_G * DT * DT;
      b.v.y -= SCENE_G * DT;
      if (!b.contact) {
        const speed = b.w.length();
        if (speed > 1e-6) b.q.premultiply(dq.setFromAxisAngle(normal.copy(b.w).divideScalar(speed), speed * DT)).normalize();
      }
      let floor = supports(b.p.x, b.p.z, pc.radius) + half;
      if (floor - b.p.y > STEP) {
        // the way on is a wall higher than the tile can step up onto: it stays where it was and bounces back off it
        const gx = supports(b.p.x + CELL, b.p.z, pc.radius) - supports(b.p.x - CELL, b.p.z, pc.radius);
        const gz = supports(b.p.x, b.p.z + CELL, pc.radius) - supports(b.p.x, b.p.z - CELL, pc.radius);
        const gm = Math.hypot(gx, gz);
        const into = gm > 1e-6 ? normal.set(gx / gm, 0, gz / gm) : normal.set(b.v.x, 0, b.v.z).normalize();
        b.p.x = x0;
        b.p.z = z0;
        const vi = b.v.dot(into);
        if (vi > 0) b.v.addScaledVector(into, -(1 + RESTITUTION) * vi);
        floor = supports(b.p.x, b.p.z, pc.radius) + half;
      }
      b.contact = b.p.y <= floor + 1e-9;
      if (b.contact) {
        // the surface's tilt here, from how its support height changes over one cell; steeper than 50° counts as 50°
        const d = CELL;
        // (of the mean height under it, not the highest: a tile on a spire's tip slides off, it does not balance)
        const gx = (meanOf(field, b.p.x + d, b.p.z, pc.radius) - meanOf(field, b.p.x - d, b.p.z, pc.radius)) / (2 * d);
        const gz = (meanOf(field, b.p.x, b.p.z + d, pc.radius) - meanOf(field, b.p.x, b.p.z - d, pc.radius)) / (2 * d);
        const gm = Math.hypot(gx, gz);
        const k = gm > 1.2 ? 1.2 / gm : 1;
        normal.set(-gx * k, 1, -gz * k).normalize();
        b.p.y = floor;
        const vn = b.v.dot(normal);
        if (vn < 0) {
          if (-vn > BOUNCE_MIN) {
            // a bounce: leaves at e times the speed it arrived, loses a little along the surface, and tumbles
            b.v.addScaledVector(normal, -(1 + RESTITUTION) * vn);
            // friction's impulse is at most mu times the bounce's, and cannot turn the slide around
            const vt = b.v.clone().addScaledVector(normal, -b.v.dot(normal));
            const m = vt.length();
            if (m > 0) b.v.addScaledVector(vt, -Math.min(m, FRICTION * (1 + RESTITUTION) * -vn) / m);
            b.w.multiplyScalar(0.4).add(new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(Math.min(-vn, 12) * 0.9));
            b.contact = false;
          } else b.v.addScaledVector(normal, -vn);
        }
        if (b.contact) {
          // Coulomb friction along the surface (kinetic while sliding, holding when the slope is gentle enough)
          const mu = t > GRIP_AFTER ? 3 : FRICTION;
          const vt = b.v.clone().addScaledVector(normal, -b.v.dot(normal));
          const m = vt.length();
          if (m > 0) b.v.addScaledVector(vt, -(m - Math.max(0, m - mu * SCENE_G * normal.y * DT)) / m);
          // lie down: the face turns toward the surface, the spin dies
          const rate = 1 - Math.exp(-DT * 16);
          b.q.slerp(flatOf(b.q, flat), rate);
          b.w.multiplyScalar(Math.exp(-DT * 10));
          // a tile with most of its underside over a drop, or on a point, tips off toward the lower side
          // (one that cannot tip, hemmed in by walls, is let be after a third of a second)
          const perch = b.tipped < 40 ? perchOf(field, b.p.x, b.p.z, pc.radius, i) : null;
          if (perch) {
            b.tipped++;
            b.v.x += perch[0] * PERCH_A * DT;
            b.v.z += perch[1] * PERCH_A * DT;
          }
          const calm = !perch && b.v.length() < 0.05 && tiltOf(b.q) < 0.04;
          b.still = calm ? b.still + 1 : 0;
          if (b.still >= STILL_STEPS) {
            b.v.set(0, 0, 0);
            b.w.set(0, 0, 0);
            b.q.copy(flatOf(b.q, flat));
            b.done = true;
            const under = supports(b.p.x, b.p.z, pc.radius);
            const modelUnder = supportsOf(base, b.p.x, b.p.z, pc.radius);
            rest[i] = { x: b.p.x, y: b.p.y, z: b.p.z, floor: under, on: under <= 1e-6 ? "table" : under <= modelUnder + 1e-6 ? "build" : "tile" };
            stamp(field, b.p.x, b.p.z, pc.radius, b.p.y + half);
          }
        }
      }
    });
    if (s % every === 0) {
      lastFrame = s / every;
      pieces.forEach((_, i) => {
        const b = bodies[i];
        frames[i].push(b.p.x, b.p.y, b.p.z, b.q.x, b.q.y, b.q.z, b.q.w);
      });
    }
  }
  // the last pose of every piece, once more, so the playback ends exactly on it
  lastFrame += 1;
  pieces.forEach((_, i) => {
    const b = bodies[i];
    frames[i].push(b.p.x, b.p.y, b.p.z, b.q.x, b.q.y, b.q.z, b.q.w);
  });
  return { pieces, duration: lastFrame * FRAME_S, frames: lastFrame + 1, track: frames.map((f) => new Float32Array(f)), first, rest, settled: allDone };
}

/** The footprint's sample points: the middle and eight round the edge. */
function samples(x: number, z: number, r: number): [number, number][] {
  const out: [number, number][] = [[x, z]];
  for (let k = 0; k < 8; k++) out.push([x + Math.cos((k * Math.PI) / 4) * r, z + Math.sin((k * Math.PI) / 4) * r]);
  return out;
}

/** The mean surface height under a piece's footprint. */
export function meanOf(f: HeightField, x: number, z: number, r: number): number {
  return samples(x, z, r).reduce((s, [sx, sz]) => s + heightAt(f, sx, sz), 0) / 9;
}

/** null when the piece is held; else the unit direction it tips,
    toward where the surface is lowest (a fixed turn for the index when that is the same all round, as on a point). */
function perchOf(f: HeightField, x: number, z: number, r: number, i: number): [number, number] | null {
  const pts = samples(x, z, r);
  const hs = pts.map(([sx, sz]) => heightAt(f, sx, sz));
  const top = Math.max(...hs);
  // held when it lies on a broad top; perched only when it is on a point: its middle over the top and little else
  if (hs[0] < top - 0.12 || hs.filter((h) => h >= top - 0.12).length / 9 >= HELD) return null;
  let dx = 0;
  let dz = 0;
  pts.forEach(([sx, sz], k) => {
    dx += (sx - x) * (top - hs[k]);
    dz += (sz - z) * (top - hs[k]);
  });
  const m = Math.hypot(dx, dz);
  return m > 1e-6 ? [dx / m, dz / m] : [Math.cos(i * 2.4), Math.sin(i * 2.4)];
}

/** Reads the support height the way the sim does, for a field and a piece's radius (tests). */
export function supportsOf(f: HeightField, x: number, z: number, r: number): number {
  let h = heightAt(f, x, z);
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    h = Math.max(h, heightAt(f, x + Math.cos(a) * r, z + Math.sin(a) * r));
  }
  return h;
}
