/* The end's celebration (sprint 2, change 9): a shower of little tiles over the finished model while the view circles
   it once. A tap anywhere skips it; it ends by itself after a few seconds. Under reduced motion nothing falls. */
import { useEffect, useMemo, useRef } from "react";
import type { Colour } from "../../engine/catalog";
import { S } from "../../strings";
import { useStill } from "../motion";

const COLOURS: Colour[] = ["red", "orange", "yellow", "green", "blue", "purple"];
const SHAPES = ["polygon(0 0,100% 0,100% 100%,0 100%)", "polygon(50% 0,100% 100%,0 100%)", "polygon(0 0,100% 100%,0 100%)"];
export const CONFETTI_MS = 3600;

export function TileConfetti({ onDone }: { onDone: () => void }) {
  const still = useStill();
  // count from the first frame on screen, not from mounting: a slow first draw must not eat the shower
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const raf = requestAnimationFrame(() => {
      t = setTimeout(() => done.current(), still ? 1200 : CONFETTI_MS);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (t) clearTimeout(t);
    };
  }, [still]);
  // the same shower each time: placed by index, not at random
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: ((i * 37) % 100) + (i % 3) * 0.7,
        delay: ((i * 53) % 900) / 1000,
        dur: 2.2 + ((i * 29) % 10) / 10,
        size: 18 + ((i * 7) % 14),
        spin: (i % 2 ? 1 : -1) * (180 + ((i * 41) % 360)),
        colour: COLOURS[i % COLOURS.length],
        shape: SHAPES[i % SHAPES.length],
      })),
    [],
  );
  return (
    <button type="button" aria-label={S.done.party} onClick={onDone} className="kid absolute inset-0 overflow-hidden">
      {!still &&
        pieces.map((p, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="confetti absolute top-0 block"
            style={
              {
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                background: `var(--tile-${p.colour})`,
                clipPath: p.shape,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
                "--spin": `${p.spin}deg`,
              } as React.CSSProperties
            }
          />
        ))}
    </button>
  );
}
