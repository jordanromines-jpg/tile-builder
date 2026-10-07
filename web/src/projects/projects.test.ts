import { describe, expect, it } from "vitest";
import { AGE_RULES } from "../engine/ages";
import { inventoryFromSet, matchProject } from "../engine/match";
import { setById } from "../engine/sets";
import { addSet } from "../store/inventory";
import type { Age } from "../engine/types";
import { PROJECTS } from "./index";
import { MORE } from "./more";
import { FRESH } from "./fresh";

const inv = (id: string) => {
  const s = setById(id)!;
  return inventoryFromSet(s.pieces, s.brand, null);
};
const of = (age: Age) => PROJECTS.filter((p) => p.age === age);
const buildable = (age: Age, set: string) => of(age).filter((p) => matchProject(p, inv(set)).state !== "need").map((p) => p.id);

describe("the projects (plan keys 6h, 6j, 6l)", () => {
  it("has 32, 16, 36, 64 and 165 projects by age, with unique ids and titles", () => {
    expect([of("t").length, of("a").length, of("b").length, of("c").length, of("d").length]).toEqual([32, 16, 36, 64, 165]);
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(PROJECTS.length);
    expect(new Set(PROJECTS.map((p) => p.title.toLowerCase())).size).toBe(PROJECTS.length);
  });

  it("2.5: builds every 0–3 project from two Magna-Tiles 100, and most from one; most lie flat", () => {
    const two = (() => {
      const s = setById("magna-100")!;
      return addSet(inventoryFromSet(s.pieces, s.brand, null), s);
    })();
    expect(of("t").filter((p) => matchProject(p, two).state === "need").map((p) => p.id)).toEqual([]);
    expect(buildable("t", "magna-100").length).toBeGreaterThanOrEqual(20);
    expect(of("t").filter((p) => p.flat).length).toBeGreaterThanOrEqual(24);
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

  it("builds every 11–16 project from two Magna-Tiles 100 or two PicassoTiles 100 (with swaps), and most need both", () => {
    const two = (id: string) => {
      const s = setById(id)!;
      return addSet(inventoryFromSet(s.pieces, s.brand, null), s);
    };
    for (const set of ["magna-100", "picasso-100"]) {
      expect(of("d").filter((p) => matchProject(p, two(set)).state === "need").map((p) => p.id), set).toEqual([]);
    }
    expect(of("d").filter((p) => matchProject(p, inv("magna-100")).state === "need").length).toBeGreaterThan(15);
  });

  it("2.2: the 101 plans from the layout kit are 50 to 175 tiles and each builds from two 100-piece sets", () => {
    const two = (id: string) => {
      const s = setById(id)!;
      return addSet(inventoryFromSet(s.pieces, s.brand, null), s);
    };
    expect(MORE).toHaveLength(101);
    for (const p of MORE) {
      expect(p.placed.length, p.id).toBeGreaterThanOrEqual(50);
      expect(p.placed.length, p.id).toBeLessThanOrEqual(175);
      for (const set of ["magna-100", "picasso-100"]) expect(matchProject(p, two(set)).state, `${p.id} from two ${set}`).not.toBe("need");
    }
  });

  it("2.3: the 100 plans from the shape kit: 6–10 builds from one Magna-Tiles 100, 11–16 from two 100-piece sets", () => {
    const two = (id: string) => {
      const s = setById(id)!;
      return addSet(inventoryFromSet(s.pieces, s.brand, null), s);
    };
    expect([FRESH.filter((p) => p.age === "b").length, FRESH.filter((p) => p.age === "c").length, FRESH.filter((p) => p.age === "d").length]).toEqual([15, 30, 55]);
    for (const p of FRESH) {
      if (p.age === "d") {
        expect(p.placed.length, p.id).toBeLessThanOrEqual(175);
        for (const set of ["magna-100", "picasso-100"]) expect(matchProject(p, two(set)).state, `${p.id} from two ${set}`).not.toBe("need");
      } else expect(matchProject(p, inv("magna-100")).state, `${p.id} from one magna-100`).not.toBe("need");
    }
  });

  it("2.3: no two of the 100 are the same build, and most use shapes off the square grid", () => {
    const signature = (p: (typeof FRESH)[number]) => {
      const n: Record<string, number> = {};
      for (const t of p.placed) n[t.shape] = (n[t.shape] ?? 0) + 1;
      const xs = p.placed.map((t) => t.pos[0]);
      const zs = p.placed.map((t) => t.pos[2]);
      return JSON.stringify([n, Math.round(Math.max(...xs) - Math.min(...xs)), Math.round(Math.max(...zs) - Math.min(...zs))]);
    };
    expect(new Set(FRESH.map(signature)).size).toBe(FRESH.length);
    const QUARTER = Math.PI / 2;
    const offGrid = (p: (typeof FRESH)[number]) =>
      p.placed.some((t) => {
        const turn = Math.abs(t.rot[1] / QUARTER - Math.round(t.rot[1] / QUARTER)) > 1e-6;
        const leans = t.rot[0] !== 0 && t.rot[0] !== -QUARTER && t.role !== "roof";
        return turn || leans || t.shape === "tri-right" || t.shape === "square-large" || (t.shape === "tri-equilateral" && t.rot[0] === -QUARTER);
      });
    expect(FRESH.filter(offGrid).length).toBeGreaterThanOrEqual(70);
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

  it("V10: 3–5 lines are short and use none of the older children's words (a cat's face is a face, not a geometry word)", () => {
    const older = /\b(vertex|vertices|equilateral|isosceles|parallel|symmetrical|pyramid|edge|layer|net)\b/i;
    const bad = of("a").flatMap((p) => p.steps.filter((s) => older.test(s.say.replace(/^Grown-up,.*?\. /, "")) || s.say.split(/\s+/).length > 22).map((s) => `${p.id}: ${s.say}`));
    expect(bad).toEqual([]);
  });

  it("every step says something, and every project ends with its own line", () => {
    for (const p of PROJECTS) {
      expect(p.steps.every((s) => s.say.length > 10), p.id).toBe(true);
      expect(p.done.length).toBeGreaterThan(10);
    }
  });
});
