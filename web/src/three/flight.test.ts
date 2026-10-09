import { describe, expect, it } from "vitest";
import { ARRIVE, ARRIVE_S, browseProgress, DROP_S, flightAt, LAND_K, LEAVE_S, makeFlight, SCENE_G, SNAP_GAP } from "./anim";

describe("the tiles' flight (4.2d)", () => {
  const from = [1.2, 1.9, 1.1];
  const to = [0.5, 0.4, 0.2];
  const gap = (out: number[]) => Math.hypot(out[0] - to[0], out[1] - to[1], out[2] - to[2]);

  it("comes down 3 mm short of its point at FLIGHT_S (4.2b), and the magnets hold it exactly at the end", () => {
    const f = makeFlight(from, to);
    const out = [0, 0, 0];
    expect(flightAt(f, 0, out)).toBe(0);
    expect(out).toEqual(from);
    expect(flightAt(f, LAND_K, out)).toBeCloseTo(1, 9);
    expect(gap(out)).toBeCloseTo(SNAP_GAP, 4);
    flightAt(f, 1, out);
    expect(out).toEqual(to);
  });

  it("the magnets pull it the last 3 mm in a moment, one small overshoot past its place (4.2b)", () => {
    const f = makeFlight(from, to);
    const out = [0, 0, 0];
    // how far past its place, along the way it came (negative: still short)
    const past = (k: number) => {
      flightAt(f, k, out);
      return (out[0] - to[0]) * f.dir[0] + (out[1] - to[1]) * f.dir[1] + (out[2] - to[2]) * f.dir[2];
    };
    let touch = -1;
    let most = 0;
    for (let k = LAND_K; k < 1; k += 0.0005) {
      const x = past(k);
      if (touch < 0 && x >= 0) touch = (k - LAND_K) * DROP_S;
      most = Math.max(most, x);
    }
    expect(touch).toBeGreaterThan(0);
    expect(touch).toBeLessThan(0.03);
    expect(most).toBeGreaterThan(0);
    expect(most).toBeLessThan(SNAP_GAP);
  });

  it("is a ballistic arc under the scene's gravity, never under its landing point", () => {
    const f = makeFlight(from, to);
    const out = [0, 0, 0];
    for (let k = 0; k <= LAND_K; k += 0.01) {
      flightAt(f, k, out);
      expect(out[1]).toBeGreaterThanOrEqual(to[1] - 1e-9);
    }
    expect(f.arc.g).toEqual([0, -SCENE_G, 0]);
  });

  it("the catch overshoots a little along the way it came and is back at rest by the end", () => {
    const f = makeFlight(from, to);
    const out = [0, 0, 0];
    let far = 0;
    for (let k = LAND_K; k < 1; k += 0.005) {
      flightAt(f, k, out);
      far = Math.max(far, gap(out));
    }
    expect(far).toBeGreaterThan(0.005);
    expect(far).toBeLessThan(0.1);
    flightAt(f, 0.99, out);
    expect(gap(out)).toBeLessThan(0.02);
  });
});

describe("All steps' drops and lifts (4.2d)", () => {
  it("a tile arrives in under 180 ms with one bounce, from 0.4 square up", () => {
    expect(ARRIVE_S).toBeLessThan(0.18);
    expect(ARRIVE.hitTimes).toHaveLength(2);
    expect(ARRIVE.at(0).y).toBeCloseTo(0.4, 9);
    expect(ARRIVE.at(ARRIVE_S).y).toBe(0);
  });

  it("tiles up to `shown` drop in together, the rest lift away in LEAVE_S, then nothing moves", () => {
    const p = [0, 0, 1, 1];
    expect(browseProgress(p, 2, 0.05, ARRIVE_S, LEAVE_S)).toBe(true);
    expect(p[2]).toBeCloseTo(1 - 0.05 / LEAVE_S, 9);
    for (let i = 0; i < 20; i++) browseProgress(p, 2, 0.05, ARRIVE_S, LEAVE_S);
    expect(p).toEqual([1, 1, 0, 0]);
    expect(browseProgress(p, 2, 0.05, ARRIVE_S, LEAVE_S)).toBe(false);
  });
});
