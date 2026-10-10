/* The look (3.0; one look since 5.4.3, Jordan: "The looks all suck redo them and wow me. just 1 is needed if it's
   good"). It changes only how things look and sound: colours and surfaces (looks/vinyl/look.css under [data-look]), the
   3D stage (looks/vinyl/stage.ts), the sounds' voicing (looks/vinyl/sounds.ts) and a decoration (looks/vinyl/decor.tsx).
   Set before the first paint, so nothing flashes. A choice saved by the four looks of before is cleared. */
export const LOOK = "vinyl";

const OLD_KEY = "tile-builder.look";

export function applyLook(): void {
  document.documentElement.dataset.look = LOOK;
  try {
    localStorage.removeItem(OLD_KEY);
  } catch {
    /* a private window: nothing was saved */
  }
}
