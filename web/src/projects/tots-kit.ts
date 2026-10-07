/* The mosaic kit (2.5): flat pictures for 0 to 3, drawn as rows of cells and laid on the table a row at a time by a
   grown-up. Rows are listed top first; the top of the picture is the far side of the table.

   Square grid, one token a cell, separated by spaces:
     .        a gap
     R        a square (R O Y G B P: red, orange, yellow, green, blue, purple)
     R+       a big square, this cell and the three to its right and below; mark those three with -
     RY/      a cell cut from bottom left to top right: R the top-left corner triangle, Y the bottom-right one
     RY\      a cell cut from top left to bottom right: R the bottom-left corner triangle, Y the top-right one
              (either colour may be . for no triangle there)
   Triangle grid, one letter a triangle, . a gap: triangles alternate point up and point down along a row, and the
   rows fit together like a honeycomb. */
import type { Colour, ShapeId } from "../engine/catalog";
import { EQ_H } from "../engine/catalog";
import type { Project } from "../engine/types";
import type { Theme } from "../engine/themes";
import { Builder } from "./helpers";

const COLOUR: Record<string, Colour> = { R: "red", O: "orange", Y: "yellow", G: "green", B: "blue", P: "purple" };
const MAX_STEP = 12;

/** Stars by size, as for every age: the lower third of 9 to 200 tiles is one star, the upper third three. */
export function starsFor(n: number): 1 | 2 | 3 {
  const third = (200 - 9) / 3;
  return n < 9 + third ? 1 : n < 9 + 2 * third ? 2 : 3;
}

interface Piece {
  /** what it is, for the step's words */
  word: string;
  add: (b: Builder) => number;
}

const colourOf = (c: string): Colour => {
  const k = COLOUR[c];
  if (!k) throw new Error(`no colour ${c}`);
  return k;
};

const article = (w: string) => (/^[aeiou]/.test(w) ? `an ${w}` : `a ${w}`);

/** "red square" → "red squares", "red corner triangle in the top left" → "red corner triangles in the top left". */
const pluralOf = (w: string) => w.replace(/\b(square|triangle)\b/, "$1s");

/** A whole row of one kind of tile in a repeating run of colours, as "10 squares, red then yellow, and round again". */
function cycle(words: string[]): string | null {
  const m = words.map((w) => /^(red|orange|yellow|green|blue|purple) (square|triangle)$/.exec(w));
  if (words.length < 4 || m.some((x) => !x || x[2] !== m[0]![2])) return null;
  for (let p = 2; p <= 6 && p + 2 <= words.length; p++) {
    if (words.every((w, i) => w === words[i % p]) && new Set(words.slice(0, p)).size === p) {
      const cols = m.slice(0, p).map((x) => x![1]);
      return `${words.length} ${m[0]![2]}s, ${cols.slice(0, -1).join(", ")} then ${cols.at(-1)}, and round again`;
    }
  }
  return null;
}

/** Runs of the same word, as "3 red squares, a gap, 2 blue squares". */
function runs(words: string[]): string {
  const lead: string[] = [];
  let rest = words;
  while (rest[0] === "gap") {
    lead.push("gap");
    rest = rest.slice(1);
  }
  const c = !rest.includes("gap") && cycle(rest);
  if (c) return [...(lead.length ? [lead.length === 1 ? "a gap" : `${lead.length} gaps`] : []), c].join(", ");
  const out: string[] = [];
  for (let i = 0; i < words.length; ) {
    let j = i;
    while (j < words.length && words[j] === words[i]) j++;
    const w = words[i];
    const n = j - i;
    if (w === "gap") out.push(n === 1 ? "a gap" : `${n} gaps`);
    else if (w.startsWith("past ")) out.push(w);
    else out.push(n === 1 ? article(w) : `${n} ${pluralOf(w)}`);
    i = j;
  }
  return out.join(", ");
}

function half(b: Builder, c: Colour, corner: "bl" | "br" | "tl" | "tr", x: number, y: number) {
  // a corner triangle's right angle sits at the first point, its legs along a→b and to the left of it
  if (corner === "bl") return b.on("tri-right", c, [x, y], [x + 1, y]);
  if (corner === "br") return b.on("tri-right", c, [x + 1, y], [x + 1, y + 1]);
  if (corner === "tr") return b.on("tri-right", c, [x + 1, y + 1], [x, y + 1]);
  return b.on("tri-right", c, [x, y + 1], [x, y]);
}

const CORNER_WORDS = { bl: "bottom left", br: "bottom right", tl: "top left", tr: "top right" };

/** The pieces of one square-grid cell, in the order they go down. */
function cell(token: string, x: number, y: number): Piece[] | "gap" | "covered" {
  if (token === ".") return "gap";
  if (token === "-") return "covered";
  if (/^[ROYGBP]$/.test(token)) {
    const c = colourOf(token);
    return [{ word: `${c} square`, add: (b) => b.on("square", c, [x, y], [x + 1, y]) }];
  }
  if (/^[ROYGBP]\+$/.test(token)) {
    const c = colourOf(token[0]);
    return [{ word: `big ${c} square`, add: (b) => b.on("square-large", c, [x, y - 1], [x + 2, y - 1]) }];
  }
  const m = /^([ROYGBP.])([ROYGBP.])([/\\])$/.exec(token);
  if (!m) throw new Error(`no such cell: ${token}`);
  const [first, second] = m[3] === "/" ? (["tl", "br"] as const) : (["bl", "tr"] as const);
  const out: Piece[] = [];
  const parts: [string, "bl" | "br" | "tl" | "tr"][] = [
    [m[1], first],
    [m[2], second],
  ];
  const both = m[1] !== "." && m[2] !== ".";
  for (const [k, corner] of parts) {
    if (k === ".") continue;
    const c = colourOf(k);
    out.push({ word: both ? `${c} corner triangle (${CORNER_WORDS[corner]})` : `${c} corner triangle in the ${CORNER_WORDS[corner]}`, add: (b) => half(b, c, corner, x, y) });
  }
  if (both) {
    const [a, z] = out;
    return [{ word: `square of two corner triangles, ${a.word.replace(" corner triangle", "")} and ${z.word.replace(" corner triangle", "")}`, add: a.add }, { word: "", add: z.add }];
  }
  return out;
}

const ROW_NAMES = (r: number) => (r === 0 ? "Top row" : "Next row down");

/** Lay the rows of a square-grid picture, one step a row (a long row takes two), with words for the grown-up. */
export function squareMosaic(b: Builder, rows: string[], opening: string, x0 = 0, y0 = 0) {
  const grid = rowsCheck(rows).map((r) => r.trim().split(/\s+/));
  const h = grid.length;
  grid.forEach((tokens, r) => {
    const y = y0 + h - 1 - r;
    let open: { words: string[]; adds: ((b: Builder) => number)[] } = { words: [], adds: [] };
    const parts: typeof open[] = [];
    const flush = () => {
      if (open.adds.length) parts.push(open);
      open = { words: [], adds: [] };
    };
    tokens.forEach((t, i) => {
      const c = cell(t, x0 + i, y);
      if (c === "gap") return open.words.push("gap");
      if (c === "covered") {
        // the cells under a big square: said once, where the big square's lower half starts
        if (i > 0 && tokens[i - 1] === "-") return;
        if (i > 0 && /\+$/.test(tokens[i - 1])) return;
        return open.words.push("past the big square");
      }
      if (open.adds.length + c.length > MAX_STEP) flush();
      for (const p of c) {
        if (p.word) open.words.push(p.word);
        open.adds.push(p.add);
      }
    });
    flush();
    parts.forEach((part, k) => {
      // trailing gaps say nothing
      while (part.words.at(-1) === "gap") part.words.pop();
      part.adds.forEach((f) => f(b));
      const lead = r === 0 && k === 0 ? `${opening} ${ROW_NAMES(r)}, left to right` : parts.length > 1 ? `${ROW_NAMES(r)}, ${k === 0 ? "left part" : "then on to the right"}` : `${ROW_NAMES(r)}, left to right`;
      b.step(`${lead}: ${runs(part.words)}.`);
    });
  });
}

/** Lay the rows of a triangle-grid picture, one step a row (or two for a long one). */
export function triangleMosaic(b: Builder, rows: string[], opening: string, x0 = 0, y0 = 0) {
  const h = rows.length;
  rows.forEach((row, r) => {
    const k = h - 1 - r;
    const y = y0 + k * EQ_H;
    const cells = row.replace(/\s+/g, "").split("");
    const parts: { words: string[]; adds: ((b: Builder) => number)[] }[] = [{ words: [], adds: [] }];
    cells.forEach((ch, j) => {
      const x = x0 + j / 2;
      const up = (j + k) % 2 === 0;
      let part = parts[parts.length - 1];
      if (ch === ".") return part.words.push("gap");
      if (part.adds.length === MAX_STEP) parts.push((part = { words: [], adds: [] }));
      const c = colourOf(ch);
      part.adds.push((b) => (up ? b.on("tri-equilateral", c, [x, y], [x + 1, y]) : b.on("tri-equilateral", c, [x + 1, y + EQ_H], [x, y + EQ_H])));
      part.words.push(`${c} triangle`);
    });
    const firstUp = k % 2 === 0;
    parts.forEach((part, p) => {
      while (part.words.at(-1) === "gap") part.words.pop();
      part.adds.forEach((f) => f(b));
      const how = firstUp ? "the first pointing up, then down, up and so on" : "the first pointing down, then up, down and so on";
      const lead =
        r === 0 && p === 0
          ? `${opening} ${ROW_NAMES(r)}, left to right, ${how}`
          : p === 0
            ? `${ROW_NAMES(r)}, left to right, ${how}`
            : `${ROW_NAMES(r)}, carrying on to the right`;
      b.step(`${lead}: ${runs(part.words)}.`);
    });
  });
}

export interface TotMeta {
  id: string;
  title: string;
  theme: Theme;
  done: string;
}

/** A finished 0–3 project: flat unless it stands up, stars by size. */
export function tot(b: Builder, meta: TotMeta, flat = true): Project {
  const n = b.placed.length;
  return b.build({ ...meta, age: "t", stars: starsFor(n), ...(flat ? { flat: true } : {}) });
}

export type { ShapeId };

/** Rows for `triangleMosaic` from a picture function: each triangle of a `rows` × `slots` grid is coloured by its
    centre (x across, y up, in square edges), or left out for ".". */
export function triangleRows(rows: number, slots: number, colourAt: (x: number, y: number) => string): string[] {
  const out: string[] = [];
  for (let k = rows - 1; k >= 0; k--) {
    let s = "";
    for (let j = 0; j < slots; j++) {
      const up = (j + k) % 2 === 0;
      s += colourAt(j / 2 + 0.5, k * EQ_H + (up ? EQ_H / 3 : (2 * EQ_H) / 3));
    }
    out.push(s.replace(/\.+$/, ""));
  }
  return out;
}

/** Every row of a square-grid picture has the same number of cells. */
export function rowsCheck(rows: string[]) {
  const n = rows[0].trim().split(/\s+/).length;
  rows.forEach((r, i) => {
    const m = r.trim().split(/\s+/).length;
    if (m !== n) throw new Error(`row ${i + 1} has ${m} cells, not ${n}: ${r}`);
  });
  return rows;
}

/* ---------- 2.6: points, big-square pictures and big-square shapes ---------- */

export type Edge = "top" | "right" | "bottom" | "left";

export interface Point {
  /** the square-grid cell the triangle sits against, [column, row], rows counted from the top */
  cell: [number, number];
  edge: Edge;
  colour: string;
  shape?: "tri-equilateral" | "tri-isosceles-tall";
}

/** Triangles laid flat against the outside edge of a picture's cells, pointing away from them: roofs, rays, petals,
    fins, spikes, crown points and bunting. `rows` is the picture's height in cells, as for `squareMosaic`. One step;
    the words are the author's. */
export function points(b: Builder, rows: number, pts: Point[], say: string, x0 = 0, y0 = 0) {
  if (pts.length > MAX_STEP) throw new Error(`${pts.length} points in one step`);
  for (const p of pts) {
    const x = x0 + p.cell[0];
    const y = y0 + rows - 1 - p.cell[1];
    const c = colourOf(p.colour);
    const s = p.shape ?? "tri-equilateral";
    // each pair runs so that the outside of the cell is on its left
    const [a, z]: [[number, number], [number, number]] =
      p.edge === "top" ? [[x, y + 1], [x + 1, y + 1]] : p.edge === "right" ? [[x + 1, y + 1], [x + 1, y]] : p.edge === "bottom" ? [[x + 1, y], [x, y]] : [[x, y], [x, y + 1]];
    b.on(s, c, a, z);
  }
  b.step(say);
}

/** A picture drawn in big squares: each token of `rows` is a big square (R O Y G B P) or "." for none, and becomes the
    2 × 2 cells `squareMosaic` reads. Mix in small squares by editing the result. */
export function bigCells(rows: string[]): string[] {
  const out: string[] = [];
  for (const r of rows) {
    const t = r.trim().split(/\s+/);
    out.push(t.map((k) => (k === "." ? ". ." : `${k}+ -`)).join(" "));
    out.push(t.map((k) => (k === "." ? ". ." : "- -")).join(" "));
  }
  return out;
}

const Q = Math.PI / 2;

/** A big square lying flat with its corner at (x, y, z), covering x..x+2 and z..z+2. */
export function bigFlat(b: Builder, colour: Colour, x: number, y: number, z: number) {
  return b.add("square-large", colour, [x, y, z + 2], [-Q, 0]);
}

/** Four big squares standing round the 2 × 2 cell at (x, z), at height y: front, right, back, left. */
export function bigRing(b: Builder, colour: Colour, x: number, z: number, y: number) {
  b.wallX("square-large", colour, x, y, z + 2);
  b.wallZ("square-large", colour, x + 2, y, z);
  b.wallX("square-large", colour, x, y, z);
  b.wallZ("square-large", colour, x, y, z);
}

/** A big cube: a big square flat, four standing round it, one on top. Three steps, six big squares. */
export function bigCube(b: Builder, colour: Colour, x: number, z: number, says: [string, string, string]) {
  bigFlat(b, colour, x, 0, z);
  b.step(says[0]);
  bigRing(b, colour, x, z, 0);
  b.step(says[1]);
  bigFlat(b, colour, x, 2, z);
  b.step(says[2]);
}

/** A tunnel along x: two big squares standing face to face, two apart, and one across the top, in one step. */
export function bigTunnel(b: Builder, colour: Colour, roof: Colour, x: number, z: number, say: string) {
  // one step: the two walls only stand once the roof joins them
  b.wallX("square-large", colour, x, 0, z + 2);
  b.wallX("square-large", colour, x, 0, z);
  bigFlat(b, roof, x, 2, z);
  b.step(say);
}
