/* Toy studio's voice: hard plastic. Taps are crisp little clicks; the snap is a magnetic clack (a dull knock, a bright
   tick and a tiny rebound); the finish is a bright xylophone run (a sine and its high partial per bar). */
import type { Tone, Voicing } from "../../sound/sound";

/** A xylophone bar: the note, and a quieter partial at 3.9x that dies sooner. */
function bar(freq: number, at: number, gain = 0.4, dur = 0.5): Tone[] {
  return [
    { wave: "sine", freq, at, dur, gain, attack: 0.002 },
    { wave: "sine", freq: freq * 3.9, at, dur: dur * 0.3, gain: gain * 0.35, attack: 0.002 },
  ];
}

export const sounds: Voicing = {
  // two plastic faces meeting: a dry tick and a short high "tok"
  tap: [
    { wave: "noise", freq: 0, dur: 0.018, gain: 0.35, filter: 6500, attack: 0.001 },
    { wave: "square", freq: 1900, to: 1100, dur: 0.03, gain: 0.12, attack: 0.001, filter: 4200 },
  ],
  // the magnets pull the tiles together: a knock, a click, a tiny rebound
  snap: [
    { wave: "sine", freq: 240, to: 110, dur: 0.09, gain: 0.55, attack: 0.001 },
    { wave: "noise", freq: 0, dur: 0.028, gain: 0.6, filter: 4800, attack: 0.001 },
    { wave: "triangle", freq: 2400, to: 1500, at: 0.004, dur: 0.045, gain: 0.3, attack: 0.001 },
    { wave: "noise", freq: 0, at: 0.055, dur: 0.02, gain: 0.22, filter: 3800, attack: 0.001 },
    { wave: "triangle", freq: 1800, to: 1300, at: 0.055, dur: 0.03, gain: 0.12, attack: 0.001 },
  ],
  // Next: a bright two-note chirp up, like pressing a toy key
  step: [
    { wave: "noise", freq: 0, dur: 0.02, gain: 0.3, filter: 6000, attack: 0.001 },
    ...bar(784, 0, 0.3, 0.16),
    ...bar(1175, 0.06, 0.26, 0.2),
  ],
  // a tile rolling over: a soft tick-tick of plastic
  turn: [
    { wave: "noise", freq: 0, dur: 0.02, gain: 0.3, filter: 5200, attack: 0.001 },
    { wave: "noise", freq: 0, at: 0.07, dur: 0.02, gain: 0.26, filter: 4600, attack: 0.001 },
    { wave: "triangle", freq: 1500, to: 1000, at: 0.07, dur: 0.03, gain: 0.1, attack: 0.001 },
  ],
  // a bright little xylophone run, up the scale and a held top bar, with a soft chord under the last
  finish: [
    ...bar(523, 0, 0.4, 0.45),
    ...bar(659, 0.11, 0.4, 0.45),
    ...bar(784, 0.22, 0.4, 0.45),
    ...bar(1047, 0.33, 0.4, 0.5),
    ...bar(1319, 0.44, 0.4, 0.55),
    ...bar(1568, 0.55, 0.42, 0.9),
    { wave: "triangle", freq: 523, at: 0.55, dur: 0.9, gain: 0.12, attack: 0.02, filter: 1400 },
    { wave: "triangle", freq: 784, at: 0.55, dur: 0.9, gain: 0.1, attack: 0.02, filter: 1600 },
  ],
  // a gentle wooden "not yet": two soft low knocks
  nope: [
    { wave: "sine", freq: 300, to: 220, dur: 0.1, gain: 0.35, attack: 0.002 },
    { wave: "sine", freq: 250, to: 180, at: 0.11, dur: 0.14, gain: 0.3, attack: 0.002 },
  ],
};
