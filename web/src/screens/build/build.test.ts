import { describe, expect, it } from "vitest";
import { inventoryFromSet, matchProject } from "../../engine/match";
import { setById } from "../../engine/sets";
import { castle } from "../../projects/castle";
import { fell, fellLines, layerStart } from "../../ui/kid/FellDown";
import { firstSwapStep, shownAfter, stepTiles, swapsByStep } from "./stepTiles";

describe("it fell down (7d)", () => {
  it("counts falls on one step and asks a grown-up after two", () => {
    let s = fell({ step: -1, falls: 0 }, 3);
    expect(fellLines(s)).toHaveLength(1);
    s = fell(s, 3);
    expect(fellLines(s)[1]).toContain("grown-up");
    s = fell(s, 4);
    expect(s).toEqual({ step: 4, falls: 1 });
  });

  it("starts the layer again from its first step", () => {
    const layers = [0, 0, 0, 1, 1, 2];
    expect(layerStart(layers, 4)).toBe(3);
    expect(layerStart(layers, 2)).toBe(0);
    expect(layerStart(layers, 5)).toBe(5);
  });
});

describe("a step's tiles (7a, 7c)", () => {
  it("groups the first castle step as four blue squares", () => {
    expect(stepTiles(castle, 0)).toEqual([{ shape: "square", colour: "blue", count: 4, instead: false }]);
    expect(shownAfter(castle, 0)).toBe(4);
    expect(shownAfter(castle, castle.steps.length - 1)).toBe(castle.placed.length);
  });

  it("shows swapped roofs as equilateral triangles from the first swapped step", () => {
    const s = setById("magna-100")!;
    const m = matchProject(castle, inventoryFromSet(s.pieces, s.brand, null));
    const first = firstSwapStep(castle, m.instead);
    expect(first).toBeGreaterThan(0);
    const roofStep = castle.steps.findIndex((st) => st.tiles.every((t) => m.instead[t] === "tri-equilateral"));
    expect(stepTiles(castle, roofStep, m.instead)).toEqual([{ shape: "tri-equilateral", colour: "red", count: 4, instead: true }]);
  });

  it("tells each swap once, at the first step that uses it", () => {
    const s = setById("magna-100")!;
    const m = matchProject(castle, inventoryFromSet(s.pieces, s.brand, null));
    const at = swapsByStep(castle, m.swaps);
    expect([...at.values()].flat().map((sw) => sw.to).sort()).toEqual(["tri-equilateral", "tri-right"]);
    const roofAt = [...at.entries()].find(([, sws]) => sws.some((sw) => sw.to === "tri-equilateral"))![0];
    expect(castle.steps[roofAt].tiles.every((t) => castle.placed[t].role === "roof")).toBe(true);
  });
});
