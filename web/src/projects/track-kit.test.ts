import { describe, expect, it } from "vitest";
import { checkProject } from "../engine/check";
import { Builder } from "./helpers";
import { arenaWall, bigTower, crashWall, crushCar, dominoes, kicker, ramp, tunnel } from "./track-kit";

const meta = { id: "t", title: "T", theme: "trucks" as const, age: "d" as const, stars: 1 as const, done: "Done!" };
const problems = (b: Builder) => checkProject(b.build(meta)).problems.filter((p) => p.rule !== "R9");
const top = (b: Builder) => Math.max(...b.placed.map((p) => p.pos[1]));

describe("the track kit (2.7)", () => {
  it("a kicker and a three-high ramp stand, one lane or two, squares or big squares", () => {
    for (const make of [
      (b: Builder) => kicker(b, "red", { x: 0, y: 0, z: 0 }, "N"),
      (b: Builder) => kicker(b, "red", { x: 0, y: 0, z: 0 }, "E", { big: true }),
      (b: Builder) => ramp(b, "red", { x: 0, y: 0, z: 0 }, "W", 3, { lanes: 2, topTower: true }),
      (b: Builder) => ramp(b, "red", { x: 0, y: 0, z: 0 }, "S", 3, { big: true, topTower: true }),
    ]) {
      const b = new Builder();
      make(b);
      expect(problems(b)).toEqual([]);
    }
  });

  it("a ramp ends at the height it was asked for, 30° from where it starts", () => {
    const b = new Builder();
    const end = ramp(b, "red", { x: 0, y: 0, z: 0 }, "N", 3, { topTower: true });
    expect(end.y).toBe(3);
    expect(end.z).toBeCloseTo(-6 * Math.cos(Math.PI / 6));
  });

  it("R11 (2.8): a small-square ramp gets a brace under every mid-air join, and takes it away and it fails", () => {
    const b = new Builder();
    ramp(b, "red", { x: 0, y: 0, z: 0 }, "N", 2, { topTower: true });
    const braces = b.placed.map((p, i) => (p.role === "brace" ? i : -1)).filter((i) => i >= 0);
    expect(braces.length).toBe(2);
    expect(problems(b)).toEqual([]);
    const bare = new Builder();
    ramp(bare, "red", { x: 0, y: 0, z: 0 }, "N", 1, { topTower: true });
    bare.placed = bare.placed.filter((p) => p.role !== "brace");
    bare.steps = bare.steps.filter((s) => s.tiles.every((t) => t < bare.placed.length));
    expect(problems(bare).map((p) => p.message)).toContainEqual(expect.stringContaining("mid-air"));
  });

  it("R12 (2.8): ramp towers over four high are two squares across, so a mega ramp stands firm", () => {
    const b = new Builder();
    ramp(b, "red", { x: 0, y: 0, z: 0 }, "N", 6, { big: true, topTower: true });
    expect(problems(b)).toEqual([]);
  });

  it("R11: a ramp whose top rests on nothing, and three ramp tiles with no support under them, fail", () => {
    const loose = new Builder();
    ramp(loose, "red", { x: 0, y: 0, z: 0 }, "N", 1);
    expect(problems(loose).map((p) => p.rule)).toContain("R11");
    const sag = new Builder();
    ramp(sag, "red", { x: 0, y: 0, z: 0 }, "N", 2, { topTower: true });
    // take away the tower under the middle join
    sag.placed.splice(0, 4);
    sag.steps.splice(0, 1);
    sag.steps = sag.steps.map((s) => ({ ...s, tiles: s.tiles.map((t) => t - 4) }));
    expect(problems(sag).map((p) => p.rule)).toContain("R11");
  });

  it("crashables stand until hit: a wall of doom seven high with its returns, dominoes and a crush car pass", () => {
    const b = new Builder();
    crashWall(b, ["red", "yellow"], { x: 0, y: 0, z: 0 }, "N", 3, 7, (r) => `row ${r + 1}`);
    dominoes(b, ["blue"], { x: 5, y: 0, z: 0 }, "E", 4, "dominoes");
    crushCar(b, "green", 0, 3);
    expect(problems(b)).toEqual([]);
    expect(top(b)).toBe(6);
  });

  it("the drop tower is eight squares high; an arena with a gate and a two-lane tunnel stand", () => {
    const t = new Builder();
    bigTower(t, ["red", "blue"], 0, 0, 4, "yellow");
    expect(problems(t)).toEqual([]);
    expect(top(t)).toBe(8);
    const a = new Builder();
    arenaWall(a, "purple", 0, 0, 5, 4, [{ side: "front", at: 2 }]);
    tunnel(a, "red", "blue", { x: 4, y: 0, z: 2 }, "N", 1);
    expect(problems(a)).toEqual([]);
  });
});
