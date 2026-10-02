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
  a: { label: "3–5", maxTilesPerStep: 1, minTiles: 3, maxTiles: 12, view: "fixed", target: 88 },
  b: { label: "6–8", maxTilesPerStep: 3, minTiles: 12, maxTiles: 40, view: "buttons", target: 80 },
  c: { label: "9–10", maxTilesPerStep: 4, minTiles: 30, maxTiles: 100, view: "free", target: 64 },
  // 2.1: big builds for 11 to 16, from up to two 100-piece sets
  d: { label: "11–16", maxTilesPerStep: 6, minTiles: 60, maxTiles: 200, view: "free", target: 64 },
};
