/* Set presets (plan key 4b): a starting point for the grown-up, who then adjusts the counts. From
   docs/research/tiles.md, "Set contents"; each sums to its set's total. */
import { BRANDS, SHAPE_IDS, type BrandId, type Colour, type ShapeId } from "./catalog";

export interface SetPreset {
  id: string;
  brand: BrandId;
  name: string;
  total: number;
  pieces: Partial<Record<ShapeId, number>>;
}

export const SETS: SetPreset[] = [
  {
    id: "magna-32",
    brand: "magna",
    name: "Magna-Tiles Clear Colors 32",
    total: 32,
    pieces: { square: 14, "square-large": 2, "tri-equilateral": 8, "tri-right": 4, "tri-isosceles-tall": 4 },
  },
  {
    id: "magna-100",
    brand: "magna",
    name: "Magna-Tiles Clear Colors 100",
    total: 100,
    pieces: { square: 50, "square-large": 4, "tri-equilateral": 20, "tri-right": 11, "tri-isosceles-tall": 15 },
  },
  {
    id: "picasso-100",
    brand: "picasso",
    name: "PicassoTiles PT100 Classic Starter",
    total: 100,
    pieces: { square: 46, "square-large": 8, "tri-equilateral": 20, "tri-right": 12, "tri-isosceles-tall": 14 },
  },
  {
    id: "connetix-60",
    brand: "connetix",
    name: "Connetix Rainbow Starter Pack 60",
    total: 60,
    pieces: { square: 24, "square-large": 6, "tri-equilateral": 6, "tri-right": 6, "tri-isosceles-tall": 6, window: 6, door: 6 },
  },
  {
    id: "connetix-102",
    brand: "connetix",
    name: "Connetix Rainbow Creative Pack 102",
    total: 102,
    pieces: { square: 36, "square-large": 6, "tri-equilateral": 12, "tri-right": 12, "tri-isosceles-tall": 12, window: 6, door: 6, "rect-2x1": 6, fence: 6 },
  },
];

export function setById(id: string): SetPreset | undefined {
  return SETS.find((s) => s.id === id);
}

/** `n` tiles of one shape spread evenly over `colours`, the odd ones going round from a different colour for each shape
    (so four big squares in six colours aren't always red, orange, yellow and green). */
export function spread(n: number, colours: Colour[], shape: ShapeId): Partial<Record<Colour, number>> {
  const by: Partial<Record<Colour, number>> = {};
  if (!colours.length) return by;
  const each = Math.floor(n / colours.length);
  const odd = n - each * colours.length;
  const from = SHAPE_IDS.indexOf(shape) % colours.length;
  colours.forEach((c, i) => {
    const k = each + ((i - from + colours.length) % colours.length < odd ? 1 : 0);
    if (k) by[c] = k;
  });
  return by;
}

/** A set's tiles by colour (4.3): each shape spread evenly over the colours its brand makes. The makers don't list
    their sets' colours by shape; a grown-up can change any count. */
export function presetColours(preset: SetPreset): Partial<Record<ShapeId, Partial<Record<Colour, number>>>> {
  const colours = BRANDS[preset.brand].colours;
  const out: Partial<Record<ShapeId, Partial<Record<Colour, number>>>> = {};
  for (const [shape, n] of Object.entries(preset.pieces) as [ShapeId, number][]) out[shape] = spread(n, colours, shape);
  return out;
}
