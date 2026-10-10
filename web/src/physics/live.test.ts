// @vitest-environment node
/* Make your own's live physics (5.0a): tiles put on one at a time stand or fall as real tiles do. */
import { beforeAll, describe, expect, it } from "vitest";
import { DEFAULT_LEG } from "../engine/catalog";
import type { Placed } from "../engine/types";
import { HOLD_S, LiveScene } from "./live";
import { rapier, type Rapier } from "./rapier";
import { DT } from "./units";

let R: Rapier;
beforeAll(async () => {
  R = await rapier();
});

const Q = Math.PI / 2;
const sq = (pos: [number, number, number], rot: [number, number]): Placed => ({ shape: "square", colour: "red", pos, rot });
/** a ring of four squares standing on the table over x..x+1, z..z+1 (as Builder.ring) */
const ring = (x: number, y: number, z: number): Placed[] => [sq([x, y, z + 1], [0, 0]), sq([x + 1, y, z], [0, -Q]), sq([x, y, z], [0, 0]), sq([x, y, z], [0, -Q])];
const seconds = (s: number) => Math.round(s / DT);
const height = (scene: LiveScene, id: number) => {
  const p = scene.poses();
  for (let k = 0; k < p.length; k += 8) if (p[k] === id) return p[k + 2];
  return NaN;
};

describe("live physics", () => {
  it("a square stood on the table stays standing, and a ring of four stands", () => {
    const s = new LiveScene(R, DEFAULT_LEG);
    const ids = ring(0, 0, 0).map((t) => s.add(t));
    s.step(seconds(HOLD_S + 2));
    for (const id of ids) expect(height(s, id)).toBeCloseTo(0.5, 1);
    expect(s.hinges(ids[0])).toBeGreaterThan(0);
    s.free();
  });

  it("the hand holds a new tile, then lets go: a square held out flat by one edge droops once let go (the magnets' friction holds it part way, as R14's C8)", () => {
    const s = new LiveScene(R, DEFAULT_LEG);
    ring(0, 0, 0).forEach((t) => s.add(t));
    s.step(seconds(1));
    const out = s.add(sq([0, 1, 2], [-Q, 0]));
    s.step(seconds(HOLD_S / 2));
    expect(s.isHeld(out)).toBe(true);
    expect(height(s, out)).toBeCloseTo(1, 1);
    s.step(seconds(HOLD_S + 2));
    expect(s.isHeld(out)).toBe(false);
    expect(height(s, out)).toBeLessThan(0.97);
    s.free();
  });

  it("a tile with nothing holding it falls to the table once the hand lets go", () => {
    const s = new LiveScene(R, DEFAULT_LEG);
    const t = s.add(sq([0, 3, 0], [0, 0]));
    s.step(seconds(HOLD_S + 1.5));
    expect(height(s, t)).toBeLessThan(0.6);
    s.free();
  });

  it("200 tiles step faster than real time (the worker's budget: a frame's four steps well under 16 ms)", () => {
    const s = new LiveScene(R, DEFAULT_LEG);
    for (let k = 0; k < 50; k++) ring(2 * (k % 10), 0, 2 * Math.floor(k / 10)).forEach((t) => s.add(t));
    s.step(seconds(HOLD_S + 0.2));
    const t0 = performance.now();
    s.step(4 * 60);
    const perFrame = (performance.now() - t0) / 60;
    s.free();
    expect(perFrame).toBeLessThan(12);
  });

  it("a new tile joins only the tiles its edges meet where they now lie, and a removed tile is gone", () => {
    const s = new LiveScene(R, DEFAULT_LEG);
    const a = s.add(sq([0, 0, 1], [0, 0]));
    const far = s.add(sq([5, 0, 1], [0, 0]));
    const b = s.add(sq([1, 0, 0], [0, -Q]));
    expect(s.hinges(a)).toBe(1);
    expect(s.hinges(far)).toBe(0);
    s.remove(b);
    expect(s.hinges(a)).toBe(0);
    expect(s.poses().length).toBe(2 * 8);
    s.free();
  });

  it("the Pip truck goes on Go, rolls to a stop on Stop, and a ring it drives into comes apart (5.0d)", () => {
    const s = new LiveScene(R, DEFAULT_LEG);
    s.truckOn([0, 0, -3], [0, 1]);
    s.step(seconds(0.5));
    const z0 = s.truckPose()![2];
    s.drive(1, 0);
    s.step(seconds(1));
    const z1 = s.truckPose()![2];
    expect(z1 - z0).toBeGreaterThan(1);
    s.drive(0, 0);
    s.step(seconds(3));
    const z2 = s.truckPose()![2];
    s.step(seconds(0.5));
    expect(Math.abs(s.truckPose()![2] - z2)).toBeLessThan(0.05);
    // a ring ahead; drive into it
    s.truckOff();
    expect(s.truckPose()).toBeNull();
    const ids = ring(-0.5, 0, 1).map((t) => s.add(t));
    s.step(seconds(HOLD_S + 1));
    s.truckOn([0, 0, -2], [0, 1]);
    s.drive(1, 0);
    s.step(seconds(2.5));
    expect(s.broke).toBeGreaterThan(0);
    expect(ids.some((id) => s.hinges(id) < 2)).toBe(true);
    s.free();
  });

  it("left is left: steering turns the truck toward its own left (+x when it faces +z)", () => {
    const s = new LiveScene(R, DEFAULT_LEG);
    s.truckOn([0, 0, 0], [0, 1]);
    s.step(seconds(0.3));
    s.drive(1, 1);
    s.step(seconds(1));
    expect(s.truckPose()![0]).toBeGreaterThan(0.3);
    s.free();
  });
});
