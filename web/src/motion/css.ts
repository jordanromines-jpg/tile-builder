/* Springs for CSS (4.2d): a spring sampled into a `linear()` easing string, so a transition or a keyframe animation
   springs without a script running every frame. Where `linear()` isn't understood (older Safari) nothing is set, and
   the custom properties stay as app.css has them: the current ease, at the old durations. */
import { springFor, springStep, type Spring } from "./spring";

/** `linear(0, …, 1)` through the spring's move from 0 to 1 over `settleS` seconds (it may pass 1 and come back). */
export function springLinear(s: Spring, settleS: number, points = 32): string {
  const v: string[] = [];
  for (let i = 0; i < points; i++) {
    const x = i === points - 1 ? 1 : springStep(s, (settleS * i) / (points - 1));
    v.push(String(Math.round(x * 1000) / 1000));
  }
  return `linear(${v.join(", ")})`;
}

/** The three the screens use: a press (quick, a hint of bounce), the ui (a card, a chip, a switch), a settle (something
    arriving, with more life). Seconds to rest and damping ratio. */
export const CSS_SPRINGS = {
  press: { settle: 0.22, zeta: 0.62 },
  ui: { settle: 0.4, zeta: 0.72 },
  settle: { settle: 0.7, zeta: 0.5 },
} as const;

export function springVars(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, { settle, zeta }] of Object.entries(CSS_SPRINGS)) {
    out[`--spring-${name}`] = springLinear(springFor(settle, zeta), settle);
    out[`--spring-${name}-t`] = `${Math.round(settle * 1000)}ms`;
  }
  return out;
}

/** Sets `--spring-press`, `--spring-ui`, `--spring-settle` (and their `-t` durations) on :root, once at start. */
export function installSprings(root: HTMLElement = document.documentElement): boolean {
  if (typeof CSS === "undefined" || !CSS.supports?.("transition-timing-function", "linear(0, 1)")) return false;
  for (const [k, v] of Object.entries(springVars())) root.style.setProperty(k, v);
  return true;
}
