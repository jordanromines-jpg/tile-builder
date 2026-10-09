// @vitest-environment node
/* The physics' calibration truths (4.2, P0): what real magnet tiles do, which the simulation must agree with before
   R14 can prove anything. */
import { beforeAll, describe, expect, it } from "vitest";
import { DEFAULT_LEG } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder } from "../projects/helpers";
import { kicker } from "../projects/track-kit";
import { R14 } from "./r14";
import { rapier, type Rapier } from "./rapier";
import { buildScene } from "./scene";
import { tiltTest } from "./tilt";

let R: Rapier;
beforeAll(async () => {
  R = await rapier();
});

const meta = (id: string, theme = "homes") => ({ id, title: id, theme, age: "c", stars: 1, done: "-" }) as never;
function make(id: string, f: (b: Builder) => void): Project {
  const b = new Builder();
  f(b);
  b.step("all");
  return b.build(meta(id));
}
function stands(p: Project, k = 6): boolean {
  const s = buildScene(R, p, { leg: DEFAULT_LEG, hinge: R14.hinge, iterations: R14.iterations });
  const r = tiltTest(s, k * R14.lean, () => true, false);
  s.free();
  return r.pass;
}

describe("the physics agrees with real tiles", () => {
  it("C1: a lone standing square tips over", () => expect(stands(make("c1", (b) => b.wallX("square", "red", 0, 0, 0)))).toBe(false));
  it("C2: a ring of four stands", () => expect(stands(make("c2", (b) => b.ring("red", 0, 0, 0)))).toBe(true));
  it("C3: two flat squares bridging a gap fold at their seam; one on two rings stands", () => {
    const bridge = make("c3", (b) => {
      b.ring("red", -1, 0, 0);
      b.ring("red", 2, 0, 0);
      b.add("square", "blue", [0, 1, 1], [-Math.PI / 2, 0]);
      b.add("square", "blue", [1, 1, 1], [-Math.PI / 2, 0]);
    });
    const lid = make("c3b", (b) => {
      b.ring("red", -1, 0, 0);
      b.ring("red", 1, 0, 0);
      b.add("square", "blue", [0, 1, 1], [-Math.PI / 2, 0]);
    });
    expect(stands(bridge)).toBe(false);
    expect(stands(lid)).toBe(true);
  });
  it("C5: a tower 7 high and 1 wide falls; 2 wide, it stands", () => {
    expect(stands(make("c5", (b) => Array.from({ length: 7 }, (_, y) => b.ring("red", 0, 0, y))))).toBe(false);
    expect(stands(make("c5b", (b) => Array.from({ length: 7 }, (_, y) => b.room("red", 0, 0, 2, 2, y))))).toBe(true);
  }, 20_000);
  it("C8: a square held out flat by one top edge droops", () => {
    expect(stands(make("c8", (b) => (b.ring("red", 0, 0, 0), b.add("square", "blue", [0, 1, 2], [-Math.PI / 2, 0]))))).toBe(false);
  });
  it("C4: a kicker holds a resting 60 g truck with its brace, and folds without it", () => {
    const drop = (brace: boolean) => {
      const b = new Builder();
      kicker(b, "red", { x: 0, y: 0, z: 0 }, "N");
      let p = b.build(meta("c4", "trucks"));
      if (!brace) {
        const keep = p.placed.map((t, i) => (t.role === "brace" ? -1 : i)).filter((i) => i >= 0);
        p = { ...p, placed: keep.map((i) => p.placed[i]), steps: [{ say: "all", tiles: keep.map((_, k) => k) }] };
      }
      const s = buildScene(R, p, { leg: DEFAULT_LEG, hinge: R14.hinge, iterations: R14.iterations });
      const slope = Math.PI / 6;
      const lift = 0.195;
      const truck = s.world.createRigidBody(
        R.RigidBodyDesc.dynamic()
          .setTranslation(0.5, 0.5 + lift * Math.cos(slope), -Math.cos(slope) + lift * Math.sin(slope))
          .setRotation({ x: Math.sin(slope / 2), y: 0, z: 0, w: Math.cos(slope / 2) })
          .setCanSleep(false),
      );
      s.world.createCollider(R.ColliderDesc.cuboid(0.4, 0.15, 0.25).setMass(60).setFriction(1), truck);
      const ramps = p.placed.map((t, i) => (t.role === "ramp" ? i : -1)).filter((i) => i >= 0);
      const before = s.poses();
      s.step(240);
      const after = s.poses();
      s.free();
      return Math.max(...ramps.map((i) => (before[i].t[1] - after[i].t[1]) * 76.2));
    };
    expect(drop(true)).toBeLessThan(2);
    expect(drop(false)).toBeGreaterThan(5);
  });
  it("is deterministic: the same build twice comes out the same", () => {
    const p = make("d", (b) => (b.ring("red", 0, 0, 0), b.ring("blue", 0, 0, 1)));
    const once = () => {
      const s = buildScene(R, p, { leg: DEFAULT_LEG, hinge: R14.hinge, iterations: R14.iterations });
      s.step(120);
      const out = JSON.stringify(s.poses());
      s.free();
      return out;
    };
    expect(once()).toBe(once());
  });
});
