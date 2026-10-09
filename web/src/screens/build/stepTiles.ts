/* What a step asks for, as tile pictures (plan keys 7a, 7c): its tiles grouped by shape and colour, each swapped tile
   shown as what stands in for it (a square as two corner triangles), marked "instead". */
import { COLOURS, SHAPE_IDS, type Colour, type ShapeId } from "../../engine/catalog";
import { SWAP_RATIO, type AppliedSwap } from "../../engine/match";
import type { Project } from "../../engine/types";

export interface StepTile {
  shape: ShapeId;
  colour?: Colour;
  count: number;
  instead: boolean;
}

/** The given placed tiles as tile pictures: grouped by shape and colour, swapped ones as what stands in for them. */
export function tilesOf(project: Project, indices: number[], instead: Record<number, ShapeId> = {}): StepTile[] {
  const out: StepTile[] = [];
  for (const t of indices) {
    const p = project.placed[t];
    const swapped = instead[t];
    const shape = swapped ?? p.shape;
    const n = swapped ? (SWAP_RATIO[`${p.shape}>${swapped}`] ?? 1) : 1;
    const hit = out.find((o) => o.shape === shape && o.colour === p.colour && o.instead === !!swapped);
    if (hit) hit.count += n;
    else out.push({ shape, colour: p.colour, count: n, instead: !!swapped });
  }
  return out;
}

export function stepTiles(project: Project, step: number, instead: Record<number, ShapeId> = {}): StepTile[] {
  return tilesOf(project, project.steps[step]?.tiles ?? [], instead);
}

export interface TileRow {
  shape: ShapeId;
  tiles: StepTile[];
  count: number;
}

/** Every tile the build takes (3.7, "Get your tiles"): one row a shape in the catalogue's order, each colour in the
    rainbow's order (no colour last), swapped tiles as what stands in for them. */
export function allTiles(project: Project, instead: Record<number, ShapeId> = {}): TileRow[] {
  const tiles = tilesOf(project, project.placed.map((_, i) => i), instead);
  const hue = (c?: Colour) => (c ? COLOURS.indexOf(c) : COLOURS.length);
  return SHAPE_IDS.flatMap((shape) => {
    const mine = tiles.filter((t) => t.shape === shape).sort((a, b) => hue(a.colour) - hue(b.colour) || Number(a.instead) - Number(b.instead));
    return mine.length ? [{ shape, tiles: mine, count: mine.reduce((n, t) => n + t.count, 0) }] : [];
  });
}

/** How many tiles are in place once `step` is done. */
export function shownAfter(project: Project, step: number): number {
  return project.steps.slice(0, step + 1).reduce((n, s) => n + s.tiles.length, 0);
}

/** The first step that uses a swapped tile, if any. */
export function firstSwapStep(project: Project, instead: Record<number, ShapeId>): number {
  return project.steps.findIndex((s) => s.tiles.some((t) => instead[t] !== undefined));
}

/** Each swap is told once, at the first step that uses it: step → the swaps that start there. */
export function swapsByStep(project: Project, swaps: AppliedSwap[]): Map<number, AppliedSwap[]> {
  const out = new Map<number, AppliedSwap[]>();
  for (const sw of swaps) {
    const s = project.steps.findIndex((st) => st.tiles.some((t) => sw.tiles.includes(t)));
    if (s >= 0) out.set(s, [...(out.get(s) ?? []), sw]);
  }
  return out;
}
