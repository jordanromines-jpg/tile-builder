/* A tile as a picture (plan key 2j; a 3D picture since sprint 2, the drawing below as its fallback): the shape, its colour at 45% over the surface, its pattern, a 3 px rim, and an
   optional count beside it. With `speak`, it is a button that says its name ("4 red squares") on tap. */
import { useId, useState, type CSSProperties } from "react";
import { DEFAULT_LEG, SHAPES, tileName, type Colour, type Pt, type ShapeId } from "../engine/catalog";
import { say, useVoiceOn } from "../speech/say";
import { PATTERN_OF, TilePattern } from "./patterns";
import { pictureUrl, tileFile } from "../pictures";

export type ChipSize = "sm" | "md" | "lg";
export const CHIP_PX: Record<ChipSize, number> = { sm: 48, md: 72, lg: 104 };
const COUNT_PX: Record<ChipSize, number> = { sm: 26, md: 32, lg: 40 };

export interface TileChipProps {
  shape: ShapeId;
  colour?: Colour;
  count?: number;
  size?: ChipSize;
  leg?: number;
  /** say the name on tap */
  speak?: boolean;
  /** this tile stands in for another (a swap): a small mark */
  instead?: boolean;
  className?: string;
}

function bounds(pts: Pt[]) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

/** The points flipped so y runs down, as SVG draws. */
function svgPoints(pts: Pt[], y1: number): string {
  return pts.map(([x, y]) => `${x},${y1 - y}`).join(" ");
}

/** The tile as the build stage draws it: its 3D picture (src/pictures.ts), or the flat drawing for "any colour" and
    when a picture is missing. */
export function TilePicture({ shape, colour, leg = DEFAULT_LEG, px }: { shape: ShapeId; colour?: Colour; leg?: number; px: number }) {
  const file = colour ? tileFile(shape, colour, leg) : null;
  const [failed, setFailed] = useState<string | null>(null);
  if (file && failed !== file)
    return (
      <img
        src={pictureUrl(file)}
        width={px}
        height={px}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className="block select-none"
        onError={() => setFailed(file)}
      />
    );
  return <TileDrawing shape={shape} colour={colour} leg={leg} px={px} />;
}

/** The flat drawing: the shape, its colour at 45%, its pattern and a rim. */
export function TileDrawing({ shape, colour, leg = DEFAULT_LEG, px }: { shape: ShapeId; colour?: Colour; leg?: number; px: number }) {
  const id = useId().replace(/:/g, "");
  const def = SHAPES[shape];
  const pts = def.points(leg);
  const b = bounds(pts);
  const w = b.x1 - b.x0;
  const h = b.y1 - b.y0;
  const side = Math.max(w, h);
  const pad = side * 0.08;
  const vb = `${b.x0 - pad - (side - w) / 2} ${-pad - (side - h) / 2} ${side + 2 * pad} ${side + 2 * pad}`;
  const fill = colour ? `var(--tile-${colour})` : "var(--surface-3)";
  const rim = colour ? `var(--tile-${colour}-rim)` : "var(--ink-3)";
  const poly = svgPoints(pts, b.y1);
  const pattern = colour ? PATTERN_OF[colour] : "plain";
  const rimPx = 3;
  return (
    <svg viewBox={vb} width={px} height={px} aria-hidden="true" focusable="false" style={{ overflow: "visible", display: "block" }}>
      <defs>{colour && <TilePattern id={`p${id}`} name={pattern} color={rim} />}</defs>
      {def.noFace ? (
        <>
          <polygon points={poly} fill="none" stroke={rim} strokeWidth={rimPx} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          {[0.33, 0.66].map((x) => (
            <line key={x} x1={x} x2={x} y1={0} y2={h} stroke={rim} strokeWidth={rimPx} vectorEffect="non-scaling-stroke" />
          ))}
        </>
      ) : (
        <>
          <polygon points={poly} fill={fill} fillOpacity={colour ? 0.45 : 1} />
          {colour && pattern !== "plain" && <polygon points={poly} fill={`url(#p${id})`} opacity={0.75} />}
          {def.hole === "window" && <rect x={0.28} y={0.28} width={0.44} height={0.44} rx={0.04} fill="var(--surface)" stroke={rim} strokeWidth={2} vectorEffect="non-scaling-stroke" />}
          {def.hole === "door" && <path d="M0.3 1 V0.45 A0.2 0.2 0 0 1 0.7 0.45 V1 Z" fill="var(--surface)" stroke={rim} strokeWidth={2} vectorEffect="non-scaling-stroke" />}
          <polygon points={poly} fill="none" stroke={rim} strokeWidth={rimPx} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

export function TileChip({ shape, colour, count, size = "md", leg, speak, instead, className = "" }: TileChipProps) {
  const label = tileName(shape, colour, count);
  const px = CHIP_PX[size];
  const voiceOn = useVoiceOn();
  const style: CSSProperties = { fontSize: COUNT_PX[size], lineHeight: 1 };
  const body = (
    <>
      <span className="relative inline-block">
        <TilePicture shape={shape} colour={colour} leg={leg} px={px} />
        {instead && (
          <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-[13px] font-bold text-accent-ink" aria-hidden="true">
            ⇄
          </span>
        )}
      </span>
      {count !== undefined && (
        <span className="font-display font-semibold tabular-nums text-ink-1" style={style} aria-hidden="true">
          {count}
        </span>
      )}
    </>
  );
  const cls = `inline-flex items-center gap-2 ${className}`;
  // with the voice off a tap would say nothing, so the chip is a picture, not a button
  if (speak && voiceOn) {
    return (
      <button type="button" className={`${cls} rounded-md p-1`} aria-label={label} onClick={() => say(label)}>
        {body}
      </button>
    );
  }
  return (
    <span className={cls} role="img" aria-label={label}>
      {body}
    </span>
  );
}
