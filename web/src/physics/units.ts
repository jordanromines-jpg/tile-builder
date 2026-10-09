/* The physics' units (4.2): lengths in squares (one small square's edge, 76.2 mm, as `engine/catalog.ts`), masses in
   grams, time in seconds. So a force of 1 N is 13 123 units (g · squares / s²) and a torque of 1 N·m is 172 229
   (g · squares² / s²). Everything here is for the build machine (Node): the app never simulates (D9). */

export const SQUARE_M = 0.0762;
/** gravity, in squares / s² */
export const G = 9.81 / SQUARE_M;
/** 1 N in force units, 1 N·m in torque units */
export const NEWTON = 1000 / SQUARE_M;
export const NEWTON_METRE = 1000 / (SQUARE_M * SQUARE_M);

/** a tile is about 6 mm thick */
export const THICK = 0.006 / SQUARE_M;
/** grams a square of tile area (a small square weighs about 10 g) */
export const AREAL_GRAMS = 10;

/** friction: plastic tile on plastic tile, and on a table (Rapier averages the two colliders' values) */
export const FRICTION_TILE = 0.3;
export const FRICTION_TABLE = 0.5;
export const RESTITUTION = 0.1;

/** the fixed step: 240 a second */
export const DT = 1 / 240;
