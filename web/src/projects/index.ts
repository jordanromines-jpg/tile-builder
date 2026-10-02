// Every project in the app, written by hand (D3). Each passes `npm run check:projects` before it ships.
import type { Project } from "../engine/types";
import { AGE_A } from "./a";
import { AGE_B } from "./b";
import { AGE_C } from "./c";
import { castle } from "./castle";
import { AGE_D } from "./d";
import { AGE_D_BIG } from "./d-big";
import { AGE_A2 } from "./a2";
import { AGE_B2 } from "./b2";
import { AGE_C2 } from "./c2";

export const PROJECTS: Project[] = [...AGE_A, ...AGE_A2, ...AGE_B, ...AGE_B2, castle, ...AGE_C, ...AGE_C2, ...AGE_D, ...AGE_D_BIG];

export function projectById(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}
