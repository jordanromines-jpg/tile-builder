/* Toy studio's decorations: iron brackets holding the shelf's plank to the wall, and a strip of three little tiles
   under each shelf heading. Pictures only; nothing moves. */
import type { Decorations } from "../decor";

function Bracket({ side }: { side: "left" | "right" }) {
  return (
    <svg
      width="44"
      height="46"
      viewBox="0 0 44 46"
      style={{ position: "absolute", top: "100%", [side]: 36, marginTop: -2, filter: "drop-shadow(0 4px 3px rgba(60,30,10,.25))" }}
    >
      <path d="M6 0h32v8L14 44H6z" fill="#7c8696" />
      <path d="M6 0h6v44H6z" fill="#a3adbc" />
      <circle cx="26" cy="5" r="2.2" fill="#586070" />
    </svg>
  );
}

function Shelf() {
  return (
    <>
      <Bracket side="left" />
      <Bracket side="right" />
    </>
  );
}

function Heading() {
  return (
    <svg width="96" height="14" viewBox="0 0 96 14" style={{ position: "absolute", left: 0, bottom: -2 }}>
      <rect x="1" y="1" width="26" height="11" rx="4" fill="var(--tile-red)" />
      <rect x="1" y="1" width="26" height="4" rx="2" fill="#fff" opacity=".4" />
      <rect x="33" y="1" width="26" height="11" rx="4" fill="var(--tile-yellow)" />
      <rect x="33" y="1" width="26" height="4" rx="2" fill="#fff" opacity=".4" />
      <rect x="65" y="1" width="26" height="11" rx="4" fill="var(--tile-blue)" />
      <rect x="65" y="1" width="26" height="4" rx="2" fill="#fff" opacity=".4" />
    </svg>
  );
}

export const decor: Decorations = { shelf: Shelf, heading: Heading };
