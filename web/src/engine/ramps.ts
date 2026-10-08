/* R11, "ramps hold a truck" (2.7). A ramp is a square, big square or rectangle leaning from its base edge up to its top
   edge, for 1:64 Monster trucks to drive on. A truck is light, but a ramp is two hinges, so:
   - R11a: a ramp leans: it is neither flat nor standing.
   - R11b: its base edge rests on the table, on a support (any tile that is not a ramp) or on the top edge of the ramp
     below; its top edge rests on a support or on the base edge of the ramp above.
   - R11c: where two ramps meet at an angle the join is a hinge, so a support sits under it.
   - R11d: ramps in one plane may run on unsupported for one join: two tiles end to end between two held edges are taut
     and cannot sag (as the locked fan of R10a), but a third would let the middle drop. So no ramp has both ends on
     unsupported joins. */
import { dot } from "./geometry";
import type { Analysis } from "./check";
import type { Problem } from "./problems";
import type { Project } from "./types";

/** The edges of tile i whose two ends sit at its highest point. */
function topEdges(a: Analysis, i: number): number[] {
  const poly = a.polys[i];
  const y = Math.max(...poly.map((v) => v[1]));
  return poly.map((v, k) => (Math.abs(v[1] - y) < 1e-3 && Math.abs(poly[(k + 1) % poly.length][1] - y) < 1e-3 ? k : -1)).filter((k) => k >= 0);
}

export function rampProblems(project: Project, a: Analysis): Problem[] {
  const out: Problem[] = [];
  const isRamp = (i: number) => project.placed[i].role === "ramp";
  const parallel = (i: number, j: number) => Math.abs(Math.abs(dot(a.normals[i], a.normals[j])) - 1) < 1e-3;
  project.placed.forEach((_, i) => {
    if (!isRamp(i)) return;
    if (a.orient[i] !== "tilted") {
      out.push({ rule: "R11", tile: i, message: "a ramp leans: this one is flat or standing" });
      return;
    }
    /** what holds edge e: "table", "support", "join" (another ramp) or null */
    const holder = (e: number, bottom: boolean): "table" | "support" | "join" | "bent" | null => {
      if (bottom && a.onTable[i] && a.bottom[i].includes(e)) return "table";
      let found: "support" | "join" | "bent" | null = null;
      a.meets[i].forEach((es, j) => {
        if (!es.has(e)) return;
        if (!isRamp(j)) found = "support";
        else if (found !== "support") found = parallel(i, j) ? "join" : "bent";
      });
      return found;
    };
    const base = a.bottom[i].map((e) => holder(e, true)).find((h) => h) ?? null;
    const top = topEdges(a, i).map((e) => holder(e, false)).find((h) => h) ?? null;
    if (!base) out.push({ rule: "R11", tile: i, message: "this ramp's bottom edge rests on nothing: put it on the table, a support or the ramp below" });
    if (!top) out.push({ rule: "R11", tile: i, message: "this ramp's top edge rests on nothing: it needs a support under it, or the next ramp" });
    if (base === "bent" || top === "bent") out.push({ rule: "R11", tile: i, message: "two ramps meet at an angle here with nothing under the join: it would fold" });
    if (base === "join" || top === "join") out.push({ rule: "R11", tile: i, message: "two ramp tiles meet in mid-air here: the join is a hinge and a truck would fold it. Put a support or a brace under it" });
  });
  return out;
}
