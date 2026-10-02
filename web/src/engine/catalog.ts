/* The tile catalog (plan key 4a; the shapes came first, in PR 2.3, because the tile pictures draw them).
   Units: one standard square edge (3 in, 76.2 mm). Every shape's points run counter-clockwise from a base edge
   (0,0)–(1,0), as in the 3D prototype. Sizes and sources: docs/research/tiles.md. */
export type Pt = [number, number];

export type ShapeId =
  | "square"
  | "square-large"
  | "tri-equilateral"
  | "tri-right"
  | "tri-isosceles-tall"
  | "rect-2x1"
  | "window"
  | "door"
  | "fence";

export const SHAPE_IDS: ShapeId[] = [
  "square",
  "square-large",
  "tri-equilateral",
  "tri-right",
  "tri-isosceles-tall",
  "rect-2x1",
  "window",
  "door",
  "fence",
];

export type Colour = "red" | "orange" | "yellow" | "green" | "blue" | "purple";
export const COLOURS: Colour[] = ["red", "orange", "yellow", "green", "blue", "purple"];

/** The tall triangle's leg when nobody has said which brand: PicassoTiles' listed 14 cm (Q1). */
export const DEFAULT_LEG = 1.867;
/** The three pictures a grown-up picks from when the brand's tall triangle is unknown (Q1). */
export const TALL_LEG_CHOICES = [1.5, 1.867, 2.2];

export const EQ_H = Math.sqrt(3) / 2;

/** The height of a tall isosceles triangle with a base of 1 and the given legs. */
export function tallHeight(leg: number): number {
  return Math.sqrt(leg * leg - 0.25);
}

export interface ShapeDef {
  /** What a child hears and reads: "square", "tall triangle". */
  label: string;
  plural: string;
  points: (leg?: number) => Pt[];
  /** a frame with an opening: the face has a hole */
  hole?: "window" | "door";
  /** an open frame with bars and no face */
  noFace?: boolean;
}

export const SHAPES: Record<ShapeId, ShapeDef> = {
  square: { label: "square", plural: "squares", points: () => [[0, 0], [1, 0], [1, 1], [0, 1]] },
  "square-large": { label: "big square", plural: "big squares", points: () => [[0, 0], [2, 0], [2, 2], [0, 2]] },
  "tri-equilateral": { label: "triangle", plural: "triangles", points: () => [[0, 0], [1, 0], [0.5, EQ_H]] },
  "tri-right": { label: "corner triangle", plural: "corner triangles", points: () => [[0, 0], [1, 0], [0, 1]] },
  "tri-isosceles-tall": {
    label: "tall triangle",
    plural: "tall triangles",
    points: (leg = DEFAULT_LEG) => [[0, 0], [1, 0], [0.5, tallHeight(leg)]],
  },
  "rect-2x1": { label: "rectangle", plural: "rectangles", points: () => [[0, 0], [2, 0], [2, 1], [0, 1]] },
  window: { label: "window", plural: "windows", points: () => [[0, 0], [1, 0], [1, 1], [0, 1]], hole: "window" },
  door: { label: "door", plural: "doors", points: () => [[0, 0], [1, 0], [1, 1], [0, 1]], hole: "door" },
  fence: { label: "fence", plural: "fences", points: () => [[0, 0], [1, 0], [1, 0.5], [0, 0.5]], noFace: true },
};

export const COLOUR_NAMES: Record<Colour, string> = {
  red: "red",
  orange: "orange",
  yellow: "yellow",
  green: "green",
  blue: "blue",
  purple: "purple",
};

/** "red square", "4 red squares", "2 tall triangles". */
export function tileName(shape: ShapeId, colour?: Colour, count?: number): string {
  const s = SHAPES[shape];
  const many = count !== undefined && count !== 1;
  const noun = many ? s.plural : s.label;
  const words = [count !== undefined ? String(count) : "", colour ? COLOUR_NAMES[colour] : "", noun].filter(Boolean);
  return words.join(" ");
}

export type BrandId = "magna" | "picasso" | "connetix" | "generic";
export const BRAND_IDS: BrandId[] = ["magna", "picasso", "connetix", "generic"];

export interface BrandDef {
  label: string;
  unitMm: number;
  /** the tall triangle's leg in units, or null when not known (Q1) */
  tallLeg: number | null;
  /** shapes only this brand makes */
  extras: ShapeId[];
}

export const BRANDS: Record<BrandId, BrandDef> = {
  magna: { label: "Magna-Tiles", unitMm: 76.2, tallLeg: 1.877, extras: [] },
  picasso: { label: "PicassoTiles", unitMm: 76.2, tallLeg: 1.867, extras: [] },
  connetix: { label: "Connetix", unitMm: 75, tallLeg: null, extras: ["rect-2x1", "window", "door", "fence"] },
  generic: { label: "Other 3-inch tiles", unitMm: 76.2, tallLeg: null, extras: [] },
};

/** Twice the signed area: positive when the points run counter-clockwise. */
export function signedArea2(pts: Pt[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return a;
}

export function isConvex(pts: Pt[]): boolean {
  let sign = 0;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    const [cx, cy] = pts[(i + 2) % pts.length];
    const cr = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
    if (Math.abs(cr) < 1e-9) continue;
    const s = Math.sign(cr);
    if (sign && s !== sign) return false;
    sign = s;
  }
  return true;
}
