// Every project in the app, written by hand (D3). Each passes `npm run check:projects` before it ships.
import type { Project } from "../engine/types";
import { AGE_A } from "./a";
import { AGE_B } from "./b";
import { AGE_C } from "./c";
import { castle } from "./castle";
import { AGE_D } from "./d";
import { AGE_D_BIG } from "./d-big";
import { MORE } from "./more";
import { FRESH } from "./fresh";
import { AGE_A2 } from "./a2";
import { AGE_B2 } from "./b2";
import { AGE_C2 } from "./c2";
import { AGE_T } from "./tots";
import { AGE_T2 } from "./tots2";
import { AGE_T_BIG } from "./tots-big";
import { TRUCKS_1 } from "./trucks-1";
import { TRUCKS_2 } from "./trucks-2";
import { TRUCKS_3 } from "./trucks-3";
import { TRUCKS_4 } from "./trucks-4";
import { TRUCKS_5 } from "./trucks-5";
import { TRUCKS_6 } from "./trucks-6";

export const PROJECTS: Project[] = [...AGE_A, ...AGE_A2, ...AGE_B, ...AGE_B2, castle, ...AGE_C, ...AGE_C2, ...AGE_D, ...AGE_D_BIG, ...MORE, ...FRESH, ...AGE_T, ...AGE_T2, ...AGE_T_BIG, ...TRUCKS_1, ...TRUCKS_2, ...TRUCKS_3, ...TRUCKS_4, ...TRUCKS_5, ...TRUCKS_6];
