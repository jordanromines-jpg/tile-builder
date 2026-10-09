/* R13, "the truck can drive the course" (4.0a), for Monster trucks builds. A build names the pieces of its course and the
   route the truck takes; the route is compiled into legs (route.ts), and the truck, a box 1.0 × 0.67 × 0.62, is driven
   and flown along them:
   - R13a: the route's names are there and it compiles: each leg can be driven, each jump can reach where it lands.
   - R13b: each leg begins within half a square, at the same height, of where the last one ended.
   - R13c: a flight's arc, sampled every 0.02 s, touches no tile except the one it takes off from and the one it lands
     on, and comes down at least 0.3 square inside a surface, from a launch no faster than a toy truck can go.
   - R13d: a drive, a crush or a smash passes through no tile except those of the pieces it joins.
   - R13e: every tile built to be knocked down belongs to a car, a wall or a row of dominoes that the route hits.
   Each problem says which leg, and which tile. */
import { boxHits, poseOf, prepare, type Prepared } from "./box";
import { compileRoute, depthInside, footprint, planeAt, RouteError, type Leg } from "./route";
import { ARC_STEP, DRIVE_STEP, GRAVITY, JOIN_TOLERANCE, LANDING_MARGIN, LANDING_SETTLE, MAX_LAUNCH_SPEED, TRUCK_RIDE } from "./truck-size";
import type { Analysis } from "./check";
import type { V3 } from "./geometry";
import type { Problem } from "./problems";
import type { Feature, Project } from "./types";

const HEIGHT_TOLERANCE = 0.15;
const CAR_LIKE = ["car", "wall", "dominoes"];

const label = (l: Leg, k: number) => `leg ${k + 1} (${l.kind === "fly" ? `fly to ${l.target}` : `${l.kind} ${l.feature ?? l.target ?? "to a point"}`})`;
const near = (n: number) => n.toFixed(2);

/** The pieces of the course a point is on (within a hand's breadth of their edges, at their height). */
function standingOn(project: Project, p: V3): string[] {
  return (project.course?.features ?? [])
    .filter((f) => {
      if (!f.surface || f.kind === "car") return false;
      const y = planeAt(f, p[0], p[2]).y;
      return Math.abs(y - p[1]) <= 0.15 && depthInside(footprint(f), [p[0], p[2]]) >= -0.15;
    })
    .map((f) => f.name);
}

/** The tiles the truck may touch on a leg: the pieces it drives, flies from or to, crashes into, starts on and ends on,
    and those of the legs just before and after. */
function allowed(project: Project, legs: Leg[], k: number): Set<number> {
  const names = new Set<string>();
  for (const l of [legs[k - 1], legs[k], legs[k + 1]]) {
    if (l?.feature) names.add(l.feature);
    if (l?.target) names.add(l.target);
  }
  for (const p of [legs[k].from, legs[k].to]) standingOn(project, p).forEach((n) => names.add(n));
  const out = new Set<number>();
  for (const f of project.course?.features ?? []) if (names.has(f.name)) f.tiles.forEach((t) => out.add(t));
  return out;
}

export function runProblems(project: Project, a: Analysis, leg: number): Problem[] {
  if (project.theme !== "trucks") return [];
  const course = project.course;
  if (!course || !course.route.length) return [{ rule: "R13a", message: "this Monster trucks build has no route: say where the truck goes with b.route([...])" }];
  const out: Problem[] = [];
  const n = project.placed.length;
  for (const f of course.features) for (const t of f.tiles) if (t >= n) out.push({ rule: "R13a", message: `${f.name} points at tile ${t}, past the last tile` });
  const owner = new Map<number, Feature>();
  for (const f of course.features) for (const t of f.tiles) owner.set(t, f);

  out.push(...crashProblems(project, owner));

  let legs: Leg[];
  try {
    legs = compileRoute(project, leg);
  } catch (e) {
    if (!(e instanceof RouteError)) throw e;
    const item = course.route[e.item];
    out.push({ rule: "R13a", message: e.item >= 0 ? `route item ${e.item + 1} (${JSON.stringify(item)}): ${e.message}` : e.message });
    return out;
  }

  const tiles: Prepared[] = a.polys.map((p, i) => prepare(p, a.normals[i]));
  const touched = (pose: ReturnType<typeof poseOf>, skip: Set<number>): number => {
    for (let t = 0; t < tiles.length; t++) if (!skip.has(t) && boxHits(pose, tiles[t])) return t;
    return -1;
  };
  const namePart = (t: number) => (owner.get(t) ? ` (part of ${owner.get(t)!.name})` : "");

  legs.forEach((l, k) => {
    const next = legs[k + 1];
    // R13b
    if (next && next.run === l.run) {
      const gap = Math.hypot(l.to[0] - next.from[0], l.to[2] - next.from[2]);
      const drop = Math.abs(l.to[1] - next.from[1]);
      if (gap > JOIN_TOLERANCE + 1e-6 || drop > HEIGHT_TOLERANCE)
        out.push({ rule: "R13b", message: `${label(l, k)} ends ${near(gap)} squares${drop > HEIGHT_TOLERANCE ? ` and ${near(drop)} up or down` : ""} from where ${label(next, k + 1)} begins (more than half a square apart, or not at one height): add a lane, or {to: [x, y, z]}` });
    }
    const skip = allowed(project, legs, k);
    if (l.kind === "fly") {
      const f = l.fly!;
      // R13c
      if (f.speed > MAX_LAUNCH_SPEED) out.push({ rule: "R13c", message: `${label(l, k)} needs a launch of ${near(f.speed)} squares a second, faster than a toy truck goes (${MAX_LAUNCH_SPEED}): shorten the jump or raise the kicker` });
      const target = course.features.find((g) => g.name === l.target)!;
      // (a flight into a wall comes down nowhere: it ends at the wall's face)
      const depth = target.surface ? depthInside(footprint(target), [l.to[0], l.to[2]]) : Infinity;
      if (depth < LANDING_MARGIN) out.push({ rule: "R13c", message: `${label(l, k)} lands ${depth < 0 ? "off" : `only ${near(depth)} squares inside`} ${target.name}; it should come down at least ${LANDING_MARGIN} inside` });
      const vh = f.speed * Math.cos(f.angle);
      const steps = Math.ceil(f.time / ARC_STEP);
      for (let s = 0; s <= steps; s++) {
        const t = Math.min(s * ARC_STEP, f.time);
        let centre: V3 = [f.start[0] + f.heading[0] * vh * t, f.start[1] + f.speed * Math.sin(f.angle) * t - 0.5 * GRAVITY * t * t, f.start[2] + f.heading[1] * vh * t];
        // the last sample is the truck on the ground, its wheels exactly on the surface
        if (s === steps && target.surface) {
          const n = planeAt(target, l.to[0], l.to[2]).normal;
          centre = [l.to[0] + n[0] * TRUCK_RIDE, l.to[1] + n[1] * TRUCK_RIDE, l.to[2] + n[2] * TRUCK_RIDE];
        }
        // the nose follows the flight, and settles level with the surface it lands on over the last moments
        let pitch = Math.max(-0.35, Math.min(Math.PI / 6, Math.atan2(f.speed * Math.sin(f.angle) - GRAVITY * t, vh)));
        if (target.surface) {
          const n = planeAt(target, l.to[0], l.to[2]).normal;
          const along = Math.atan2(-(n[0] * f.heading[0] + n[2] * f.heading[1]), n[1]);
          const settle = Math.max(0, Math.min(1, (t - (f.time - LANDING_SETTLE)) / LANDING_SETTLE));
          pitch = (1 - settle) * pitch + settle * along;
        }
        const hit = touched(poseOf(centre, f.heading, pitch), skip);
        if (hit >= 0) {
          out.push({ rule: "R13c", tile: hit, message: `${label(l, k)}: the truck flying to ${target.name} hits this tile${namePart(hit)} ${near(t)} s after take-off, ${near(Math.hypot(centre[0] - l.from[0], centre[2] - l.from[2]))} squares from the lip, ${near(centre[1])} up` });
          break;
        }
      }
      return;
    }
    // R13d
    const dx = l.to[0] - l.from[0];
    const dz = l.to[2] - l.from[2];
    const run = Math.hypot(dx, dz);
    if (run < 1e-6) return;
    const h: [number, number] = [dx / run, dz / run];
    // (a crash leg that drops steeply is the truck falling through: it keeps its nose within 30° of level)
    const steep = Math.atan2(l.to[1] - l.from[1], run);
    const pitch = l.kind === "smash" || l.kind === "crush" ? Math.max(-Math.PI / 6, Math.min(Math.PI / 6, steep)) : steep;
    const nrm: V3 = [-h[0] * Math.sin(pitch), Math.cos(pitch), -h[1] * Math.sin(pitch)];
    const count = Math.max(1, Math.ceil(run / DRIVE_STEP));
    for (let s = 0; s <= count; s++) {
      const q = s / count;
      const p: V3 = [l.from[0] + dx * q + nrm[0] * TRUCK_RIDE, l.from[1] + (l.to[1] - l.from[1]) * q + nrm[1] * TRUCK_RIDE, l.from[2] + dz * q + nrm[2] * TRUCK_RIDE];
      const hit = touched(poseOf(p, h, pitch), skip);
      if (hit >= 0) {
        out.push({ rule: "R13d", tile: hit, message: `${label(l, k)}: the truck drives through this tile${namePart(hit)}, ${near(q * run)} squares along the leg, at ${near(p[0])}, ${near(p[2])}` });
        break;
      }
    }
  });
  return out;
}

/** R13e: tiles built to fall belong to something the truck hits. */
function crashProblems(project: Project, owner: Map<number, Feature>): Problem[] {
  const course = project.course;
  if (!course) return [];
  const hit = new Set<string>();
  for (const item of course.route) {
    if (typeof item === "object" && "through" in item) hit.add(item.through);
    if (typeof item === "object" && "jump" in item) hit.add(item.jump);
  }
  const out: Problem[] = [];
  const said = new Set<string>();
  project.placed.forEach((p, t) => {
    if (p.role !== "crash") return;
    const f = owner.get(t);
    if (!f || !CAR_LIKE.includes(f.kind)) out.push({ rule: "R13e", tile: t, message: "this tile is built to be knocked down, but it is not part of a car, a wall or a row of dominoes that the course names" });
    else if (!hit.has(f.name) && !said.has(f.name)) {
      said.add(f.name);
      out.push({ rule: "R13e", tile: t, message: `this tile is part of ${f.name}, built to be knocked down, but the route never hits it: add {through: "${f.name}"}` });
    }
  });
  return out;
}
