/* Every look's 3D stage, by id. Imported only by the 3D code (three/Stage.tsx), so three.js stays in the 3D chunk and
   out of the first screen's. */
import type { LookId } from "./looks";
import type { StageLook } from "./stage";
import { stage as classic } from "./classic/stage";
import { stage as toy } from "./toy/stage";
import { stage as book } from "./book/stage";
import { stage as studio } from "./studio/stage";

export const STAGES: Record<LookId, StageLook> = { classic, toy, book, studio };
