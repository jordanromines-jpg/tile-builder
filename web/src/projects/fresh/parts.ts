/* Small helpers shared by the 2.3 plans. */
import { EQ_H, type Colour } from "../../engine/catalog";
import type { Builder } from "../helpers";
import type { P, Studio, Tri } from "../studio";

/** Fins out from the four corners of a w × d tower on the table at (x, z), diagonally. */
export function corners(x: number, z: number, w = 1, d = 1): { corner: P; out: P }[] {
  return [
    { corner: [x + w, z + d], out: [1, 1] },
    { corner: [x, z + d], out: [-1, 1] },
    { corner: [x, z], out: [-1, -1] },
    { corner: [x + w, z], out: [1, -1] },
  ];
}

/** Fins out from the corners of a triangle, away from its middle. */
export function triCorners(t: Tri): { corner: P; out: P }[] {
  const m: P = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
  return t.map((p) => ({ corner: p, out: [p[0] - m[0], p[1] - m[1]] as P }));
}

/** The sides of a path as [from, to] pairs (closed: the last joins the first). */
export function sides(pts: P[], closed = true): [P, P][] {
  const out: [P, P][] = pts.slice(0, -1).map((p, i) => [p, pts[i + 1]]);
  if (closed) out.push([pts[pts.length - 1], pts[0]]);
  return out;
}

/** Cells along a row or a column, for rugs. */
export const row = (x0: number, x1: number, z: number): [number, number][] => Array.from({ length: x1 - x0 }, (_, i) => [x0 + i, z]);
export const col = (x: number, z0: number, z1: number): [number, number][] => Array.from({ length: z1 - z0 }, (_, i) => [x, z0 + i]);

/** The unit triangle on the side p → q of a shape, pointing away from the shape's middle c. */
export function triOut(c: P, p: P, q: P): Tri {
  const mx = (p[0] + q[0]) / 2;
  const mz = (p[1] + q[1]) / 2;
  const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
  let n: P = [-(q[1] - p[1]) / d, (q[0] - p[0]) / d];
  if (n[0] * (mx - c[0]) + n[1] * (mz - c[1]) < 0) n = [-n[0], -n[1]];
  const h = Math.sqrt(3) / 2;
  return [p, q, [Math.round((mx + n[0] * h) * 1e9) / 1e9, Math.round((mz + n[1] * h) * 1e9) / 1e9]];
}

/** Out from the middle c through the point p, as a direction for a fin. */
export const away = (c: P, p: P): P => [p[0] - c[0], p[1] - c[1]];

/** Three squares in a U on the side p → q of a shape, sticking out away from its middle c: a foot or a leg joined to
    the side at both ends, so it can't swing as a fin on one edge does (R14). */
export function uOut(c: P, p: P, q: P): P[] {
  const [, , apex] = triOut(c, p, q);
  // the side's outward normal, from the triangle's apex over the side's middle
  const h = Math.sqrt(3) / 2;
  const n: P = [(apex[0] - (p[0] + q[0]) / 2) / h, (apex[1] - (p[1] + q[1]) / 2) / h];
  const r = (v: number) => Math.round(v * 1e9) / 1e9;
  return [p, [r(p[0] + n[0]), r(p[1] + n[1])], [r(q[0] + n[0]), r(q[1] + n[1])], q];
}

/** The unit triangles inside a big triangle of side n on the triangle grid L, corner (i, j), row by row, with the
    tiles that must go on together (`atoms`): each upside-down one goes on with the one before it, so that every tile
    rests on two edges at the end of its step. */
export function bigTri(L: (i: number, j: number) => P, i0: number, j0: number, n: number): { tris: Tri[]; atoms: number[] } {
  const tris: Tri[] = [];
  const atoms: number[] = [];
  const up = (i: number, j: number): Tri => [L(i0 + i, j0 + j), L(i0 + i + 1, j0 + j), L(i0 + i, j0 + j + 1)];
  const down = (i: number, j: number): Tri => [L(i0 + i + 1, j0 + j), L(i0 + i + 1, j0 + j + 1), L(i0 + i, j0 + j + 1)];
  for (let j = 0; j < n; j++) {
    tris.push(up(0, j));
    atoms.push(1);
    for (let i = 0; i + j < n - 1; i++) {
      tris.push(up(i + 1, j), down(i, j));
      atoms.push(2);
    }
  }
  return { tris, atoms };
}

/** The corners of a big triangle of side n, unit by unit, going round. */
export function bigTriPath(L: (i: number, j: number) => P, i0: number, j0: number, n: number): P[] {
  const pts: P[] = [];
  for (let k = 0; k < n; k++) pts.push(L(i0 + k, j0));
  for (let k = 0; k < n; k++) pts.push(L(i0 + n - k, j0 + k));
  for (let k = 0; k < n; k++) pts.push(L(i0, j0 + n - k));
  return pts;
}

/** A truss bridge along x on the table (lines z = 0 and 1): n triangles the right way up on each side from x0, an
    upside-down one between each two and one past each end (so no triangle has a free slanted edge), and a road of
    squares laid flat across on the upside-down ones. It goes up a bay at a time, both sides and the road across
    together, so the two thin sides are tied before the hand lets go (R14). */
export function trussBridge(s: Studio, name: string, x0: number, n: number, up: Colour, down: Colour, road: Colour) {
  const deck = (b: Builder, j: number) => b.add("square", road, [x0 + j - 0.5, EQ_H, 1], [-Math.PI / 2, 0]);
  const downTri = (b: Builder, j: number, z: number) => b.add("tri-equilateral", down, [x0 + j - 0.5, EQ_H, z], [Math.PI, 0]);
  for (let j = 0; j <= n; j++) {
    const end = j === n;
    s.part(
      0,
      (b) => {
        const before = b.placed.length;
        for (const z of [1, 0]) {
          if (!end) b.wallX("tri-equilateral", up, x0 + j, 0, z);
          downTri(b, j, z);
        }
        deck(b, j);
        return b.placed.length - before;
      },
      () =>
        j === 0
          ? `${name}: on each side stand a triangle with an upside-down one beside it, its point on the table, then lay a road square across the two upside-down ones.`
          : end
            ? `${name}: an upside-down triangle on each side to finish the end, and the last road square across.`
            : `${name}: on each side one more triangle and an upside-down one beside it, then a road square across.`,
    );
  }
}

const PIXEL: Record<string, Colour> = { r: "red", o: "orange", y: "yellow", g: "green", b: "blue", p: "purple" };

/** A standing wall of squares along x from x0 on line z, a picture in it: `rows` from the top down, one letter a square
    (r o y g b p). Built a layer at a time from the bottom, with a square going back at each end of every row so the
    wall cannot fold over. */
export function pixelWall(s: Studio, name: string, x0: number, z: number, rows: string[]) {
  rows
    .slice()
    .reverse()
    .forEach((line, y) =>
      s.part(
        2 * y,
        (b) => {
          // a square going back at each end holds the row upright (R10)
          b.wallZ("square", PIXEL[line[0]], x0, y, z - 1);
          [...line].forEach((ch, i) => b.wallX("square", PIXEL[ch], x0 + i, y, z));
          b.wallZ("square", PIXEL[line[line.length - 1]], x0 + line.length, y, z - 1);
          return line.length + 2;
        },
        (k, of) => (k === 0 ? `${name}, row ${y + 1} from the bottom: a square going back at the left end, then squares along, matching the colours in the picture.` : `${name}: keep going${k === of - 1 ? ", and a square going back at the right end" : ""}.`),
      ),
    );
}
