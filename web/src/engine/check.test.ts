import { describe, expect, it } from "vitest";
import { castle } from "../projects/castle";
import { Builder } from "../projects/helpers";
import { checkProject } from "./check";
import { ProjectZ } from "./schema";

const meta = { id: "t", title: "T", theme: "homes" as const, age: "b" as const, stars: 1 as const, done: "Done!" };
const rules = (r: ReturnType<typeof checkProject>) => [...new Set(r.problems.map((p) => p.rule))].sort();

function box(): Builder {
  const b = new Builder();
  b.ring("red", 0, 0, 0);
  return b;
}

describe("the checker", () => {
  it("passes the castle under every leg", () => {
    const r = checkProject(castle);
    expect(r.problems.map((p) => `${p.rule} step ${p.step} tile ${p.tile}: ${p.message}`)).toEqual([]);
    expect(castle.steps.length).toBeGreaterThanOrEqual(20);
    expect(castle.steps.length).toBeLessThanOrEqual(28);
    expect(castle.steps.every((s) => s.tiles.length <= 4)).toBe(true);
  });

  it("parses the castle; a step past the last tile fails", () => {
    expect(ProjectZ.safeParse(castle).success).toBe(true);
    const bad = { ...castle, steps: [...castle.steps, { say: "x", tiles: [999] }] };
    expect(ProjectZ.safeParse(bad).success).toBe(false);
  });

  it("R6: a lone standing square falls", () => {
    const b = new Builder();
    b.wallX("square", "red", 0, 0, 0);
    b.step("one");
    expect(rules(checkProject(b.build(meta)))).toContain("R6");
  });

  it("R1 and R3: a floating square", () => {
    const b = box();
    b.step("ring");
    b.wallX("square", "red", 5, 3, 5);
    b.step("float");
    const r = checkProject(b.build(meta));
    expect(rules(r)).toEqual(expect.arrayContaining(["R1", "R3"]));
  });

  it("R7: a roof of three tall and one short triangle", () => {
    const b = box();
    b.step("ring");
    b.add("tri-isosceles-tall", "red", [0, 1, 1], [0, 0], "roof");
    b.add("tri-isosceles-tall", "red", [1, 1, 1], [0, Math.PI / 2], "roof");
    b.add("tri-isosceles-tall", "red", [1, 1, 0], [0, Math.PI], "roof");
    b.add("tri-equilateral", "red", [0, 1, 0], [0, -Math.PI / 2], "roof");
    b.step("roof");
    expect(rules(checkProject(b.build(meta)))).toContain("R7");
  });

  it("passes a box with a roof; R2 catches two tiles in one place", () => {
    const b = box();
    b.step("ring");
    b.roof("blue", 0, 0, 1);
    b.step("roof");
    expect(checkProject(b.build({ ...meta, age: "c", stars: 1 }), {}).problems.filter((p) => p.rule !== "R9")).toEqual([]);
    const c = box();
    c.wallX("square", "red", 0, 0, 1);
    c.step("ring and a twin");
    expect(rules(checkProject(c.build(meta)))).toContain("R2");
  });

  it("R5: a step may not jump a layer", () => {
    const b = box();
    b.step("ring");
    b.ring("red", 0, 0, 2);
    b.step("too high");
    expect(rules(checkProject(b.build(meta)))).toContain("R5");
  });

  it("R9: an age 3–5 project with a three-tile step fails; the castle passes as 9–10", () => {
    const b = new Builder();
    b.flat("square", "red", 0, 0);
    b.flat("square", "blue", 1, 0);
    b.flat("square", "green", 2, 0);
    b.step("three at once");
    const r = checkProject(b.build({ ...meta, age: "a", flat: true }));
    expect(r.problems.some((p) => p.rule === "R9" && p.step === 0)).toBe(true);
    expect(checkProject(castle).problems.filter((p) => p.rule === "R9")).toEqual([]);
  });
});
