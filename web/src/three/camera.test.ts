import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { ANY_YAW, AZIMUTH, cornersOf, ELEVATION, fitBox, fitDistance, fitTight, FOV, viewFrom } from "./camera";

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

  it("fitBox (2.8.1): every corner ends up inside the view, checked by width and by height apart", () => {
    const corners = cornersOf(new THREE.Vector3(-13, 0, -6), new THREE.Vector3(13, 2, 6));
    const aspect = 1.44;
    const d = fitTight(corners, aspect, 0.6);
    const cam = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 500);
    cam.position.copy(viewFrom(new THREE.Vector3(), d));
    cam.lookAt(0, 0, 0);
    cam.updateMatrixWorld();
    const ndc = corners.map((c) => c.clone().project(cam));
    // within the width, and within the 60 % of the height left clear of panels
    expect(Math.max(...ndc.map((p) => Math.abs(p.x)))).toBeLessThanOrEqual(1 + 1e-6);
    expect(Math.max(...ndc.map((p) => Math.abs(p.y)))).toBeLessThanOrEqual(0.6 + 1e-6);
    // and it touches one edge: no more distance than it needs
    expect(Math.max(...ndc.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y) / 0.6)))).toBeCloseTo(1, 3);
  });

  it("a long, low build stands closer than the old sphere round it; a view that turns stands back for every way", () => {
    const corners = cornersOf(new THREE.Vector3(-13, 0, -6), new THREE.Vector3(13, 2, 6));
    expect(fitBox(corners, 1.44, 0.6)).toBeLessThan(fitDistance(26, 1.44, 2, 0.6));
    expect(fitBox(corners, 1.44, 0.6, undefined, ANY_YAW)).toBeGreaterThanOrEqual(fitBox(corners, 1.44, 0.6));
  });
});
