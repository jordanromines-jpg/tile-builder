import { describe, expect, it } from "vitest";
import { DEFAULT_LEG } from "./catalog";
import { coplanarOverlapArea, crosses, edgesMeet, edgesOf, isOnTable, layerOf, normalOf, orientationOf, worldPolygon, type V3 } from "./geometry";
import type { Placed } from "./types";

const L = DEFAULT_LEG;
const sq = (x: number, y: number, z: number, ry = 0, rx = 0): Placed => ({ shape: "square", pos: [x, y, z], rot: [rx, ry] });
const poly = (p: Placed) => worldPolygon(p, L);
const anyMeet = (a: Placed, b: Placed) => edgesOf(poly(a)).some((e) => edgesOf(poly(b)).some((f) => edgesMeet(e, f)));
const round = (ps: V3[]) => ps.map((p) => p.map((v) => +v.toFixed(6) + 0));

describe("geometry", () => {
  it("places a square turned a quarter so it runs along +z", () => {
    expect(round(poly(sq(0, 0, 0, -Math.PI / 2)))).toEqual([[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]]);
    expect(orientationOf(normalOf(sq(0, 0, 0, -Math.PI / 2), L))).toBe("standing");
  });

  it("two squares in a line meet; a square and a right triangle share an edge", () => {
    expect(anyMeet(sq(0, 0, 0), sq(1, 0, 0))).toBe(true);
    expect(anyMeet(sq(0, 0, 0), sq(2, 0, 0))).toBe(false);
    const tri: Placed = { shape: "tri-right", pos: [1, 0, 0], rot: [0, 0] };
    expect(anyMeet(sq(0, 0, 0), tri)).toBe(true);
  });

  it("a square across a gap meets its neighbours' side edges", () => {
    const bridge = sq(2, 1, 0);
    expect(anyMeet(bridge, sq(1, 1, 0))).toBe(true);
    expect(anyMeet(bridge, sq(3, 1, 0))).toBe(true);
    expect(anyMeet(bridge, sq(1, 0, 0))).toBe(false);
  });

  it("a corner: two walls at right angles share their upright edge", () => {
    expect(anyMeet(sq(0, 0, 0), sq(0, 0, 0, -Math.PI / 2))).toBe(true);
  });

  it("two squares in one place overlap by 1; side by side by 0", () => {
    const a = sq(0, 0, 0);
    expect(coplanarOverlapArea(poly(a), normalOf(a, L), poly(a), normalOf(a, L))).toBeCloseTo(1, 6);
    const b = sq(0.5, 0, 0);
    expect(coplanarOverlapArea(poly(a), normalOf(a, L), poly(b), normalOf(b, L))).toBeCloseTo(0.5, 6);
    const c = sq(1, 0, 0);
    expect(coplanarOverlapArea(poly(a), normalOf(a, L), poly(c), normalOf(c, L))).toBeCloseTo(0, 6);
  });

  it("catches a tile through another, not tiles that only touch", () => {
    const a = sq(0, 0, 0);
    const through = sq(0.5, 0, -0.5, -Math.PI / 2);
    expect(crosses(poly(a), normalOf(a, L), poly(through), normalOf(through, L))).toBe(true);
    const corner = sq(0, 0, 0, -Math.PI / 2);
    expect(crosses(poly(a), normalOf(a, L), poly(corner), normalOf(corner, L))).toBe(false);
  });

  it("knows the table, the layer and a flat tile", () => {
    expect(isOnTable(poly(sq(0, 0, 0)))).toBe(true);
    expect(isOnTable(poly(sq(0, 1, 0)))).toBe(false);
    expect(layerOf(poly(sq(0, 1, 0)))).toBe(1);
    const flat = sq(0, 0, 1, 0, -Math.PI / 2);
    expect(orientationOf(normalOf(flat, L))).toBe("flat");
    expect(isOnTable(poly(flat))).toBe(true);
  });

  it("leans four roof triangles until their apexes meet over the middle", () => {
    const roof = (x: number, z: number, ry: number): Placed => ({ shape: "tri-isosceles-tall", pos: [x, 1, z], rot: [0, ry], role: "roof" });
    const apexes = [roof(0, 1, 0), roof(1, 1, Math.PI / 2), roof(1, 0, Math.PI), roof(0, 0, -Math.PI / 2)].map((r) => poly(r)[2]);
    for (const a of apexes) {
      expect(a[0]).toBeCloseTo(0.5, 6);
      expect(a[2]).toBeCloseTo(0.5, 6);
      expect(a[1]).toBeCloseTo(apexes[0][1], 6);
    }
  });
});
