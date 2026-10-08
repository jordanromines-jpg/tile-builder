/* R10, "it holds up" (2.3): the joints of real magnet tiles are hinges. Two flat tiles side by side fold at their join,
   a tile held by one edge swings, and a straight wall folds over at its seams. So:
   - R10a: a flat tile above the table rests on at least two top edges of standing or leaning tiles; edges it shares
     with other flat tiles do not hold it up. The one exception is a fan of six triangles round a point whose outer
     edges are all held: six unit triangles round a point cannot sag without stretching, so the fan is locked.
   - R10b: every tile, except one lying flat on the table, is held along at least two of its edges, by other tiles or,
     for a tile standing on it, the table. A flag on top of a wall hangs by one edge.
   - R10c: standing tiles in one plane, on one layer, joined side by side make a row; every row touches, at a side or
     top edge, a tile out of its plane (a wall at an angle, a lid, a leaning tile). A tile's bottom edge is a hinge,
     like the table, so it does not brace.
   Checked on the finished build: a child holds a wall while building the corner that braces it.
   A crash obstacle (role "crash", 2.7) is built to be knocked over by a truck, so it skips R10a and R10b. It keeps
   R10c (2.8): built to fall is not built to fold, so a crash wall stands until it is hit, with a corner, a return or a
   box. Only a single row standing on the table with nothing on it (a domino, a row of skittles) may stand alone. */
import { dot, type V3 } from "./geometry";
import type { Analysis } from "./check";
import type { Problem } from "./problems";
import type { Project } from "./types";

const key = (v: V3) => v.map((x) => (Math.abs(x) < 0.005 ? 0 : x).toFixed(2)).join(",");

function coplanar(a: Analysis, i: number, j: number): boolean {
  const n = a.normals[i];
  return Math.abs(Math.abs(dot(n, a.normals[j])) - 1) < 1e-3 && Math.abs(dot(n, a.polys[j][0]) - dot(n, a.polys[i][0])) < 1e-3;
}

/** The edges of flat tile i that rest on a standing or leaning tile below it (a roof on top holds nothing up). */
function restingEdges(a: Analysis, i: number): Set<number> {
  const out = new Set<number>();
  const y = a.polys[i][0][1];
  a.meets[i].forEach((es, j) => {
    if (a.orient[j] !== "flat" && Math.max(...a.polys[j].map((v) => v[1])) <= y + 1e-3) es.forEach((e) => out.add(e));
  });
  return out;
}

/** Flat tiles above the table that are held: two resting edges, or a locked fan of six triangles. */
export function heldFlats(project: Project, a: Analysis): Set<number> {
  const n = project.placed.length;
  const flats = [...Array(n).keys()].filter((i) => a.orient[i] === "flat" && !a.onTable[i]);
  const held = new Set(flats.filter((i) => restingEdges(a, i).size >= 2));
  // fans: triangles grouped by each corner they have
  const around = new Map<string, number[]>();
  for (const i of flats) {
    if (a.polys[i].length !== 3) continue;
    for (const v of a.polys[i]) around.set(key(v), [...(around.get(key(v)) ?? []), i]);
  }
  for (let grew = true; grew; ) {
    grew = false;
    around.forEach((tris, k) => {
      if (tris.length !== 6 || tris.every((i) => held.has(i))) return;
      // each triangle's outer edge (the one away from the middle) rests on a wall or on a held flat tile
      const locked = tris.every((i) => {
        const e = a.polys[i].findIndex((v, m) => key(v) !== k && key(a.polys[i][(m + 1) % 3]) !== k);
        return restingEdges(a, i).has(e) || [...a.meets[i].entries()].some(([j, es]) => held.has(j) && es.has(e));
      });
      if (locked) {
        tris.forEach((i) => held.add(i));
        grew = true;
      }
    });
  }
  return held;
}

export function holdsProblems(project: Project, a: Analysis): Problem[] {
  const out: Problem[] = [];
  const n = project.placed.length;
  const held = heldFlats(project, a);
  const crash = (i: number) => project.placed[i].role === "crash";
  for (let i = 0; i < n; i++) {
    if (crash(i)) continue;
    if (a.orient[i] === "flat" && !a.onTable[i] && !held.has(i)) out.push({ rule: "R10", tile: i, message: "this flat tile would sag: it needs two edges resting on walls below, not just on other flat tiles" });
    if (!(a.orient[i] === "flat" && a.onTable[i])) {
      const edges = new Set<number>();
      a.meets[i].forEach((es) => es.forEach((e) => edges.add(e)));
      if (a.onTable[i]) a.bottom[i].forEach((e) => edges.add(e));
      if (edges.size < 2) out.push({ rule: "R10", tile: i, message: "this tile hangs by one edge, so it would flop over" });
    }
  }
  const seen = new Set<number>();
  for (let i = 0; i < n; i++) {
    if (a.orient[i] !== "standing" || seen.has(i)) continue;
    const row = [i];
    seen.add(i);
    for (let k = 0; k < row.length; k++) {
      const t = row[k];
      a.meets[t].forEach((es, j) => {
        if (seen.has(j) || a.orient[j] !== "standing" || a.layer[j] !== a.layer[t] || !coplanar(a, t, j)) return;
        if ([...es].some((e) => a.bottom[t].includes(e))) return;
        seen.add(j);
        row.push(j);
      });
    }
    const braced = row.some((t) => [...a.meets[t].entries()].some(([j, es]) => !coplanar(a, t, j) && [...es].some((e) => !a.bottom[t].includes(e))));
    // a domino: crash tiles standing on the table, one row, with nothing resting on them
    const top = (t: number) => Math.max(...a.polys[t].map((v) => v[1]));
    const domino = row.every((t) => crash(t) && a.onTable[t] && ![...a.meets[t].keys()].some((j) => Math.min(...a.polys[j].map((v) => v[1])) >= top(t) - 1e-3));
    if (domino) continue;
    if (!braced) out.push({ rule: "R10", tile: i, message: `this wall of ${row.length} would fold over: nothing at an angle holds it` });
  }
  return out;
}
