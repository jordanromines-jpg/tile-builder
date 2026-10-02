/* Matching (plan key 4k): can this family build this project with their tiles? Colour is ignored: it is a preference,
   never a requirement. When short, swaps are tried in a fixed order:
     1. the project's own swaps
     2. four tall triangles → four equilateral triangles, a whole pyramid at a time (a lower roof)
     3. a square → two corner triangles
     4. a rectangle → two squares
     5. a big square → four squares
   What is still short after that is `missing`, drawn on the card as "Need 2 more". */
import type { ShapeId } from "./catalog";
import type { Inventory, Project, SwapRule } from "./types";

export interface Missing {
  shape: ShapeId;
  count: number;
}

export interface AppliedSwap {
  from: ShapeId;
  to: ShapeId;
  /** the placed tiles built another way */
  tiles: number[];
  say: string;
}

export interface Match {
  state: "can" | "swap" | "need";
  missing: Missing[];
  swaps: AppliedSwap[];
  /** placed tile → the shape it is built with instead */
  instead: Record<number, ShapeId>;
  note?: "best-with-one-brand";
}

/** How many of each shape a tile becomes when swapped. */
export const SWAP_RATIO: Partial<Record<string, number>> = {
  "square>tri-right": 2,
  "rect-2x1>square": 2,
  "square-large>square": 4,
};

const DEFAULT_SWAPS: SwapRule[] = [
  { from: "tri-isosceles-tall", to: "tri-equilateral", perPyramid: true, say: "Short on tall triangles? Four short triangles make a lower roof." },
  { from: "square", to: "tri-right", say: "Short on squares? Two corner triangles make a square." },
  { from: "rect-2x1", to: "square", say: "No rectangle? Two squares side by side make one." },
  { from: "square-large", to: "square", say: "No big square? Four squares make one." },
];

export function needsOf(project: Project): Partial<Record<ShapeId, number>> {
  const out: Partial<Record<ShapeId, number>> = {};
  for (const p of project.placed) out[p.shape] = (out[p.shape] ?? 0) + 1;
  return out;
}

export function have(inv: Inventory, s: ShapeId): number {
  return inv.counts[s]?.any ?? 0;
}

export function inventoryTotal(inv: Inventory): number {
  return Object.values(inv.counts).reduce((n, c) => n + (c?.any ?? 0), 0);
}

/** Roof tiles in groups of their step: each group is one pyramid. */
function pyramidsOf(project: Project, shape: ShapeId): number[][] {
  return project.steps
    .map((s) => s.tiles.filter((t) => project.placed[t].role === "roof" && project.placed[t].shape === shape))
    .filter((g) => g.length >= 3);
}

export function matchProject(project: Project, inv: Inventory): Match {
  const instead: Record<number, ShapeId> = {};
  const used = (): Partial<Record<ShapeId, number>> => {
    const out: Partial<Record<ShapeId, number>> = {};
    project.placed.forEach((p, i) => {
      const s = instead[i] ?? p.shape;
      const k = instead[i] ? (SWAP_RATIO[`${p.shape}>${s}`] ?? 1) : 1;
      out[s] = (out[s] ?? 0) + k;
    });
    return out;
  };
  const short = (s: ShapeId) => Math.max(0, (used()[s] ?? 0) - have(inv, s));
  const swaps: AppliedSwap[] = [];
  const rules = [...(project.swaps ?? []), ...DEFAULT_SWAPS];
  const tried = new Set<string>();

  for (const rule of rules) {
    const key = `${rule.from}>${rule.to}`;
    if (tried.has(key)) continue;
    tried.add(key);
    const k = SWAP_RATIO[key] ?? 1;
    const done: number[] = [];
    if (rule.perPyramid) {
      for (const g of pyramidsOf(project, rule.from).reverse()) {
        if (short(rule.from) <= 0) break;
        if ((used()[rule.to] ?? 0) + g.length > have(inv, rule.to)) break;
        g.forEach((t) => (instead[t] = rule.to));
        done.push(...g);
      }
    } else {
      const candidates = project.placed.map((p, i) => i).filter((i) => project.placed[i].shape === rule.from && !instead[i] && project.placed[i].role !== "roof");
      for (const i of candidates.reverse()) {
        if (short(rule.from) <= 0) break;
        if ((used()[rule.to] ?? 0) + k > have(inv, rule.to)) break;
        instead[i] = rule.to;
        done.push(i);
      }
    }
    if (done.length) swaps.push({ from: rule.from, to: rule.to, tiles: done.sort((a, b) => a - b), say: rule.say });
  }

  const u = used();
  const missing = (Object.keys(u) as ShapeId[]).map((s) => ({ shape: s, count: Math.max(0, (u[s] ?? 0) - have(inv, s)) })).filter((m) => m.count > 0);
  const state = missing.length ? "need" : swaps.length ? "swap" : "can";
  const note = inv.brands.length >= 2 && project.bigRing ? "best-with-one-brand" : undefined;
  return { state, missing, swaps, instead, ...(note ? { note } : {}) };
}

/** How many of the projects a family can build now, with or without swaps. */
export function canBuildCount(projects: Project[], inv: Inventory): number {
  return projects.filter((p) => matchProject(p, inv).state !== "need").length;
}

/** An inventory from a set preset. */
export function inventoryFromSet(pieces: Partial<Record<ShapeId, number>>, brand: Inventory["brands"][number], tallLeg: number | null): Inventory {
  const counts: Inventory["counts"] = {};
  for (const [s, n] of Object.entries(pieces)) counts[s as ShapeId] = { any: n ?? 0 };
  return { brands: [brand], tallLeg, counts };
}
