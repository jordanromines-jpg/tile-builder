/* The tilt test (R14's protocol, 4.2): let the build settle, then lean the table a little each way and back. A build
   that stands like real tiles doesn't move. The lean is atan(1/k), k = 6 (4 for trucks): the angle at which a block six
   (four) times as tall as it is wide tips over, so for a rigid block R14 agrees with R12, and it also catches what
   folds at a hinge. */
import type { V3 } from "../engine/geometry";
import { at, type Pose, type Scene } from "./scene";
import { DT, G, SQUARE_M } from "./units";

export const SETTLE_S = 0.5;
export const LEAN_S = 0.5;
export const UPRIGHT_S = 0.25;
/** a pass: after the leans, every tile is back within this of where it settled (a fall never comes back) … */
export const LIMIT_MM = 2;
export const LIMIT_DEG = 2;
/** … and while leaning, none moved more than this (a hinge folding a long way and back is not standing) */
export const PEAK_MM = 10;
export const PEAK_DEG = 6;
/** and settling (gravity alone, before any lean) moved nothing further than this from where it was built */
export const SETTLE_MM = 5;
/** R14 blocks only a real fall (Jordan, 9 Oct, D11: until real tiles calibrate the magnets): a tile that moves more
    than this, anywhere in the test, or tips more than this; smaller sags are reported, not blocked */
export const FALL_MM = 20;
export const FALL_DEG = 15;

export interface TiltResult {
  pass: boolean;
  /** how far the worst tile moved from its settled place while leaning, mm, and turned, degrees */
  worstMm: number;
  worstDeg: number;
  /** where it ended, after the last lean */
  endMm: number;
  endDeg: number;
  tile: number;
  phase: string;
  /** how far settling moved the worst tile from where it was built, mm */
  settleMm: number;
  /** a real fall: what R14 blocks */
  falls: boolean;
}

function moved(scene: Scene, a: Pose[], b: Pose[], only: (i: number) => boolean): { mm: number; deg: number; tile: number } {
  let mm = 0;
  let deg = 0;
  let tile = -1;
  for (let i = 0; i < a.length; i++) {
    if (!only(i)) continue;
    for (const v of scene.local[i]) {
      const p = at(a[i], v);
      const q = at(b[i], v);
      const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) * SQUARE_M * 1000;
      if (d > mm) {
        mm = d;
        tile = i;
      }
    }
    // the angle between the two rotations
    const dq = Math.abs(a[i].q[0] * b[i].q[0] + a[i].q[1] * b[i].q[1] + a[i].q[2] * b[i].q[2] + a[i].q[3] * b[i].q[3]);
    deg = Math.max(deg, (2 * Math.acos(Math.min(1, dq)) * 180) / Math.PI);
  }
  return { mm, deg, tile };
}

const AUTHORED: Pose = { t: [0, 0, 0], q: [0, 0, 0, 1] };

export function tiltTest(scene: Scene, k: number, only: (i: number) => boolean = () => true, failFast = true): TiltResult {
  const steps = (s: number) => Math.round(s / DT);
  const built = scene.bodies.map((b) => {
    const t = b.translation();
    return { ...AUTHORED, t: [t.x, t.y, t.z] as V3 };
  });
  scene.step(steps(SETTLE_S));
  const settled = scene.poses();
  const settle = moved(scene, built, settled, only);
  if (failFast && (settle.mm > FALL_MM || settle.deg > FALL_DEG))
    return { pass: false, falls: true, worstMm: settle.mm, worstDeg: settle.deg, endMm: NaN, endDeg: NaN, tile: settle.tile, phase: "settling", settleMm: settle.mm };
  const lean = Math.atan(1 / k);
  let worst = { mm: 0, deg: 0, tile: -1 };
  let phase = "";
  const phases: [string, V3][] = [
    ["right", [1, 0, 0]],
    ["left", [-1, 0, 0]],
    ["towards the child", [0, 0, 1]],
    ["away", [0, 0, -1]],
  ];
  for (const [name, d] of phases) {
    scene.setGravity([G * Math.sin(lean) * d[0], -G * Math.cos(lean), G * Math.sin(lean) * d[2]]);
    for (const [s, label] of [
      [LEAN_S, `leaning ${name}`],
      [UPRIGHT_S, `upright after ${name}`],
    ] as const) {
      if (label.startsWith("upright")) scene.setGravity([0, -G, 0]);
      for (let n = 0; n < steps(s); n++) {
        scene.step();
        if (n % 12 !== 11) continue;
        const m = moved(scene, settled, scene.poses(), only);
        if (m.mm > worst.mm || m.deg > worst.deg) {
          worst = { mm: Math.max(m.mm, worst.mm), deg: Math.max(m.deg, worst.deg), tile: m.mm > worst.mm ? m.tile : worst.tile };
          phase = label;
        }
        if (failFast && (worst.mm > FALL_MM || worst.deg > FALL_DEG)) {
          return { pass: false, falls: true, worstMm: worst.mm, worstDeg: worst.deg, endMm: NaN, endDeg: NaN, tile: worst.tile, phase, settleMm: settle.mm };
        }
      }
    }
  }
  const end = moved(scene, settled, scene.poses(), only);
  const pass = settle.mm <= SETTLE_MM && worst.mm <= PEAK_MM && worst.deg <= PEAK_DEG && end.mm <= LIMIT_MM && end.deg <= LIMIT_DEG;
  const falls = Math.max(worst.mm, settle.mm) > FALL_MM || Math.max(worst.deg, settle.deg) > FALL_DEG;
  return { pass, falls, worstMm: worst.mm, worstDeg: worst.deg, endMm: end.mm, endDeg: end.deg, tile: pass ? worst.tile : end.mm > LIMIT_MM ? end.tile : worst.tile, phase, settleMm: settle.mm };
}
