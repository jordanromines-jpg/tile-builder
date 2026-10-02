/* Outline icons of each tile shape (plan key 2k), in Phosphor's style: a 256 grid, 16-unit round strokes, no fill. */
import { DEFAULT_LEG, SHAPES, type ShapeId } from "../engine/catalog";

export function ShapeIcon({ shape, size = 24, label }: { shape: ShapeId; size?: number; label?: string }) {
  const pts = SHAPES[shape].points(DEFAULT_LEG);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const w = Math.max(...xs);
  const h = Math.max(...ys);
  const k = 192 / Math.max(w, h);
  const ox = (256 - w * k) / 2;
  const oy = (256 - h * k) / 2;
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${(ox + x * k).toFixed(1)} ${(256 - oy - y * k).toFixed(1)}`).join(" ") + " Z";
  const def = SHAPES[shape];
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={16}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={d} />
      {def.hole === "window" && <rect x={ox + 0.3 * k} y={256 - oy - 0.7 * k} width={0.4 * k} height={0.4 * k} rx={6} />}
      {def.hole === "door" && <path d={`M${ox + 0.32 * k} ${256 - oy} V${256 - oy - 0.55 * k} a${0.18 * k} ${0.18 * k} 0 0 1 ${0.36 * k} 0 V${256 - oy}`} />}
      {def.noFace && [0.33, 0.66].map((x) => <line key={x} x1={ox + x * w * k} x2={ox + x * w * k} y1={256 - oy} y2={256 - oy - h * k} />)}
    </svg>
  );
}
