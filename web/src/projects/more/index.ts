// 2.2: 101 more projects, 50 to 175 tiles, written as plans for the layout kit (../kit.ts).
import type { Project } from "../../engine/types";
import { MORE_CASTLES } from "./castles";
import { MORE_CRITTERS } from "./critters";
import { MORE_GOING } from "./going";
import { MORE_HOMES } from "./homes";
import { MORE_TOWERS } from "./towers";

export const MORE: Project[] = [...MORE_CASTLES, ...MORE_HOMES, ...MORE_GOING, ...MORE_CRITTERS, ...MORE_TOWERS];
