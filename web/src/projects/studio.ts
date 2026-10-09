/* The shape kit (2.3): the layout kit (kit.ts) plus parts off the square grid. Walls that walk at any angle (hexagons,
   octagons, stars, zigzags, letters), flat triangle lids on the triangle grid, three-triangle pyramids, big squares,
   corner-triangle fins, and flat pictures on the table. Nothing stands loose on a top edge: real tiles there flop over (R10). The plan is still written by hand
   (D3); the kit places the tiles and writes the steps layer by layer, as the checker's rules ask (R5, R6, R7).
   Points are [x, z] on the table: x right, z towards the child. */
import { EQ_H, type Colour, type ShapeId } from "../engine/catalog";
import type { Builder } from "./helpers";
import { Site } from "./kit";

export type P = [number, number];
export type Tri = [P, P, P];

const Q = Math.PI / 2;
/** A face of a regular tetrahedron leans in this far from upright. */
const TETRA_TILT = -Math.asin(1 / 3);
const ORD = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const r9 = (v: number) => Math.round(v * 1e9) / 1e9;
const key = (p: P) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`;
const turnOf = (a: P, b: P) => Math.atan2(-(b[1] - a[1]), b[0] - a[0]);

/** The triangle grid: point (i, j), rows running away from the child. */
export const lattice =
  (ox = 0, oz = 0) =>
  (i: number, j: number): P => [r9(ox + i + j / 2), r9(oz - j * EQ_H)];

/** A walk of unit steps from `start`, first heading in degrees (0 right, 90 away from the child), turning left by each
    angle in `turns` at each joint (negative turns right). */
export function turtle(start: P, heading: number, turns: number[]): P[] {
  const pts: P[] = [start];
  let h = heading;
  const go = () => {
    const [x, z] = pts[pts.length - 1];
    const r = (h * Math.PI) / 180;
    pts.push([r9(x + Math.cos(r)), r9(z - Math.sin(r))]);
  };
  go();
  for (const t of turns) {
    h += t;
    go();
  }
  return pts;
}

/** The corners of a regular polygon with unit sides, its first side from `start` at `heading`. */
export function polygon(start: P, sides: number, heading = 0): P[] {
  return turtle(start, heading, Array<number>(sides - 2).fill(360 / sides));
}

/** A hexagon round lattice point (i, j) of `L`: its corners and its six triangles, going round. */
export function hexagon(L: (i: number, j: number) => P, i: number, j: number) {
  const ring: [number, number][] = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
  const corners = ring.map(([a, b]) => L(i + a, j + b));
  const c = L(i, j);
  const tris = corners.map((p, k) => [p, corners[(k + 1) % 6], c] as Tri);
  return { corners, tris, centre: c };
}

/** The twelve corners of a six-point star round lattice point (i, j), and its twelve triangles: the six points first
    (each rests on two walls), then the hexagon, each beside the last. */
export function star(L: (i: number, j: number) => P, i: number, j: number) {
  const h = hexagon(L, i, j);
  const tips: [number, number][] = [[1, 1], [-1, 2], [-2, 1], [-1, -1], [1, -2], [2, -1]];
  const corners: P[] = [];
  const points: Tri[] = [];
  h.corners.forEach((p, k) => {
    const q = h.corners[(k + 1) % 6];
    const t = L(i + tips[k][0], j + tips[k][1]);
    corners.push(p, t);
    points.push([p, q, t]);
  });
  return { corners, tris: [...points, ...h.tris], centre: h.centre };
}

/** The unit triangle with base a → b whose third corner lies on the given side (+1 left of a → b seen from above). */
export function triOn(a: P, b: P, side: 1 | -1 = 1): Tri {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const mx = (a[0] + b[0]) / 2;
  const mz = (a[1] + b[1]) / 2;
  return [a, b, [r9(mx + side * dz * EQ_H), r9(mz - side * dx * EQ_H)]];
}

interface Flat {
  shape: ShapeId;
  colour: Colour;
  /** the base edge; the tile lies on the side of `toward` */
  a: P;
  b: P;
  toward: P;
}

export class Studio extends Site {
  /** walls already placed, by height and ends, so shapes side by side share a wall */
  private made = new Set<string>();

  /** Anything else, as its own group: tiles added by `add`, at the given build level (2y walls, 2y − 1 floors). */
  part(level: number, add: (b: Builder) => number, say: (k: number, of: number) => string, pyramid = false, atoms?: number[]) {
    this.push(level, add, say, pyramid, atoms);
  }

  /** Walls of squares (or another standing shape) along the points `pts`, `height` layers from `base`. A closed path
      joins the last point to the first. `gap` leaves out one side on the bottom layer for a door; the layer above
      finishes with the square over it, so it rests on both neighbours. */
  walls(
    name: string,
    pts: P[],
    height: number,
    colours: Colour[],
    o: { closed?: boolean; base?: number; gap?: number; what?: string; shape?: ShapeId; level?: (y: number) => number } = {},
  ) {
    const base = o.base ?? 0;
    const segs: [P, P][] = pts.slice(0, -1).map((p, i) => [p, pts[i + 1]]);
    if (o.closed) segs.push([pts[pts.length - 1], pts[0]]);
    const shape = o.shape ?? "square";
    for (let y = base; y < base + height; y++) {
      let order = segs.map((_, i) => i);
      // the bottom layer starts just after the door, so every square goes on beside the last
      if (o.gap !== undefined && y === base) order = [...order.slice(o.gap + 1), ...order.slice(0, o.gap)];
      else if (o.gap !== undefined) order = [...order.slice(o.gap + 1), ...order.slice(0, o.gap + 1)];
      order = order.filter((i) => {
        const k = [key(segs[i][0]), key(segs[i][1])].sort().join("|") + `|${y}`;
        if (this.made.has(k)) return false;
        this.made.add(k);
        return true;
      });
      if (!order.length) continue;
      const colour = colours[(y - base) % colours.length];
      const n = order.length;
      const door = o.gap !== undefined;
      // (`level` builds a part out of the usual layer order: an arm both layers high before the next, R14)
      this.push(
        o.level?.(y) ?? 2 * y,
        (b) => {
          order.forEach((i) => b.stand(shape, colour, segs[i][0], segs[i][1], y));
          return n;
        },
        (k, of) => {
          const who = cap(name);
          if (y === base) {
            const start = `${who}: stand ${n === 1 ? "a square" : `${n} squares`} ${o.what ?? "in a line"}, each one joined to the last${door ? ", leaving a gap for the door" : ""}.`;
            if (k === 0) return start;
            return k === of - 1 ? `${who}: ${o.closed ? "close the shape" : "finish the line"}.` : `${who}: keep going round.`;
          }
          if (k === 0) return `${who}, ${ORD[y - base] ?? "next"} layer: stack squares on the top edges${door && y === base + 1 ? ", starting beside the door. The square over the door goes on last, resting on its two neighbours" : ""}.`;
          return k === of - 1 ? `${who}: finish this layer.` : `${who}: keep stacking round.`;
        },
      );
    }
    return { pts, top: base + height };
  }

  /** Flat tiles, each laid by its base edge on the side of a point: a lid of triangles, a picture on the table. */
  flats(name: string, tiles: Flat[], y: number, what = "a lid", atoms?: number[], last = false) {
    this.push(
      last ? 1000 : y === 0 ? -1 : 2 * y - 1,
      (b) => {
        for (const t of tiles) {
          const d: P = [t.b[0] - t.a[0], t.b[1] - t.a[1]];
          const left = (t.toward[0] - t.a[0]) * d[1] - (t.toward[1] - t.a[1]) * d[0];
          const [a, c] = left > 0 ? [t.a, t.b] : [t.b, t.a];
          b.add(t.shape, t.colour, [a[0], y, a[1]], [-Q, turnOf(a, c)]);
        }
        return tiles.length;
      },
      (k, of) => {
        const who = cap(name);
        if (y === 0) return k === 0 ? `${who}: lay ${what} flat on the table, tile by tile.` : `${who}: ${k === of - 1 ? "finish it" : "keep laying tiles flat"}.`;
        if (k === 0) return `${who}: lay ${what}, tiles flat on top, each one beside the last. Each rests on two edges.`;
        return k === of - 1 ? `${who}: finish ${what}.` : `${who}: keep laying tiles flat.`;
      },
      false,
      atoms,
    );
  }

  /** Short triangles flat over unit triangles (a hexagon's six, a star's twelve), in order, each beside the last. */
  triLid(name: string, tris: Tri[], y: number, colour: Colour | ((i: number) => Colour), what = "a lid", atoms?: number[], last = false) {
    const c = typeof colour === "function" ? colour : () => colour;
    this.flats(name, tris.map((t, i) => ({ shape: "tri-equilateral" as ShapeId, colour: c(i), a: t[0], b: t[1], toward: t[2] })), y, what, atoms, last);
  }

  /** Three short triangles leaning together over the unit triangle `t` at height y, until their tips meet. */
  /** (`last`: on the final steps, after a roof that braces what it leans on, R14) */
  tetra(name: string, t: Tri, y: number, colour: Colour, last = false) {
    this.push(
      last ? 1000 : 2 * y,
      (b) => {
        for (let k = 0; k < 3; k++) {
          const p = t[k];
          const q = t[(k + 1) % 3];
          const r = t[(k + 2) % 3];
          const left = (r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0]);
          const [a, c] = left > 0 ? [p, q] : [q, p];
          b.add("tri-equilateral", colour, [a[0], y, a[1]], [TETRA_TILT, turnOf(a, c)]);
        }
        return 3;
      },
      () => `${cap(name)}: lean three triangles together until their tips meet. Hold them at the top.`,
      true,
    );
  }

  /** Corner triangles standing out from a tower's corners on the table, upright side against the corner: fins. A fin
      swings on its corner and creeps when the walls it hangs from are held from above by a hand (R14), so on a build
      with storeys put them `last`: the final step, with nothing above to hold. */
  fins(name: string, at: { corner: P; out: P }[], colour: Colour, what = "fins", last = false) {
    this.push(
      last ? 1000 : 0,
      (b) => {
        at.forEach(({ corner, out }) => {
          const l = Math.hypot(out[0], out[1]);
          b.stand("tri-right", colour, corner, [r9(corner[0] + out[0] / l), r9(corner[1] + out[1] / l)], 0);
        });
        return at.length;
      },
      (k, of) => (k === 0 ? `${cap(name)}: stand corner triangles out from the corners, the straight side against the corner: ${what}.` : `${cap(name)}: more ${what}${k === of - 1 ? " to finish" : ""}.`),
    );
  }

  /** Squares flat on the table over grid cells [x, z] (each cell x..x+1, z..z+1), one colour each. */
  rug(name: string, cells: [number, number][], colour: Colour | ((i: number) => Colour), what = "the picture") {
    const c = typeof colour === "function" ? colour : () => colour;
    this.flats(name, cells.map(([x, z], i) => ({ shape: "square" as ShapeId, colour: c(i), a: [x, z + 1] as P, b: [x + 1, z + 1] as P, toward: [x, z] as P })), 0, what);
  }

  /** A big square flat on the table over x..x+2, z..z+2: a landing pad, a pond, a stage. */
  pad(name: string, x: number, z: number, colour: Colour, what = "a big square") {
    this.flats(name, [{ shape: "square-large", colour, a: [x, z + 2], b: [x + 2, z + 2], toward: [x, z] }], 0, what);
  }

  /** A room of four big squares on the table over x..x+2, z..z+2, with a big square lid. Build something two layers
      high before the lid goes on (R5 counts layers across the whole build). */
  bigRoom(name: string, x: number, z: number, colour: Colour, lid: Colour | false = colour) {
    const pts: P[] = [[x, z + 2], [x + 2, z + 2], [x + 2, z], [x, z]];
    this.push(
      0,
      (b) => {
        pts.forEach((p, i) => b.stand("square-large", colour, p, pts[(i + 1) % 4], 0));
        return 4;
      },
      (k, of) => (k === 0 ? `${cap(name)}: stand big squares in a ring${of > 1 ? "" : " of four"}, each one joined to the last.` : `${cap(name)}: close the big ring.`),
    );
    if (lid) this.flats(name, [{ shape: "square-large", colour: lid, a: [x, z + 2], b: [x + 2, z + 2], toward: [x, z] }], 2, "a big square lid");
    return { name, x, z, w: 2, d: 2, top: 2 };
  }
}
