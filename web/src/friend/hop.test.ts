import { describe, expect, it } from "vitest";
import { HOP_LIFT, HOP_SAMPLES, hopKeyframes, squashKeyframes, tossKeyframes } from "./hop";

const xy = (k: { translate: string }) => k.translate.replace(/px/g, "").split(" ").map(Number);

describe("Pip's hop", () => {
  it("is 16 samples of one arc from where he is to where he lands, rising HOP_LIFT on a level hop", () => {
    const k = hopKeyframes({ x: 40, y: 500 }, { x: 640, y: 500 }, 600);
    expect(k).toHaveLength(HOP_SAMPLES + 1);
    expect(xy(k[0])).toEqual([40, 500]);
    expect(xy(k[HOP_SAMPLES])).toEqual([640, 500]);
    const top = Math.min(...k.map((s) => xy(s)[1]));
    expect(top).toBeCloseTo(500 - HOP_LIFT, 0);
    // steady across, a parabola up and down (gravity pulls y down)
    const xs = k.map((s) => xy(s)[0]);
    xs.slice(1).forEach((x, i) => expect(x - xs[i]).toBeCloseTo(600 / HOP_SAMPLES, 1));
  });

  it("a fast hop rises as high as a slow one", () => {
    const a = hopKeyframes({ x: 0, y: 300 }, { x: 300, y: 300 }, 600);
    const b = hopKeyframes({ x: 0, y: 300 }, { x: 300, y: 300 }, 300);
    expect(Math.min(...a.map((s) => xy(s)[1]))).toBeCloseTo(Math.min(...b.map((s) => xy(s)[1])), 0);
  });

  it("the landing squashes to scaleY 0.86 and scaleX 1.08, then springs back and rests at 1", () => {
    const k = squashKeyframes();
    expect(k[0].transform).toBe("scale(1.0800, 0.8600)");
    expect(k[k.length - 1].transform).toBe("scale(1.0000, 1.0000)");
    // it passes 1 on the way back (a stretch), once
    const ys = k.map((s) => Number(/, ([\d.]+)\)/.exec(s.transform)![1]));
    expect(Math.max(...ys)).toBeGreaterThan(1);
  });

  it("tossed tiles fly on an arc, spin, shrink and are gone on arrival", () => {
    const k = tossKeyframes(-120, -200, 300);
    expect(k).toHaveLength(HOP_SAMPLES + 1);
    expect(k[0]).toEqual({ transform: "translate(0.00px, 0.00px) rotate(0.0deg) scale(1.000)", opacity: 1 });
    expect(k[HOP_SAMPLES].transform).toBe("translate(-120.00px, -200.00px) rotate(540.0deg) scale(0.400)");
    expect(k[HOP_SAMPLES].opacity).toBe(0);
    const ys = k.map((s) => Number(/, (-?[\d.]+)px\)/.exec(s.transform)![1]));
    expect(Math.min(...ys)).toBeLessThan(-200);
  });
});
