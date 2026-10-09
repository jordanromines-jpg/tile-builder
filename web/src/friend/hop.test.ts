import { describe, expect, it } from "vitest";
import { HOP_LIFT, HOP_SAMPLES, hopAt, squashKeyframes, tossKeyframes } from "./hop";

describe("Pip's hop", () => {
  it("follows one arc from where he is to where he lands, rising HOP_LIFT on a level hop", () => {
    const from = { x: 40, y: 500 };
    const to = { x: 640, y: 500 };
    const k = Array.from({ length: 61 }, (_, i) => hopAt(from, to, 600, i * 10));
    expect(k[0]).toEqual(from);
    expect(k[60]).toEqual(to);
    expect(Math.min(...k.map((p) => p.y))).toBeCloseTo(500 - HOP_LIFT, 0);
    // steady across, a parabola up and down (gravity pulls y down)
    k.slice(1).forEach((p, i) => expect(p.x - k[i].x).toBeCloseTo(10, 6));
  });

  it("a fast hop rises as high as a slow one, and it stays where it lands", () => {
    const top = (ms: number) => Math.min(...Array.from({ length: 101 }, (_, i) => hopAt({ x: 0, y: 300 }, { x: 300, y: 300 }, ms, (ms * i) / 100).y));
    expect(top(600)).toBeCloseTo(top(300), 6);
    expect(hopAt({ x: 0, y: 300 }, { x: 300, y: 300 }, 300, 900)).toEqual({ x: 300, y: 300 });
  });

  it("aimed again as the tiles move, he moves smoothly and lands on where they are now", () => {
    const from = { x: 900, y: 400 };
    const aim = (t: number) => ({ x: 900 - 0.5 * t, y: 380 - 0.08 * t });
    const k = Array.from({ length: 37 }, (_, i) => hopAt(from, aim(i * 16.67), 600, i * 16.67));
    k.slice(1).forEach((p, i) => expect(Math.hypot(p.x - k[i].x, p.y - k[i].y)).toBeLessThan(30));
    expect(k[36].x).toBeCloseTo(aim(600).x, 0);
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
