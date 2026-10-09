/* The truck's size and the numbers a run is proved with (4.0a), in one place. Units are square edges (76.2 mm) and
   seconds. The Pip truck (4.0b, `three/truck/spec.ts`) and the physics (4.0c) import these. The truck is a box:
   it is the 1:64 monster truck, 7–8 cm long and 7.5 cm wide across its tyres. */

/** Gravity in squares per second squared (9.81 m/s² over 76.2 mm). */
export const GRAVITY = 128.7;

/** The box the route checker flies and drives: nose to tail, side to side, and tyre-tops to ground. */
export const TRUCK_LENGTH = 1.0;
/** (0.98: the Pip truck across its tyres, three/truck/spec.ts track + tyreWidth) */
export const TRUCK_WIDTH = 0.98;
export const TRUCK_HEIGHT = 0.62;

/** How far the middle of the box is above the surface it rolls on. */
export const TRUCK_RIDE = TRUCK_HEIGHT / 2;

/** Ramps are 30° (track-kit.ts). */
export const SLOPE_ANGLE = Math.PI / 6;

/** R13b: two legs join when one ends within this of where the next begins. */
export const JOIN_TOLERANCE = 0.5;
/** R13c: a landing is at least this far inside the surface it lands on. */
export const LANDING_MARGIN = 0.3;
/** R13c: the arc is sampled this often (seconds). */
export const ARC_STEP = 0.02;
/** R13c/d: a tile closer to the truck than this counts as touched (the box is shrunk by it). */
export const CLEARANCE = 0.02;
/** R13c: over this many seconds before it lands, the truck's nose comes level with the surface it lands on. */
export const LANDING_SETTLE = 0.15;
/** R13d: a drive is sampled this often along its path (squares). */
export const DRIVE_STEP = 0.1;
/** The truck keeps this far from the edges of a lane or ramp (half its width, a little more). */
export const EDGE_KEEP = 0.4;
/** The fastest a toy truck is allowed to leave a lip, in squares per second (R13c): about 3 m/s at 1:64. */
export const MAX_LAUNCH_SPEED = 40;
