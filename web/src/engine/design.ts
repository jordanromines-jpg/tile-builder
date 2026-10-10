/* A child's own design (5.0c, Make your own): the tiles as they were put on, kept on the iPad, and the steps that
   build it again. A design becomes a Project, so Build mode, Watch it build and All steps read it as they read ours.
   Steps go in the order the tiles were put on: one tile a step for 3–5, and for older children the tiles in a row
   that are alike (same shape, colour, way up and place) together, up to the age's most a step. */
import { AGE_RULES } from "./ages";
import { COLOUR_NAMES, DEFAULT_LEG, SHAPES, type Colour, type ShapeId } from "./catalog";
import { edgesMeet, edgesOf, layerOf, worldPolygon, type Seg } from "./geometry";
import type { Age, Placed, Project, Step } from "./types";

export interface Design {
  /** "my-…", so a design's id never meets one of ours */
  id: string;
  name: string;
  placed: Placed[];
  /** ISO time of the last change */
  updated: string;
}

export const DESIGN_PREFIX = "my-";
export const isDesignId = (id: string) => id.startsWith(DESIGN_PREFIX);
export const newDesignId = (now = Date.now()) => `${DESIGN_PREFIX}${now.toString(36)}`;

const near = (a: number, b: number) => Math.abs(a - b) < 0.02;

function verbOf(p: Placed): { verb: string; after: string } {
  const rx = p.rot[0];
  if (near(rx, 0)) return { verb: "Stand", after: "" };
  if (near(rx, -Math.PI / 2)) return { verb: "Lay", after: " flat" };
  if (rx < -Math.PI / 2) return { verb: "Hang", after: " down" };
  return { verb: "Lean", after: "" };
}

const article = (word: string) => (/^[aeiou]/.test(word) ? "an" : "a");
const one = (shape: ShapeId, colour?: Colour) => {
  const words = `${colour ? `${COLOUR_NAMES[colour]} ` : ""}${SHAPES[shape].label}`;
  return `${article(words)} ${words}`;
};

/** Where tile i goes: "on the table", or on the first tile before it whose edge its base edge lies along. */
function whereOf(placed: Placed[], i: number, leg: number): string {
  const poly = worldPolygon(placed[i], leg);
  const base: Seg = [poly[0], poly[1]];
  if (Math.abs(base[0][1]) < 0.02 && Math.abs(base[1][1]) < 0.02) return "on the table";
  for (let j = 0; j < i; j++) {
    if (edgesOf(worldPolygon(placed[j], leg)).some((e) => edgesMeet(base, e))) {
      const words = `${placed[j].colour ? `${COLOUR_NAMES[placed[j].colour!]} ` : ""}${SHAPES[placed[j].shape].label}`;
      return `on the ${words}`;
    }
  }
  return "on top";
}

/** The steps that build these tiles again, in the order they were put on. */
export function designSteps(placed: Placed[], age: Age, leg = DEFAULT_LEG): Step[] {
  const most = AGE_RULES[age].maxTilesPerStep;
  const info = placed.map((p, i) => ({ ...verbOf(p), where: whereOf(placed, i, leg), layer: layerOf(worldPolygon(p, leg)) }));
  const steps: Step[] = [];
  let i = 0;
  while (i < placed.length) {
    const p = placed[i];
    const k = info[i];
    let n = 1;
    while (
      n < most &&
      i + n < placed.length &&
      placed[i + n].shape === p.shape &&
      placed[i + n].colour === p.colour &&
      info[i + n].verb === k.verb &&
      info[i + n].where === k.where &&
      info[i + n].layer === k.layer
    )
      n++;
    const what = n === 1 ? one(p.shape, p.colour) : `${n} ${p.colour ? `${COLOUR_NAMES[p.colour]} ` : ""}${SHAPES[p.shape].plural}`;
    steps.push({ say: `${k.verb} ${what}${k.after} ${k.where}.`, tiles: Array.from({ length: n }, (_, m) => i + m) });
    i += n;
  }
  return steps;
}

/** The design as a project, its steps as they come (no checking: for drawing it on a shelf). */
export function designBase(d: Design, age: Age): Project {
  // a baby's builds are a grown-up's: their steps are a 3–5's, one tile at a time
  const stepAge: Age = age === "t" ? "a" : age;
  const base: Project = {
    id: d.id,
    title: d.name,
    theme: "patterns",
    age: stepAge,
    stars: 1,
    done: `You built ${d.name}!`,
    placed: d.placed,
    steps: designSteps(d.placed, stepAge),
  };
  const extras = [...new Set(d.placed.map((p) => p.shape))].filter((s) => s === "rect-2x1" || s === "window" || s === "door" || s === "fence");
  if (extras.length) base.needs = { brandExtras: extras };
  return base;
}
