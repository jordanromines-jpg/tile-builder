/* A project's picture. Since sprint 2 it is the 3D picture drawn ahead of time (src/pictures.ts, superseding D24); the
   SVG below stays for part-built projects and as the fallback: drawn from the project's own tiles, from the front, a
   little to the right and above, far tiles first so near ones sit on top. */
import { useMemo, useState } from "react";
import { DEFAULT_LEG, type ShapeId } from "../engine/catalog";
import { asBuilt, worldPolygon, type V3 } from "../engine/geometry";
import type { Project } from "../engine/types";
import { pictureUrl, projectFile } from "../pictures";

const AZ = 0.5;
const EL = 0.55;
const view: V3 = [-Math.sin(AZ) * Math.cos(EL), -Math.sin(EL), -Math.cos(AZ) * Math.cos(EL)];
const right: V3 = [Math.cos(AZ), 0, -Math.sin(AZ)];
const up: V3 = [
  right[1] * view[2] - right[2] * view[1],
  right[2] * view[0] - right[0] * view[2],
  right[0] * view[1] - right[1] * view[0],
];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export interface Drawn {
  points: string;
  colour: string;
  depth: number;
}

/** The tiles as flat polygons on the picture, farthest first, and the picture's box. */
export function drawProject(project: Project, shown = project.placed.length, leg = DEFAULT_LEG, instead: Record<number, ShapeId> = {}) {
  const polys = project.placed.slice(0, shown).map((p, i) => ({ poly: worldPolygon(asBuilt(p, instead[i]), leg), colour: p.colour ?? "blue" }));
  const flat = polys.map(({ poly, colour }) => {
    const pts = poly.map((p) => [dot(p, right), -dot(p, up)] as [number, number]);
    const depth = poly.reduce((d, p) => d + dot(p, view), 0) / poly.length;
    return { pts, colour, depth };
  });
  flat.sort((a, b) => a.depth - b.depth);
  const xs = flat.flatMap((f) => f.pts.map((p) => p[0]));
  const ys = flat.flatMap((f) => f.pts.map((p) => p[1]));
  const box = xs.length ? { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) } : { x: 0, y: 0, w: 1, h: 1 };
  const drawn: Drawn[] = flat.map((f) => ({ points: f.pts.map((p) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`).join(" "), colour: f.colour, depth: f.depth }));
  return { drawn, box };
}

/** The finished project as the build stage draws it: its 3D picture (src/pictures.ts) on the stage colour, or the
    drawing below for a part-built project and when the picture is missing (when the project's tiles are at hand; the
    Library has only the id, and shows the empty stage instead). */
export function ProjectPicture({ id, project, shown, label }: { id?: string; project?: Project; shown?: number; label?: string }) {
  const file = projectFile(id ?? project!.id);
  const [failed, setFailed] = useState(false);
  if (shown === undefined && !failed)
    return (
      <img
        src={pictureUrl(file)}
        alt={label ?? ""}
        aria-hidden={label ? undefined : true}
        draggable={false}
        loading="lazy"
        decoding="async"
        className="block h-full w-full bg-stage object-contain"
        onError={() => setFailed(true)}
      />
    );
  if (!project) return <div className="block h-full w-full bg-stage" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
  return <ProjectDrawing project={project} shown={shown} label={label} />;
}

export function ProjectDrawing({ project, shown, label }: { project: Project; shown?: number; label?: string }) {
  const { drawn, box } = useMemo(() => drawProject(project, shown), [project, shown]);
  // fit a 4:3 frame round the model with a margin
  const pad = Math.max(box.w, box.h) * 0.12 + 0.3;
  let w = box.w + 2 * pad;
  let h = box.h + 2 * pad;
  if (w / h < 4 / 3) w = (h * 4) / 3;
  else h = (w * 3) / 4;
  const x = box.x + box.w / 2 - w / 2;
  const y = box.y + box.h / 2 - h / 2;
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      className="block h-full w-full"
      style={{ background: "var(--stage)" }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <ellipse cx={box.x + box.w / 2} cy={box.y + box.h * 0.92} rx={box.w * 0.62 + 0.3} ry={box.h * 0.12 + 0.25} fill="var(--ground)" opacity={0.6} />
      {drawn.map((d, i) => (
        <polygon
          key={i}
          points={d.points}
          fill={`var(--tile-${d.colour})`}
          fillOpacity={0.5}
          stroke={`var(--tile-${d.colour}-rim)`}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
