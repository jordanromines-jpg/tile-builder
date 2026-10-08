/* Decorations (3.0): the few places a look adds shapes CSS can't make (a crayon line under a heading, the torn edge of a
   paper panel, a plank's wood grain), each at a named place the shared screens render. A look gives a component for
   the places it wants and nothing for the rest. Decorations are pictures only: aria-hidden, no taps, no layout (each
   sits absolutely inside its place, which is `position: relative`). */
import type { ComponentType } from "react";
import { useLook } from "./useLook";
import { DECOR } from "./decorations";

export type DecorAt =
  /** behind everything on a page (Library, grown-ups) */
  | "page"
  /** under a shelf's row of cards: the plank */
  | "shelf"
  /** under or beside a shelf's heading */
  | "heading"
  /** over a project card's picture, for a frame or sheen */
  | "card"
  /** on the build screen's step panel */
  | "panel"
  /** behind the finish screen's words */
  | "finish";

export type Decorations = Partial<Record<DecorAt, ComponentType>>;

export function Decor({ at }: { at: DecorAt }) {
  const C = DECOR[useLook()][at];
  return C ? (
    <span aria-hidden="true" className="ts-decor pointer-events-none absolute inset-0" data-decor={at}>
      <C />
    </span>
  ) : null;
}
