/* The age band a kid screen is sized for (D19): the Library's chosen age, or in build mode the project's own band.
   It sets the smallest target and the label size (PRODUCT.md, "The age bands"). */
import { createContext, useContext, type ReactNode } from "react";

export type Age = "t" | "a" | "b" | "c" | "d";
export const AGES: Age[] = ["t", "a", "b", "c", "d"];

/** The Library's shelves after the chosen one: 0–3 (2.5), built by grown-ups, comes last. */
export const SHELF_ORDER: Age[] = ["a", "b", "c", "d", "t"];

export const TARGET: Record<Age, number> = { t: 64, a: 88, b: 80, c: 64, d: 64 };

/** 11–16 (2.1) uses the 9–10 sizes and controls: free orbit, zoom, step jumps. So does 0–3 (2.5): a grown-up builds
    those, for a baby to look at. */
const SIZES: Record<Age, "a" | "b" | "c"> = { t: "c", a: "a", b: "b", c: "c", d: "c" };

/** 9 and up, and 0–3 (built by a grown-up): the model turns and zooms freely, and the step dots jump. */
export function older(age: Age): boolean {
  return age === "c" || age === "d" || age === "t";
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
