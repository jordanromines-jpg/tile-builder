/* Picture book's voice: soft and woody. A block of wood knocked on a table, a pencil tap, a wooden step, a rustle of
   paper turning, and a music box to finish. */
import type { Voicing } from "../../sound/sound";

export const sounds: Voicing = {
  // a pencil tapped once on paper
  tap: [
    { wave: "noise", freq: 0, dur: 0.02, gain: 0.22, filter: 4200 },
    { wave: "sine", freq: 880, to: 700, dur: 0.045, gain: 0.22 },
  ],
  // a wooden block knocked on the table: a woody thunk with a short body behind it
  snap: [
    { wave: "noise", freq: 0, dur: 0.03, gain: 0.34, filter: 1900 },
    { wave: "sine", freq: 430, to: 190, dur: 0.09, gain: 0.55 },
    { wave: "triangle", freq: 820, to: 420, dur: 0.05, gain: 0.16 },
  ],
  // a wooden marimba bar
  step: [
    { wave: "sine", freq: 392, dur: 0.16, gain: 0.3, attack: 0.004 },
    { wave: "sine", freq: 1568, dur: 0.05, gain: 0.07, attack: 0.002 },
  ],
  // a page turning
  turn: [{ wave: "noise", freq: 0, dur: 0.22, gain: 0.1, attack: 0.07, filter: 1500 }],
  // a music box winding down to a held note
  finish: [
    { wave: "sine", freq: 1047, dur: 0.32, gain: 0.22, attack: 0.003 },
    { wave: "sine", freq: 2093, dur: 0.1, gain: 0.04, attack: 0.002 },
    { wave: "sine", freq: 1319, at: 0.17, dur: 0.32, gain: 0.22, attack: 0.003 },
    { wave: "sine", freq: 2637, at: 0.17, dur: 0.1, gain: 0.04, attack: 0.002 },
    { wave: "sine", freq: 1568, at: 0.34, dur: 0.32, gain: 0.22, attack: 0.003 },
    { wave: "sine", freq: 3136, at: 0.34, dur: 0.1, gain: 0.04, attack: 0.002 },
    { wave: "sine", freq: 2093, at: 0.56, dur: 0.9, gain: 0.26, attack: 0.003 },
    { wave: "sine", freq: 4186, at: 0.56, dur: 0.25, gain: 0.04, attack: 0.002 },
    { wave: "sine", freq: 1568, at: 0.56, dur: 0.7, gain: 0.1, attack: 0.003 },
  ],
  // a soft low wooden bump
  nope: [{ wave: "sine", freq: 300, to: 230, dur: 0.14, gain: 0.3, attack: 0.004 }],
};
