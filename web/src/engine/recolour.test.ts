import { describe, expect, it } from "vitest";
import { applySet } from "../store/inventory";
import { castle } from "../projects/castle";
import { COLOURS, type Colour, type ShapeId } from "./catalog";
import { matchProject } from "./match";
import { hueGap, inColours, recolour, recolourLine } from "./recolour";
import { presetColours, SETS, setById } from "./sets";
import type { Inventory, Project } from "./types";

/** A made-up build: each step a list of [shape, colour, how many]. Only shapes, colours and steps matter here. */
function mk(steps: [ShapeId, Colour, number][][]): Project {
  const placed: Project["placed"] = [];
  const out: Project["steps"] = steps.map((parts) => {
    const tiles: number[] = [];
    for (const [shape, colour, n] of parts) for (let k = 0; k < n; k++) tiles.push(placed.push({ shape, colour, pos: [0, 0, 0], rot: [0, 0] } as Project["placed"][number]) - 1);
    return { tiles, say: "" } as Project["steps"][number];
  });
  return { ...castle, placed, steps: out };
}
const inv = (brand: Inventory["brands"][number], counts: Partial<Record<ShapeId, [number, Partial<Record<Colour, number>>?]>>): Inventory => ({
  brands: [brand],
  tallLeg: null,
  counts: Object.fromEntries(Object.entries(counts).map(([s, [any, byColour]]) => [s, byColour ? { any, byColour } : { any }])),
});
/** how many of each colour the build uses once recoloured */
const uses = (p: Project) => p.placed.reduce<Partial<Record<Colour, number>>>((o, t) => ({ ...o, [t.colour!]: (o[t.colour!] ?? 0) + 1 }), {});

describe("recolouring (4.3)", () => {
  it("keeps every tile when the family has enough of each colour", () => {
    const p = mk([[["square", "red", 4], ["square", "blue", 2]]]);
    expect(recolour(p, inv("magna", { square: [10, { red: 5, blue: 5 }] }))).toEqual({});
  });

  it("moves a red roof that doesn't fit as one, to one colour, not striped", () => {
    const p = mk([[["square", "red", 2]], [["tri-equilateral", "red", 4]]]);
    const c = recolour(p, inv("magna", { square: [2, { red: 2 }], "tri-equilateral": [6, { red: 2, orange: 4 }] }));
    expect(Object.keys(c).map(Number)).toEqual([2, 3, 4, 5]);
    expect(new Set(Object.values(c))).toEqual(new Set(["orange"]));
  });

  it("goes to the colour nearest in hue that has room", () => {
    expect(hueGap("red", "orange")).toBe(1);
    expect(hueGap("red", "pink")).toBe(1);
    expect(hueGap("sky", "blue")).toBe(1);
    const p = mk([[["square", "blue", 3]]]);
    const c = recolour(p, inv("picasso", { square: [9, { blue: 0, sky: 3, yellow: 6 }] }));
    expect(new Set(Object.values(c))).toEqual(new Set(["sky"]));
  });

  it("never uses more of a colour than the family has", () => {
    const p = mk([[["square", "blue", 12]], [["square", "blue", 9]], [["square", "green", 5]]]);
    const have = { red: 4, orange: 4, yellow: 4, green: 4, blue: 4, purple: 6 };
    const q = inColours(p, recolour(p, inv("magna", { square: [26, have] })));
    for (const [col, n] of Object.entries(uses(q))) expect(n, col).toBeLessThanOrEqual(have[col as keyof typeof have]);
  });

  it("with no colour counts, takes the brand's colours as an even mix; with other tiles, changes nothing", () => {
    const p = mk([[["square", "blue", 20]]]);
    const q = inColours(p, recolour(p, inv("magna", { square: [48] })));
    expect(Math.max(...Object.values(uses(q)) as number[])).toBe(8);
    expect(recolour(p, inv("generic", { square: [48] }))).toEqual({});
  });

  it("a shape the family has too few of keeps its colours: too few tiles spread over the colours would stripe it", () => {
    const p = mk([[["square", "blue", 4]], [["square", "red", 4]]]);
    expect(recolour(p, inv("magna", { square: [6, { blue: 2, purple: 2, red: 2 }] }))).toEqual({});
  });

  it("tiles counted beyond the colour counts keep their colour", () => {
    const p = mk([[["square", "blue", 6]]]);
    expect(recolour(p, inv("magna", { square: [10, { red: 4 }] }))).toEqual({});
  });

  it("colours a swapped tile as what it is built with", () => {
    const p = mk([[["square", "red", 1]]]);
    const c = recolour(p, inv("magna", { "tri-right": [2, { green: 2 }] }), { 0: "tri-right" });
    expect(c).toEqual({ 0: "green" });
  });

  it("the castle with PicassoTiles 100 is drawn in its colours, the same way every time", () => {
    const set = applySet({ brands: [], tallLeg: null, counts: {} }, setById("picasso-100")!);
    const m = matchProject(castle, set);
    const a = recolour(castle, set, m.instead);
    expect(a).toEqual(recolour(castle, set, m.instead));
    const q = inColours(castle, a);
    // light blue and pink come in: PicassoTiles makes them
    expect(Object.keys(uses(q)).length).toBeGreaterThan(6);
  });
});

describe("a step's line in the new colours (4.3)", () => {
  it("names the colour a colour's tiles all became, and drops a colour split over several", () => {
    expect(recolourLine("A yellow square, then a yellow corner triangle.", [{ shape: "square", colour: "yellow" }, { shape: "square", colour: "yellow" }], ["blue", "blue"])).toBe("A blue square, then a blue corner triangle.");
    expect(recolourLine("Red squares in a ring.", [{ shape: "square", colour: "red" }, { shape: "square", colour: "red" }], ["orange", "pink"])).toBe("Squares in a ring.");
    expect(recolourLine("A red roof on the blue wall.", [{ shape: "square", colour: "red" }, { shape: "square", colour: "blue" }], ["sky", "blue"])).toBe("A light blue roof on the blue wall.");
    expect(recolourLine("An orange square, a blue square.", [{ shape: "square", colour: "orange" }, { shape: "square", colour: "blue" }], ["blue", "orange"])).toBe("A blue square, an orange square.");
    // swapped both ways in one line: each word is changed once
    expect(recolourLine("red and blue", [{ shape: "square", colour: "red" }, { shape: "square", colour: "blue" }], ["blue", "red"])).toBe("blue and red");
  });

  it("reads a colour word with the shape after it", () => {
    const line = "A yellow corner triangle, a yellow square, a yellow corner triangle.";
    const before = [{ shape: "tri-right", colour: "yellow" }, { shape: "square", colour: "yellow" }, { shape: "tri-right", colour: "yellow" }] as const;
    expect(recolourLine(line, [...before], ["red", "yellow", "red"])).toBe("A red corner triangle, a yellow square, a red corner triangle.");
  });

  it("the project's lines follow its tiles", () => {
    const p = mk([[["square", "yellow", 2]]]);
    p.steps[0] = { ...p.steps[0], say: "Two yellow squares." };
    expect(inColours(p, { 0: "green", 1: "green" }).steps[0].say).toBe("Two green squares.");
  });
});

describe("set colours (4.3)", () => {
  it("each preset's colours add up to its shapes, in its brand's colours only", () => {
    for (const s of SETS) {
      const by = presetColours(s);
      for (const [shape, n] of Object.entries(s.pieces)) {
        const cs = by[shape as ShapeId] ?? {};
        expect(Object.values(cs).reduce((a, b) => a + (b ?? 0), 0), `${s.id} ${shape}`).toBe(n);
        expect(Object.keys(cs).every((c) => COLOURS.includes(c as Colour))).toBe(true);
      }
    }
    expect(Object.keys(presetColours(setById("magna-100")!).square!)).toEqual(["red", "orange", "yellow", "green", "blue", "purple"]);
    expect(Object.keys(presetColours(setById("picasso-100")!).square!)).toHaveLength(8);
  });

  it("four big squares in six colours don't always take the first four", () => {
    const by = presetColours(setById("magna-100")!);
    expect(Object.keys(by["square-large"]!)).not.toEqual(["red", "orange", "yellow", "green"]);
  });

  it("choosing a preset fills the colours", () => {
    const i = applySet({ brands: [], tallLeg: null, counts: {} }, setById("magna-100")!);
    expect(i.counts.square?.byColour).toEqual({ red: 9, orange: 9, yellow: 8, green: 8, blue: 8, purple: 8 });
  });
});
