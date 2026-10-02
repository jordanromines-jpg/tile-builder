// 2.3: 100 more projects for 6 to 16, built mostly from parts off the square grid (../studio.ts).
import type { Project } from "../../engine/types";
import { FRESH_B } from "./b";
import { FRESH_C1 } from "./c-1";
import { FRESH_C2 } from "./c-2";
import { FRESH_D1 } from "./d-1";
import { FRESH_D2 } from "./d-2";
import { FRESH_D3 } from "./d-3";
import { FRESH_D4 } from "./d-4";

export const FRESH: Project[] = [...FRESH_B, ...FRESH_C1, ...FRESH_C2, ...FRESH_D1, ...FRESH_D2, ...FRESH_D3, ...FRESH_D4];
