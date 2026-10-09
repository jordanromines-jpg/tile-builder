/* Motion (plan key 2p): durations and easing from the tokens; with reduced motion, springs become short fades. */
import { useReducedMotion, type Transition } from "motion/react";
import { springFor } from "../motion/spring";

export const T_PRESS = 0.1;
export const T_UI = 0.24;
export const T_CELEBRATE = 1.4;
export const EASE: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

export function useUiTransition(): Transition {
  const reduced = useReducedMotion();
  return reduced ? { duration: 0.12, ease: "linear" } : { type: "spring", stiffness: 420, damping: 34 };
}

export function useStill(): boolean {
  return useReducedMotion() ?? false;
}

/** A spring for the `motion` library that has settled in `settleS` seconds (closed-form, from src/motion/spring.ts). */
export function settleSpring(settleS: number, zeta = 0.55): Transition {
  const s = springFor(settleS, zeta);
  return { type: "spring", stiffness: s.stiffness, damping: s.damping, mass: s.mass };
}
