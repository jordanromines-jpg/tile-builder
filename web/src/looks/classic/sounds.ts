/* Classic's sounds: plain and short. A snap is a click with a bright tick on top, like two magnets meeting. */
import type { Voicing } from "../../sound/sound";

export const sounds: Voicing = {
  tap: [{ wave: "sine", freq: 660, to: 520, dur: 0.06, gain: 0.35 }],
  snap: [
    { wave: "noise", freq: 0, dur: 0.035, gain: 0.5, filter: 3200 },
    { wave: "triangle", freq: 1400, to: 900, dur: 0.05, gain: 0.35 },
  ],
  step: [{ wave: "sine", freq: 523, dur: 0.12, gain: 0.3, attack: 0.01 }],
  turn: [{ wave: "noise", freq: 0, dur: 0.18, gain: 0.12, attack: 0.05, filter: 900 }],
  finish: [
    { wave: "triangle", freq: 523, dur: 0.18, gain: 0.35 },
    { wave: "triangle", freq: 659, at: 0.12, dur: 0.18, gain: 0.35 },
    { wave: "triangle", freq: 784, at: 0.24, dur: 0.18, gain: 0.35 },
    { wave: "triangle", freq: 1047, at: 0.36, dur: 0.45, gain: 0.4, attack: 0.01 },
  ],
  nope: [{ wave: "sine", freq: 330, to: 262, dur: 0.18, gain: 0.25 }],
};
