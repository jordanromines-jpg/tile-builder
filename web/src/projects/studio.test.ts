import { describe, expect, it } from "vitest";
import { checkProject } from "../engine/check";
import type { Project } from "../engine/types";
import { Studio, hexagon, lattice, polygon, star, triOn, turtle } from "./studio";

const meta = { id: "probe", title: "Probe", theme: "patterns" as const, age: "d" as const, done: "You made the probe!" };
/** Every rule but the age's size (R9): these are parts, not whole projects. */
const problems = (p: Project) => checkProject(p).problems.filter((x) => x.rule !== "R9").map((x) => `${x.rule} step ${x.step} tile ${x.tile}: ${x.message}`);

describe("the shape kit (2.3)", () => {
  it("builds a hexagon tower with a triangle lid and three-triangle pyramids on it", () => {
    const s = new Studio();
    const L = lattice(0, 0);
    const h = hexagon(L, 1, 1);
    s.walls("the hive", h.corners, 2, ["yellow", "orange"], { closed: true, what: "in a hexagon" });
    s.triLid("the hive", h.tris, 2, "yellow");
    [0, 2, 4].forEach((k) => s.tetra("a hat", h.tris[k], 2, "red"));
    const p = s.build(meta);
    expect(p.placed.filter((t) => t.shape === "square")).toHaveLength(12);
    expect(problems(p)).toEqual([]);
  });

  it("shares the wall between two hexagons side by side", () => {
    const s = new Studio();
    const L = lattice(0, 0);
    s.walls("one cell", hexagon(L, 1, 1).corners, 1, ["yellow"], { closed: true });
    s.walls("two cells", hexagon(L, 2, 2).corners, 1, ["orange"], { closed: true });
    const p = s.build(meta);
    expect(p.placed).toHaveLength(11);
    expect(problems(p)).toEqual([]);
  });

  it("builds a star fort with a door, a lid and spikes, and a tetrahedron on the table", () => {
    const s = new Studio();
    const st = star(lattice(0, 0), 2, 2);
    s.walls("the star", st.corners, 2, ["blue", "purple"], { closed: true, gap: 0 });
    s.triLid("the star", st.tris, 2, (i) => (i < 6 ? "yellow" : "red"));
    s.tetra("the tent", triOn([6, 1], [7, 1]), 0, "green");
    const p = s.build({ ...meta, age: "c" });
    expect(problems(p)).toEqual([]);
  });

  it("builds an octagon, a zigzag, fins on a tower and a big room", () => {
    const s = new Studio();
    s.walls("the bandstand", polygon([0, 4], 8), 1, ["red"], { closed: true });
    s.walls("the snake", turtle([0, 6], 0, [60, -120, 120, -120]), 2, ["green", "yellow"]);
    s.tower("the rocket", 6, 0, 3, ["blue"], { cap: "tall" });
    s.fins("the rocket", [{ corner: [7, 1], out: [1, 1] }, { corner: [6, 1], out: [-1, 1] }, { corner: [6, 0], out: [-1, -1] }, { corner: [7, 0], out: [1, -1] }], "red");
    s.bigRoom("the big box", 9, 0, "purple", "yellow");
    s.pad("the pond", 9, 3, "blue");
    s.rug("the path", [[0, 9], [1, 9], [2, 9]], "orange");
    const p = s.build(meta);
    expect(problems(p)).toEqual([]);
  });
});
