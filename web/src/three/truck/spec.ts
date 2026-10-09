/* The Pip truck's numbers (plan 2026-10-09-truck-runs-autobuild, PR 4.0b). Pure data: no three.js, so the physics
   (4.0c) reads the very same numbers the picture is drawn from. One unit is one small square (76.2 mm), so a 1:64 truck
   about 1.0 long is 7.6 cm.

   The truck's frame: the origin is on the ground at the middle of the wheelbase, with the truck at rest; +z is forward
   (Pip's face), +y is up, and +x is the truck's left. Wheels are numbered front left, front right, rear left, rear
   right. Spin is positive when the wheel rolls forward, steer is positive to the left (radians), and compress runs
   from 0 (the spring fully out) to 1 (on the bump stop); the truck rests at REST_COMPRESS. */

export const TRUCK = {
  length: 1.0,
  bodyWidth: 0.62,
  /** between the middles of the two tyres on an axle */
  track: 0.78,
  wheelbase: 0.6,
  wheelRadius: 0.22,
  tyreWidth: 0.2,
  /** the underside of the chassis above the ground at rest */
  rideHeight: 0.3,
  /** total spring travel, from fully out to the bump stop */
  travel: 0.1,
  massGrams: 60,
  /** the centre of mass above the ground at rest */
  comHeight: 0.32,
} as const;

/** How far the springs are squashed at rest: a tenth of the travel (the physics tunes its own spring to match). */
export const REST_COMPRESS = 0.1;

export type V3 = [number, number, number];
export type Quat = [number, number, number, number];
export interface Wheel {
  spin: number;
  steer: number;
  compress: number;
}
export interface TruckPose {
  pos: V3;
  /** x, y, z, w */
  quat: Quat;
  wheels: [Wheel, Wheel, Wheel, Wheel];
}

/** A pose at rest on a flat table. */
export function restPose(): TruckPose {
  const w = (): Wheel => ({ spin: 0, steer: 0, compress: REST_COMPRESS });
  return { pos: [0, 0, 0], quat: [0, 0, 0, 1], wheels: [w(), w(), w(), w()] };
}

export const WHEEL_NAMES = ["front left", "front right", "rear left", "rear right"] as const;

/** Where each wheel's middle is across (left is +) and along (front is +) the truck. */
export const WHEEL_XZ: readonly (readonly [number, number])[] = [
  [TRUCK.track / 2, TRUCK.wheelbase / 2],
  [-TRUCK.track / 2, TRUCK.wheelbase / 2],
  [TRUCK.track / 2, -TRUCK.wheelbase / 2],
  [-TRUCK.track / 2, -TRUCK.wheelbase / 2],
];

/** A wheel's middle above the ground (the truck's frame origin) for a compress value: one radius up at REST_COMPRESS,
    a travel's worth of movement between 0 and 1. */
export function wheelHeight(compress: number): number {
  return TRUCK.wheelRadius + (compress - REST_COMPRESS) * TRUCK.travel;
}

/** The axles' middles along z: front, rear. */
export const AXLE_Z = [TRUCK.wheelbase / 2, -TRUCK.wheelbase / 2] as const;

export interface Mount {
  /** 0 front axle, 1 rear */
  axle: 0 | 1;
  /** +1 left, -1 right */
  side: 1 | -1;
}
/** A coil-over shock: its foot is on the axle (a point in the axle's own frame, which moves and tilts with it), its
    top on the chassis tower (a point in the truck's frame). Two a corner, leaning toward each other like a V. */
export interface ShockMount extends Mount {
  foot: [number, number, number];
  top: [number, number, number];
}
export const SHOCKS: ShockMount[] = ([0, 1] as const).flatMap((axle) =>
  ([1, -1] as const).flatMap((side) =>
    ([1, -1] as const).map((k): ShockMount => ({
      axle,
      side,
      foot: [side * 0.215, 0.05, k * 0.07],
      top: [side * 0.19, 0.84, AXLE_Z[axle] + k * 0.025],
    })),
  ),
);

/** A link bar (four to an axle: two low, two high): one end on the axle (axle frame), the other on the chassis (truck
    frame), reaching toward the middle of the truck. */
export interface LinkMount extends Mount {
  high: boolean;
  foot: [number, number, number];
  chassis: [number, number, number];
}
export const LINKS: LinkMount[] = ([0, 1] as const).flatMap((axle) =>
  ([1, -1] as const).flatMap((side) =>
    [false, true].map((high): LinkMount => {
      const toward = axle === 0 ? -1 : 1;
      return {
        axle,
        side,
        high,
        foot: high ? [side * 0.08, 0.075, 0] : [side * 0.15, -0.03, 0],
        chassis: high ? [side * 0.07, 0.46, AXLE_Z[axle] + toward * 0.24] : [side * 0.15, 0.345, AXLE_Z[axle] + toward * 0.27],
      };
    }),
  ),
);

/** The drive: the transfer case (truck frame) and where each shaft meets its axle's differential (axle frame). */
export const DRIVE = {
  transfer: [0, 0.41, 0] as V3,
  diff: [0, 0.07, 0] as V3,
};
