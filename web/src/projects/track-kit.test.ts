import { describe, expect, it } from "vitest";
import { checkProject } from "../engine/check";
import { Builder } from "./helpers";
import { arenaWall, bigTower, crashWall, crushCar, dominoes, kicker, lane, ramp, tower, tunnel } from "./track-kit";

const meta = { id: "t", title: "T", theme: "trucks" as const, age: "d" as const, stars: 1 as const, done: "Done!" };
const problems = (b: Builder) => checkProject(b.build(meta)).problems.filter((p) => p.rule !== "R9" && !p.rule.startsWith("R13"));
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

describe("the track kit records the course (4.0a)", () => {
  it("a lane is flat ground over its squares, numbered by kind", () => {
    const b = new Builder();
    lane(b, ["green"], { x: 1, y: 0, z: 0 }, "N", 3, 2, "road");
    lane(b, ["green"], { x: 0, y: 0, z: 5 }, "E", 2, 1, "another");
    const [one, two] = b.features;
    expect(one).toMatchObject({ name: "lane-1", kind: "lane", dir: "N", surface: { kind: "flat", y: 0, poly: [[1, -3], [3, -3], [3, 0], [1, 0]] } });
    expect(one.tiles).toHaveLength(6);
    expect(two.name).toBe("lane-2");
    expect(two.dir).toBe("E");
  });

  it("a ramp is a slope from the middle of its bottom edge to the middle of its top edge, as wide as its tiles", () => {
    const b = new Builder();
    ramp(b, "red", { x: 0, y: 0, z: 0 }, "N", 3, { lanes: 2, topTower: true });
    kicker(b, "red", { x: 5, y: 0, z: 0 }, "E", { big: true });
    const [r, k] = b.features;
    expect(r).toMatchObject({ name: "ramp-1", kind: "ramp", dir: "N" });
    const s = r.surface!;
    if (s.kind !== "slope") throw new Error("a ramp is a slope");
    expect(s.from).toEqual([1, 0, 0]);
    expect(s.to[1]).toBe(3);
    expect(s.to[0]).toBeCloseTo(1);
    expect(s.to[2]).toBeCloseTo(-6 * Math.cos(Math.PI / 6));
    expect(s.width).toBe(2);
    expect(r.tiles.map((t) => b.placed[t].role)).toEqual(Array(r.tiles.length).fill("ramp"));
    expect(k).toMatchObject({ name: "kicker-1", kind: "kicker", dir: "E" });
    expect(k.surface).toMatchObject({ kind: "slope", width: 2, from: [5, 0, 1] });
  });

  it("a crush car is a car whose roof, one square up, is flat ground to land on; a wall and dominoes are what they say", () => {
    const b = new Builder();
    crushCar(b, "red", 2, -3);
    crashWall(b, ["red"], { x: 0, y: 0, z: 0 }, "N", 3, 2, () => "row");
    dominoes(b, ["blue"], { x: 0, y: 0, z: 5 }, "E", 3, "dominoes");
    const [car, wall, dom] = b.features;
    expect(car).toMatchObject({ name: "car-1", kind: "car", surface: { kind: "flat", y: 1, poly: [[2, -3], [3, -3], [3, -2], [2, -2]] } });
    expect(car.tiles).toHaveLength(6);
    expect(wall).toMatchObject({ name: "wall-1", kind: "wall" });
    expect(dom).toMatchObject({ name: "dominoes-1", kind: "dominoes", dir: "E" });
    expect(b.placed.filter((t) => t.role === "crash")).toHaveLength(car.tiles.length + wall.tiles.length + dom.tiles.length);
  });

  it("a tower with a lid makes a deck at the lid's height, and a tunnel a floor with a roof", () => {
    const b = new Builder();
    tower(b, ["red", "blue"], 0, 0, 2, 1, 2, "yellow", undefined, "S");
    tunnel(b, "red", "blue", { x: 5, y: 0, z: 0 }, "N", 2, "E");
    expect(b.features.map((f) => f.name)).toEqual(["deck-1", "tunnel-1", "deck-2"]);
    expect(b.features[0]).toMatchObject({ dir: "S", surface: { kind: "flat", y: 2, poly: [[0, 0], [2, 0], [2, 1], [0, 1]] } });
    expect(b.features[1].surface).toMatchObject({ kind: "flat", y: 0, poly: [[5, -4], [7, -4], [7, 0], [5, 0]] });
    expect(b.features[2]).toMatchObject({ dir: "E", surface: { kind: "flat", y: 2 } });
  });
});
