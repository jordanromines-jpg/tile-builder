/* A design's steps, checked (5.0c): kept apart from design.ts so the Library, which only draws designs, doesn't load
   the checker. */
import { checkProject } from "./check";
import { designBase, type Design } from "./design";
import type { Age, Project } from "./types";

/** The rules a step can break that mean "it may not stand yet": the steps say so, and building carries on. */
const WOBBLY = new Set(["R6", "R10", "R11"]);

/** The design as a project to build step by step. A step after which the checker finds it may not stand yet says to
    hold it until the next tile is on (the design is the child's: nothing is refused). */
export function designProject(d: Design, age: Age): Project {
  const base = designBase(d, age);
  const wobbly = new Set(checkProject(base).problems.filter((p) => WOBBLY.has(p.rule) && p.step !== undefined).map((p) => p.step!));
  return { ...base, steps: base.steps.map((s, i) => (wobbly.has(i) ? { ...s, say: `${s.say} Hold it until the next tile is on.` } : s)) };
}
