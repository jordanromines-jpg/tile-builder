import { describe, expect, it } from "vitest";
import { Builder } from "../projects/helpers";
import { checkProject } from "./check";
import { designSteps, isDesignId, newDesignId, type Design } from "./design";
import { designProject } from "./design-steps";

/** A little house, put on as a child would: four walls, then a flat roof. */
function house(): Design {
  const b = new Builder();
  b.ring("red", 0, 0, 0);
  b.lid("square", "blue", 0, 1, 0);
  return { id: newDesignId(0), name: "My house", placed: b.placed, updated: "2026-10-10T00:00:00Z" };
}

describe("designs (5.0c)", () => {
  it("have ids of their own", () => {
    expect(isDesignId(newDesignId())).toBe(true);
    expect(isDesignId("castle")).toBe(false);
  });

  it("one tile a step for 3–5, in the order put on, in plain words", () => {
    const steps = designSteps(house().placed, "a");
    expect(steps.map((s) => s.tiles)).toEqual([[0], [1], [2], [3], [4]]);
    expect(steps[0].say).toBe("Stand a red square on the table.");
    expect(steps[4].say).toBe("Lay a blue square flat on the red square.");
  });

  it("older children put alike tiles on together", () => {
    const steps = designSteps(house().placed, "b");
    expect(steps.map((s) => s.tiles)).toEqual([[0, 1, 2], [3], [4]]);
    expect(steps[0].say).toBe("Stand 3 red squares on the table.");
  });

  it("a little house's steps pass the checker", () => {
    const p = designProject(house(), "b");
    expect(checkProject(p).problems.filter((x) => x.rule !== "R9")).toEqual([]);
    expect(p.steps.every((s) => !s.say.includes("Hold it"))).toBe(true);
  });

  it("a step that may not stand yet says to hold it, and is kept", () => {
    const b = new Builder();
    b.wallX("square", "green", 0, 0, 0);
    const p = designProject({ id: "my-x", name: "A wall", placed: b.placed, updated: "" }, "a");
    expect(p.steps[0].say).toBe("Stand a green square on the table. Hold it until the next tile is on.");
  });
});
