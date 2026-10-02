import { describe, expect, it } from "vitest";
import { SHAPE_IDS, TALL_LEG_CHOICES } from "../engine/catalog";
import { buildGeometry, inset } from "./tile";

describe("the 3D tile", () => {
  it("insets a unit square evenly", () => {
    const r = inset([[0, 0], [1, 0], [1, 1], [0, 1]], 0.1);
    expect(r.map((p) => p.map((v) => +v.toFixed(3)))).toEqual([[0.1, 0.1], [0.9, 0.1], [0.9, 0.9], [0.1, 0.9]]);
  });

  it("builds every shape, and shares geometry between tiles of a shape", () => {
    for (const s of SHAPE_IDS) {
      const g = buildGeometry(s);
      expect(g.frame.getAttribute("position").count, s).toBeGreaterThan(0);
      expect(buildGeometry(s)).toBe(g);
    }
    expect(buildGeometry("fence").glass).toBeNull();
    const legs = new Set(TALL_LEG_CHOICES.map((l) => buildGeometry("tri-isosceles-tall", l)));
    expect(legs.size).toBe(3);
  });
});
