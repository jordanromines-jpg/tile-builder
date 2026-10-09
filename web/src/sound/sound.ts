/* Sound (3.0): a few short sounds made on the device with Web Audio (nothing downloaded): a tap, a tile's magnetic snap
   as it lands, a step, a turn, the finish, a gentle "not yet". Each look voices them its own way (looks/<look>/
   sounds.ts); the events are shared. Quiet, on unless a grown-up turns "Sound effects" off in Settings (SettingsSync
   keeps this in step with that switch), and silent until the first touch: iOS starts audio only from a gesture, and
   keeps Web Audio silent when the iPad is on mute. Reduced motion doesn't mute: sound isn't motion. */
export type SoundEvent = "tap" | "snap" | "step" | "turn" | "finish" | "nope";

/** One tone: an oscillator (or noise) from `freq` to `to` over `dur` seconds, starting `at` seconds in. */
export interface Tone {
  wave: OscillatorType | "noise";
  freq: number;
  to?: number;
  at?: number;
  dur: number;
  /** 0 to 1, before the master volume */
  gain: number;
  /** seconds to rise; the rest decays */
  attack?: number;
  /** a low-pass filter's cut-off, Hz */
  filter?: number;
}

export type Voicing = Record<SoundEvent, Tone[]>;

/** quiet: the steps are spoken, and a room of building children is loud enough */
const MASTER = 0.3;

let ctx: AudioContext | null = null;
let voicing: Voicing | null = null;
let unlocked = false;
let on = true;

export function soundOn(): boolean {
  return on;
}

/** The grown-ups' "Sound effects" switch (SettingsSync). */
export function setSoundOn(value: boolean): void {
  on = value;
}

/** The look's sounds; called when the look changes. */
export function setVoicing(v: Voicing): void {
  voicing = v;
}

/** Waits for the first touch, then makes the audio context (iOS allows it only inside a gesture). */
export function armSound(): void {
  if (unlocked || typeof window === "undefined") return;
  const unlock = () => {
    unlocked = true;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    void ctx.resume();
    window.removeEventListener("pointerdown", unlock, true);
  };
  window.addEventListener("pointerdown", unlock, true);
}

let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext): AudioBuffer {
  if (noiseBuf && noiseBuf.sampleRate === c.sampleRate) return noiseBuf;
  const b = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return (noiseBuf = b);
}

/** Plays an event in the look's voice, if sound is on and the iPad has been touched. */
export function play(event: SoundEvent): void {
  if (voicing) playTones(voicing[event]);
}

/** The audio context, once the iPad has been touched and while sound is on (the truck's engine voice uses it). */
export function liveAudio(): { ctx: AudioContext; master: number } | null {
  return ctx && soundOn() && ctx.state === "running" ? { ctx, master: MASTER } : null;
}

/** Plays tones (one of the shared sounds, the same in every look), if sound is on and the iPad has been touched. */
export function playTones(tones: Tone[], loud = 1): void {
  if (!ctx || !soundOn() || ctx.state !== "running") return;
  const now = ctx.currentTime;
  for (const t0 of tones) {
    const t = { ...t0, gain: t0.gain * loud };
    const start = now + (t.at ?? 0);
    const end = start + t.dur;
    const g = ctx.createGain();
    const attack = Math.min(t.attack ?? 0.004, t.dur / 2);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, t.gain * MASTER), start + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    let out: AudioNode = g;
    if (t.filter) {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = t.filter;
      g.connect(f);
      out = f;
    }
    out.connect(ctx.destination);
    if (t.wave === "noise") {
      const src = ctx.createBufferSource();
      src.buffer = noise(ctx);
      src.connect(g);
      src.start(start);
      src.stop(end);
    } else {
      const o = ctx.createOscillator();
      o.type = t.wave;
      o.frequency.setValueAtTime(t.freq, start);
      if (t.to) o.frequency.exponentialRampToValueAtTime(t.to, end);
      o.connect(g);
      o.start(start);
      o.stop(end);
    }
  }
}
