/* Watching the frame rate (3.1). The viewer draws only when something moves (frameloop "demand"), so a generic monitor
   that counts frames a second reads a still screen as a slow one and steps down at once: the looks' effects were off
   almost always. This counts only frames drawn back to back (within 100 ms of the last), ignores the first two
   seconds (shaders compiling, the effects loading), and after each change waits three seconds before judging again.
   Slow: a running average over 24 ms (under 42 frames a second) for 45 moving frames. Fast again: under 15 ms for
   180. */
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

const GRACE_MS = 2000;
const COOL_MS = 3000;
const SLOW_MS = 24;
const FAST_MS = 15;

export function FrameWatch({ onDecline, onIncline }: { onDecline: () => void; onIncline: () => void }) {
  const s = useRef({ start: 0, last: 0, avg: 16.7, slow: 0, fast: 0, quiet: 0 });
  useFrame(() => {
    const now = performance.now();
    const w = s.current;
    if (!w.start) w.start = now;
    const dt = w.last ? now - w.last : 0;
    w.last = now;
    // a frame after a pause starts a new run: the pause isn't slowness
    if (!dt || dt > 100 || now - w.start < GRACE_MS || now < w.quiet) return;
    w.avg = w.avg * 0.9 + dt * 0.1;
    w.slow = w.avg > SLOW_MS ? w.slow + 1 : 0;
    w.fast = w.avg < FAST_MS ? w.fast + 1 : 0;
    if (w.slow >= 45 || w.fast >= 180) {
      if (w.slow >= 45) onDecline();
      else onIncline();
      w.slow = w.fast = 0;
      w.avg = 16.7;
      w.quiet = now + COOL_MS;
    }
  });
  return null;
}
