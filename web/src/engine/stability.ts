/* R12, "it stands firm" (2.8). A build stands on its base, and a tall, narrow one tips: a hand brushes it, a truck
   lands beside it. So:
   - R12a: every structure (tiles joined to each other, leaving out crash tiles, which are built to fall, and tiles
     lying flat on the table, which add no width) is, at every whole height, at most k times as tall above that height
     as it is wide there, measured across its narrowest way. Checking every height, not just the table, means a low
     ring stuck to the foot of a tall thin tower doesn't count as widening it; a stepped tower (a ziggurat) passes.
     Structures joined together count as one, so tying a tower to its neighbour widens it. k is 4 for a Monster trucks
     build, which carries a moving load, and 6 for the rest.
   - R12b: in a Monster trucks build, a flat tile above the table that a truck can drive on rests on two opposite
     edges, so it spans between supports instead of perching on a corner. */
import type { Analysis } from "./check";
import type { Problem } from "./problems";
import type { Project } from "./types";

/** How many times its narrowest width a structure may be tall: trucks since 2.8, every project since 2.8.2. */
export const SLENDER = { trucks: 4, other: 6 };

/** The narrowest width of a set of points on the table (x, z), across every direction in 5° steps. */
function narrowest(pts: [number, number][]): number {
  let best = Infinity;
  for (let d = 0; d < 180; d += 5) {
    const c = Math.cos((d * Math.PI) / 180);
    const s = Math.sin((d * Math.PI) / 180);
    const proj = pts.map(([x, z]) => x * c + z * s);
    best = Math.min(best, Math.max(...proj) - Math.min(...proj));
  }
  return best;
}

/** Where the structure's tiles cross the level y, as points on the floor plan (x, z). */
function section(a: Analysis, tiles: number[], y: number): [number, number][] {
  const out: [number, number][] = [];
  for (const i of tiles) {
    const poly = a.polys[i];
    // only what reaches above y holds up what is above y: a ring that ends here doesn't widen the tower over it
    if (Math.max(...poly.map((v) => v[1])) <= y + 1e-3) continue;
    poly.forEach((p, k) => {
      const q = poly[(k + 1) % poly.length];
      if (Math.abs(p[1] - y) < 1e-3) out.push([p[0], p[2]]);
      else if ((p[1] - y) * (q[1] - y) < 0) {
        const t = (y - p[1]) / (q[1] - p[1]);
        out.push([p[0] + t * (q[0] - p[0]), p[2] + t * (q[2] - p[2])]);
      }
    });
  }
  return out;
}

/** Each structure's tiles, its height and how wide it is at each whole height from the table up. */
export function structures(project: Project, a: Analysis): { tiles: number[]; height: number; widths: number[] }[] {
  const n = project.placed.length;
  const skip = (i: number) => project.placed[i].role === "crash" || (a.orient[i] === "flat" && a.onTable[i]);
  const seen = new Array<boolean>(n).fill(false);
  const out: { tiles: number[]; height: number; widths: number[] }[] = [];
  for (let s = 0; s < n; s++) {
    if (seen[s] || skip(s)) continue;
    const tiles = [s];
    seen[s] = true;
    for (let k = 0; k < tiles.length; k++)
      for (const j of a.meets[tiles[k]].keys())
        if (!seen[j] && !skip(j)) {
          seen[j] = true;
          tiles.push(j);
        }
    const height = Math.max(...tiles.flatMap((i) => a.polys[i].map((v) => v[1])));
    const widths: number[] = [];
    for (let y = 0; y < height - 1e-3; y++) {
      const pts = section(a, tiles, y);
      // no tile crosses this height: nothing to tip (-1); a flat wall crossing it is 0 wide, and does tip
      widths.push(pts.length ? narrowest(pts) : -1);
    }
    out.push({ tiles, height, widths });
  }
  return out;
}

export function stabilityProblems(project: Project, a: Analysis): Problem[] {
  const out: Problem[] = [];
  const trucks = project.theme === "trucks";
  const k = trucks ? SLENDER.trucks : SLENDER.other;
  for (const s of structures(project, a)) {
    // a single layer can't tip far; a structure with no feet on the table is caught by R3
    if (s.height <= 1 + 1e-3) continue;
    const y = s.widths.findIndex((w, y) => w >= 0 && s.height - y > k * w + 1e-3);
    if (y >= 0)
      out.push({ rule: "R12", tile: s.tiles[0], message: `this part is ${round(s.height - y)} high above ${y ? `height ${y}` : "the table"}, where it is only ${round(s.widths[y])} wide: it would tip. Keep it at most ${k} times as high as it is wide, or tie it to a neighbour` });
  }
  if (trucks) {
    project.placed.forEach((p, i) => {
      if (p.role === "crash" || p.shape !== "square" && p.shape !== "square-large") return;
      if (a.orient[i] !== "flat" || a.onTable[i]) return;
      const y = a.polys[i][0][1];
      const rests = new Set<number>();
      a.meets[i].forEach((es, j) => {
        if (a.orient[j] !== "flat" && Math.max(...a.polys[j].map((v) => v[1])) <= y + 1e-3) es.forEach((e) => rests.add(e));
      });
      if (![0, 1].some((e) => rests.has(e) && rests.has(e + 2)))
        out.push({ rule: "R12", tile: i, message: "a truck drives on this flat tile, but it rests on a corner: rest it on two opposite edges" });
    });
  }
  return out;
}

const round = (v: number) => Math.round(v * 10) / 10;
