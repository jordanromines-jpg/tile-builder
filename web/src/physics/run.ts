/* A truck run (4.0c): the Pip truck drives a finished Monster trucks build along its route (4.0a), in the physics, and
   the run is recorded for the app to play (D9). The course stands still (R14 proves it stands); the crash pieces are
   free, held by their magnet hinges until a hit hard enough breaks them, and then they fall as tiles do. The driver
   steers along each leg at that leg's speed; at a jump's lip the truck gets the take-off speed the route solved for
   (the child's push). R13f checks the run as it goes: the truck keeps to its road, lands every jump, knocks down every
   crash piece, and ends on its wheels. */
import { DEFAULT_LEG } from "../engine/catalog";
import { LANDING_SETTLE, TRUCK_RIDE } from "../engine/truck-size";
import { compileRoute, depthInside, footprint, type Leg } from "../engine/route";
import type { V3 } from "../engine/geometry";
import type { Project } from "../engine/types";
import { TRUCK } from "../three/truck/spec";
import type { Rapier } from "./rapier";
import { at, buildScene, type Pose } from "./scene";
import { DT, G, NEWTON } from "./units";
import { brake, capChange, compressOf, drive, forwardOf, groundPoint, HAND, MAX_STEER, norm2, normalOf, place, steerToward } from "./hand";
import { CHASSIS_Y, makeTruck } from "./vehicle";

/** recording rate: one frame every 4 steps of 1/240 s */
export const RUN_FPS = 60;
const PER_FRAME = Math.round(1 / (DT * RUN_FPS));
/** a hit this hard breaks a crash piece's magnets (a magnet pair lets go at about 1.5 N) */
export const BREAK_FORCE = 1.5 * NEWTON;
/** the truck hitting a target (a wall, a car, dominoes) this hard brings the whole target down: the child crashes the
    truck in on purpose, and the build is meant to fall (its line says so) */
export const HIT_FORCE = 0.3 * NEWTON;
/** speeds on each kind of leg, squares a second */
const SPEED: Record<Leg["kind"], number> = { drive: 1.6, climb: 1.4, descend: 1.2, fly: 0, crush: 1.4, smash: 1.8 };
const LOOK_AHEAD = 0.6;
/** seconds the hand carries the truck on through a crash at the end of its route */
const CARRY_ON = 0.4;
/** how hard the hand slows the truck at the end of its route, squares a second per second */
const STOPPING = 4;
/** angular damping for half a second after a landing */
const STEADY = 12;
const TIMEOUT_S = 60;
/** how far from its road the truck may stray */
const KEEP = 0.5;

export interface TruckFrame {
  pos: V3;
  quat: [number, number, number, number];
  wheels: { spin: number; steer: number; compress: number }[];
}

export interface RunEvent {
  t: number;
  kind: "launch" | "land" | "break" | "end";
  tile?: number;
  /** a landing's hit, 0–1 (how hard the springs bottomed) */
  hit?: number;
}

/** What a trace (for finding out why a run goes wrong) sees after each step. */
export interface Trace {
  t: number;
  leg: number;
  kind: string;
  truck: ReturnType<typeof makeTruck>;
  scene: ReturnType<typeof buildScene>;
  broken: Set<number>;
}

export interface RunRecord {
  id: string;
  fps: number;
  truck: TruckFrame[];
  /** placed index → its pose in each frame (only the crash pieces) */
  tiles: Record<number, Pose[]>;
  events: RunEvent[];
  problems: string[];
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
/** how long the truck is kept on a jump's arc, at most (it's let go as a wheel touches), in its flight times */
const GUIDED = 1.5;
const dot2 = (a: [number, number], b: [number, number]) => a[0] * b[0] + a[1] * b[1];
const len2 = (x: number, z: number) => Math.hypot(x, z);

/** Simulates the build's run and records it. `nudge` perturbs it a little (R13f's robustness runs): the start moves
    by 0.02 square a step and the hand's speeds change by 1% a step. */
export function simulateRun(R: Rapier, project: Project, nudge = 0, trace?: (at: Trace) => void): RunRecord {
  const legs = compileRoute(project, DEFAULT_LEG);
  const pace = 1 + 0.01 * nudge;
  const crash = new Set(project.placed.map((t, i) => (t.role === "crash" ? i : -1)).filter((i) => i >= 0));
  const fixed = new Set(project.placed.map((_, i) => i).filter((i) => !crash.has(i)));
  const scene = buildScene(R, project, { leg: DEFAULT_LEG, held: fixed, hinge: 0.006, iterations: 16, flush: true });
  const { world } = scene;
  const events = new R.EventQueue(true);
  const colliderTile = new Map<number, number>();
  // every tile's collider, to tell what a wheel stands on
  const tileOf = new Map(scene.bodies.map((b, i) => [b.collider(0).handle, i]));
  for (const i of crash) {
    const c = scene.bodies[i].collider(0);
    c.setActiveEvents(R.ActiveEvents.CONTACT_FORCE_EVENTS);
    c.setContactForceEventThreshold(BREAK_FORCE / 4);
    colliderTile.set(c.handle, i);
  }
  const jointsOf = new Map<number, typeof scene.joints>();
  for (const j of scene.joints) for (const k of [j.i, j.j]) if (crash.has(k)) jointsOf.set(k, [...(jointsOf.get(k) ?? []), j]);
  const broken = new Set<number>();
  // each crash piece's target, so a truck's hit brings that whole target down
  const targetOf = new Map<number, number[]>();
  for (const f of project.course?.features ?? []) if (["wall", "car", "dominoes"].includes(f.kind)) for (const i of f.tiles) targetOf.set(i, f.tiles);
  // each car tile's roof footprint
  const carOf = new Map<number, [number, number][]>();
  for (const f of project.course?.features ?? []) if (f.kind === "car" && f.surface) for (const i of f.tiles) carOf.set(i, footprint(f));
  // the truck's chassis or one of its tyres
  const isTruck = (h: number) => world.getCollider(h)?.parent()?.handle === truck.body.handle;
  const breakTile = (i: number, at: number) => {
    if (broken.has(i)) return;
    broken.add(i);
    for (const j of jointsOf.get(i) ?? []) if (world.getImpulseJoint(j.joint.handle)) world.removeImpulseJoint(j.joint, true);
    scene.release(i);
    out.events.push({ t: at, kind: "break", tile: i });
  };

  const first = legs[0];
  const head0 = norm2(sub(first.to, first.from));
  // the child sets the truck down wholly on its first piece: its middle half a truck in from the route's start
  const startAt = (L: Leg): V3 => {
    const run = Math.hypot(L.to[0] - L.from[0], L.to[2] - L.from[2]);
    const k = Math.min(TRUCK.length / 2, run / 2) / (run || 1);
    return [L.from[0] + (L.to[0] - L.from[0]) * k, L.from[1] + (L.to[1] - L.from[1]) * k, L.from[2] + (L.to[2] - L.from[2]) * k];
  };
  const pitchOf = (L: Leg) => Math.atan2(L.to[1] - L.from[1], Math.hypot(L.to[0] - L.from[0], L.to[2] - L.from[2]) || 1);
  const s0 = startAt(first);
  const start: V3 = [s0[0] + nudge * 0.02, s0[1], s0[2] + nudge * 0.013];
  const truck = makeTruck(R, world, start, head0, pitchOf(first));
  const out: RunRecord = { id: project.id, fps: RUN_FPS, truck: [], tiles: {}, events: [], problems: [] };
  for (const i of crash) out.tiles[i] = [];
  const startPoses = scene.poses();

  let li = 0;
  let t = 0;
  let flying = false;
  let launchedAt = 0;
  // where the truck left the lip, how far it means to fly and how long it should be in the air
  let launch = { at: [0, 0, 0] as V3, d: 0, air: 0, v: [0, 0, 0] as V3, heading: [0, 1] as [number, number], land: 0 };
  let ended = -1;
  let steps = 0;
  let steadyUntil = 0;
  let springsBackAt = 0;
  const strayed = new Set<number>();
  // how far each leg's start may swing off its line (a turn, a join, a landing)
  const swing = new Map<number, number>();
  let stuckFor = 0;
  const placed = new Set<number>();
  const done = () => li >= legs.length;

  while (t < TIMEOUT_S) {
    // the driver
    const p = truck.body.translation();
    let ground: V3 = groundPoint(truck);
    if (!done()) {
      const L = legs[li];
      if (L.run !== legs[Math.max(0, li - 1)].run && li > 0 && !flying && !placed.has(li)) {
        placed.add(li);
        place(truck, startAt(L), norm2(sub(L.to, L.from)), pitchOf(L));
        ground = groundPoint(truck);
      }
      if (L.kind === "fly") {
        if (!flying) {
          const f = L.fly!;
          // the arc from where the truck is now, through the middle of the arc the route proved (from the lip, R13c),
          // to the landing: a parabola through three points, so it clears what the proved one clears
          const along = (q: V3) => (q[0] - ground[0]) * f.heading[0] + (q[2] - ground[2]) * f.heading[1];
          const mt = f.time / 2;
          const mid: V3 = [f.start[0] + f.heading[0] * f.speed * Math.cos(f.angle) * mt, f.start[1] - TRUCK_RIDE + f.speed * Math.sin(f.angle) * mt - (G * mt * mt) / 2, f.start[2] + f.heading[1] * f.speed * Math.cos(f.angle) * mt];
          const [um, ym, ud, yd] = [along(mid), mid[1] - ground[1], along(L.to), L.to[1] - ground[1]];
          const a = (ym / um - yd / ud) / (um - ud);
          const ok = um > 0.05 && ud > um + 0.05 && a < 0;
          // (a route too short for that: the speed that carries it straight to the landing at the lip's angle)
          const c = Math.cos(f.angle);
          const vx = ok ? Math.sqrt(-G / (2 * a)) : c * Math.sqrt((G * ud * ud) / Math.max(1e-3, 2 * c * c * (Math.max(0.3, ud) * Math.tan(f.angle) - yd)));
          const vy = ok ? (ym / um - a * um) * vx : vx * Math.tan(f.angle);
          const d = Math.max(0.3, ud);
          truck.body.setLinvel({ x: f.heading[0] * vx, y: vy, z: f.heading[1] * vx }, true);
          // the nose comes level by the landing (a truck's front wheels leave the lip first)... The springs let go for a
          // moment, or the rear ones, still squashed on the ramp, would kick the tail up and flip it
          const air = d / Math.max(0.1, vx);
          // ... and turns from the lip's pitch to the pitch of what it lands on (nose down onto a ramp going down)
          const S = L.surface;
          const run = S?.kind === "slope" ? Math.hypot(S.to[0] - S.from[0], S.to[2] - S.from[2]) : 0;
          const landPitch = S?.kind === "slope" && run ? Math.atan2(S.to[1] - S.from[1], run) * Math.sign(((S.to[0] - S.from[0]) * f.heading[0] + (S.to[2] - S.from[2]) * f.heading[1]) / run) : 0;
          const rate = (f.angle - landPitch) / air;
          launch = { at: ground, d, air, v: [f.heading[0] * vx, vy, f.heading[1] * vx], heading: f.heading, land: landPitch };
          truck.body.setAngvel({ x: rate * f.heading[1], y: 0, z: -rate * f.heading[0] }, true);
          truck.vehicle.springs(false);
          springsBackAt = t + 0.06;
          flying = true;
          launchedAt = t;
          out.events.push({ t, kind: "launch" });
        }
        drive(truck, 0, 0);
        // the flight is gravity alone (R13c proved its arc clears every tile), so the truck is kept on the exact arc
        // until near its landing; the landing and whatever it hits are the physics' own
        const air = t - launchedAt;
        // a wheel touching down: not on the piece it took off from (the rear ones are still on the lip as it leaves)
        const from = new Set(project.course?.features.find((x) => x.name === legs[li - 1]?.feature)?.tiles ?? []);
        const touched = [0, 1, 2, 3].some((w) => {
          const g = truck.vehicle.wheelGroundObject(w);
          return truck.vehicle.wheelSuspensionForce(w) > 0 && !(g && from.has(tileOf.get(g.handle) ?? -1));
        });
        if (touched && !steadyUntil) {
          // the springs take the landing: the speed into what it lands on is gone, the speed along it is kept, and the
          // child's hand on the truck steadies it for a moment
          const n = normalOf(L.surface);
          const lv = truck.body.linvel();
          const into = Math.min(0, lv.x * n[0] + lv.y * n[1] + lv.z * n[2]);
          // (landing on a car, the crunch takes the speed: the truck goes on at a crushing pace)
          const onCar = project.course?.features.find((x) => x.name === L.target)?.kind === "car";
          const along = { x: lv.x - into * n[0], y: lv.y - into * n[1], z: lv.z - into * n[2] };
          const k = onCar ? Math.min(1, SPEED.crush * pace / (Math.hypot(along.x, along.y, along.z) || 1)) : 1;
          truck.body.setLinvel({ x: along.x * k, y: along.y * k, z: along.z * k }, true);
          truck.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
          truck.body.setAngularDamping(STEADY);
          steadyUntil = t + 0.5;
        }
        if (!touched && !steadyUntil && air < GUIDED * launch.air) {
          truck.body.setLinvel({ x: launch.v[0], y: launch.v[1] - G * air, z: launch.v[2] }, true);
          // the nose follows the flight (no more than 20° down) and settles to what it lands on, as R13c flies it
          const vh = Math.hypot(launch.v[0], launch.v[2]);
          const settle = Math.max(0, Math.min(1, (air - (launch.air - LANDING_SETTLE)) / LANDING_SETTLE));
          const want = (1 - settle) * Math.max(-0.35, Math.min(Math.PI / 6, Math.atan2(launch.v[1] - G * air, vh))) + settle * launch.land;
          const rate = Math.max(-30, Math.min(30, (Math.asin(Math.max(-1, Math.min(1, forwardOf(truck)[1]))) - want) / (3 * DT)));
          truck.body.setAngvel({ x: rate * launch.heading[1], y: 0, z: -rate * launch.heading[0] }, true);
        }
        const down = [0, 1, 2, 3].filter((w) => truck.vehicle.wheelSuspensionForce(w) > 0).length;
        // it has landed when two wheels are down past the lip (the rear ones are still over the ramp as it leaves)
        const gone = (ground[0] - launch.at[0]) * L.fly!.heading[0] + (ground[2] - launch.at[2]) * L.fly!.heading[1];
        if (t - launchedAt > 0.08 && down >= 2 && (gone >= launch.d / 2 || t - launchedAt > launch.air)) {
          flying = false;
          // a good landing puts the wheels that come down on what the jump aims at (the front ones may touch a little
          // before the middle gets to its point: that's a landing too)
          // (or the front axle comes down on its footprint: the wheels may first find the edge of what holds it up)
          const aimed = project.course?.features.find((x) => x.name === L.target);
          const aim = new Set(aimed?.tiles ?? []);
          const fw = forwardOf(truck);
          const front: [number, number] = [ground[0] + fw[0] * (TRUCK.wheelbase / 2), ground[2] + fw[2] * (TRUCK.wheelbase / 2)];
          const onAim =
            (aimed?.surface ? depthInside(footprint(aimed), front) >= -0.25 : false) ||
            [0, 1, 2, 3].some((w) => {
              const g = truck.vehicle.wheelGroundObject(w);
              return truck.vehicle.wheelSuspensionForce(w) > 0 && g && aim.has(tileOf.get(g.handle) ?? -1);
            });
          const miss = len2(ground[0] - L.to[0], ground[2] - L.to[2]);
          if (!onAim && miss > 0.8) out.problems.push(`R13f: the jump of route item ${L.item + 1} landed ${miss.toFixed(2)} squares from where it should`);
          const hit = Math.max(...[0, 1, 2, 3].map((w) => compressOf(truck, w)));
          out.events.push({ t, kind: "land", hit: Math.min(1, hit) });
          li++;
        }
      } else {
        // a crush where the truck landed has no length (and may point back): it runs on the jump's heading, from half
        // a square short of the car's middle to it, so the hand carries the truck onto the car
        const Pf = legs[li - 1]?.fly;
        const from: V3 = Pf && len2(L.to[0] - L.from[0], L.to[2] - L.from[2]) < 0.3 ? [L.to[0] - Pf.heading[0] * 0.5, L.from[1], L.to[2] - Pf.heading[1] * 0.5] : L.from;
        const dir = norm2(sub(L.to, from));
        const length = len2(L.to[0] - from[0], L.to[2] - from[2]);
        const s = (ground[0] - from[0]) * dir[0] + (ground[2] - from[2]) * dir[1];
        const lateral = Math.abs((ground[0] - from[0]) * -dir[1] + (ground[2] - from[2]) * dir[0]);
        // coming out of a turn the truck swings wide (no truck turns on the spot)
        const P = legs[li - 1];
        const turn = P && P.kind !== "fly" ? Math.acos(Math.max(-1, Math.min(1, dot2(norm2(sub(P.to, P.from)), dir)))) : 0;
        // (and legs may join up to half a square apart, R13b: the truck starts a leg where the last one left it)
        const joinOff = P ? Math.abs((P.to[0] - from[0]) * -dir[1] + (P.to[2] - from[2]) * dir[0]) : 0;
        // a turn's arc (the hand turns the truck HAND.turn radians a second) carries it out by r(1 - cos turn)
        const r = SPEED[L.kind] * pace / HAND.turn;
        // (after a jump it comes down anywhere on what it aims at, so it may start the leg as far off again; and a
        // swing begun on a leg shorter than the turn's arc carries on into this one)
        if (!swing.has(li)) {
          const short = P && P.kind !== "fly" && len2(P.to[0] - P.from[0], P.to[2] - P.from[2]) < 1 + 2 * r;
          swing.set(li, joinOff + r * (1 - Math.cos(turn)) + (P?.kind === "fly" ? KEEP : 0) + (short ? swing.get(li - 1) ?? 0 : 0));
        }
        const keep = s < 1 + 2 * r ? KEEP + swing.get(li)! : KEEP;
        if (lateral > keep && L.kind !== "smash" && L.kind !== "crush" && !strayed.has(li)) {
          strayed.add(li);
          out.problems.push(`R13f: the truck left the road on route item ${L.item + 1}, a ${L.kind}${li > 0 && legs[li - 1].kind === "fly" ? " after a jump" : ""} (${lateral.toFixed(2)} squares off)`);
        }
        // steer toward a point a little ahead on the leg (into the next leg past its end)
        const ahead = s + LOOK_AHEAD;
        let target: [number, number];
        if (ahead <= length || li + 1 >= legs.length || legs[li + 1].kind === "fly") target = [from[0] + dir[0] * Math.min(ahead, length + LOOK_AHEAD), from[2] + dir[1] * Math.min(ahead, length + LOOK_AHEAD)];
        else {
          const N = legs[li + 1];
          const d2 = norm2(sub(N.to, N.from));
          target = [N.from[0] + d2[0] * (ahead - length), N.from[2] + d2[1] * (ahead - length)];
        }
        // aim ahead, and come back onto the leg's line (left of it is +, and left is + steer, so steer against it)
        const leftOff = (ground[0] - from[0]) * dir[1] - (ground[2] - from[2]) * dir[0];
        const steer = Math.max(-MAX_STEER, Math.min(MAX_STEER, steerToward(truck, target) - 1.2 * leftOff));
        // crushing a car or smashing a wall, the hand keeps the truck level (it presses it down through a car, and stops
        // it riding up a falling wall once its nose is 20° up): its pitch and roll are held back, not its turn
        if (L.kind === "crush" || (L.kind === "smash" && forwardOf(truck)[1] > Math.sin(Math.PI / 9))) {
          const w = truck.body.angvel();
          truck.body.setAngvel({ x: w.x * (1 - HAND.level), y: w.y, z: w.z * (1 - HAND.level) }, true);
        }
        // stuck on a crash (a fallen piece wedged between the truck and its target): the child pushes harder, and the
        // target gives
        if ((L.kind === "crush" || L.kind === "smash") && truck.vehicle.currentVehicleSpeed() < 0.2) {
          stuckFor += DT;
          const aimed = project.course?.features.find((x) => x.name === L.target);
          if (stuckFor > 0.5 && aimed) for (const k of aimed.tiles) if (crash.has(k)) breakTile(k, t);
          // (and once it has all let go, the crash is done: the truck sits in the wreck)
          if (stuckFor > 1 && aimed?.tiles.every((k) => !crash.has(k) || broken.has(k))) {
            stuckFor = 0;
            li++;
            continue;
          }
        } else stuckFor = 0;
        // the last leg: the hand slows the truck to a stop with all of it still on its piece (its middle half a truck
        // short of the route's end)
        const last = li === legs.length - 1;
        const crashing = L.kind === "smash" || L.kind === "crush";
        const stopAt = !last || crashing ? length : Math.max(0, length - Math.min(length / 2, TRUCK.length / 2));
        const speed = last ? Math.min(SPEED[L.kind] * pace, Math.sqrt(2 * STOPPING * Math.max(0, stopAt - s))) : SPEED[L.kind] * pace;
        drive(truck, Math.max(speed, last ? 0.05 : 0), steer, target);
        // a truck leaves a lip as its front wheels go over it (half a wheelbase before its middle gets there)
        const leaving = legs[li + 1]?.kind === "fly" ? TRUCK.wheelbase / 2 : 0;
        // (over a crushed car's pieces the truck gets bumped about: near its end is the end)
        const near = len2(ground[0] - L.to[0], ground[2] - L.to[2]) < 0.25 || ((L.kind === "crush" || L.kind === "smash") && s >= length - Math.min(0.4, length / 3));
        if (s >= stopAt - 0.02 - leaving || (near && (!last || crashing) && !leaving)) li++;
      }
    } else {
      if (ended < 0) {
        ended = t;
        out.events.push({ t, kind: "end" });
      }
      // a crash at the end: the hand carries the truck on through for a moment before it lets it roll to a stop
      const E = legs[legs.length - 1];
      if ((E.kind === "smash" || E.kind === "crush") && t - ended < CARRY_ON) {
        // (on the way it faces: a crush where the truck landed is a leg of no length)
        const d = norm2(forwardOf(truck));
        drive(truck, SPEED[E.kind] * pace, 0, [ground[0] + d[0] * 2, ground[2] + d[1] * 2]);
      } else brake(truck);
      // stopped: the child's hand rests on the truck while what it knocked down settles
      if (!truck.body.isKinematic() && Math.hypot(truck.body.linvel().x, truck.body.linvel().z) < 0.1) truck.body.setBodyType(R.RigidBodyType.KinematicPositionBased, true);
      if (t - ended > 2.5) break;
    }

    if (springsBackAt && t > springsBackAt) {
      truck.vehicle.springs(true);
      springsBackAt = 0;
    }
    if (steadyUntil && t > steadyUntil) {
      truck.body.setAngularDamping(0);
      steadyUntil = 0;
    }
    truck.vehicle.update(DT);
    // a wheel coming down on a crash piece is a hit on its target too (the wheels are rays: they make no contacts); a
    // car gives way once the truck is on it (its middle over the roof), not as the first wheel touches its edge
    const middle = groundPoint(truck);
    for (let w = 0; w < 4; w++) {
      const g = truck.vehicle.wheelGroundObject(w);
      const i = g ? colliderTile.get(g.handle) : undefined;
      if (i === undefined || !(truck.vehicle.wheelSuspensionForce(w) > 0)) continue;
      const car = carOf.get(i);
      if (car && depthInside(car, [middle[0], middle[2]]) < 0) continue;
      for (const k of targetOf.get(i) ?? [i]) breakTile(k, t);
    }
    const before = { v: truck.body.linvel(), w: truck.body.angvel() };
    scene.step(1, events);
    // a loose tile squeezed under the chassis can make the solver pop the truck away faster than any hit by a 10 g
    // tile could: no step changes its speed or its spin by more than a real knock does
    capChange(truck, before);
    events.drainContactForceEvents((e) => {
      const f = e.totalForceMagnitude();
      const byTruck = isTruck(e.collider1()) || isTruck(e.collider2());
      if (f < (byTruck ? HIT_FORCE : BREAK_FORCE)) return;
      for (const h of [e.collider1(), e.collider2()]) {
        const i = colliderTile.get(h);
        if (i === undefined) continue;
        if (byTruck) for (const k of targetOf.get(i) ?? [i]) breakTile(k, t);
        else breakTile(i, t);
      }
    });
    t += DT;
    trace?.({ t, leg: li, kind: legs[li]?.kind ?? "end", truck, scene, broken });
    if (++steps % PER_FRAME === 0) record(out, truck, scene, crash, p);
  }

  // R13f: how it ended
  if (!done()) out.problems.push(`R13f: the run didn't finish its route in ${TIMEOUT_S} s (stopped at route item ${legs[li].item + 1})`);
  const q = truck.body.rotation();
  const upY = 1 - 2 * (q.x * q.x + q.z * q.z);
  if (upY < 0.7) out.problems.push("R13f: the truck didn't end on its wheels");
  const end = scene.poses();
  // every target the truck crashes comes down: most of its tiles knocked over (a far corner may stay up, as in life)
  const knocked = (i: number) => {
    const moved = Math.hypot(...sub(end[i].t, startPoses[i].t));
    const dq = Math.abs(end[i].q[0] * startPoses[i].q[0] + end[i].q[1] * startPoses[i].q[1] + end[i].q[2] * startPoses[i].q[2] + end[i].q[3] * startPoses[i].q[3]);
    return moved >= 0.2 || (2 * Math.acos(Math.min(1, dq)) * 180) / Math.PI >= 25;
  };
  for (const f of project.course?.features ?? []) {
    if (!["wall", "car", "dominoes"].includes(f.kind)) continue;
    const down = f.tiles.filter(knocked).length;
    if (down < 0.6 * f.tiles.length) out.problems.push(`R13f: ${f.name} wasn't knocked down (${down} of ${f.tiles.length} tiles)`);
  }
  scene.free();
  return out;
}

function record(out: RunRecord, truck: ReturnType<typeof makeTruck>, scene: ReturnType<typeof buildScene>, crash: Set<number>, _p: unknown) {
  const p = truck.body.translation();
  const q = truck.body.rotation();
  const pose: Pose = { t: [p.x, p.y, p.z], q: [q.x, q.y, q.z, q.w] };
  out.truck.push({
    pos: at(pose, [0, -CHASSIS_Y, 0]),
    quat: pose.q,
    wheels: [0, 1, 2, 3].map((w) => ({ spin: truck.vehicle.wheelRotation(w) ?? 0, steer: truck.vehicle.wheelSteering(w) ?? 0, compress: compressOf(truck, w) })),
  });
  for (const i of crash) {
    const t = scene.bodies[i].translation();
    const r = scene.bodies[i].rotation();
    out.tiles[i].push({ t: [t.x, t.y, t.z], q: [r.x, r.y, r.z, r.w] });
  }
}
