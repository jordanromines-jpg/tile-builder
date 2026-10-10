/* R14, every build stands (4.2, D10, D11): after each step, everything from the earlier steps must stand on its own
   (this step's tiles are in the child's hand), and the finished build must stand with nothing held; crash pieces
   stand until a truck hits them, so they're held too (R10c checks how they're built, R13f how they fall). Each state
   gets the tilt test; R14 blocks a real fall (a tile moving more than 20 mm or tipping more than 15°) and reports the
   smaller sags. Node only: the app never simulates (D9). */
import { DEFAULT_LEG } from "../engine/catalog";
import type { Project } from "../engine/types";
import type { Rapier } from "./rapier";
import { buildScene } from "./scene";
import { tiltTest } from "./tilt";

/** The settings R14 is proved with (calibration.test.ts). Part of every cache key. */
export const R14 = { lean: 1.25, hinge: 0.006, iterations: 24 } as const;

export interface R14Fall {
  step: number;
  tile: number;
  mm: number;
  deg: number;
  phase: string;
}

export interface R14Result {
  id: string;
  falls: R14Fall[];
  /** states that sag a little without falling */
  sags: number;
  /** the worst movement in any state, mm */
  worstMm: number;
}

export function proveBuild(R: Rapier, p: Project): R14Result {
  const k = (p.theme === "trucks" ? 4 : 6) * R14.lean;
  const out: R14Result = { id: p.id, falls: [], sags: 0, worstMm: 0 };
  let upto = 0;
  for (let s = 0; s < p.steps.length; s++) {
    upto += p.steps[s].tiles.length;
    const last = s === p.steps.length - 1;
    const held = new Set<number>(last ? [] : p.steps[s].tiles);
    p.placed.forEach((t, i) => i < upto && t.role === "crash" && held.add(i));
    const scene = buildScene(R, p, { leg: DEFAULT_LEG, upto, held, hinge: R14.hinge, iterations: R14.iterations });
    const r = tiltTest(scene, k, (i) => !held.has(i), true);
    scene.free();
    out.worstMm = Math.max(out.worstMm, r.worstMm);
    if (r.falls) out.falls.push({ step: s + 1, tile: r.tile, mm: Math.round(r.worstMm), deg: Math.round(r.worstDeg), phase: r.phase });
    else if (!r.pass) out.sags++;
  }
  return out;
}
