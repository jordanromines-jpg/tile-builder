/* The second cue (DESIGN.md, Tile pictures): each tile colour has its own pattern, so no two tiles are told apart by
   colour alone. Patterns are drawn in tile units (one square edge = 1) in the rim colour. */
import type { Colour } from "../engine/catalog";

export type PatternName = "dots" | "diagonal" | "plain" | "waves" | "horizontal" | "stars";

export const PATTERN_OF: Record<Colour, PatternName> = {
  red: "dots",
  orange: "diagonal",
  yellow: "plain",
  green: "waves",
  blue: "horizontal",
  purple: "stars",
};

const S = 0.25; // one pattern cell

function star(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(3)},${(cy + rr * Math.sin(a)).toFixed(3)}`);
  }
  return pts.join(" ");
}

/** An SVG <pattern> with the given id, in the given colour. "plain" draws nothing. */
export function TilePattern({ id, name, color }: { id: string; name: PatternName; color: string }) {
  const common = { id, patternUnits: "userSpaceOnUse" as const, width: S, height: S };
  const ink = { stroke: color, strokeWidth: 0.035, fill: "none", strokeLinecap: "round" as const };
  switch (name) {
    case "dots":
      return (
        <pattern {...common}>
          <circle cx={S / 2} cy={S / 2} r={0.04} fill={color} />
        </pattern>
      );
    case "diagonal":
      return (
        <pattern {...common} patternTransform="rotate(45)">
          <line x1={0} y1={S / 2} x2={S} y2={S / 2} {...ink} />
        </pattern>
      );
    case "waves":
      return (
        <pattern {...common}>
          <path d={`M0 ${S * 0.6} Q ${S / 4} ${S * 0.3} ${S / 2} ${S * 0.6} T ${S} ${S * 0.6}`} {...ink} />
        </pattern>
      );
    case "horizontal":
      return (
        <pattern {...common}>
          <line x1={0} y1={S / 2} x2={S} y2={S / 2} {...ink} />
        </pattern>
      );
    case "stars":
      return (
        <pattern {...common} width={S * 1.4} height={S * 1.4}>
          <polygon points={star(S * 0.7, S * 0.7, 0.07)} fill={color} />
        </pattern>
      );
    case "plain":
      return <pattern {...common} />;
  }
}
