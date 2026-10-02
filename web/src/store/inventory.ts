/* Changing the family's tiles (plan key 5e), as pure functions so the Tiles screen and its tests share them. */
import { BRANDS, DEFAULT_LEG, type BrandId, type Colour, type ShapeId } from "../engine/catalog";
import type { SetPreset } from "../engine/sets";
import type { Inventory, ShapeCount } from "../engine/types";

function colourSum(c?: ShapeCount, except?: Colour): number {
  return Object.entries(c?.byColour ?? {}).reduce((n, [k, v]) => (k === except ? n : n + (v ?? 0)), 0);
}

export function setCount(inv: Inventory, shape: ShapeId, n: number): Inventory {
  const any = Math.max(0, Math.round(n));
  const prev = inv.counts[shape];
  let byColour = prev?.byColour ? { ...prev.byColour } : undefined;
  // a colour count never exceeds the shape's count: trim colours from the last
  if (byColour) {
    let over = colourSum({ any, byColour }) - any;
    for (const k of Object.keys(byColour).reverse() as Colour[]) {
      if (over <= 0) break;
      const cut = Math.min(over, byColour[k] ?? 0);
      byColour[k] = (byColour[k] ?? 0) - cut;
      over -= cut;
    }
  }
  return { ...inv, counts: { ...inv.counts, [shape]: byColour ? { any, byColour } : { any } } };
}

export function setColourCount(inv: Inventory, shape: ShapeId, colour: Colour, n: number): Inventory {
  const prev = inv.counts[shape] ?? { any: 0 };
  const room = prev.any - colourSum(prev, colour);
  const v = Math.max(0, Math.min(room, Math.round(n)));
  return { ...inv, counts: { ...inv.counts, [shape]: { ...prev, byColour: { ...prev.byColour, [colour]: v } } } };
}

/** A preset replaces the counts and sets the brand; the tall triangle follows the brand when it is known. */
export function applySet(inv: Inventory, preset: SetPreset): Inventory {
  const counts: Inventory["counts"] = {};
  for (const [s, n] of Object.entries(preset.pieces)) counts[s as ShapeId] = { any: n ?? 0 };
  return { brands: [preset.brand], tallLeg: BRANDS[preset.brand].tallLeg ?? inv.tallLeg, counts };
}

export function toggleBrand(inv: Inventory, b: BrandId): Inventory {
  const brands = inv.brands.includes(b) ? inv.brands.filter((x) => x !== b) : [...inv.brands, b];
  return { ...inv, brands };
}

export function setTallLeg(inv: Inventory, leg: number | null): Inventory {
  return { ...inv, tallLeg: leg };
}

/** The leg the 3D model draws tall triangles with: the family's pick, else their one brand's, else PicassoTiles'. */
export function effectiveLeg(inv: Inventory | undefined): number {
  if (inv?.tallLeg) return inv.tallLeg;
  const known = (inv?.brands ?? []).map((b) => BRANDS[b].tallLeg).filter((l): l is number => !!l);
  return known[0] ?? DEFAULT_LEG;
}
