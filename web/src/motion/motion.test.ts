import { describe, expect, it } from "vitest";
import { arcAt, arcBetween, arcVelocity, hopBetween, sampleArc } from "./arc";
import { springLinear, springVars } from "./css";
import { fall, MM } from "./fall";
import { atRest, dampingRatio, settleTime, spring, springAt, springFor, springStep } from "./spring";

/** Steps the same equation numerically, finely, as an independent check of the closed form. */
function integrate(k: number, c: number, m: number, x0: number, v0: number, t: number) {
  let x = x0;
  let v = v0;
  const dt = 1e-5;
  for (let s = 0; s < t; s += dt) {
    v += ((-k * x - c * v) / m) * dt;
    x += v * dt;
  }
  return { x, v };
}

describe("springs", () => {
  it("start where they are let go, and settle to the target", () => {
    for (const z of [0.3, 0.7, 1, 1.6, 4]) {
      const s = springFor(0.5, z);
      expect(dampingRatio(s)).toBeCloseTo(z, 9);
      expect(springAt(s, 0)).toEqual({ x: 1, v: 0 });
      expect(Math.abs(springAt(s, 0.5).x)).toBeLessThanOrEqual(0.0051);
      expect(Math.abs(springAt(s, 5).x)).toBeLessThan(1e-6);
    }
  });

  it("matches a fine numerical step in all three regimes, with a start velocity too", () => {
    for (const c of [3, 12, 40]) {
      const s = spring(100, c, 1.5);
      const exact = springAt(s, 0.6, 0.8, -2);
      const num = integrate(100, c, 1.5, 0.8, -2, 0.6);
      expect(exact.x).toBeCloseTo(num.x, 3);
      expect(exact.v).toBeCloseTo(num.v, 2);
    }
  });

  it("critically damped never overshoots; under-damped does, by the expected amount", () => {
    const crit = springFor(0.6, 1);
    for (let t = 0; t <= 1; t += 0.01) expect(springStep(crit, t)).toBeLessThanOrEqual(1 + 1e-12);
    const z = 0.5;
    const under = springFor(0.6, z);
    const peak = Math.max(...Array.from({ length: 400 }, (_, i) => springStep(under, i / 200)));
    // overshoot of a step response: exp(−πζ/√(1−ζ²)) = 16.3 % at ζ = 0.5
    expect(peak - 1).toBeCloseTo(Math.exp((-Math.PI * z) / Math.sqrt(1 - z * z)), 3);
  });

  it("is closed form: a huge first frame lands where the spring is, with nothing blown up", () => {
    const s = springFor(0.6, 0.5);
    for (const t of [10, 1e3, 1e6]) {
      const st = springAt(s, t, 1, 50);
      expect(Number.isFinite(st.x) && Number.isFinite(st.v)).toBe(true);
      expect(atRest(st, 1e-9, 1e-9)).toBe(true);
    }
    // a stiff spring, and a very over-damped one, at 3 s: finite, at rest
    expect(Math.abs(springAt(spring(1e6, 2000), 3).x)).toBeLessThan(1e-12);
    expect(Number.isFinite(springAt(spring(1e6, 1e5), 3).x)).toBe(true);
  });

  it("settleTime finds when it stays within the tolerance", () => {
    const s = springFor(0.7, 0.8);
    expect(settleTime(s)).toBeCloseTo(0.7, 2);
  });
});

describe("falls", () => {
  const g = 128.7;
  it("lands on the floor at √(2h/g), then bounces at e times the speed", () => {
    const f = fall({ height: 0.4, g, e: 0.25 });
    const t0 = Math.sqrt((2 * 0.4) / g);
    expect(f.hitTimes[0]).toBeCloseTo(t0, 9);
    expect(f.at(0).y).toBeCloseTo(0.4, 9);
    expect(f.at(t0).y).toBeCloseTo(0, 9);
    const vIn = g * t0;
    const apex = f.at(t0 + (0.25 * vIn) / g);
    expect(apex.y).toBeCloseTo((0.25 * vIn) ** 2 / (2 * g), 9);
    expect(apex.v).toBeCloseTo(0, 6);
  });

  it("one small bounce and rest, in under 180 ms, from 0.4 square with e 0.25", () => {
    const f = fall({ height: 0.4, g, e: 0.25 });
    expect(f.hitTimes).toHaveLength(2);
    expect(f.duration).toBeLessThan(0.18);
    expect(f.at(f.duration)).toEqual({ y: 0, v: 0 });
    expect(f.at(f.duration + 1)).toEqual({ y: 0, v: 0 });
  });

  it("rests when the next bounce would rise under 1 mm, never goes below the floor", () => {
    const f = fall({ height: 3, g, e: 0.5 });
    const last = f.hitTimes.at(-1)!;
    expect(f.duration).toBe(last);
    const speed = Math.sqrt(2 * g * 3) * 0.5 ** (f.hitTimes.length - 1);
    expect((0.5 * speed) ** 2 / (2 * g)).toBeLessThan(MM);
    for (let t = 0; t < f.duration; t += 0.001) expect(f.at(t).y).toBeGreaterThanOrEqual(0);
    // every apex before the last was above the limit
    expect(f.hitTimes.length).toBeGreaterThan(1);
  });

  it("e = 0 lands and stays; a thrown-up start takes longer", () => {
    expect(fall({ height: 1, g, e: 0 }).hitTimes).toHaveLength(1);
    expect(fall({ height: 1, g, e: 0, v0: 10 }).duration).toBeGreaterThan(fall({ height: 1, g, e: 0 }).duration);
  });
});

describe("arcs", () => {
  it("land exactly on their point at their time", () => {
    const a = arcBetween([1, 5, -2], [4, 0.5, 3], 0.36, [0, -43, 0]);
    const end = arcAt(a, a.time);
    expect(end[0]).toBeCloseTo(4, 9);
    expect(end[1]).toBeCloseTo(0.5, 9);
    expect(end[2]).toBeCloseTo(3, 9);
    expect(arcAt(a, 0)).toEqual([1, 5, -2]);
  });

  it("have the velocity of the position's slope, and gravity pulls the right way", () => {
    const a = arcBetween([0, 2, 0], [3, 0, 0], 0.4, [0, -43, 0]);
    const h = 1e-6;
    const num = (arcAt(a, 0.2 + h)[1] - arcAt(a, 0.2 - h)[1]) / (2 * h);
    expect(arcVelocity(a, 0.2)[1]).toBeCloseTo(num, 4);
    expect(arcVelocity(a, 0.3)[1] - arcVelocity(a, 0.1)[1]).toBeCloseTo(-43 * 0.2, 9);
    // the part the gravity doesn't touch is steady
    expect(arcVelocity(a, 0.1)[0]).toBeCloseTo(arcVelocity(a, 0.3)[0], 12);
  });

  it("a level hop on a screen (y down) rises by its lift, whatever its length or time", () => {
    for (const ms of [300, 600]) {
      const a = hopBetween([0, 100], [400, 100], ms / 1000, 36, 1, true);
      const pts = sampleArc(a, 200);
      expect(Math.min(...pts.map((p) => p[1]))).toBeCloseTo(100 - 36, 1);
      expect(pts[0]).toEqual([0, 100]);
      expect(pts[200][0]).toBeCloseTo(400, 6);
      expect(pts[200][1]).toBeCloseTo(100, 6);
    }
  });

  it("a hop to a higher place rises above the higher end, and a drop still lifts first", () => {
    const up = sampleArc(hopBetween([0, 300], [200, 100], 0.6, 36, 1, true), 200);
    expect(Math.min(...up.map((p) => p[1]))).toBeCloseTo(100 - 36, 1);
    const down = sampleArc(hopBetween([0, 100], [200, 300], 0.6, 36, 1, true), 200);
    expect(Math.min(...down.map((p) => p[1]))).toBeCloseTo(100 - 36, 1);
    expect(down[200][1]).toBeCloseTo(300, 6);
  });

  it("samples n + 1 keyframes, first and last on the ends", () => {
    const pts = sampleArc(hopBetween([5, 5], [50, 9], 0.5, 20, 1, true), 16);
    expect(pts).toHaveLength(17);
    expect(pts[16][0]).toBeCloseTo(50, 9);
  });
});

describe("css springs", () => {
  it("make a linear() easing that starts at 0 and ends at 1", () => {
    const s = springFor(0.4, 0.7);
    const css = springLinear(s, 0.4);
    expect(css).toMatch(/^linear\(0, .*, 1\)$/);
    expect(css.split(",")).toHaveLength(32);
  });

  it("an under-damped one passes 1 on the way", () => {
    const nums = springLinear(springFor(0.4, 0.5), 0.4).slice(7, -1).split(", ").map(Number);
    expect(Math.max(...nums)).toBeGreaterThan(1);
  });

  it("the three the screens use, with their durations", () => {
    const v = springVars();
    expect(Object.keys(v).sort()).toEqual(["--spring-press", "--spring-press-t", "--spring-settle", "--spring-settle-t", "--spring-ui", "--spring-ui-t"]);
    expect(v["--spring-press-t"]).toBe("220ms");
  });
});
