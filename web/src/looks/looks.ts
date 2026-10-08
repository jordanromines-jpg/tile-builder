/* Looks (3.0): the same app in different styles a family chooses (plans/2026-10-08-design-polish.md). A look changes
   only how things look and sound: colours and surfaces (looks/<look>/look.css under [data-look]), the 3D stage
   (looks/<look>/stage.ts), the sounds' voicing (looks/<look>/sounds.ts) and a few decorations (looks/<look>/decor.tsx),
   each gathered by its own registry (stages.ts, voices.ts, decorations.ts) so three.js loads only with the 3D.
   Layouts, steps, words and the 3D model are shared. Like light and dark (ground.ts), the choice is kept per browser
   and set before the first paint, so nothing flashes. */
export type LookId = "classic" | "toy" | "book" | "studio";

export interface LookInfo {
  id: LookId;
  name: string;
  /** one line for the picker */
  blurb: string;
}

/** In the picker's order. `classic` is the design before 3.0, kept until Jordan picks a default (G2). */
export const LOOKS: LookInfo[] = [
  { id: "toy", name: "Toy studio", blurb: "Everything made of shiny tiles, in a playroom." },
  { id: "book", name: "Picture book", blurb: "Paper, crayon and watercolour, like a storybook." },
  { id: "studio", name: "Clean studio", blurb: "Calm and bright: the tiles are the only colour." },
  { id: "classic", name: "Classic", blurb: "The way Tile Steps looked before." },
];

export const DEFAULT_LOOK: LookId = "classic";

const KEY = "tile-builder.look";
const IDS = new Set<string>(LOOKS.map((l) => l.id));

export function currentLook(): LookId {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored && IDS.has(stored)) return stored as LookId;
  } catch {
    /* a private window: no store; the default stands */
  }
  return DEFAULT_LOOK;
}

export function applyLook(look: LookId = currentLook()): LookId {
  document.documentElement.dataset.look = look;
  return look;
}

export function setLook(look: LookId): void {
  applyLook(look);
  try {
    localStorage.setItem(KEY, look);
  } catch {
    /* the choice lasts the page */
  }
}
