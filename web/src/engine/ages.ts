/* The age bands as data (plan key 4l; PRODUCT.md, "The age bands"; child-development.md). */
import type { Age } from "./schema";

export interface AgeRule {
  label: string;
  maxTilesPerStep: number;
  minTiles: number;
  maxTiles: number;
  /** fixed: still, quarter turns by button; buttons: + drag to turn; free: orbit, zoom, slow turn */
  view: "fixed" | "buttons" | "free";
  readAloud: "always" | "on" | "optional";
  target: number;
}

export const AGE_RULES: Record<Age, AgeRule> = {
  a: { label: "3–5", maxTilesPerStep: 1, minTiles: 3, maxTiles: 12, view: "fixed", readAloud: "always", target: 88 },
  b: { label: "6–8", maxTilesPerStep: 3, minTiles: 12, maxTiles: 40, view: "buttons", readAloud: "on", target: 80 },
  c: { label: "9–10", maxTilesPerStep: 4, minTiles: 30, maxTiles: 100, view: "free", readAloud: "optional", target: 64 },
};
