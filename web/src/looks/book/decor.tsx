/* Picture book's decorations: a crayon underline, a drawn shelf line, washi tape on a card, a deckled page edge on the
   panel, and stars drawn around the finish's headline. Pictures only, no animation; colours come from the look's tokens
   (--book-*, in look.css) so light and dark follow. */
import type { CSSProperties } from "react";
import type { Decorations } from "../decor";

const abs: CSSProperties = { position: "absolute", overflow: "visible" };
const crayon = { fill: "none", stroke: "var(--book-crayon)", strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** a crayon stroke under a heading: two passes, the second thinner and a little off */
function Heading() {
  return (
    <svg viewBox="0 0 200 14" preserveAspectRatio="none" style={{ ...abs, left: -6, bottom: -13, width: "calc(100% + 14px)", height: 14 }}>
      <path d="M2 8 C 30 3, 52 11, 84 6 S 150 4, 198 7" {...crayon} strokeWidth={5} vectorEffect="non-scaling-stroke" opacity={0.85} />
      <path d="M10 11 C 50 7, 90 12, 130 9 S 176 8, 190 10" {...crayon} strokeWidth={2.5} vectorEffect="non-scaling-stroke" opacity={0.55} />
    </svg>
  );
}

/** the shelf: a drawn line with a few short strokes of shading beneath it */
function Shelf() {
  return (
    <svg viewBox="0 0 400 14" preserveAspectRatio="none" style={{ ...abs, left: 0, top: 0, width: "100%", height: 14 }}>
      <path d="M0 4 C 60 2, 110 6, 170 3 S 300 5, 400 3" fill="none" stroke="var(--book-pencil)" strokeWidth={3.2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M12 9 L 60 8 M 90 10 L 160 9 M 210 8 L 290 10 M 320 9 L 380 8" fill="none" stroke="var(--book-pencil)" strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.4} />
    </svg>
  );
}

/** a strip of washi tape across the card's top-right corner (its colour changes from card to card in look.css) */
function Card() {
  return (
    <span
      style={{
        position: "absolute",
        top: 10,
        right: -26,
        width: 96,
        height: 26,
        transform: "rotate(38deg)",
        background: "var(--tape)",
        boxShadow: "0 1px 2px rgba(60,40,20,0.18)",
        clipPath: "polygon(0 8%, 4% 0, 8% 10%, 12% 0, 92% 0, 96% 10%, 100% 0, 100% 100%, 96% 90%, 92% 100%, 88% 90%, 84% 100%, 12% 100%, 8% 92%, 4% 100%, 0 92%)",
        backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 5px, transparent 5px 11px)",
        backgroundColor: "var(--tape)",
      }}
    />
  );
}

/** a deckled (torn) top edge for the panel: a jagged strip of paper along its top */
const DECKLE = (() => {
  let seed = 5;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let d = "M0 12";
  for (let x = 0; x <= 1000; x += 8) d += ` L${x} ${(2 + rnd() * 7).toFixed(1)}`;
  return `${d} L1000 12 Z`;
})();

function Panel() {
  return (
    <svg viewBox="0 0 1000 12" preserveAspectRatio="none" style={{ ...abs, left: 22, right: 22, top: -9, width: "calc(100% - 44px)", height: 12 }}>
      <path d={DECKLE} fill="var(--surface-2)" stroke="var(--book-pencil)" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeOpacity={0.35} />
    </svg>
  );
}

const STAR = "M20 3 L24.5 14.5 L37 15.4 L27.5 23.6 L30.6 36 L20 29.4 L9.6 36 L12.6 23.6 L3 15.4 L15.4 14.5 Z";

function Star({ style, size, tilt = 0, soft = false }: { style: CSSProperties; size: number; tilt?: number; soft?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} style={{ ...abs, transform: `rotate(${tilt}deg)`, ...style }}>
      <path d={STAR} fill={soft ? "var(--book-star-2)" : "var(--book-star)"} stroke="var(--book-crayon)" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** stars drawn round the headline: the end of the story */
function Finish() {
  return (
    <>
      <Star size={44} tilt={12} style={{ right: -58, top: "calc(50% - 22px)" }} />
      <Star size={22} tilt={-14} soft style={{ right: -14, top: -26 }} />
      <Star size={26} tilt={-8} soft style={{ left: "20%", bottom: -32 }} />
      <Star size={18} tilt={18} style={{ right: "28%", bottom: -28 }} />
      <Star size={20} tilt={-20} style={{ left: "5%", top: -22 }} soft />
    </>
  );
}

/** a pale watercolour sun behind the Library's top corner */
function Page() {
  return (
    <span
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 560,
        height: 380,
        background: "radial-gradient(ellipse at 100% 0, var(--book-wash-sun), transparent 70%)",
        opacity: 0.8,
      }}
    />
  );
}

export const decor: Decorations = { heading: Heading, shelf: Shelf, card: Card, panel: Panel, finish: Finish, page: Page };
