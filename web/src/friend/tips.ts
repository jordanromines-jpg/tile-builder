/* Pip's tips (3.9): a short tip at the first step that needs one, worked out from the step's own tiles, so no build
   needs tips written for it. Each kind is told once a build, at most one a step; none for 0–3 (a grown-up builds). */
import { layerOf, worldPolygon } from "../engine/geometry";
import type { Project } from "../engine/types";

export type TipKind = "crash" | "brace" | "ramp" | "roof" | "bigStand" | "layer3";
/** the order a step's tips win in, when it has more than one */
const ORDER: TipKind[] = ["crash", "brace", "ramp", "roof", "bigStand", "layer3"];

/** step → the tip told there. */
export function tipsByStep(project: Project, leg: number): Map<number, TipKind> {
  const out = new Map<number, TipKind>();
  if (project.age === "t") return out;
  const told = new Set<TipKind>();
  project.steps.forEach((step, i) => {
    const kinds = new Set<TipKind>();
    let low = Infinity;
    for (const t of step.tiles) {
      const p = project.placed[t];
      if (p.role) kinds.add(p.role);
      // a big square standing on its edge (tilt 0): heavy, it falls over until the next tile holds it
      if (p.shape === "square-large" && Math.abs(p.rot[0]) < 1e-3) kinds.add("bigStand");
      low = Math.min(low, layerOf(worldPolygon(p, leg)));
    }
    // the first step that starts on the third layer
    if (low >= 2) kinds.add("layer3");
    const kind = ORDER.find((k) => kinds.has(k) && !told.has(k));
    if (kind) {
      told.add(kind);
      out.set(i, kind);
    }
  });
  return out;
}
