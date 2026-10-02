/* Motion (plan key 2p): durations and easing from the tokens; with reduced motion, springs become short fades. */
import { useReducedMotion, type Transition } from "motion/react";

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
