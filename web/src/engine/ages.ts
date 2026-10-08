/* The age bands as data (plan key 4l; PRODUCT.md, "The age bands"; child-development.md). */
import type { Age } from "./schema";

export interface AgeRule {
  label: string;
  maxTilesPerStep: number;
  minTiles: number;
  maxTiles: number;
  /** fixed: still, quarter turns by button; buttons: + drag to turn; free: orbit, zoom, slow turn */
  view: "fixed" | "buttons" | "free";
  target: number;
}

export const AGE_RULES: Record<Age, AgeRule> = {
  // 2.5: mosaics and simple shapes for babies and toddlers, built by a grown-up for the baby to look at; a row of a
  // mosaic is one step, and the bigger pictures take up to two 100-piece sets
  t: { label: "0–3", maxTilesPerStep: 12, minTiles: 9, maxTiles: 200, view: "free", target: 64 },
  a: { label: "3–5", maxTilesPerStep: 1, minTiles: 3, maxTiles: 12, view: "fixed", target: 88 },
  b: { label: "6–8", maxTilesPerStep: 3, minTiles: 12, maxTiles: 40, view: "buttons", target: 80 },
  c: { label: "9–10", maxTilesPerStep: 4, minTiles: 30, maxTiles: 100, view: "free", target: 64 },
  // 2.1: big builds for 11 to 16, from up to two 100-piece sets
  d: { label: "11–16", maxTilesPerStep: 6, minTiles: 60, maxTiles: 200, view: "free", target: 64 },
};

/** Monster trucks (2.7): arenas and stunt builds for 1:64 trucks, bigger than the other builds of each age; the biggest
    take up to four 100-piece sets. A whole ring of walls or a whole ramp counts as one group in a step. */
export const TRUCK_RULES: Record<Age, AgeRule> = {
  t: { ...AGE_RULES.t, minTiles: 9, maxTiles: 80 },
  a: { ...AGE_RULES.a, minTiles: 6, maxTiles: 30 },
  b: { ...AGE_RULES.b, maxTilesPerStep: 4, minTiles: 20, maxTiles: 100 },
  c: { ...AGE_RULES.c, maxTilesPerStep: 6, minTiles: 40, maxTiles: 220 },
  d: { ...AGE_RULES.d, maxTilesPerStep: 8, minTiles: 100, maxTiles: 420 },
};

/** The size rules a project is held to: its age's, or for a Monster trucks build, the trucks'. */
export function rulesFor(p: { age: Age; theme: string }): AgeRule {
  return p.theme === "trucks" ? TRUCK_RULES[p.age] : AGE_RULES[p.age];
}
