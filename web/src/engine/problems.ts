/* What the checker can find, in words a project's author reads (plan key 4f). */
export type Rule = "R0" | "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7" | "R8" | "R9";

export interface Problem {
  rule: Rule;
  message: string;
  tile?: number;
  step?: number;
  /** the tall triangle's leg the problem was found with */
  leg?: number;
}

export const RULES: Record<Rule, string> = {
  R0: "the project's data is well formed",
  R1: "every tile meets another tile along an edge, or is on the table",
  R2: "no two tiles overlap, and no tile passes through another",
  R3: "every tile is joined, edge to edge, to a tile on the table",
  R4: "the steps place every tile once, in order, each next to what is already built",
  R5: "a step never builds more than one layer above the top so far",
  R6: "after every step, everything stands: walls on the table have a neighbour, upper tiles sit on an edge or span a gap, lids rest on two edges",
  R7: "leaning tiles make whole pyramids: four alike (three over a triangle), finished in one step",
  R8: "the project passes for every brand's tall triangle and names the special tiles it needs",
  R9: "the steps and size fit the project's age",
};

export function describe(p: Problem, project = ""): string {
  const where = [project, p.step !== undefined ? `step ${p.step + 1}` : "", p.tile !== undefined ? `tile ${p.tile}` : "", p.leg !== undefined ? `leg ${p.leg}` : ""].filter(Boolean);
  return `${where.join(" · ")} · ${p.rule}: ${p.message}`;
}
