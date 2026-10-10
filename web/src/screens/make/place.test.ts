import { describe, expect, it } from "vitest";
import { DEFAULT_LEG } from "../../engine/catalog";
import { analyse } from "../../engine/check";
import { worldPolygon } from "../../engine/geometry";
import type { Placed, Project } from "../../engine/types";
import { blocked, placeOn, spotsFor, TILTS } from "./place";

const leg = DEFAULT_LEG;
const project = (placed: Placed[]) => ({ id: "m", title: "m", theme: "homes", age: "c", stars: 1, done: "-", placed, steps: [{ say: "-", tiles: placed.map((_, i) => i) }] }) as unknown as Project;
const polys = (placed: Placed[]) => placed.map((p) => worldPolygon(p, leg));

describe("placing a tile (5.0b)", () => {
  it("on the table's grid, standing: the same tile as Builder.wallX", () => {
    const spots = spotsFor("square", leg, []);
    const s = spots.find((x) => x.a.join() === "0,0,0" && x.b.join() === "1,0,0")!;
    const t = placeOn(s, "square", "red", 0);
    expect(t.pos).toEqual([0, 0, 0]);
    expect(t.rot[0]).toBe(0);
    expect(Math.abs(t.rot[1])).toBe(0);
  });

  it("on a wall's top edge, it meets the wall (a magnet join the checker sees)", () => {
    const wall = placeOn({ a: [0, 0, 0], b: [1, 0, 0] }, "square", "red", 0);
    const top = spotsFor("square", leg, polys([wall])).find((s) => s.a[1] === 1)!;
    expect(top).toBeTruthy();
    for (let tilt = 0; tilt < TILTS.length; tilt++) {
      const t = placeOn(top, "square", "blue", tilt, tilt % 2 === 1);
      expect(analyse(project([wall, t]), leg).meets[0].has(1)).toBe(true);
    }
  });

  it("a big square needs two squares of edge in a line", () => {
    const a = placeOn({ a: [0, 0, 0], b: [1, 0, 0] }, "square", "red", 0);
    const b = placeOn({ a: [1, 0, 0], b: [2, 0, 0] }, "square", "red", 0);
    const tops = spotsFor("square-large", leg, polys([a, b])).filter((s) => s.a[1] === 1);
    expect(tops).toHaveLength(1);
    expect(Math.hypot(tops[0].b[0] - tops[0].a[0], tops[0].b[2] - tops[0].a[2])).toBeCloseTo(2);
  });

  it("a tile through one already there is blocked; one beside it is not", () => {
    const wall = placeOn({ a: [0, 0, 0], b: [1, 0, 0] }, "square", "red", 0);
    const same = placeOn({ a: [0, 0, 0], b: [1, 0, 0] }, "square", "blue", 0);
    const across = placeOn({ a: [0.5, 0, -0.5], b: [0.5, 0, 0.5] }, "square", "blue", 0);
    const beside = placeOn({ a: [1, 0, 0], b: [1, 0, 1] }, "square", "blue", 0);
    expect(blocked(same, leg, polys([wall]))).toBe(true);
    expect(blocked(across, leg, polys([wall]))).toBe(true);
    expect(blocked(beside, leg, polys([wall]))).toBe(false);
  });
});
