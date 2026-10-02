/* The celebration (plan key 2o): one moving element, a hexagon of six triangle tiles (a build every child knows) that
   turns into place, under 1.4 s, the same every time; a tap skips it; with reduced motion it is the still hexagon.
   No sound, no points. */
import { motion } from "motion/react";
import { useEffect, useId } from "react";
import { COLOURS } from "../../engine/catalog";
import { useStill } from "../motion";
import { PATTERN_OF, TilePattern } from "../patterns";
import { S } from "../../strings";

const R = 1;
const corner = (i: number): [number, number] => [R * Math.cos((Math.PI / 3) * i - Math.PI / 2), R * Math.sin((Math.PI / 3) * i - Math.PI / 2)];

export function Hexagon({ size }: { size: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="-1.15 -1.15 2.3 2.3" width={size} height={size} aria-hidden="true">
      <defs>
        {COLOURS.map((c) => (
          <TilePattern key={c} id={`h${id}${c}`} name={PATTERN_OF[c]} color={`var(--tile-${c}-rim)`} />
        ))}
      </defs>
      {COLOURS.map((c, i) => {
        const [x1, y1] = corner(i);
        const [x2, y2] = corner(i + 1);
        const pts = `0,0 ${x1},${y1} ${x2},${y2}`;
        return (
          <g key={c}>
            <polygon points={pts} fill={`var(--tile-${c})`} fillOpacity={0.45} />
            {PATTERN_OF[c] !== "plain" && <polygon points={pts} fill={`url(#h${id}${c})`} opacity={0.75} />}
            <polygon points={pts} fill="none" stroke={`var(--tile-${c}-rim)`} strokeWidth={4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
}

export function Celebration({ onDone, size = 280 }: { onDone?: () => void; size?: number }) {
  const still = useStill();
  useEffect(() => {
    if (!onDone) return;
    const t = setTimeout(onDone, still ? 0 : 1400);
    return () => clearTimeout(t);
  }, [onDone, still]);
  return (
    <button type="button" aria-label={S.done.party} onClick={onDone} className="kid grid place-items-center" style={{ width: size, height: size }}>
      <motion.span
        className="block"
        initial={still ? false : { scale: 0.3, rotate: -120, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <Hexagon size={size} />
      </motion.span>
    </button>
  );
}
