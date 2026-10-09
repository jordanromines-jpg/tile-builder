/* The child's hand on the Pip truck (4.0c): a toy truck is pushed, not driven. On the ground the hand carries it along
   its route at a leg's speed, turns it, keeps it from sliding and rolling, and slows it at the end; the springs, the
   bumps, the jumps and whatever it hits are the physics' own (run.ts). */
import type { V3 } from "../engine/geometry";
import type { Leg } from "../engine/route";
import { REST_COMPRESS, TRUCK } from "../three/truck/spec";
import { at } from "./scene";
import { DT, G } from "./units";
import { CHASSIS_Y, type makeTruck, REST_LENGTH, rotate, standing } from "./vehicle";

type Truck = ReturnType<typeof makeTruck>;
/** the most the front wheels turn, radians */
export const MAX_STEER = 0.55;

/** The up normal of a surface (a slope's, or straight up). */
export function normalOf(S: Leg["surface"]): V3 {
  if (S?.kind !== "slope") return [0, 1, 0];
  const run = Math.hypot(S.to[0] - S.from[0], S.to[2] - S.from[2]) || 1;
  const k = Math.atan2(S.to[1] - S.from[1], run);
  // the slope rises along (to - from) on the ground; its normal leans back against that
  const dx = (S.to[0] - S.from[0]) / run;
  const dz = (S.to[2] - S.from[2]) / run;
  return [-dx * Math.sin(k), Math.cos(k), -dz * Math.sin(k)];
}

/** The most a step may change the truck's speed (squares a second) and spin (radians a second). */
const MOST_DV = 1.5;
const MOST_DW = 12;

export function capChange(truck: Truck, before: { v: { x: number; y: number; z: number }; w: { x: number; y: number; z: number } }) {
  const cap = (now: { x: number; y: number; z: number }, was: { x: number; y: number; z: number }, most: number) => {
    const d = [now.x - was.x, now.y - was.y, now.z - was.z];
    const k = Math.min(1, most / (Math.hypot(d[0], d[1], d[2]) || 1));
    return { x: was.x + d[0] * k, y: was.y + d[1] * k, z: was.z + d[2] * k };
  };
  truck.body.setLinvel(cap(truck.body.linvel(), before.v, MOST_DV), true);
  truck.body.setAngvel(cap(truck.body.angvel(), before.w, MOST_DW), true);
}

export function norm2(v: V3): [number, number] {
  const l = Math.hypot(v[0], v[2]) || 1;
  return [v[0] / l, v[2] / l];
}

export function groundPoint(truck: Truck): V3 {
  const p = truck.body.translation();
  const q = truck.body.rotation();
  return at({ t: [p.x, p.y, p.z], q: [q.x, q.y, q.z, q.w] }, [0, -CHASSIS_Y, 0]);
}

export function steerToward(truck: Truck, target: [number, number]): number {
  const p = truck.body.translation();
  const q = truck.body.rotation();
  // the truck's forward on the ground (+z in its own frame)
  const fx = 2 * (q.x * q.z + q.w * q.y);
  const fz = 1 - 2 * (q.x * q.x + q.y * q.y);
  const dx = target[0] - p.x;
  const dz = target[1] - p.z;
  const err = Math.atan2(fx * dz - fz * dx, fx * dx + fz * dz);
  // err < 0: the target is to the truck's left (left is +x in its own frame), and left is positive steer
  return Math.max(-MAX_STEER, Math.min(MAX_STEER, -1.4 * err));
}

/** The truck's forward direction in the world (+z in its own frame). */
export function forwardOf(truck: Truck): V3 {
  const q = truck.body.rotation();
  return [2 * (q.x * q.z + q.w * q.y), 2 * (q.y * q.z - q.w * q.x), 1 - 2 * (q.x * q.x + q.y * q.y)];
}

/** The child's hand on the truck (a toy truck is pushed, not driven): on the ground it carries the truck along at the
    leg's speed, keeps it from sliding sideways and turns it toward where it's going; the springs, the bumps, the slopes
    and whatever it hits are the physics' own. */
export function drive(truck: Truck, speed: number, steer: number, target?: [number, number]) {
  truck.vehicle.setWheelSteering(0, steer);
  truck.vehicle.setWheelSteering(1, steer);
  truck.vehicle.setWheelSteering(2, -0.3 * steer);
  truck.vehicle.setWheelSteering(3, -0.3 * steer);
  const held = !!speed && !!target && [0, 1, 2, 3].some((w) => truck.vehicle.wheelSuspensionForce(w) > 0);
  truck.vehicle.grip(!held);
  if (!held) return;
  hand(truck, speed, HAND.take);
  // turn toward the target about the truck's own up, and steady its roll
  const q = truck.body.rotation();
  const up = rotate(q, [0, 1, 0]);
  const f = forwardOf(truck);
  const p = truck.body.translation();
  const dx = target[0] - p.x;
  const dz = target[1] - p.z;
  const err = Math.atan2(f[0] * dz - f[2] * dx, f[0] * dx + f[2] * dz);
  const w = truck.body.angvel();
  const yaw = Math.max(-HAND.turn, Math.min(HAND.turn, -HAND.yaw * err));
  const onUp = w.x * up[0] + w.y * up[1] + w.z * up[2];
  const onF = w.x * f[0] + w.y * f[1] + w.z * f[2];
  const k = yaw - onUp;
  const r = -HAND.roll * onF;
  truck.body.setAngvel({ x: w.x + k * up[0] + r * f[0], y: w.y + k * up[1] + r * f[1], z: w.z + k * up[2] + r * f[2] }, true);
}

/** The hand's grip: how much of the speed error it takes away each step, the turn rate per radian of error (and its
    most, radians a second), how much of the roll rate it holds back each step, and of the pitch and roll while it
    crushes or smashes. */
export const HAND = { take: 0.25, yaw: 4, turn: 3, roll: 0.15, level: 0.15 };

/** Brings the truck's speed along itself toward `speed` (taking `take` of the difference), and its sideways slide to
    nothing; its speed along its own up (the springs') is left alone. */
export function hand(truck: Truck, speed: number, take: number) {
  const q = truck.body.rotation();
  const f = forwardOf(truck);
  const side = rotate(q, [1, 0, 0]);
  const v = truck.body.linvel();
  const vf = v.x * f[0] + v.y * f[1] + v.z * f[2];
  const vs = v.x * side[0] + v.y * side[1] + v.z * side[2];
  // (and it holds the truck against the slope it's on: gravity along its nose; nose down, only as much as the truck is
  // really rolling, or at the bottom of a dip it would hold the truck back from climbing out)
  const roll = f[1] < 0 && speed > 0 ? Math.max(0, Math.min(1, vf / speed)) : 1;
  const a = take * (speed - vf) + G * f[1] * DT * roll;
  const b = -take * vs;
  truck.body.setLinvel({ x: v.x + a * f[0] + b * side[0], y: v.y + a * f[1] + b * side[1], z: v.z + a * f[2] + b * side[2] }, true);
}

export function brake(truck: Truck) {
  // a gentle roll-out to a stop
  truck.vehicle.grip(true);
  if ([0, 1, 2, 3].some((w) => truck.vehicle.wheelSuspensionForce(w) > 0)) hand(truck, 0, 0.02);
}

export function place(truck: Truck, at3: V3, heading: [number, number], pitch = 0) {
  const q = standing(heading, pitch);
  const up = rotate(q, [0, CHASSIS_Y, 0]);
  truck.body.setTranslation({ x: at3[0] + up[0], y: at3[1] + up[1], z: at3[2] + up[2] }, true);
  truck.body.setRotation(q, true);
  truck.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  truck.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
}

export function compressOf(truck: Truck, w: number): number {
  const l = truck.vehicle.wheelSuspensionLength(w);
  return Math.max(0, Math.min(1, REST_COMPRESS + (REST_LENGTH - l) / TRUCK.travel));
}
