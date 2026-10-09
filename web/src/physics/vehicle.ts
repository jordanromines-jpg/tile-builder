/* The Pip truck in the physics (4.0c): a 60 g chassis on four ray-cast wheels, sized from the very numbers the
   picture is drawn from (three/truck/spec.ts). Each wheel is a ray from its spring's top: a spring and a damper push
   the chassis up where the ray meets a tile or the table, and the tyre's grip stops it sliding sideways, up to its
   grip times its load (plastic on plastic slides a little: Jordan, "tire friction to emulate plastic toy wheels sliding
   across smooth Hot Wheels track pieces"). The truck is pushed along at its centre of mass, so a push never tips it.
   Rapier's own ray-cast vehicle rolled the chassis onto one side whenever it wasn't facing along z, so this small one
   is ours: its springs sag a tenth of their travel at rest and stop hard at the bump stop. */
import { TRUCK, WHEEL_XZ } from "../three/truck/spec";
import type { Rapier } from "./rapier";
import type { Scene } from "./scene";
import { G } from "./units";

type World = Scene["world"];
type Body = ReturnType<World["createRigidBody"]>;
type Collider = ReturnType<World["getCollider"]>;

/** the chassis: a box over the wheels, its middle this high above the ground at rest */
export const CHASSIS = { halfWidth: TRUCK.bodyWidth / 2, halfHeight: 0.14, halfLength: TRUCK.length / 2 } as const;
export const CHASSIS_Y = TRUCK.rideHeight + CHASSIS.halfHeight;
/** the spring's length at rest, from its top on the chassis to the wheel's middle */
export const REST_LENGTH = 0.12;
/** the solid part of a tyre, as a share of its radius */
const TYRE_SOLID = 0.8;
const PER_WHEEL = TRUCK.massGrams / 4;
const SAG = TRUCK.travel / 10;
/** spring stiffness (force a square): a tenth of the travel's sag under a quarter of the truck; damping half critical;
    grip: how much sideways force a tyre holds for its load; most: the bump stop's force, eight times its share of the truck */
export const SPRING = { stiffness: (PER_WHEEL * G) / SAG, damping: Math.sqrt(((PER_WHEEL * G) / SAG) * PER_WHEEL), grip: 1.1, most: 8 * PER_WHEEL * G };

type V = { x: number; y: number; z: number };
const rot = (q: { x: number; y: number; z: number; w: number }, v: V): V => {
  const c1 = { x: q.y * v.z - q.z * v.y, y: q.z * v.x - q.x * v.z, z: q.x * v.y - q.y * v.x };
  const c2 = { x: q.y * c1.z - q.z * c1.y, y: q.z * c1.x - q.x * c1.z, z: q.x * c1.y - q.y * c1.x };
  return { x: v.x + 2 * (q.w * c1.x + c2.x), y: v.y + 2 * (q.w * c1.y + c2.y), z: v.z + 2 * (q.w * c1.z + c2.z) };
};
const dot = (a: V, b: V) => a.x * b.x + a.y * b.y + a.z * b.z;

/** Four wheels on rays: the few calls the run makes, wheel by wheel. */
export class Wheels {
  private contact = [false, false, false, false];
  private length = [REST_LENGTH, REST_LENGTH, REST_LENGTH, REST_LENGTH];
  private force = [0, 0, 0, 0];
  private ground: (Collider | null)[] = [null, null, null, null];
  private steer = [0, 0, 0, 0];
  private spin = [0, 0, 0, 0];
  private springsOn = true;
  private gripOn = true;

  constructor(
    private R: Rapier,
    private world: World,
    private body: Body,
  ) {}

  /** One step: springs, grip, and the wheels' turning. */
  update(dt: number) {
    const R = this.R;
    const p = this.body.translation();
    const q = this.body.rotation();
    const down = rot(q, { x: 0, y: -1, z: 0 });
    const forward = rot(q, { x: 0, y: 0, z: 1 });
    const hub = TRUCK.wheelRadius - CHASSIS_Y;
    // a wheel hangs down past its rest length (as far as its travel) before it leaves the ground
    const reach = REST_LENGTH + TRUCK.travel + TRUCK.wheelRadius;
    for (let w = 0; w < 4; w++) {
      const [x, z] = WHEEL_XZ[w];
      const top = rot(q, { x, y: hub + REST_LENGTH, z });
      const at = { x: p.x + top.x, y: p.y + top.y, z: p.z + top.z };
      const hit = this.world.castRayAndGetNormal(new R.Ray(at, down), reach, true, undefined, undefined, undefined, this.body);
      if (!hit) {
        this.contact[w] = false;
        this.length[w] = REST_LENGTH;
        this.force[w] = 0;
        this.ground[w] = null;
      } else {
        this.contact[w] = true;
        this.ground[w] = hit.collider;
        const len = hit.timeOfImpact - TRUCK.wheelRadius;
        this.length[w] = Math.max(REST_LENGTH - TRUCK.travel, len);
        const squash = REST_LENGTH - len;
        // past the bump stop the spring is five times as stiff
        const stop = Math.max(0, squash - TRUCK.travel);
        const along = -dot(this.body.velocityAtPoint(at), down);
        // no more than a bump stop gives (a ray that starts inside a loose tile would read a squash no spring has)
        const f = this.springsOn ? Math.min(SPRING.most, Math.max(0, SPRING.stiffness * (squash + 4 * stop) - SPRING.damping * along)) : 0;
        this.force[w] = f;
        // the spring pushes along the chassis's own up, as a real one does: the ground's normal at a tile's edge can
        // point back down a ramp and stop the truck at its crest
        const n = { x: -down.x, y: -down.y, z: -down.z };
        this.body.applyImpulseAtPoint({ x: n.x * f * dt, y: n.y * f * dt, z: n.z * f * dt }, at, true);
        // and presses on what it stands on, if that can move (a crush car's roof, a fallen tile)
        const under = hit.collider.parent();
        const toi0 = hit.timeOfImpact;
        if (under?.isDynamic()) under.applyImpulseAtPoint({ x: -n.x * f * dt, y: -n.y * f * dt, z: -n.z * f * dt }, { x: at.x + down.x * toi0, y: at.y + down.y * toi0, z: at.z + down.z * toi0 }, true);
        // grip: cancel the tyre's sideways slide, no more than its grip times its load; applied level with the centre of
        // mass, so it steers the truck without rolling it
        const s = this.steer[w];
        const fwd = rot(q, { x: Math.sin(s), y: 0, z: Math.cos(s) });
        const side = { x: n.y * fwd.z - n.z * fwd.y, y: n.z * fwd.x - n.x * fwd.z, z: n.x * fwd.y - n.y * fwd.x };
        const toi = hit.timeOfImpact;
        const vs = dot(this.body.velocityAtPoint({ x: at.x + down.x * toi, y: at.y + down.y * toi, z: at.z + down.z * toi }), side);
        const most = this.gripOn ? SPRING.grip * f * dt : 0;
        const j = Math.max(-most, Math.min(most, -vs * PER_WHEEL));
        const level = rot(q, { x, y: TRUCK.comHeight - CHASSIS_Y, z });
        this.body.applyImpulseAtPoint({ x: side.x * j, y: side.y * j, z: side.z * j }, { x: p.x + level.x, y: p.y + level.y, z: p.z + level.z }, true);
      }
      // the wheel turns with the ground going by
      this.spin[w] += (dot(this.body.linvel(), forward) * dt) / TRUCK.wheelRadius;
    }
  }

  wheelIsInContact(w: number) {
    return this.contact[w];
  }
  wheelGroundObject(w: number) {
    return this.ground[w];
  }
  wheelSuspensionForce(w: number) {
    return this.force[w];
  }
  wheelSuspensionLength(w: number) {
    return this.length[w];
  }
  wheelRotation(w: number) {
    return this.spin[w];
  }
  wheelSteering(w: number) {
    return this.steer[w];
  }
  setWheelSteering(w: number, a: number) {
    this.steer[w] = a;
  }
  /** springs off for a moment at a take-off (the rear ones, still squashed on the ramp, would flip the truck) */
  springs(on: boolean) {
    this.springsOn = on;
  }
  /** the tyres' grip off while a hand holds the truck (the hand keeps it from sliding) */
  grip(on: boolean) {
    this.gripOn = on;
  }
  currentVehicleSpeed() {
    return dot(this.body.linvel(), rot(this.body.rotation(), { x: 0, y: 0, z: 1 }));
  }
}

export interface Truck {
  body: Body;
  vehicle: Wheels;
}

/** The truck's rotation facing `heading` (x, z), its nose up by `pitch` (radians, on a ramp). */
export function standing(heading: [number, number], pitch = 0) {
  const yaw = Math.atan2(heading[0], heading[1]);
  // yaw about y, then pitch the nose up about the truck's own side (−x): q = yaw · pitch
  const cy = Math.cos(yaw / 2);
  const sy = Math.sin(yaw / 2);
  const cp = Math.cos(-pitch / 2);
  const sp = Math.sin(-pitch / 2);
  return { x: cy * sp, y: sy * cp, z: -sy * sp, w: cy * cp };
}

/** A vector turned by a rotation. */
export function rotate(q: { x: number; y: number; z: number; w: number }, v: [number, number, number]): [number, number, number] {
  const r = rot(q, { x: v[0], y: v[1], z: v[2] });
  return [r.x, r.y, r.z];
}

/** A truck standing at `at` (where the wheels touch, the middle of the wheelbase) facing `heading` (x, z), on a slope
    of `pitch`. */
export function makeTruck(R: Rapier, world: World, at: [number, number, number], heading: [number, number], pitch = 0): Truck {
  const q = standing(heading, pitch);
  const up = rotate(q, [0, CHASSIS_Y, 0]);
  const body = world.createRigidBody(
    R.RigidBodyDesc.dynamic()
      .setTranslation(at[0] + up[0], at[1] + up[1], at[2] + up[2])
      .setRotation(q)
      .setCanSleep(false)
      .setCcdEnabled(true),
  );
  // the centre of mass sits low, between the axles (a heavy chassis and wheels under a light shell)
  world.createCollider(
    R.ColliderDesc.cuboid(CHASSIS.halfWidth, CHASSIS.halfHeight, CHASSIS.halfLength)
      .setMassProperties(TRUCK.massGrams, { x: 0, y: TRUCK.comHeight - CHASSIS_Y, z: 0 }, { x: 5.4, y: 6.9, z: 2.3 }, { x: 0, y: 0, z: 0, w: 1 })
      .setFriction(0.4)
      .setRestitution(0.1)
      .setActiveEvents(R.ActiveEvents.CONTACT_FORCE_EVENTS),
    body,
  );
  // each tyre's front meets what's ahead (a slope rising out of a dip, a step's edge) as a round, slippery solid a little
  // inside the tyre, clear of the ground at rest: the rays hold the truck up, and these roll it up and over
  for (const [x, z] of WHEEL_XZ)
    world.createCollider(
      R.ColliderDesc.ball(TYRE_SOLID * TRUCK.wheelRadius)
        .setTranslation(x, TRUCK.wheelRadius - CHASSIS_Y, z)
        .setDensity(0)
          .setFriction(0)
        .setFrictionCombineRule(R.CoefficientCombineRule.Min)
        .setRestitution(0.1)
        .setActiveEvents(R.ActiveEvents.CONTACT_FORCE_EVENTS),
      body,
    );
  return { body, vehicle: new Wheels(R, world, body) };
}
