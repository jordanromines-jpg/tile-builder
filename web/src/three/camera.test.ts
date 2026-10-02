import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { AZIMUTH, ELEVATION, fitDistance, viewFrom } from "./camera";

describe("camera", () => {
  it("stands further back for a bigger model, a narrower view or panels over part of it", () => {
    const d = fitDistance(4, 1.4);
    expect(fitDistance(8, 1.4)).toBeGreaterThan(d);
    expect(fitDistance(4, 0.75)).toBeGreaterThan(d);
    expect(fitDistance(4, 1.4, 4, 0.6)).toBeGreaterThan(d);
  });

  it("looks from the three-quarter angle, a little above", () => {
    const p = viewFrom(new THREE.Vector3(), 10);
    expect(p.length()).toBeCloseTo(10);
    expect(Math.asin(p.y / 10)).toBeCloseTo(ELEVATION);
    expect(Math.atan2(p.x, p.z)).toBeCloseTo(AZIMUTH);
  });
});
