/* The age band a kid screen is sized for (D19): the Library's chosen age, or in build mode the project's own band.
   It sets the smallest target and the label size (PRODUCT.md, "The age bands"). */
import { createContext, useContext, type ReactNode } from "react";

export type Age = "a" | "b" | "c";
export const AGES: Age[] = ["a", "b", "c"];

export const TARGET: Record<Age, number> = { a: 88, b: 80, c: 64 };
export const PRIMARY = 104;

const Ctx = createContext<Age>("a");

export function AgeProvider({ age, children }: { age: Age; children: ReactNode }) {
  return <Ctx.Provider value={age}>{children}</Ctx.Provider>;
}

export function useAge(): Age {
  return useContext(Ctx);
}

/** CSS variable names for this age's sizes. */
export function ageVars(age: Age) {
  return {
    target: `var(--target-kid-${age})`,
    label: `var(--fs-kid-label-${age})`,
    display: `var(--fs-kid-display-${age})`,
    count: `var(--fs-kid-count-${age})`,
  };
}
