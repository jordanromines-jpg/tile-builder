// Every project in the app, written by hand (D3). Each passes `npm run check:projects` before it ships.
import type { Project } from "../engine/types";
import { AGE_A } from "./a";
import { AGE_B } from "./b";
import { AGE_C } from "./c";
import { castle } from "./castle";

export const PROJECTS: Project[] = [...AGE_A, ...AGE_B, castle, ...AGE_C];

export function projectById(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}
