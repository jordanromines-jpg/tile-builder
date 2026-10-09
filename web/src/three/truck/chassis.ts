/* The open tube chassis and what hangs on it (PR 4.0b): green frame rails with a shock tower over each axle, solid
   blue axles with a diff housing, two coil-overs a corner (yellow springs round blue dampers), four link bars an axle,
   a driveshaft. The moving parts are built once, in their own frames, and the rig (rig.ts) places them every frame. */
import * as THREE from "three";
import { ball, helix, merge, paint, put, quatX, rod, tube, type Palette } from "./geo";
import { AXLE_Z, LINKS, SHOCKS, TRUCK, type V3 } from "./spec";

const R = 0.026;
const RAIL_Y = 0.335;
/** the tube frame the body sits on, above the tyres */
export const TUB_Y = 0.5;

/** The frame: two rails kicked up at the ends, cross members, a shock tower over each axle, the pillars the high link
    bars hang from, the transfer case, and bump stops. Static in the truck's frame. */
export function buildChassis(pal: Palette): THREE.BufferGeometry {
  const g = pal.green;
  const parts: THREE.BufferGeometry[] = [];
  const add = (list: THREE.BufferGeometry[], c: THREE.Color) => parts.push(...list.map((p) => paint(p, c)));
  for (const s of [1, -1]) {
    add(tube([[s * 0.16, 0.45, -0.47], [s * 0.16, RAIL_Y, -0.39], [s * 0.16, RAIL_Y, 0.39], [s * 0.16, 0.45, 0.47]], R, 6), g);
    for (const a of AXLE_Z) {
      // a tower: two legs from the rail up to the shock tops
      for (const k of [1, -1]) add(tube([[s * 0.16, RAIL_Y, a + k * 0.15], [s * 0.19, SHOCKS[0].top[1], a]], R * 0.85, 6), g);
    }
  }
  for (const z of [-0.39, -0.06, 0.06, 0.39]) add(tube([[-0.16, RAIL_Y, z], [0.16, RAIL_Y, z]], R * 0.9, 6), g);
  for (const a of AXLE_Z) add(tube([[-0.19, SHOCKS[0].top[1], a], [0.19, SHOCKS[0].top[1], a]], R * 0.9, 6), g);
  // the body's tube frame: a loop under the face and the bed, held up off the rails by four posts
  const loop: V3[] = [[-0.255, TUB_Y, 0.4], [0.255, TUB_Y, 0.4], [0.255, TUB_Y, -0.43], [-0.255, TUB_Y, -0.43], [-0.255, TUB_Y, 0.4]];
  add(tube(loop, R * 0.8, 6), g);
  add(tube([[-0.255, TUB_Y, 0], [0.255, TUB_Y, 0]], R * 0.8, 6), g);
  for (const s of [1, -1]) for (const z of [0.4, -0.43]) add(tube([[s * 0.16, RAIL_Y, z * 0.92], [s * 0.255, TUB_Y, z]], R * 0.8, 6), g);
  // pillars for the high links, tied across
  for (const l of LINKS.filter((l) => l.high && l.side === 1)) {
    for (const s of [1, -1]) add(tube([[s * 0.16, RAIL_Y, l.chassis[2]], [s * l.chassis[0] * 1, l.chassis[1], l.chassis[2]]], R * 0.85, 6), g);
    add(tube([[-l.chassis[0], l.chassis[1], l.chassis[2]], [l.chassis[0], l.chassis[1], l.chassis[2]]], R * 0.85, 6), g);
  }
  // the link bars' chassis ends: a ball each
  for (const l of LINKS) parts.push(paint(ball(l.chassis, 0.022, 6, 4), pal.purple));
  // transfer case, with the driveshafts' yokes
  parts.push(paint(put(new THREE.BoxGeometry(0.12, 0.08, 0.12), [0, 0.41, 0]), pal.blue));
  for (const s of [1, -1]) parts.push(paint(rod([s * 0.06, RAIL_Y, 0], [s * 0.05, 0.4, 0], R * 0.8, 5), pal.green));
  // bump stops above each wheel, hanging from the rail
  for (const s of [1, -1]) for (const a of AXLE_Z) parts.push(paint(put(new THREE.CylinderGeometry(0.03, 0.025, 0.045, 8), [s * 0.16, TRUCK.rideHeight - 0.02, a]), pal.purple));
  return merge(parts);
}

/** An axle, in its own frame (the axle's middle at the origin, the diff facing +z): the tube, the diff housing and its
    cover, hubs, and a ball for every mount that reaches it. */
export function buildAxle(pal: Palette): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const half = TRUCK.track / 2 - TRUCK.tyreWidth / 2 + 0.005;
  parts.push(paint(put(new THREE.CylinderGeometry(0.03, 0.03, half * 2, 8), [0, 0, 0], new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)), pal.blue));
  const pumpkin = new THREE.SphereGeometry(0.075, 10, 6);
  parts.push(paint(put(pumpkin, [0, 0, 0], undefined, [1.15, 0.9, 1]), pal.blue));
  parts.push(paint(put(new THREE.CylinderGeometry(0.052, 0.052, 0.02, 10), [0, 0, 0.068], quatX(Math.PI / 2)), pal.yellow));
  for (const s of [1, -1]) {
    // a hub housing at each end of the tube, and the flange the tyre sits against
    parts.push(paint(put(new THREE.CylinderGeometry(0.058, 0.058, 0.07, 10), [s * (half - 0.015), 0, 0], new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)), pal.blue));
  }
  for (const m of SHOCKS.filter((m) => m.axle === 0)) parts.push(paint(ball(m.foot, 0.024, 6, 4), pal.purple));
  for (const l of LINKS.filter((l) => l.axle === 0)) parts.push(paint(ball(l.foot, 0.022, 6, 4), pal.purple));
  return merge(parts);
}

/** A coil-over shock along +y from its foot (y = 0) to its top (y = `length`): the damper and its rod, a spring round
    them, and the end caps. Stretched a little by the rig as the wheel moves. */
export function buildShock(pal: Palette, length: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const cyl = (r: number, y0: number, y1: number, sides = 8) => put(new THREE.CylinderGeometry(r, r, y1 - y0, sides), [0, (y0 + y1) / 2, 0]);
  parts.push(paint(cyl(0.02, 0.03, length * 0.56), pal.blue));
  parts.push(paint(cyl(0.011, length * 0.5, length - 0.02, 6), pal.orange));
  parts.push(paint(cyl(0.034, 0, 0.03), pal.purple), paint(cyl(0.03, length - 0.03, length), pal.purple));
  parts.push(paint(cyl(0.04, 0.13, 0.142, 10), pal.purple), paint(cyl(0.04, length - 0.142, length - 0.13, 10), pal.purple));
  parts.push(paint(put(helix(0.04, 0.013, 6, length - 0.28, 7, 4), [0, 0.142, 0]), pal.yellow));
  return merge(parts);
}

/** A link bar along +y from 0 to 1 (the rig scales it to length). */
export function buildLinkBar(pal: Palette): THREE.BufferGeometry {
  return paint(put(new THREE.CylinderGeometry(0.013, 0.013, 1, 6, 1, true), [0, 0.5, 0]), pal.red);
}

/** A driveshaft along +z from 0 to 1 (scaled to length): an eight-sided bar in alternating colours so the spin shows,
    with a yoke at each end. */
export function buildDriveshaft(pal: Palette): THREE.BufferGeometry {
  const body = new THREE.CylinderGeometry(0.022, 0.022, 1, 8, 1, true).toNonIndexed();
  // alternate the colour of the eight faces
  const n = body.getAttribute("position").count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const face = Math.floor(i / 6);
    const c = face % 2 ? pal.yellow : pal.red;
    col.set([c.r, c.g, c.b], i * 3);
  }
  body.setAttribute("color", new THREE.BufferAttribute(col, 3));
  for (const k of Object.keys(body.attributes)) if (!["position", "normal", "color"].includes(k)) body.deleteAttribute(k);
  body.rotateX(Math.PI / 2).translate(0, 0, 0.5);
  return body;
}

/** The shock's length at rest, foot to top (every shock is the same). */
export const SHOCK_LENGTH = Math.hypot(
  SHOCKS[0].top[0] - SHOCKS[0].foot[0],
  SHOCKS[0].top[1] - (SHOCKS[0].foot[1] + TRUCK.wheelRadius),
  SHOCKS[0].top[2] - (SHOCKS[0].foot[2] + AXLE_Z[SHOCKS[0].axle]),
);
