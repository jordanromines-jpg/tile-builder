import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { cost } from "./geo";
import { buildTruck } from "./rig";
import { REST_COMPRESS, TRUCK, WHEEL_XZ, restPose, wheelHeight } from "./spec";
import { blinkOpen } from "./Truck";

describe("the Pip truck", () => {
  it("fits its budget: at most 14 draw calls and 30k triangles", () => {
    const { calls, triangles } = cost(buildTruck().root);
    expect(calls).toBeLessThanOrEqual(14);
    expect(triangles).toBeLessThanOrEqual(30000);
  });

  it("has numbers that agree: the wheels touch the ground at rest, and the body rides above the tyres", () => {
    expect(wheelHeight(REST_COMPRESS)).toBeCloseTo(TRUCK.wheelRadius, 9);
    expect(WHEEL_XZ.map(([x]) => Math.abs(x))).toEqual([TRUCK.track / 2, TRUCK.track / 2, TRUCK.track / 2, TRUCK.track / 2]);
    expect(TRUCK.rideHeight).toBeGreaterThan(0);
    // the spring moves the wheel by exactly the travel between fully out and the bump stop
    expect(wheelHeight(1) - wheelHeight(0)).toBeCloseTo(TRUCK.travel, 9);
    expect(TRUCK.comHeight).toBeGreaterThan(TRUCK.rideHeight);
  });

  it("stands on the ground at rest: the lowest point of the tyres is y = 0", () => {
    const rig = buildTruck();
    rig.setPose(restPose());
    rig.root.updateMatrixWorld(true);
    let low = Infinity;
    rig.root.traverse((o) => {
      const im = o as THREE.InstancedMesh;
      if (!im.isInstancedMesh || im.count !== 4 || im.geometry.boundingBox === null) im.geometry?.computeBoundingBox?.();
      if (!im.isInstancedMesh || im.count !== 4) return;
      const m = new THREE.Matrix4();
      const box = im.geometry.boundingBox!;
      // the tyres are the four-instance mesh with the widest reach (the rims are inside them)
      if (box.max.y < 0.2) return;
      for (let i = 0; i < 4; i++) {
        im.getMatrixAt(i, m);
        const b = box.clone().applyMatrix4(m);
        low = Math.min(low, b.min.y);
      }
    });
    expect(low).toBeCloseTo(0, 2);
  });

  it("moves the springs: a squashed corner shortens its shocks", () => {
    const rig = buildTruck();
    const shocks = rig.root.children[0].children.find((c) => (c as THREE.InstancedMesh).count === 8) as THREE.InstancedMesh;
    const len = (i: number) => {
      const m = new THREE.Matrix4();
      shocks.getMatrixAt(i, m);
      return new THREE.Vector3().setFromMatrixScale(m).y;
    };
    rig.setPose(restPose());
    const rest = len(0);
    const p = restPose();
    p.wheels[0].compress = 1;
    rig.setPose(p);
    expect(len(0)).toBeLessThan(rest);
  });

  it("blinks briefly now and then", () => {
    expect(blinkOpen(0)).toBe(1);
    expect(blinkOpen(4.6 * 0.97)).toBeLessThan(0.1);
    expect(blinkOpen(2)).toBe(1);
  });
});
