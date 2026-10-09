import { describe, expect, it } from "vitest";
import { boxHits, poseOf, prepare } from "./box";
import { TRUCK_HEIGHT, TRUCK_LENGTH, TRUCK_RIDE, TRUCK_WIDTH } from "./truck-size";
import type { V3 } from "./geometry";

// a 4 × 4 square lying on the table, and a wall 2 high standing across z = -3
const floor = prepare([[-2, 0, 2], [2, 0, 2], [2, 0, -2], [-2, 0, -2]] as V3[], [0, 1, 0]);
const wall = prepare([[-2, 0, -3], [2, 0, -3], [2, 2, -3], [-2, 2, -3]] as V3[], [0, 0, 1]);

describe("the truck as a box (4.0a)", () => {
  it("is 1.0 long, 0.67 wide and 0.62 high, and rides half its height up", () => {
    expect([TRUCK_LENGTH, TRUCK_WIDTH, TRUCK_HEIGHT]).toEqual([1.0, 0.67, 0.62]);
    expect(TRUCK_RIDE).toBeCloseTo(0.31);
  });

  it("rolling on a floor touches nothing; a box sunk into it does", () => {
    expect(boxHits(poseOf([0, TRUCK_RIDE, 0], [0, -1], 0), floor)).toBe(false);
    expect(boxHits(poseOf([0, TRUCK_RIDE - 0.1, 0], [0, -1], 0), floor)).toBe(true);
    // nose down 30° with the middle at riding height: the tail is up and the nose digs in
    expect(boxHits(poseOf([0, TRUCK_RIDE, 0], [0, -1], -Math.PI / 6), floor)).toBe(true);
  });

  it("a wall is hit when the truck reaches it, and not before; over its top, no", () => {
    // heading away from the child (-z): the nose is half a truck ahead of the middle
    expect(boxHits(poseOf([0, TRUCK_RIDE, -2.4], [0, -1], 0), wall)).toBe(false);
    expect(boxHits(poseOf([0, TRUCK_RIDE, -2.6], [0, -1], 0), wall)).toBe(true);
    expect(boxHits(poseOf([0, 2 + TRUCK_RIDE + 0.1, -3], [0, -1], 0), wall)).toBe(false);
    // beside it: a wall one side of the truck's path, 0.4 clear
    expect(boxHits(poseOf([2.6, TRUCK_RIDE, -3], [0, -1], 0), wall)).toBe(false);
  });

  it("turns with its heading: crosswise to the wall, the truck is as wide as it is long", () => {
    const side = poseOf([0, TRUCK_RIDE, -2.55], [1, 0], 0);
    expect(boxHits(side, wall)).toBe(false);
    expect(boxHits(poseOf([0, TRUCK_RIDE, -2.7], [1, 0], 0), wall)).toBe(true);
  });
});
