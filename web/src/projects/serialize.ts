/* The projects as data (2.4). The plans in this folder run once, when the app is built (`npm run projects`), not on the
   iPad: each project is saved as JSON under public/projects/, and a small catalogue of them all (catalog.json, next to
   this file) is what the Library reads. Numbers are rounded to six places, as for the pictures' fingerprints. */
import type { ShapeId } from "../engine/catalog";
import type { Course, Placed, Project, SwapRule } from "../engine/types";
import type { Theme } from "../engine/themes";
import type { Age } from "../engine/types";

/** What the Library and the grown-ups' counts need to know about a project, without its tiles. */
export interface ProjectInfo {
  id: string;
  title: string;
  theme: Theme;
  age: Age;
  stars: 1 | 2 | 3;
  tiles: number;
  bigRing?: boolean;
  swaps?: SwapRule[];
  /** tiles that are not roof triangles, by shape */
  shapes: Partial<Record<ShapeId, number>>;
  /** each roof (a pyramid of leaning triangles), in step order: its triangles' shape and how many */
  roofs: [ShapeId, number][];
}

const round = (v: number) => {
  const r = Math.round(v * 1e6) / 1e6;
  return Object.is(r, -0) ? 0 : r;
};

const round3 = (v: [number, number, number]): [number, number, number] => [round(v[0]), round(v[1]), round(v[2])];

/** A Monster trucks course with its numbers rounded. */
function roundCourse(c: Course): Course {
  return {
    ...c,
    features: c.features.map((f) => {
      const s = f.surface;
      if (!s) return f;
      return { ...f, surface: s.kind === "flat" ? { ...s, y: round(s.y), poly: s.poly.map(([x, z]): [number, number] => [round(x), round(z)]) } : { ...s, from: round3(s.from), to: round3(s.to), width: round(s.width) } };
    }),
    route: c.route.map((r) => (typeof r === "object" && "to" in r ? { to: round3(r.to) } : r)),
  };
}

/** The project with its numbers rounded, ready to save. */
export function serialize(p: Project): Project {
  return {
    ...p,
    placed: p.placed.map((t): Placed => ({ ...t, pos: t.pos.map(round) as Placed["pos"], rot: t.rot.map(round) as Placed["rot"] })),
    ...(p.course ? { course: roundCourse(p.course) } : {}),
  };
}

export function summarize(p: Project): ProjectInfo {
  const shapes: Partial<Record<ShapeId, number>> = {};
  p.placed.forEach((t) => {
    if (t.role !== "roof") shapes[t.shape] = (shapes[t.shape] ?? 0) + 1;
  });
  const roofs: [ShapeId, number][] = [];
  for (const s of p.steps) {
    const roof = s.tiles.filter((t) => p.placed[t].role === "roof");
    // a roof is finished in one step (R7); group a step's roof triangles by shape
    const byShape = new Map<ShapeId, number>();
    roof.forEach((t) => byShape.set(p.placed[t].shape, (byShape.get(p.placed[t].shape) ?? 0) + 1));
    byShape.forEach((n, shape) => roofs.push([shape, n]));
  }
  return {
    id: p.id,
    title: p.title,
    theme: p.theme,
    age: p.age,
    stars: p.stars,
    tiles: p.placed.length,
    ...(p.bigRing ? { bigRing: true } : {}),
    ...(p.swaps ? { swaps: p.swaps } : {}),
    shapes,
    roofs,
  };
}

/** A stand-in project with the same tiles by shape and the same roofs, for matching against a family's tiles without
    loading the real one (matchProject reads only shapes, roofs, swaps and bigRing). */
export function skeleton(info: ProjectInfo): Project {
  const placed: Placed[] = [];
  const steps: Project["steps"] = [];
  const rest: number[] = [];
  for (const [shape, n] of Object.entries(info.shapes) as [ShapeId, number][])
    for (let k = 0; k < n; k++) rest.push(placed.push({ shape, pos: [0, 0, 0], rot: [0, 0] }) - 1);
  if (rest.length) steps.push({ say: "-", tiles: rest });
  for (const [shape, n] of info.roofs) {
    const roof: number[] = [];
    for (let k = 0; k < n; k++) roof.push(placed.push({ shape, pos: [0, 0, 0], rot: [0, 0], role: "roof" }) - 1);
    steps.push({ say: "-", tiles: roof });
  }
  return { id: info.id, title: info.title, theme: info.theme, age: info.age, stars: info.stars, done: "-", placed, steps, ...(info.bigRing ? { bigRing: true } : {}), ...(info.swaps ? { swaps: info.swaps } : {}) };
}
