/* The Pip truck's sounds on a run (4.0c), made on the device like the rest: an engine that hums higher the faster the
   truck goes, a whoosh as it leaves a lip, a thud on landing (as loud as the landing was hard), and a plastic crunch
   as a crash piece's magnets let go (no more than six a second, or a falling wall would be a roar). A toy truck sounds
   the same in every look. Silent with the grown-ups' "Sound effects" off, and until the iPad is first touched. */
import { liveAudio, playTones, type Tone } from "./sound";

const WHOOSH: Tone[] = [{ wave: "noise", freq: 0, dur: 0.35, gain: 0.35, attack: 0.08, filter: 1800 }];
const THUD: Tone[] = [
  { wave: "sine", freq: 120, to: 55, dur: 0.18, gain: 0.7, attack: 0.002 },
  { wave: "noise", freq: 0, dur: 0.06, gain: 0.4, filter: 900, attack: 0.001 },
];
const CRUNCH: Tone[] = [
  { wave: "noise", freq: 0, dur: 0.05, gain: 0.45, filter: 5200, attack: 0.001 },
  { wave: "triangle", freq: 1700, to: 900, at: 0.01, dur: 0.05, gain: 0.18, attack: 0.001 },
  { wave: "noise", freq: 0, at: 0.06, dur: 0.03, gain: 0.25, filter: 3600, attack: 0.001 },
];

let lastCrunch = 0;

export const truckSound = {
  whoosh: () => playTones(WHOOSH),
  /** hit: 0 (a soft landing) to 1 (the springs bottomed) */
  thud: (hit: number) => playTones(THUD, 0.4 + 0.6 * Math.max(0, Math.min(1, hit))),
  crunch: () => {
    const now = performance.now();
    if (now - lastCrunch < 1000 / 6) return;
    lastCrunch = now;
    playTones(CRUNCH);
  },
};

/** The engine: a filtered sawtooth (and a quieter one a fifth up) whose pitch follows the truck's speed. */
export class Engine {
  private nodes: { o: OscillatorNode[]; g: GainNode; f: BiquadFilterNode } | null = null;

  start() {
    if (this.nodes) return;
    const a = liveAudio();
    if (!a) return;
    const { ctx, master } = a;
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(0.18 * master, ctx.currentTime + 0.3);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 500;
    g.connect(f).connect(ctx.destination);
    const o = [1, 1.5].map((k, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 70 * k;
      const og = ctx.createGain();
      og.gain.value = i ? 0.4 : 1;
      osc.connect(og).connect(g);
      osc.start();
      return osc;
    });
    this.nodes = { o, g, f };
  }

  /** speed in squares a second (at real speed) */
  speed(v: number) {
    const a = liveAudio();
    if (!this.nodes || !a) return;
    const s = Math.min(1, Math.abs(v) / 20);
    const at = a.ctx.currentTime;
    this.nodes.o.forEach((o, i) => o.frequency.setTargetAtTime((65 + 140 * s) * (i ? 1.5 : 1), at, 0.08));
    this.nodes.f.frequency.setTargetAtTime(400 + 1600 * s, at, 0.08);
  }

  stop() {
    const n = this.nodes;
    this.nodes = null;
    const a = liveAudio();
    if (!n) return;
    const at = a?.ctx.currentTime ?? 0;
    n.g.gain.cancelScheduledValues(at);
    n.g.gain.setTargetAtTime(0.0001, at, 0.15);
    n.o.forEach((o) => o.stop(at + 0.8));
  }
}
