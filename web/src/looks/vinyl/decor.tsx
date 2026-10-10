/* The one look's decoration (5.4.3): a strip of three little glossy tiles under each shelf heading (from Toy studio's).
   Pictures only; nothing moves. The plank itself is CSS (look.css). */
import type { Decorations } from "../decor";

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

export const decor: Decorations = { heading: Heading };
