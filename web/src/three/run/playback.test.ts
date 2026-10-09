import { describe, expect, it } from "vitest";
import type { Recording } from "../../engine/run-format";
import { REST_COMPRESS, TRUCK } from "../truck/spec";
import { distances, player, rateAt, SLOW, slerp } from "./playback";

const straight = (): Recording => ({
  fps: 10,
  // facing +z, one square a second
  truck: Array.from({ length: 11 }, (_, f) => ({ pos: [0, 0, f / 10], quat: [0, 0, 0, 1], steer: 0, squash: [REST_COMPRESS, REST_COMPRESS, REST_COMPRESS, REST_COMPRESS] })),
  tiles: new Map([[3, { first: 4, t: [[2, 0.5, 0], [2, 0.3, 0], [2, 0.04, 0]], q: [[0, 0, 0, 1], [0, 0, 0, 1], [0.7071, 0, 0, 0.7071]] }]]),
  events: [{ frame: 5, kind: "break", tile: 3 }],
});

describe("playing a run", () => {
  it("puts the truck between its frames, and turns its wheels by the ground it covers", () => {
    const p = player(straight());
    expect(p.length).toBeCloseTo(1);
    const mid = p.truck(0.55);
    expect(mid.pos[2]).toBeCloseTo(0.55);
    expect(mid.wheels[0].spin).toBeCloseTo(0.55 / TRUCK.wheelRadius);
    expect(p.truck(5).pos[2]).toBeCloseTo(1);
    expect(distances(straight()).at(-1)).toBeCloseTo(1);
  });

  it("leaves a tile as built until it moves, then follows it, then keeps it where it came to rest", () => {
    const p = player(straight());
    expect(p.tile(3, 0.3)).toBeNull();
    expect(p.tile(3, 0.45)!.p[1]).toBeCloseTo(0.4);
    expect(p.tile(3, 0.9)!.p[1]).toBeCloseTo(0.04);
    expect(p.tile(9, 0.5)).toBeNull();
    expect(p.start(3)).toEqual([2, 0.5, 0]);
    expect(p.events).toEqual([{ t: 0.5, kind: "break", hit: undefined }]);
  });

  it("turns along the shortest arc, whichever sign a quaternion was written with", () => {
    const a: [number, number, number, number] = [0, 0, 0, 1];
    const b: [number, number, number, number] = [0, -0.7071, 0, -0.7071];
    const h = slerp(a, b, 0.5);
    // halfway to +90° about y (−q is the same turn as q)
    expect(Math.abs(h[1])).toBeCloseTo(Math.sin(Math.PI / 8), 3);
  });

  it("plays at speed between the action, slower around it, and ends at the run's end", () => {
    expect(rateAt(0.5, [0.5])).toBeCloseTo(SLOW);
    expect(rateAt(3, [0.5])).toBe(1);
    const p = player(straight());
    // one crash at 0.5 s: the second it lasts takes longer to play
    expect(p.playLength).toBeGreaterThan(1.2);
    expect(p.at(0)).toBe(0);
    expect(p.at(p.playLength + 1)).toBe(p.length);
    let last = 0;
    for (let s = 0; s <= p.playLength; s += 0.01) {
      const t = p.at(s);
      expect(t).toBeGreaterThanOrEqual(last - 1e-9);
      last = t;
    }
  });
});
