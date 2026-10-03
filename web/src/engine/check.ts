/* The checker (plan keys 4f, 4l): proves a hand-written project can be built, step by step, with real tiles. The rules
   are in problems.ts (RULES) and, in words, in engine/README.md. */
import { AGE_RULES } from "./ages";
import { BRANDS, TALL_LEG_CHOICES, type ShapeId } from "./catalog";
import {
  apexOf,
  bottomEdges,
  boundsOf,
  boundsTouch,
  coplanarOverlapArea,
  crosses,
  edgesMeet,
  edgesOf,
  isOnTable,
  layerOf,
  normalOf,
  orientationOf,
  worldPolygon,
  type Orientation,
  type V3,
} from "./geometry";
import { holdsProblems } from "./hold";
import type { Problem } from "./problems";
import type { Project } from "./types";

const EXTRAS: ShapeId[] = ["rect-2x1", "window", "door", "fence"];

/** Every leg a project must pass with: the three pictures and each brand's known leg. */
export function legsToCheck(): number[] {
  const legs = new Set<number>(TALL_LEG_CHOICES);
  for (const b of Object.values(BRANDS)) if (b.tallLeg) legs.add(b.tallLeg);
  return [...legs].sort((a, b) => a - b);
}

export interface Analysis {
  polys: V3[][];
  normals: V3[];
  orient: Orientation[];
  onTable: boolean[];
  layer: number[];
  bottom: number[][];
  /** meets[i] maps a neighbour j to the edges of i that meet j */
  meets: Map<number, Set<number>>[];
  overlaps: [number, number][];
  crossings: [number, number][];
}

export function analyse(project: Project, leg: number): Analysis {
  const n = project.placed.length;
  const polys = project.placed.map((p) => worldPolygon(p, leg));
  const normals = project.placed.map((p) => normalOf(p, leg));
  const bounds = polys.map(boundsOf);
  const edges = polys.map(edgesOf);
  const meets = polys.map(() => new Map<number, Set<number>>());
  const overlaps: [number, number][] = [];
  const crossings: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!boundsTouch(bounds[i], bounds[j])) continue;
      edges[i].forEach((e, ei) =>
        edges[j].forEach((f, fj) => {
          if (!edgesMeet(e, f)) return;
          if (!meets[i].has(j)) meets[i].set(j, new Set());
          if (!meets[j].has(i)) meets[j].set(i, new Set());
          meets[i].get(j)!.add(ei);
          meets[j].get(i)!.add(fj);
        }),
      );
      if (coplanarOverlapArea(polys[i], normals[i], polys[j], normals[j]) > 1e-3) overlaps.push([i, j]);
      else if (crosses(polys[i], normals[i], polys[j], normals[j])) crossings.push([i, j]);
    }
  }
  return {
    polys,
    normals,
    orient: normals.map(orientationOf),
    onTable: polys.map(isOnTable),
    layer: polys.map(layerOf),
    bottom: polys.map(bottomEdges),
    meets,
    overlaps,
    crossings,
  };
}

/** The edges of tile i that meet a tile in `set`. */
function metEdges(a: Analysis, i: number, set: Set<number>): Set<number> {
  const out = new Set<number>();
  a.meets[i].forEach((es, j) => {
    if (set.has(j)) es.forEach((e) => out.add(e));
  });
  return out;
}

function grounded(a: Analysis, set: Set<number>): Set<number> {
  const seen = new Set([...set].filter((i) => a.onTable[i]));
  const queue = [...seen];
  while (queue.length) {
    const i = queue.pop()!;
    a.meets[i].forEach((_, j) => {
      if (set.has(j) && !seen.has(j)) {
        seen.add(j);
        queue.push(j);
      }
    });
  }
  return seen;
}

/** Why tile i would not stand with only `set` built, or null when it stands (R6). */
function standsProblem(project: Project, a: Analysis, i: number, set: Set<number>): string | null {
  const met = metEdges(a, i, set);
  const o = a.orient[i];
  if (o === "flat") {
    if (a.onTable[i]) return null;
    return met.size >= 2 ? null : "a flat tile above the table needs two edges to rest on";
  }
  if (o === "tilted") {
    // its base on an upright or flat tile's edge, or on the table: a whole pyramid on the table holds itself up
    const onTable = a.bottom[i].includes(0) && a.onTable[i];
    const base = onTable || [...a.meets[i].entries()].some(([j, es]) => set.has(j) && es.has(0) && a.orient[j] !== "tilted");
    return base ? null : "a leaning tile's base edge must sit on a top edge below, or on the table";
  }
  if (a.onTable[i]) {
    if (project.flat) return null;
    const sides = [...met].filter((e) => !a.bottom[i].includes(e));
    // a wall raised from the edge of a floor tile is held by its magnets
    const onFloor = [...a.meets[i].entries()].some(([j, es]) => set.has(j) && a.orient[j] === "flat" && [...es].some((e) => a.bottom[i].includes(e)));
    return sides.length || onFloor ? null : "a standing tile on the table needs a neighbour at its side, or a floor tile under its edge";
  }
  if (a.bottom[i].some((e) => met.has(e))) return null;
  return met.size >= 2 ? null : "an upper tile must sit on an edge below, or span a gap between two neighbours";
}

/** Leaning tiles grouped by where their apexes meet (R7). */
export function pyramids(project: Project, a: Analysis): number[][] {
  const groups = new Map<string, number[]>();
  project.placed.forEach((_, i) => {
    if (a.orient[i] !== "tilted") return;
    // -0.00 and 0.00 are the same place
    const k = apexOf(a.polys[i]).map((v) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2)).join(",");
    groups.set(k, [...(groups.get(k) ?? []), i]);
  });
  return [...groups.values()];
}

function checkWithLeg(project: Project, leg: number): Problem[] {
  const out: Problem[] = [];
  const a = analyse(project, leg);
  const n = project.placed.length;
  const order = project.steps.flatMap((s) => s.tiles);

  // R1
  for (let i = 0; i < n; i++) if (!a.onTable[i] && a.meets[i].size === 0) out.push({ rule: "R1", tile: i, message: "this tile meets no other tile and is not on the table" });
  // R2
  for (const [i, j] of a.overlaps) out.push({ rule: "R2", tile: j, message: `this tile overlaps tile ${i}` });
  for (const [i, j] of a.crossings) out.push({ rule: "R2", tile: j, message: `this tile passes through tile ${i}` });
  // R3
  const all = new Set(order.length ? order : project.placed.map((_, i) => i));
  const g = grounded(a, all);
  for (const i of all) if (!g.has(i)) out.push({ rule: "R3", tile: i, message: "this tile is not joined to anything on the table" });
  // R4: once each, in order
  if (order.length !== n || order.some((t, k) => t !== k)) out.push({ rule: "R4", message: `the steps must place tiles 0 to ${n - 1} once each, in order` });

  // step by step: R4 next to what is built, R3 after each step, R5 layers, R6 stands
  const built = new Set<number>();
  let top = -1;
  const pyrs = pyramids(project, a);
  project.steps.forEach((step, k) => {
    step.tiles.forEach((t) => built.add(t));
    for (const t of step.tiles) {
      if (t >= n) continue;
      const next = a.onTable[t] || [...a.meets[t].keys()].some((j) => built.has(j));
      if (!next) out.push({ rule: "R4", step: k, tile: t, message: "this tile meets nothing built so far" });
      if (a.layer[t] > top + 1) out.push({ rule: "R5", step: k, tile: t, message: `this tile is on layer ${a.layer[t]}, but the top so far is layer ${top}` });
    }
    const gk = grounded(a, built);
    for (const t of built) if (!gk.has(t) && all.has(t) && g.has(t)) out.push({ rule: "R3", step: k, tile: t, message: "after this step, this tile is not joined to the table" });
    for (const t of built) {
      const why = standsProblem(project, a, t, built);
      if (why) out.push({ rule: "R6", step: k, tile: t, message: why });
    }
    top = Math.max(top, ...step.tiles.filter((t) => t < n).map((t) => a.layer[t]));
  });

  // R7: whole pyramids, one step each
  const stepOf = new Map<number, number>();
  project.steps.forEach((s, k) => s.tiles.forEach((t) => stepOf.set(t, k)));
  for (const grp of pyrs) {
    const shapes = new Set(grp.map((i) => project.placed[i].shape));
    if (grp.some((i) => !project.placed[i].shape.startsWith("tri-"))) out.push({ rule: "R7", tile: grp[0], message: "only triangles can lean into a pyramid" });
    else if (grp.length !== 4 && grp.length !== 3) out.push({ rule: "R7", tile: grp[0], message: `a pyramid needs four leaning triangles (or three), not ${grp.length}` });
    else if (shapes.size > 1) out.push({ rule: "R7", tile: grp[0], message: "a pyramid's triangles must all be the same kind" });
    if (new Set(grp.map((i) => stepOf.get(i))).size > 1) out.push({ rule: "R7", tile: grp[0], message: "a pyramid must be finished in one step, or it falls in" });
  }

  // R10: it holds up like real tiles
  out.push(...holdsProblems(project, a));

  return out.map((p) => ({ ...p, leg }));
}

/** R9: the steps and size fit the project's age. A whole pyramid in one step counts as one group at every age. */
function checkAge(project: Project, legs: number[]): Problem[] {
  const out: Problem[] = [];
  const rule = AGE_RULES[project.age];
  const n = project.placed.length;
  if (n < rule.minTiles || n > rule.maxTiles) out.push({ rule: "R9", message: `${n} tiles; age ${rule.label} projects have ${rule.minTiles} to ${rule.maxTiles}` });
  const a = analyse(project, legs[0]);
  const pyrs = pyramids(project, a).map((g) => [...g].sort((x, y) => x - y).join(","));
  project.steps.forEach((s, k) => {
    const isPyramid = pyrs.includes([...s.tiles].sort((x, y) => x - y).join(","));
    if (s.tiles.length > rule.maxTilesPerStep && !isPyramid) out.push({ rule: "R9", step: k, message: `${s.tiles.length} tiles in one step; age ${rule.label} takes at most ${rule.maxTilesPerStep}` });
  });
  if (project.age === "a" && !project.flat && Math.max(...a.layer) > 1) out.push({ rule: "R9", message: "a 3–5 project lies flat or has at most two layers" });
  return out;
}

export function checkProject(project: Project, opts: { legs?: number[] } = {}): { ok: boolean; problems: Problem[] } {
  const usesTall = project.placed.some((p) => p.shape === "tri-isosceles-tall");
  const legs = opts.legs ?? (usesTall ? legsToCheck() : [TALL_LEG_CHOICES[1]]);
  const problems: Problem[] = [];
  const seen = new Set<string>();
  for (const leg of legs) {
    for (const p of checkWithLeg(project, leg)) {
      const key = `${p.rule}|${p.step}|${p.tile}|${p.message}`;
      if (seen.has(key)) continue;
      seen.add(key);
      problems.push(usesTall ? p : { ...p, leg: undefined });
    }
  }
  // R8: special tiles are named
  const used = new Set(project.placed.map((p) => p.shape));
  for (const s of EXTRAS) {
    if (used.has(s) && !project.needs?.brandExtras?.includes(s)) problems.push({ rule: "R8", message: `uses ${s}, so needs.brandExtras must list it` });
  }
  problems.push(...checkAge(project, legs));
  return { ok: problems.length === 0, problems };
}
