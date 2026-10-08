/* Every look's sounds, by id (no three.js: these load with the first screen). */
import type { Voicing } from "../sound/sound";
import type { LookId } from "./looks";
import { sounds as classic } from "./classic/sounds";
import { sounds as toy } from "./toy/sounds";
import { sounds as book } from "./book/sounds";
import { sounds as studio } from "./studio/sounds";

export const VOICES: Record<LookId, Voicing> = { classic, toy, book, studio };
