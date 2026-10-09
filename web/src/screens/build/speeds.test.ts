import { describe, expect, it } from "vitest";
import { guideTimes } from "../../friend/pace";
import { paceOf, sayAt, WATCH_SECONDS, WATCH_SPEEDS } from "./speeds";

describe("Watch it build's speeds (4.1)", () => {
  it("gives a step 6, 3.5 and 1.5 seconds", () => {
    expect(WATCH_SPEEDS.map((s) => WATCH_SECONDS[s])).toEqual([6, 3.5, 1.5]);
  });

  it("hurries Pip only at Fast, and says the line only at Slow and Medium", () => {
    expect(WATCH_SPEEDS.map(paceOf)).toEqual(["normal", "normal", "fast"]);
    expect(WATCH_SPEEDS.map(sayAt)).toEqual([true, true, false]);
  });

  it("halves Pip's hop, hold and toss at Fast, and the hold still ends after his hop", () => {
    const n = guideTimes("normal");
    const f = guideTimes("fast");
    expect(n.hold).toBe(0.9);
    expect(f.hold).toBeCloseTo(n.hold / 2);
    expect(f.hopMs).toBe(n.hopMs / 2);
    expect(f.tossMs).toBe(n.tossMs / 2);
    expect(f.hold * 1000).toBeGreaterThan(f.hopMs);
    expect(guideTimes()).toEqual(n);
  });
});
