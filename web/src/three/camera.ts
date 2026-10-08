/* The camera (sprint 2, change 3): a three-quarter view from a little above, so walls, depth and roofs read at a glance,
   framed to the model; each step leans the view toward the tiles being placed. */
import * as THREE from "three";

export const AZIMUTH = (35 * Math.PI) / 180;
export const ELEVATION = (26 * Math.PI) / 180;
export const FOV = 32;

/** How far back the camera stands to fit a model `size` across and `height` tall (its bounding sphere, with a margin)
    in a view of `aspect` (width over full height). */
export function fitDistance(size: number, aspect: number, height = size, clear = 1): number {
  const r = (Math.sqrt(2 * size * size + height * height) / 2) * 0.72 + 0.25;
  const t = Math.tan((FOV * Math.PI) / 360);
  // `clear`: the share of the view's height left clear of panels
  const vfov = 2 * Math.atan(t * clear);
  const hfov = 2 * Math.atan(t * aspect);
  const fov = Math.min(vfov, hfov);
  return (r / Math.sin(fov / 2)) * 1.02;
}

/** Every 30°: the turns a view may take when the child can turn it freely. */
export const ANY_YAW = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);

/** How far back the camera stands so every corner fits in the view (2.8.1): each corner, given relative to where the
    camera looks, is projected into the camera at the three-quarter angle turned by each of `yaws`, and checked against
    the view's width (`aspect`, width over full height) and the height left clear of panels (`clear`, a share of it).
    Width and height are checked apart, so a long, low build fills the width instead of a sphere round it. */
export function fitBox(corners: THREE.Vector3[], aspect: number, clear = 1, look: Look = THREE_QUARTER, yaws: number[] = [0]): number {
  // a little air round the edges
  return fitTight(corners, aspect, clear, look, yaws) * 1.06 + 0.3;
}

/** As `fitBox`, with no air: the distance at which the outermost point just touches the edge of the view. */
export function fitTight(corners: THREE.Vector3[], aspect: number, clear = 1, look: Look = THREE_QUARTER, yaws: number[] = [0]): number {
  const t = Math.tan((FOV * Math.PI) / 360);
  const tv = t * clear;
  const th = t * aspect;
  const up = new THREE.Vector3(0, 1, 0);
  let d = 0;
  for (const yaw of yaws) {
    const back = viewFrom(new THREE.Vector3(), 1, yaw, look);
    const right = new THREE.Vector3().crossVectors(up, back).normalize();
    const camUp = new THREE.Vector3().crossVectors(back, right);
    for (const c of corners) {
      const z = c.dot(back);
      d = Math.max(d, z + Math.abs(c.dot(right)) / th, z + Math.abs(c.dot(camUp)) / tv);
    }
  }
  return d;
}

/** The eight corners of the box from `min` to `max`. */
export function cornersOf(min: THREE.Vector3, max: THREE.Vector3): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) out.push(new THREE.Vector3(x, y, z));
  return out;
}

export interface Look {
  azimuth: number;
  elevation: number;
}

export const THREE_QUARTER: Look = { azimuth: AZIMUTH, elevation: ELEVATION };

/** 0–3 mosaics (2.5) are pictures lying on the table: seen from the front and well above, so they read the right way
    up, as a picture does. */
export const MOSAIC: Look = { azimuth: 0, elevation: (60 * Math.PI) / 180 };

export function lookOf(project: { age: string; flat?: boolean }): Look {
  return project.age === "t" && project.flat ? MOSAIC : THREE_QUARTER;
}

/** The camera position for looking at `target` from `distance` at the three-quarter angle (or `look`), turned by
    `yaw`. */
export function viewFrom(target: THREE.Vector3, distance: number, yaw = 0, look: Look = THREE_QUARTER): THREE.Vector3 {
  const az = look.azimuth + yaw;
  return new THREE.Vector3(
    target.x + distance * Math.cos(look.elevation) * Math.sin(az),
    target.y + distance * Math.sin(look.elevation),
    target.z + distance * Math.cos(look.elevation) * Math.cos(az),
  );
}

export function easeInOut(k: number): number {
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}
