import { describe, expect, it } from "vitest";
import { easeOutBack, fade, mulberry, STAGGER, stepProgress } from "./anim";
import { partsOf } from "./parts";

describe("the drop-in", () => {
  it("is the same every time", () => {
    const a = mulberry(7);
    const b = mulberry(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("settles exactly, with a small overshoot on the way", () => {
    expect(easeOutBack(0)).toBeCloseTo(0, 6);
    expect(easeOutBack(1)).toBe(1);
    expect(Math.max(...[0.6, 0.7, 0.8, 0.9].map(easeOutBack))).toBeGreaterThan(1);
    expect(fade(0.34)).toBe(1);
  });

  it("lands tiles one after another, and hides those past `shown`", () => {
    const p = [0, 0, 0, 1];
    stepProgress(p, 3, 0.1, 1);
    expect(p).toEqual([0.1, 0, 0, 0]);
    for (let i = 0; i < 3; i++) stepProgress(p, 3, 0.1, 1);
    expect(p[0]).toBeGreaterThanOrEqual(STAGGER);
    stepProgress(p, 3, 0.1, 1);
    expect(p[1]).toBeGreaterThan(0);
    for (let i = 0; i < 40; i++) stepProgress(p, 3, 0.1, 1);
    expect(p).toEqual([1, 1, 1, 0]);
    expect(stepProgress(p, 3, 0.1, 1)).toBe(false);
  });

  it("draws a swapped square as two corner triangles, a big square as four squares", () => {
    expect(partsOf("square", "tri-right").map((p) => p.shape)).toEqual(["tri-right", "tri-right"]);
    expect(partsOf("square-large", "square")).toHaveLength(4);
    expect(partsOf("square")).toEqual([{ shape: "square", at: [0, 0] }]);
  });
});
