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

/** The camera position for looking at `target` from `distance` at the three-quarter angle, turned by `yaw`. */
export function viewFrom(target: THREE.Vector3, distance: number, yaw = 0): THREE.Vector3 {
  const az = AZIMUTH + yaw;
  return new THREE.Vector3(
    target.x + distance * Math.cos(ELEVATION) * Math.sin(az),
    target.y + distance * Math.sin(ELEVATION),
    target.z + distance * Math.cos(ELEVATION) * Math.cos(az),
  );
}

export function easeInOut(k: number): number {
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}
