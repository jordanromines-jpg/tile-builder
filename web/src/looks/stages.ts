/* Every look's 3D stage, by id. Imported only by the 3D code (three/Stage.tsx), so three.js stays in the 3D chunk and
   out of the first screen's. 5.4.1: every look stands on the one look's set (Jordan: "just 1 is needed"); the other
   looks and this registry go in 5.4.3. */
import type { LookId } from "./looks";
import type { StageLook } from "./stage";
import { stage as vinyl } from "./vinyl/stage";

export const STAGES: Record<LookId, StageLook> = { classic: vinyl, toy: vinyl, book: vinyl, studio: vinyl };
