/* Clean studio (3.4): minimal, precise, gentle. Glass and air: a soft glassy tick for the snap (a high sine pair over a
   quiet low knock, so a landing has weight), a clean two-note rise to finish. No saws, no squares, nothing shrill. */
import type { Voicing } from "../../sound/sound";

export const sounds: Voicing = {
  tap: [{ wave: "sine", freq: 1320, to: 1100, dur: 0.05, gain: 0.22, attack: 0.002 }],
  snap: [
    { wave: "sine", freq: 2400, to: 1900, dur: 0.05, gain: 0.26, attack: 0.001 },
    { wave: "sine", freq: 3600, to: 3000, dur: 0.03, gain: 0.1, attack: 0.001 },
    { wave: "sine", freq: 320, to: 210, dur: 0.07, gain: 0.22, attack: 0.002 },
    { wave: "noise", freq: 0, dur: 0.014, gain: 0.12, filter: 5200 },
  ],
  step: [{ wave: "sine", freq: 880, to: 988, dur: 0.15, gain: 0.2, attack: 0.008 }],
  turn: [{ wave: "noise", freq: 0, dur: 0.22, gain: 0.06, attack: 0.09, filter: 1600 }],
  finish: [
    { wave: "sine", freq: 784, dur: 0.4, gain: 0.3, attack: 0.006 },
    { wave: "sine", freq: 1568, dur: 0.25, gain: 0.04, attack: 0.006 },
    { wave: "sine", freq: 1175, at: 0.17, dur: 0.95, gain: 0.3, attack: 0.008 },
    { wave: "sine", freq: 2350, at: 0.17, dur: 0.5, gain: 0.05, attack: 0.008 },
  ],
  nope: [{ wave: "sine", freq: 440, to: 392, dur: 0.16, gain: 0.16, attack: 0.004 }],
};
