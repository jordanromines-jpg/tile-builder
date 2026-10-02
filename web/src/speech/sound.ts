/* Sound effects (Q3): off by default. When a grown-up turns them on, a soft click on each new step, through Web Audio.
   iPadOS keeps Web Audio silent when the iPad is on mute. */
let ctx: AudioContext | null = null;

export function click(): void {
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(660, t);
    o.frequency.exponentialRampToValueAtTime(440, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.15, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.13);
  } catch {
    /* no audio: stay quiet */
  }
}
