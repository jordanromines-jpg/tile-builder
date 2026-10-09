/* Pip's pace (4.1, Watch it build): how long his trip takes. Normal is 3.9's; Fast (Watch at 1.5 s a step) halves his
   hop and hold, so he still gets the tiles across before the next step comes. The Model's `hold` is the same hold. */
export type Pace = "normal" | "fast";

const HOLD_S = 0.9;
const HOP_MS = 600;
const HOME_MS = 500;
const TOSS_MS = 300;
const CHEER_MS = 900;

export interface GuideTimes {
  /** seconds the new tiles wait while Pip carries them over (the Model's `hold`) */
  hold: number;
  hopMs: number;
  homeMs: number;
  tossMs: number;
  cheerMs: number;
}

export function guideTimes(pace: Pace = "normal"): GuideTimes {
  const k = pace === "fast" ? 0.5 : 1;
  return { hold: HOLD_S * k, hopMs: HOP_MS * k, homeMs: HOME_MS * k, tossMs: TOSS_MS * k, cheerMs: CHEER_MS * k };
}
