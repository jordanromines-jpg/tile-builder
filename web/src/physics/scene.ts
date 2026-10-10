/* A build, or part of one, as a physics scene (4.2): every tile a thin solid of its own outline, the table under them,
   and a magnet hinge at every edge where two tiles meet (`analyse().meets`, the joints R10 reasons about). A hinge
   turns freely about its edge apart from a little magnet friction, and holds every other way, as a magnet join does:
   a wall folds at its seams, a flag hangs, a ring keeps its corners. Tiles the child holds (the hand, D10) are fixed. */
import { analyse } from "../engine/check";
import { edgesOf, type V3 } from "../engine/geometry";
import type { Project } from "../engine/types";
import type { Rapier } from "./rapier";
import { AREAL_GRAMS, DT, FRICTION_TABLE, FRICTION_TILE, G, NEWTON_METRE, RESTITUTION, THICK } from "./units";

type World = InstanceType<Rapier["World"]>;
type Body = ReturnType<World["createRigidBody"]>;

/** Magnet friction at a hinge, N·m for each square of edge: below the 0.0037 N·m that would hold a small square
    straight out by one edge (a flag hangs, R10b), above what keeps an open ring of four square (calibrated, P0). */
export const HINGE_NM = 0.0015;
/** how a held tile follows its magnets while the build settles, per second (see `hold`) */
export const SEAT_DAMPING = 50;

export interface SceneOpts {
  leg: number;
  /** tiles 0 … upto − 1 are built (default: all) */
  upto?: number;
  /** fixed in place: the child's hand */
  held?: Set<number>;
  hinge?: number;
  /** solver iterations a step (default 8) */
  iterations?: number;
  /** every tile facing up (lying or leaning) has its thickness under its plane, so each driving surface is its tile's
      own plane and a truck rolls from tile to tile, and off the table, without a 6 mm step (truck runs: the course is
      fixed, so it changes nothing else) */
  flush?: boolean;
}

export interface Pose {
  t: V3;
  q: [number, number, number, number];
}

export interface Scene {
  R: Rapier;
  world: World;
  bodies: Body[];
  /** each tile's outline, from its body's centre */
  local: V3[][];
  joints: { i: number; j: number; length: number; joint: InstanceType<Rapier["RevoluteImpulseJoint"]> }[];
  /** steps the world; an event queue collects contact forces for whoever asked for them */
  step(n?: number, events?: InstanceType<Rapier["EventQueue"]>): void;
  poses(): Pose[];
  setGravity(g: V3): void;
  /** a tile whose magnets have let go: it collides with its old neighbours again */
  release(i: number): void;
  /** the held tiles, seated, are held still from now on (the child's hand) */
  hold(): void;
  free(): void;
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const addv = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V3) => Math.sqrt(dot(a, a));
const vec = (v: V3) => ({ x: v[0], y: v[1], z: v[2] });

/** The shortest distance between two segments. */
function segDist(p1: V3, q1: V3, p2: V3, q2: V3): number {
  const d1 = sub(q1, p1);
  const d2 = sub(q2, p2);
  const r = sub(p1, p2);
  const a = dot(d1, d1);
  const e = dot(d2, d2);
  const f = dot(d2, r);
  const c = dot(d1, r);
  const b = dot(d1, d2);
  const den = a * e - b * b;
  let s = den > 1e-12 ? Math.min(1, Math.max(0, (b * f - c * e) / den)) : 0;
  let t = (b * s + f) / e;
  if (t < 0) {
    t = 0;
    s = Math.min(1, Math.max(0, -c / a));
  } else if (t > 1) {
    t = 1;
    s = Math.min(1, Math.max(0, (b - c) / a));
  }
  return len(sub(addv(p1, scale(d1, s)), addv(p2, scale(d2, t))));
}

/** Tiles that touch at an edge or a corner: their slabs overlap there by a few millimetres, as real tiles' rounded
    edges don't, so they mustn't push each other apart. */
function touching(polys: V3[][]): Set<string> {
  const out = new Set<string>();
  const lo = polys.map((p) => [0, 1, 2].map((k) => Math.min(...p.map((v) => v[k]))));
  const hi = polys.map((p) => [0, 1, 2].map((k) => Math.max(...p.map((v) => v[k]))));
  for (let i = 0; i < polys.length; i++) {
    for (let j = i + 1; j < polys.length; j++) {
      if ([0, 1, 2].some((k) => lo[i][k] > hi[j][k] + THICK || lo[j][k] > hi[i][k] + THICK)) continue;
      const ei = edgesOf(polys[i]);
      const ej = edgesOf(polys[j]);
      if (ei.some(([a, b]) => ej.some(([c, d]) => segDist(a, b, c, d) < THICK))) out.add(`${i}:${j}`);
    }
  }
  return out;
}

/** The torque that lifts a tile lying flat on the table about one of its edges (the line through `p` along `u`): its
    weight times how far its middle is from the edge, in the world's units. */
function liftOf(poly: V3[], p: V3, u: V3): number {
  let area2 = 0;
  for (let k = 0; k < poly.length; k++) {
    const [x1, , z1] = poly[k];
    const [x2, , z2] = poly[(k + 1) % poly.length];
    area2 += x1 * z2 - x2 * z1;
  }
  const c = centroid(poly);
  const r = sub(c, p);
  const off = sub(r, scale(u, dot(r, u)));
  return (Math.abs(area2) / 2) * AREAL_GRAMS * G * len(off);
}

function centroid(poly: V3[]): V3 {
  return scale(poly.reduce(addv, [0, 0, 0] as V3), 1 / poly.length);
}

export function buildScene(R: Rapier, project: Project, opts: SceneOpts): Scene {
  const upto = opts.upto ?? project.placed.length;
  const part: Project = { ...project, placed: project.placed.slice(0, upto) };
  const a = analyse(part, opts.leg);
  const world = new R.World(vec([0, -G, 0]));
  world.timestep = DT;
  world.integrationParameters.numSolverIterations = opts.iterations ?? 8;

  const table = world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(0, -0.5, 0));
  world.createCollider(R.ColliderDesc.cuboid(200, 0.5, 200).setFriction(FRICTION_TABLE).setRestitution(RESTITUTION), table);

  const bodies: Body[] = [];
  const local: V3[][] = [];
  for (let i = 0; i < upto; i++) {
    const poly = a.polys[i];
    const n = a.normals[i];
    const c = centroid(poly);
    // a tile is a slab about its plane; one lying or leaning on the table sits on it, its slab above the plane
    const onTable = a.onTable[i] && Math.abs(n[1]) > 0.01;
    const up: V3 = n[1] >= 0 ? n : scale(n, -1);
    const facesUp = Math.abs(n[1]) > 0.01;
    const [lo, hi] = opts.flush && facesUp ? [-THICK, 0] : onTable ? [0, THICK] : [-THICK / 2, THICK / 2];
    const pts: number[] = [];
    for (const v of poly) for (const k of [lo, hi]) pts.push(...addv(sub(v, c), scale(up, k)));
    // a held tile is in the child's hand: while the build settles it is weightless and damped, so its magnets seat it
    // where the build really is; then `hold()` fixes it there (fixed from the start, at its drawn place, it would drag
    // a build that had settled a millimetre through its joints for as long as the test ran)
    const desc = (opts.held?.has(i) ? R.RigidBodyDesc.dynamic().setGravityScale(0).setLinearDamping(SEAT_DAMPING).setAngularDamping(SEAT_DAMPING) : R.RigidBodyDesc.dynamic()).setCanSleep(false).setTranslation(...c);
    const body = world.createRigidBody(desc);
    const col = R.ColliderDesc.convexHull(new Float32Array(pts));
    if (!col) throw new Error(`${project.id}: tile ${i} has no solid shape`);
    world.createCollider(col.setDensity(AREAL_GRAMS / THICK).setFriction(FRICTION_TILE).setRestitution(RESTITUTION).setActiveHooks(R.ActiveHooks.FILTER_CONTACT_PAIRS), body);
    bodies.push(body);
    local.push(poly.map((v) => sub(v, c)));
  }

  // contacts between tiles that touch are left out; every other contact (and the table) counts
  const touch = touching(a.polys);
  const tileOf = new Map(bodies.map((b, i) => [b.handle, i]));
  const hooks = {
    filterContactPair(_c1: number, _c2: number, b1: number, b2: number) {
      const i = tileOf.get(b1);
      const j = tileOf.get(b2);
      if (i === undefined || j === undefined) return R.SolverFlags.COMPUTE_IMPULSE;
      return touch.has(i < j ? `${i}:${j}` : `${j}:${i}`) ? null : R.SolverFlags.COMPUTE_IMPULSE;
    },
    filterIntersectionPair() {
      return true;
    },
  };

  const joints: Scene["joints"] = [];
  const hinge = (opts.hinge ?? HINGE_NM) * NEWTON_METRE;
  for (let i = 0; i < upto; i++) {
    for (const [j, es] of a.meets[i]) {
      if (j <= i || j >= upto) continue;
      const theirs = [...(a.meets[j].get(i) ?? [])].map((f) => edgesOf(a.polys[j])[f]);
      for (const e of es) {
        const [p0, p1] = edgesOf(a.polys[i])[e];
        const la = len(sub(p1, p0));
        const u = scale(sub(p1, p0), 1 / la);
        // the part of this edge the other tile's edge covers: the magnets are along it
        let from = la;
        let to = 0;
        for (const [q0, q1] of theirs) {
          const t0 = dot(sub(q0, p0), u);
          const t1 = dot(sub(q1, p0), u);
          from = Math.min(from, Math.max(0, Math.min(t0, t1)));
          to = Math.max(to, Math.min(la, Math.max(t0, t1)));
        }
        if (to - from < 0.05) continue;
        const mid = addv(p0, scale(u, (from + to) / 2));
        const ci = bodies[i].translation();
        const cj = bodies[j].translation();
        const data = R.JointData.revolute(vec(sub(mid, [ci.x, ci.y, ci.z])), vec(sub(mid, [cj.x, cj.y, cj.z])), vec(u));
        const joint = world.createImpulseJoint(data, bodies[i], bodies[j], true) as InstanceType<Rapier["RevoluteImpulseJoint"]>;
        joint.setContactsEnabled(false);
        // magnet friction: a motor that tries to stop the hinge turning, no harder than the magnets grip. Not between
        // two tiles lying flat on the table: the table holds them, and friction round the closed loops of a flat
        // picture's seams would fight itself and throw the picture about
        const flatOnTable = (k: number) => a.onTable[k] && a.orient[k] === "flat";
        if (flatOnTable(i) && flatOnTable(j)) {
          joints.push({ i, j, length: to - from, joint });
          continue;
        }
        // where one tile lies flat on the table, the hinge can't hold harder than that tile's own weight about the
        // edge: past that, the flat tile lifts instead of the hinge turning (a leaf mustn't rise with its stem)
        let grip = hinge * (to - from);
        for (const k of [i, j]) if (flatOnTable(k)) grip = Math.min(grip, liftOf(a.polys[k], p0, u));
        joint.configureMotorVelocity(0, 1e6);
        world.impulseJoints.raw.jointSetMotorMaxForce(joint.handle, R.JointAxis.AngX as unknown as Parameters<typeof world.impulseJoints.raw.jointSetMotorMaxForce>[1], grip);
        joints.push({ i, j, length: to - from, joint });
      }
    }
  }

  // Rapier (0.21) runs the hooks only in a step that has an event queue: without one, the contact filter above is
  // skipped and touching tiles push each other apart at their shared corners. So every step gets one.
  const queue = new R.EventQueue(false);

  return {
    R,
    world,
    bodies,
    local,
    joints,
    step(n = 1, events) {
      for (let k = 0; k < n; k++) world.step(events ?? queue, hooks);
    },
    poses() {
      return bodies.map((b) => {
        const t = b.translation();
        const q = b.rotation();
        return { t: [t.x, t.y, t.z], q: [q.x, q.y, q.z, q.w] };
      });
    },
    setGravity(g) {
      world.gravity = vec(g);
    },
    hold() {
      for (const i of opts.held ?? []) if (i < bodies.length) bodies[i].setBodyType(R.RigidBodyType.Fixed, true);
    },
    release(i) {
      for (const k of [...touch]) {
        const [a1, b1] = k.split(":").map(Number);
        if (a1 === i || b1 === i) touch.delete(k);
      }
    },
    free() {
      queue.free();
      world.free();
    },
  };
}

/** A point on a body, from its local offset, at a pose. */
export function at(p: Pose, v: V3): V3 {
  const [x, y, z, w] = p.q;
  // v + 2w(q × v) + 2 q × (q × v)
  const c1: V3 = [y * v[2] - z * v[1], z * v[0] - x * v[2], x * v[1] - y * v[0]];
  const c2: V3 = [y * c1[2] - z * c1[1], z * c1[0] - x * c1[2], x * c1[1] - y * c1[0]];
  return [p.t[0] + v[0] + 2 * (w * c1[0] + c2[0]), p.t[1] + v[1] + 2 * (w * c1[1] + c2[1]), p.t[2] + v[2] + 2 * (w * c1[2] + c2[2])];
}
