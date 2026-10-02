import { describe, expect, it } from "vitest";
import { BRANDS, isConvex, SHAPE_IDS, SHAPES, signedArea2, tallHeight, tileName, TALL_LEG_CHOICES } from "./catalog";

describe("the catalog", () => {
  it("draws every shape counter-clockwise and convex, from a base edge (0,0)–(1,0) or longer", () => {
    for (const id of SHAPE_IDS) {
      for (const leg of TALL_LEG_CHOICES) {
        const pts = SHAPES[id].points(leg);
        expect(signedArea2(pts), id).toBeGreaterThan(0);
        expect(isConvex(pts), id).toBe(true);
        expect(pts[0]).toEqual([0, 0]);
        expect(pts[1][1]).toBe(0);
      }
    }
  });

  it("gives the tall triangle a height of 1.80 for legs of 1.867", () => {
    expect(tallHeight(1.867).toFixed(2)).toBe("1.80");
  });

  it("names tiles the way a child hears them", () => {
    expect(tileName("square", "red")).toBe("red square");
    expect(tileName("square", "red", 4)).toBe("4 red squares");
    expect(tileName("tri-isosceles-tall", undefined, 2)).toBe("2 tall triangles");
    expect(tileName("tri-equilateral", undefined, 1)).toBe("1 triangle");
  });

  it("knows Magna-Tiles' measured leg and that Connetix's is unknown", () => {
    expect(BRANDS.magna.tallLeg).toBe(1.877);
    expect(BRANDS.connetix.tallLeg).toBeNull();
    expect(BRANDS.connetix.extras).toContain("window");
  });
});
