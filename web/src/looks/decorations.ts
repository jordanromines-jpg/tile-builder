/* Every look's decorations, by id (no three.js: these load with the screens). */
import type { Decorations } from "./decor";
import type { LookId } from "./looks";
import { decor as classic } from "./classic/decor";
import { decor as toy } from "./toy/decor";
import { decor as book } from "./book/decor";
import { decor as studio } from "./studio/decor";

export const DECOR: Record<LookId, Decorations> = { classic, toy, book, studio };
