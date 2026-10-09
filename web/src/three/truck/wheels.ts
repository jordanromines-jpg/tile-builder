/* The wheels (PR 4.0b): giant tyres in dark purple, a lathe of a rounded profile with chevron lugs in two offset rows,
   and dish rims in yellow with a hub and bolts. A wheel is built once, in its own frame (the axle along +x, pointing
   outward for a left wheel); the rig places the four. */
import * as THREE from "three";
import { merge, paint, put, quatY, type Palette } from "./geo";
import { TRUCK } from "./spec";

const HALF = TRUCK.tyreWidth / 2;
const CARCASS = TRUCK.wheelRadius - 0.03;
const LUGS = 22;

/** Revolves a profile of (radius, along-the-axle) points about the wheel's axle (+x). */
function lathe(profile: [number, number][], segments: number): THREE.BufferGeometry {
  const g = new THREE.LatheGeometry(profile.map(([r, a]) => new THREE.Vector2(r, a)), segments);
  return g.rotateZ(-Math.PI / 2);
}

export function buildTyre(pal: Palette, quality = 1): THREE.BufferGeometry {
  const segs = Math.round(40 * quality);
  const bore = 0.115;
  const profile: [number, number][] = [
    [bore, -HALF],
    [0.165, -HALF],
    [CARCASS - 0.012, -HALF + 0.014],
    [CARCASS, -HALF + 0.045],
    [CARCASS, HALF - 0.045],
    [CARCASS - 0.012, HALF - 0.014],
    [0.165, HALF],
    [bore, HALF],
    [bore, -HALF],
  ];
  const parts = [paint(lathe(profile, segs), pal.tyre)];
  // lugs: a chevron of bars, one row on each half of the tread, the two rows offset by half a pitch
  const lugColour = pal.tyre.clone().offsetHSL(0, 0, 0.045);
  const lug = new THREE.BoxGeometry(0.1, 0.034, 0.034);
  for (let row = 0; row < 2; row++) {
    const side = row === 0 ? 1 : -1;
    for (let i = 0; i < LUGS; i++) {
      const a = ((i + row * 0.5) / LUGS) * Math.PI * 2;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(a, 0, 0)).multiply(quatY(side * 0.62));
      // the lug stands on the tread: radial position, then the angle of the chevron
      const r = TRUCK.wheelRadius - 0.017;
      const p: [number, number, number] = [side * 0.052, Math.cos(a) * r, Math.sin(a) * r];
      parts.push(paint(put(lug.clone(), p, q), lugColour));
    }
  }
  return merge(parts);
}

export function buildRim(pal: Palette): THREE.BufferGeometry {
  // the dish seen from outside: the hub, a dip, then the lip that meets the tyre's bead
  const dish: [number, number][] = [[0.158, 0.092], [0.158, 0.108], [0.13, 0.108], [0.115, 0.09], [0.06, 0.09], [0.05, 0.112], [0, 0.112]];
  const parts = [paint(lathe(dish, 24), pal.yellow)];
  // a cap on the hub and eight bolts round it
  parts.push(paint(put(new THREE.CylinderGeometry(0.03, 0.036, 0.022, 10).rotateZ(-Math.PI / 2), [0.118, 0, 0]), pal.red));
  const bolt = new THREE.CylinderGeometry(0.011, 0.011, 0.02, 6).rotateZ(-Math.PI / 2);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    parts.push(paint(put(bolt.clone(), [0.098, Math.cos(a) * 0.082, Math.sin(a) * 0.082]), pal.orange));
  }
  return merge(parts);
}
