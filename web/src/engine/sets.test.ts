import { describe, expect, it } from "vitest";
import { SETS } from "./sets";

describe("set presets", () => {
  it("each sums to its total", () => {
    for (const s of SETS) expect(Object.values(s.pieces).reduce((a, b) => a + (b ?? 0), 0), s.name).toBe(s.total);
  });
});
