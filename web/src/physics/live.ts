/* Live physics for Make your own (5.0a, Jordan's M1: "live, always on"): a scene that grows as a child puts tiles on.
   The same tiles as R14's scene (scene.ts): 6 mm slabs, a magnet hinge with a little friction at every edge where two
   tiles meet, no pushing between tiles that touch, a flat tile's hinge no stronger than its own weight. A new tile
   joins only the tiles its edges meet where they now lie (one that fell holds nothing up), is held in the hand for
   HOLD_S while its magnets seat it, then let go: if nothing holds it, it falls. A hard knock (BREAK_FORCE) lets a
   tile's magnets go. Runs in a worker (worker.ts); pure, so it is tested in Node. */
import { edgesMeet, edgesOf, normalOf, worldPolygon, type V3 } from "../engine/geometry";
import type { Placed } from "../engine/types";
import { brake, capChange, compressOf, drive, forwardOf, MAX_STEER } from "./hand";
import type { Rapier } from "./rapier";
import { at, centroid, liftOf, SEAT_DAMPING, segDist, type Pose } from "./scene";
import { CHASSIS_Y, makeTruck, type Truck } from "./vehicle";
import { AREAL_GRAMS, DT, FRICTION_TABLE, FRICTION_TILE, G, NEWTON, NEWTON_METRE, RESTITUTION, THICK } from "./units";

type World = InstanceType<Rapier["World"]>;
type Body = ReturnType<World["createRigidBody"]>;
type Joint = ReturnType<World["createImpulseJoint"]>;

/** seconds the hand holds a new tile before it lets go */
export const HOLD_S = 1;
/** a knock this hard lets a tile's magnets go (as in the truck runs) */
export const LIVE_BREAK = 1.5 * NEWTON;
/** solver passes a step */
export const LIVE_ITERATIONS = 10;
/** the truck hitting a tile this hard lets that tile's magnets go (the runs' HIT_FORCE: the child crashes it in on
    purpose) */
export const LIVE_HIT = 0.3 * NEWTON;
/** how fast the child pushes the truck on Go, squares a second (4.4.1's drive) */
export const LIVE_DRIVE = 2.4;
/** R14's hinge friction, N·m a square of edge */
const HINGE = 0.006;

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const vec = (v: V3) => ({ x: v[0], y: v[1], z: v[2] });

interface Tile {
  id: number;
  body: Body;
  local: V3[];
  flat: boolean;
  joints: Joint[];
  /** seconds left in the hand */
  held: number;
}

export class LiveScene {
  private world: World;
  private tiles = new Map<number, Tile>();
  private byHandle = new Map<number, number>();
  private touch = new Set<string>();
  private queue: InstanceType<Rapier["EventQueue"]>;
  private hooks: { filterContactPair: (c1: number, c2: number, b1: number, b2: number) => number | null; filterIntersectionPair: () => boolean };
  private next = 0;
  private truck: Truck | null = null;
  /** the child's hand on the truck: Go (0 or 1) and the turn (−1 right … 1 left) */
  private push = { go: 0, steer: 0 };
  /** magnets that let go since the last poses (for the crunch) */
  broke = 0;

  constructor(
    private R: Rapier,
    private leg: number,
  ) {
    this.world = new R.World(vec([0, -G, 0]));
    this.world.timestep = DT;
    // fewer solver passes than R14's 24: this is play, not proof, and it must keep up on an iPad
    this.world.integrationParameters.numSolverIterations = LIVE_ITERATIONS;
    const table = this.world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(0, -0.5, 0));
    this.world.createCollider(R.ColliderDesc.cuboid(200, 0.5, 200).setFriction(FRICTION_TABLE).setRestitution(RESTITUTION), table);
    this.queue = new R.EventQueue(true);
    this.hooks = {
      filterContactPair: (_c1, _c2, b1, b2) => {
        const i = this.byHandle.get(b1);
        const j = this.byHandle.get(b2);
        if (i === undefined || j === undefined) return R.SolverFlags.COMPUTE_IMPULSE;
        return this.touch.has(key(i, j)) ? null : R.SolverFlags.COMPUTE_IMPULSE;
      },
      filterIntersectionPair: () => true,
    };
  }

  /** The tile's outline as it now lies. */
  private polyOf(t: Tile): V3[] {
    const p = this.pose(t);
    return t.local.map((v) => at(p, v));
  }

  private pose(t: Tile): Pose {
    const a = t.body.translation();
    const q = t.body.rotation();
    return { t: [a.x, a.y, a.z], q: [q.x, q.y, q.z, q.w] };
  }

  /** Put a tile on, as the child places it: returns its id. */
  add(p: Placed): number {
    const R = this.R;
    const poly = worldPolygon(p, this.leg);
    const n = normalOf(p, this.leg);
    const c = centroid(poly);
    const onTable = Math.abs(Math.min(...poly.map((v) => v[1]))) < 1e-6;
    const facesUp = Math.abs(n[1]) > 0.01;
    const flat = onTable && Math.abs(n[1]) > 0.999;
    const up: V3 = n[1] >= 0 ? n : scale(n, -1);
    const [lo, hi] = onTable && facesUp ? [0, THICK] : [-THICK / 2, THICK / 2];
    const pts: number[] = [];
    for (const v of poly) for (const k of [lo, hi]) pts.push(...sub(v, c).map((x, i) => x + up[i] * k));
    const body = this.world.createRigidBody(
      R.RigidBodyDesc.dynamic().setGravityScale(0).setLinearDamping(SEAT_DAMPING).setAngularDamping(SEAT_DAMPING).setTranslation(...c),
    );
    const col = R.ColliderDesc.convexHull(new Float32Array(pts));
    if (!col) throw new Error("a tile with no solid shape");
    const collider = this.world.createCollider(
      col.setDensity(AREAL_GRAMS / THICK).setFriction(FRICTION_TILE).setRestitution(RESTITUTION).setActiveHooks(R.ActiveHooks.FILTER_CONTACT_PAIRS).setActiveEvents(R.ActiveEvents.CONTACT_FORCE_EVENTS).setContactForceEventThreshold(LIVE_BREAK / 4),
      body,
    );
    const id = this.next++;
    const tile: Tile = { id, body, local: poly.map((v) => sub(v, c)), flat, joints: [], held: HOLD_S };
    this.byHandle.set(body.handle, id);
    this.byHandle.set(collider.handle, id);

    // its magnets: every edge that meets an edge of a tile where that tile now lies
    const mine = edgesOf(poly);
    for (const other of this.tiles.values()) {
      const theirs = edgesOf(this.polyOf(other));
      if (mine.some(([a, b]) => theirs.some(([q, r]) => segDist(a, b, q, r) < THICK))) this.touch.add(key(id, other.id));
      for (const [p0, p1] of mine) {
        for (const f of theirs) {
          if (!edgesMeet([p0, p1], f)) continue;
          const la = Math.hypot(...sub(p1, p0));
          const u = scale(sub(p1, p0), 1 / la);
          const t0 = dot(sub(f[0], p0), u);
          const t1 = dot(sub(f[1], p0), u);
          const from = Math.max(0, Math.min(t0, t1));
          const to = Math.min(la, Math.max(t0, t1));
          if (to - from < 0.05) continue;
          const mid = p0.map((x, i) => x + u[i] * (from + to) / 2) as V3;
          const ca = body.translation();
          const cb = other.body.translation();
          const data = R.JointData.revolute(vec(sub(mid, [ca.x, ca.y, ca.z])), vec(sub(mid, [cb.x, cb.y, cb.z])), vec(u));
          const joint = this.world.createImpulseJoint(data, body, other.body, true) as InstanceType<Rapier["RevoluteImpulseJoint"]>;
          joint.setContactsEnabled(false);
          if (!(flat && other.flat)) {
            let grip = HINGE * NEWTON_METRE * (to - from);
            if (flat) grip = Math.min(grip, liftOf(poly, p0, u));
            if (other.flat) grip = Math.min(grip, liftOf(this.polyOf(other), p0, u));
            joint.configureMotorVelocity(0, 1e6);
            this.world.impulseJoints.raw.jointSetMotorMaxForce(joint.handle, R.JointAxis.AngX as unknown as Parameters<typeof this.world.impulseJoints.raw.jointSetMotorMaxForce>[1], grip);
          }
          tile.joints.push(joint);
          other.joints.push(joint);
        }
      }
    }
    this.tiles.set(id, tile);
    return id;
  }

  /** Take a tile off. */
  remove(id: number) {
    const t = this.tiles.get(id);
    if (!t) return;
    this.letGo(id);
    this.world.removeRigidBody(t.body);
    this.tiles.delete(id);
    for (const k of [...this.touch]) if (k.split(":").map(Number).includes(id)) this.touch.delete(k);
  }

  /** A tile's magnets let go: its hinges are gone, and it knocks against its old neighbours again. */
  letGo(id: number) {
    const t = this.tiles.get(id);
    if (!t) return;
    for (const j of t.joints) {
      if (this.world.impulseJoints.get(j.handle)) this.world.removeImpulseJoint(j, true);
      for (const o of this.tiles.values()) if (o !== t) o.joints = o.joints.filter((x) => x !== j);
    }
    t.joints = [];
    for (const k of [...this.touch]) if (k.split(":").map(Number).includes(id)) this.touch.delete(k);
  }

  /** Step the world `n` times (1/240 s each); the hand lets go of each tile after HOLD_S. */
  step(n = 1) {
    for (let k = 0; k < n; k++) {
      for (const t of this.tiles.values()) {
        if (t.held <= 0) continue;
        t.held -= DT;
        if (t.held <= 0) {
          t.body.setGravityScale(1, true);
          t.body.setLinearDamping(0);
          t.body.setAngularDamping(0);
          // (tiles at rest sleep, and cost nothing, until something knocks them)
          t.body.wakeUp();
        }
      }
      if (this.truck) {
        const tr = this.truck;
        if (this.push.go) {
          // the hand pushes it along and turns it toward a point two squares ahead, turned by the steer
          const f = forwardOf(tr);
          const a = this.push.steer * MAX_STEER;
          const p = tr.body.translation();
          const dir: [number, number] = [f[0] * Math.cos(a) + f[2] * Math.sin(a), -f[0] * Math.sin(a) + f[2] * Math.cos(a)];
          drive(tr, LIVE_DRIVE * this.push.go, a, [p.x + dir[0] * 2, p.z + dir[1] * 2]);
        } else brake(tr);
        tr.vehicle.update(DT);
      }
      // (a loose tile squeezed under the chassis mustn't pop the truck away faster than a real knock: as in the runs)
      const before = this.truck ? { v: this.truck.body.linvel(), w: this.truck.body.angvel() } : null;
      this.world.step(this.queue, this.hooks);
      if (before && this.truck) capChange(this.truck, before);
      this.queue.drainContactForceEvents((e) => {
        const byTruck = this.isTruck(e.collider1()) || this.isTruck(e.collider2());
        if (e.totalForceMagnitude() < (byTruck ? LIVE_HIT : LIVE_BREAK)) return;
        for (const h of [e.collider1(), e.collider2()]) {
          const id = this.byHandle.get(h);
          if (id !== undefined && this.tiles.get(id)?.joints.length) {
            this.letGo(id);
            this.broke++;
          }
        }
      });
    }
  }

  /** Every tile's pose: id, then position and turn (x, y, z, qx, qy, qz, qw), 8 numbers a tile. */
  poses(): Float32Array {
    const out = new Float32Array(this.tiles.size * 8);
    let k = 0;
    for (const t of this.tiles.values()) {
      const p = this.pose(t);
      out.set([t.id, ...p.t, ...p.q], k);
      k += 8;
    }
    return out;
  }

  /** The Pip truck on the table at `at` (where its wheels touch), facing `heading` (x, z); one at a time. */
  truckOn(where: V3, heading: [number, number]) {
    this.truckOff();
    this.truck = makeTruck(this.R, this.world, where, heading);
    this.push = { go: 0, steer: 0 };
  }

  private isTruck(collider: number): boolean {
    const b = this.truck?.body;
    if (!b) return false;
    for (let k = 0; k < b.numColliders(); k++) if (b.collider(k).handle === collider) return true;
    return false;
  }

  truckOff() {
    if (this.truck) this.world.removeRigidBody(this.truck.body);
    this.truck = null;
  }

  /** The child's hand on the truck: Go (0 or 1) and the turn (−1 right … 1 left). */
  drive(go: number, steer: number) {
    this.push = { go, steer };
  }

  /** The truck's pose: where its wheels touch (x, y, z), its turn (x, y, z, w), then each wheel's spin, steer and
      squash (19 numbers); null with no truck. */
  truckPose(): Float32Array | null {
    const tr = this.truck;
    if (!tr) return null;
    const p = tr.body.translation();
    const q = tr.body.rotation();
    const pose: Pose = { t: [p.x, p.y, p.z], q: [q.x, q.y, q.z, q.w] };
    const out = new Float32Array(19);
    out.set([...at(pose, [0, -CHASSIS_Y, 0]), ...pose.q]);
    for (let w = 0; w < 4; w++) out.set([tr.vehicle.wheelRotation(w) ?? 0, tr.vehicle.wheelSteering(w) ?? 0, compressOf(tr, w)], 7 + w * 3);
    return out;
  }

  /** Is this tile still held in the hand? */
  isHeld(id: number): boolean {
    return (this.tiles.get(id)?.held ?? 0) > 0;
  }

  /** How many magnet hinges hold this tile. */
  hinges(id: number): number {
    return this.tiles.get(id)?.joints.length ?? 0;
  }

  free() {
    this.queue.free();
    this.world.free();
  }
}

const key = (i: number, j: number) => (i < j ? `${i}:${j}` : `${j}:${i}`);
