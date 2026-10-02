/* What a placed tile is drawn as (plan key 7c): itself, or, after a swap, the tiles that stand in for it, in the tile's
   own plane. A roof swapped to equilateral triangles is one triangle with a steeper tilt (geometry.rotOf). */
import type { ShapeId } from "../engine/catalog";

export interface Part {
  shape: ShapeId;
  /** offset in the tile's plane */
  at: [number, number];
  /** a half turn in the tile's plane (the second corner triangle of a square) */
  flip?: boolean;
}

export function partsOf(shape: ShapeId, instead?: ShapeId): Part[] {
  if (!instead || instead === shape) return [{ shape, at: [0, 0] }];
  if (shape === "square" && instead === "tri-right") return [{ shape: "tri-right", at: [0, 0] }, { shape: "tri-right", at: [1, 1], flip: true }];
  if (shape === "rect-2x1" && instead === "square") return [{ shape: "square", at: [0, 0] }, { shape: "square", at: [1, 0] }];
  if (shape === "square-large" && instead === "square")
    return [
      { shape: "square", at: [0, 0] },
      { shape: "square", at: [1, 0] },
      { shape: "square", at: [0, 1] },
      { shape: "square", at: [1, 1] },
    ];
  return [{ shape: instead, at: [0, 0] }];
}
