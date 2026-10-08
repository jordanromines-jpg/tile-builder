import { describe, expect, it } from "vitest";
import { checkProject } from "./check";
import { Builder } from "../projects/helpers";
import { crashWall, tower } from "../projects/track-kit";

const meta = { id: "t", title: "T", theme: "trucks" as const, age: "d" as const, stars: 1 as const, done: "Done!" };
const rules = (b: Builder) => checkProject(b.build(meta)).problems.filter((p) => p.rule !== "R9");
const r12 = (b: Builder) => rules(b).filter((p) => p.rule === "R12");

describe("R12, it stands firm (2.8)", () => {
  it("a tower may be four times as high as it is wide: 1 × 1 four high passes, five high tips", () => {
    const four = new Builder();
    tower(four, ["red"], 0, 0, 1, 1, 4, "yellow");
    expect(rules(four)).toEqual([]);
    const five = new Builder();
    tower(five, ["red"], 0, 0, 1, 1, 5, "yellow");
    expect(r12(five).length).toBeGreaterThan(0);
  });

  it("a 2 × 2 tower eight high stands; its lid rests on two opposite walls, not on corners", () => {
    const b = new Builder();
    tower(b, ["red", "blue"], 0, 0, 2, 2, 8, "yellow");
    expect(rules(b)).toEqual([]);
  });

  it("a low ring stuck to the foot of a tall thin tower doesn't widen it: the check is at every height", () => {
    const b = new Builder();
    tower(b, ["red"], 0, 0, 1, 1, 6, null);
    b.room("blue", 1, 0, 1, 1, 0);
    b.room("blue", 0, 1, 1, 1, 0);
    b.step("a ring at the foot");
    expect(r12(b).length).toBeGreaterThan(0);
  });

  it("tying widens only the way you tie: a 2 × 1 block seven high still tips across its narrow way", () => {
    const b = new Builder();
    for (let r = 0; r < 7; r++) {
      b.room("red", 0, 0, 2, 1, r);
      b.step(`ring ${r + 1}`);
    }
    expect(r12(b).length).toBeGreaterThan(0);
  });

  it("a flat tile above the table resting on two walls at a corner fails in a trucks build", () => {
    const b = new Builder();
    b.room("red", 0, 0, 2, 2, 0);
    b.step("a ring");
    b.lids("yellow", 0, 0, 2, 2, 1);
    b.step("lids on corners");
    expect(r12(b).map((p) => p.message)).toContainEqual(expect.stringContaining("corner"));
  });
});

describe("R12 for every project (2.8.2)", () => {
  it("a build that isn't a truck may be six times as high as it is wide: 1 × 1 six high stands, seven tips", () => {
    const house = { ...meta, theme: "homes" as const };
    const tall = (h: number) => {
      const b = new Builder();
      tower(b, ["red"], 0, 0, 1, 1, h, "yellow");
      return checkProject(b.build(house)).problems.filter((p) => p.rule === "R12");
    };
    expect(tall(6)).toEqual([]);
    expect(tall(7).length).toBeGreaterThan(0);
  });
});

describe("crashables stand until hit (R10c for crash tiles, 2.8)", () => {
  it("a flat stack of crash squares folds; the kit's wall, with its returns, stands", () => {
    const flat = new Builder();
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 3; i++) flat.add("square", "red", [i, r, 0], [0, 0], "crash");
      flat.step(`row ${r + 1}`);
    }
    expect(rules(flat).map((p) => p.rule)).toContain("R10");
    const wall = new Builder();
    crashWall(wall, ["red"], { x: 0, y: 0, z: 0 }, "N", 3, 3, (r) => `row ${r + 1}`);
    expect(rules(wall)).toEqual([]);
  });

  it("a single row of crash squares on the table, with nothing on it, may stand alone like dominoes", () => {
    const b = new Builder();
    for (let i = 0; i < 3; i++) b.add("square", "red", [i, 0, 0], [0, 0], "crash");
    b.step("a row");
    expect(rules(b)).toEqual([]);
  });
});
