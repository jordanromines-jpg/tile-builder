import { describe, expect, it } from "vitest";
import { AGE_RULES } from "../engine/ages";
import { inventoryFromSet, matchProject } from "../engine/match";
import { setById } from "../engine/sets";
import type { Age } from "../engine/types";
import { PROJECTS } from "./index";

const inv = (id: string) => {
  const s = setById(id)!;
  return inventoryFromSet(s.pieces, s.brand, null);
};
const of = (age: Age) => PROJECTS.filter((p) => p.age === age);
const buildable = (age: Age, set: string) => of(age).filter((p) => matchProject(p, inv(set)).state !== "need").map((p) => p.id);

describe("the projects (plan keys 6h, 6j, 6l)", () => {
  it("has 10, 12 and 8 projects by age, with unique ids", () => {
    expect([of("a").length, of("b").length, of("c").length]).toEqual([10, 12, 8]);
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(PROJECTS.length);
  });

  it("builds every 3–5 project from a Magna-Tiles 32", () => {
    expect(buildable("a", "magna-32")).toEqual(of("a").map((p) => p.id));
  });

  it("builds at least eight 6–8 projects from a Magna-Tiles 100, and two from a Connetix 60", () => {
    expect(buildable("b", "magna-100").length).toBeGreaterThanOrEqual(8);
    expect(buildable("b", "connetix-60").length).toBeGreaterThanOrEqual(2);
  });

  it("builds at least five 9–10 projects from a Magna-Tiles 100, with swaps", () => {
    expect(buildable("c", "magna-100").length).toBeGreaterThanOrEqual(5);
  });

  it("gives stars by size within the age: lower third 1, middle 2, upper 3", () => {
    const wrong = PROJECTS.filter((p) => {
      const r = AGE_RULES[p.age];
      const third = (r.maxTiles - r.minTiles) / 3;
      const want = p.placed.length < r.minTiles + third ? 1 : p.placed.length < r.minTiles + 2 * third ? 2 : 3;
      return p.age !== "a" && p.stars !== want;
    });
    expect(wrong.map((p) => `${p.id}: ${p.placed.length} tiles, ${p.stars} stars`)).toEqual([]);
  });

  it("every step says something, and every project ends with its own line", () => {
    for (const p of PROJECTS) {
      expect(p.steps.every((s) => s.say.length > 10), p.id).toBe(true);
      expect(p.done.length).toBeGreaterThan(10);
    }
  });
});
