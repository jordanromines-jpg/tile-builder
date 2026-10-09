import { describe, expect, it } from "vitest";
import { DEFAULT_LEG } from "../engine/catalog";
import { PROJECTS } from "../projects";
import { castle } from "../projects/castle";
import { tipsByStep } from "./tips";

describe("Pip's tips (3.9)", () => {
  it("tells the castle's roof tip at its first roof step only", () => {
    const tips = tipsByStep(castle, DEFAULT_LEG);
    const roofAt = castle.steps.findIndex((s) => s.tiles.some((t) => castle.placed[t].role === "roof"));
    expect([...tips.entries()].filter(([, k]) => k === "roof")).toEqual([[roofAt, "roof"]]);
  });

  it("tells a truck build about its ramp and brace", () => {
    const truck = PROJECTS.find((p) => p.placed.some((t) => t.role === "ramp") && p.placed.some((t) => t.role === "brace"))!;
    const kinds = [...tipsByStep(truck, DEFAULT_LEG).values()];
    expect(kinds).toContain("ramp");
    expect(kinds).toContain("brace");
  });

  it("tells a crash wall build to crash", () => {
    const crash = PROJECTS.find((p) => p.age !== "t" && p.placed.some((t) => t.role === "crash"))!;
    expect([...tipsByStep(crash, DEFAULT_LEG).values()]).toContain("crash");
  });

  it("tells nothing for 0–3, each kind once a build, at most one a step", () => {
    for (const p of PROJECTS) {
      const tips = tipsByStep(p, DEFAULT_LEG);
      if (p.age === "t") expect(tips.size, p.id).toBe(0);
      const kinds = [...tips.values()];
      expect(new Set(kinds).size, p.id).toBe(kinds.length);
    }
  });
});
