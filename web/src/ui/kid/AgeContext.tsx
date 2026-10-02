/* The age band a kid screen is sized for (D19): the Library's chosen age, or in build mode the project's own band.
   It sets the smallest target and the label size (PRODUCT.md, "The age bands"). */
import { createContext, useContext, type ReactNode } from "react";

export type Age = "a" | "b" | "c" | "d";
export const AGES: Age[] = ["a", "b", "c", "d"];

export const TARGET: Record<Age, number> = { a: 88, b: 80, c: 64, d: 64 };

/** 11–16 (2.1) uses the 9–10 sizes and controls: free orbit, zoom, step jumps. */
const SIZES: Record<Age, "a" | "b" | "c"> = { a: "a", b: "b", c: "c", d: "c" };

/** 9 and up: the model turns and zooms freely, and the step dots jump. */
export function older(age: Age): boolean {
  return age === "c" || age === "d";
}
export const PRIMARY = 112;

const Ctx = createContext<Age>("a");

export function AgeProvider({ age, children }: { age: Age; children: ReactNode }) {
  return <Ctx.Provider value={age}>{children}</Ctx.Provider>;
}

export function useAge(): Age {
  return useContext(Ctx);
}

/** CSS variable names for this age's sizes. */
export function ageVars(band: Age) {
  const age = SIZES[band];
  return {
    target: `var(--target-kid-${age})`,
    label: `var(--fs-kid-label-${age})`,
    display: `var(--fs-kid-display-${age})`,
    count: `var(--fs-kid-count-${age})`,
  };
}
