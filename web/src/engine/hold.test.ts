import { describe, expect, it } from "vitest";
import { Builder } from "../projects/helpers";
import { Studio, hexagon, lattice } from "../projects/studio";
import { checkProject } from "./check";

const meta = { id: "t", title: "T", theme: "homes" as const, age: "d" as const, stars: 1 as const, done: "Done!" };
/** The R10 problems, as messages. */
const r10 = (b: Builder) => checkProject(b.build(meta)).problems.filter((p) => p.rule === "R10").map((p) => p.message);

describe("R10: it holds up like real tiles", () => {
  it("a three-by-three roof sags in the middle; walls inside hold it up", () => {
    const b = new Builder();
    b.room("red", 0, 0, 3, 3, 0);
    b.step("walls");
    b.lids("blue", 0, 0, 3, 3, 1);
    b.step("roof");
    expect(r10(b).some((m) => m.includes("sag"))).toBe(true);

    const held = new Builder();
    held.room("red", 0, 0, 3, 3, 0);
    held.inside("red", 0, 0, 3, 3, 0);
    held.step("walls");
    held.lids("blue", 0, 0, 3, 3, 1);
    held.step("roof");
    expect(r10(held)).toEqual([]);
  });

  it("a hexagon of six flat triangles on a hexagon of walls is locked: it cannot sag", () => {
    const s = new Studio();
    const h = hexagon(lattice(0, 0), 1, 1);
    s.walls("the hut", h.corners, 1, ["red"], { closed: true });
    s.triLid("the hut", h.tris, 1, "blue");
    const p = s.build({ ...meta, theme: "patterns" });
    expect(checkProject(p).problems.filter((x) => x.rule === "R10")).toEqual([]);
  });

  it("a flag standing on top of a wall hangs by one edge", () => {
    const b = new Builder();
    b.ring("red", 0, 0, 0);
    b.step("ring");
    b.wallX("tri-isosceles-tall", "yellow", 0, 1, 1);
    b.step("flag");
    expect(r10(b).some((m) => m.includes("one edge"))).toBe(true);
  });

  it("a straight wall folds over; a ring and a zigzag stand", () => {
    const line = new Builder();
    for (let x = 0; x < 3; x++) line.wallX("square", "red", x, 0, 0);
    line.step("line");
    expect(r10(line).some((m) => m.includes("fold"))).toBe(true);

    const ring = new Builder();
    ring.room("red", 0, 0, 2, 1, 0);
    ring.step("ring");
    expect(r10(ring)).toEqual([]);

    const zigzag = new Builder();
    zigzag.stand("square", "red", [0, 0], [1, 0]);
    zigzag.stand("square", "red", [1, 0], [1, -1]);
    zigzag.stand("square", "red", [1, -1], [2, -1]);
    zigzag.step("zigzag");
    expect(r10(zigzag)).toEqual([]);
  });
});
