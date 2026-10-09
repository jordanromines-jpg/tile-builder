/* Builds in the colours a family has (4.3, plan 2026-10-09-set-colours; Jordan: "The colors don't match what's available
   in the sets"). Colour stays a preference, never a requirement: matching (match.ts) is unchanged, and this only says
   which tiles to draw and name in another colour so the build uses the colours the family has. Rules, in order:
   1. A shape's colours are the grown-up's colour counts; a shape counted without colours is taken as spread evenly
      over the colours of the family's brands (a family that picked its set before 4.3, or counts by shape only). With
      neither (no brand, or "other tiles"), it keeps its designed colours. So does a shape the family has too few of for
      the build (the card says "Need 2 more"; spreading too few tiles over the colours would only stripe it). Tiles
      counted beyond a shape's colour counts can be any colour, so they keep theirs.
   2. A colour whose tiles all fit keeps them. One that doesn't moves whole to one other colour with room (every
      orange tile becomes red), so the build stays one design and its lines name one colour.
   3. Otherwise its steps keep the colour while it lasts, and the rest move as groups (one step's tiles of one shape
      and one designed colour: a red roof, a blue wall) to one colour each, so a roof doesn't come out striped. A move
      goes to the colour nearest in hue with room, then the one with most left.
   4. A group that fits no one colour is split tile by tile the same way; a tile nothing has room for keeps its colour
      (the family is short of the shape; the card already says so).
   Swapped tiles are coloured as what they are built with. Pure and deterministic. */
import { BRANDS, COLOUR_NAMES, COLOURS, type Colour, type ShapeId } from "./catalog";
import { spread } from "./sets";
import { SWAP_RATIO } from "./match";
import type { Inventory, Project } from "./types";

interface Group {
  shape: ShapeId;
  colour: Colour;
  step: number;
  /** placed tiles, with how many of the shape each takes (a square built as two corner triangles takes 2) */
  tiles: { i: number; k: number }[];
  need: number;
}

/** How far apart two colours are round the rainbow (red, orange, yellow, green, blue, purple, back to red). */
export function hueGap(a: Colour, b: Colour): number {
  const d = Math.abs(COLOURS.indexOf(a) - COLOURS.indexOf(b));
  return Math.min(d, COLOURS.length - d);
}

/** Where a group goes: the nearest colour in hue with room for `need`, then the one with most left; null if none. */
function pick(left: Map<Colour, number>, from: Colour, need: number): Colour | null {
  const room = COLOURS.filter((c) => c !== from && (left.get(c) ?? 0) >= need);
  if (!room.length) return null;
  room.sort((a, b) => hueGap(from, a) - hueGap(from, b) || (left.get(b) ?? 0) - (left.get(a) ?? 0) || COLOURS.indexOf(a) - COLOURS.indexOf(b));
  return room[0];
}

/** Placed tile → the colour to draw and name it in, for the tiles whose colour changes. */
export function recolour(project: Project, inv: Inventory | undefined, instead: Record<number, ShapeId> = {}): Record<number, Colour> {
  const out: Record<number, Colour> = {};
  if (!inv) return out;
  const stepOf = new Map<number, number>();
  project.steps.forEach((s, n) => s.tiles.forEach((t) => stepOf.set(t, n)));

  // the groups, by the shape each tile is built with
  const groups = new Map<string, Group>();
  project.placed.forEach((p, i) => {
    if (!p.colour) return;
    const shape = instead[i] ?? p.shape;
    const k = instead[i] ? (SWAP_RATIO[`${p.shape}>${shape}`] ?? 1) : 1;
    const step = stepOf.get(i) ?? 0;
    const key = `${shape}|${p.colour}|${step}`;
    const g = groups.get(key) ?? { shape, colour: p.colour, step, tiles: [], need: 0 };
    g.tiles.push({ i, k });
    g.need += k;
    groups.set(key, g);
  });

  const shapes = new Set([...groups.values()].map((g) => g.shape));
  for (const shape of shapes) {
    const count = inv.counts[shape];
    const mine = [...groups.values()].filter((g) => g.shape === shape).sort((a, b) => a.step - b.step || COLOURS.indexOf(a.colour) - COLOURS.indexOf(b.colour));
    if (mine.reduce((n, g) => n + g.need, 0) > (count?.any ?? 0)) continue;
    let by = count?.byColour ?? {};
    if (!COLOURS.some((c) => (by[c] ?? 0) > 0)) {
      if (inv.brands.includes("generic")) continue;
      const made = COLOURS.filter((c) => inv.brands.some((b) => BRANDS[b].colours.includes(c)));
      if (!made.length) continue;
      by = spread(count?.any ?? 0, made, shape);
    }
    const left = new Map(COLOURS.map((c) => [c, by[c] ?? 0]));
    // tiles counted without a colour: any colour, so a tile placed there keeps its own
    let free = Math.max(0, (count?.any ?? 0) - COLOURS.reduce((n, c) => n + (by[c] ?? 0), 0));

    // 2. a colour whose tiles all fit in it keeps them all; one that doesn't fit moves whole to one other colour if one
    // has room (so a yellow duck becomes all blue, not striped); otherwise its steps keep the colour while it lasts
    const family = new Map<Colour, Group[]>();
    for (const g of mine) family.set(g.colour, [...(family.get(g.colour) ?? []), g]);
    const total = (gs: Group[]) => gs.reduce((n, g) => n + g.need, 0);
    const over: Group[][] = [];
    for (const [c, gs] of family) {
      if ((left.get(c) ?? 0) >= total(gs)) left.set(c, (left.get(c) ?? 0) - total(gs));
      else over.push(gs);
    }
    const moving: Group[] = [];
    over.sort((a, b) => total(b) - total(a) || COLOURS.indexOf(a[0].colour) - COLOURS.indexOf(b[0].colour));
    for (const gs of over) {
      const to = pick(left, gs[0].colour, total(gs));
      if (to) {
        left.set(to, (left.get(to) ?? 0) - total(gs));
        gs.forEach((g) => g.tiles.forEach(({ i }) => (out[i] = to)));
        continue;
      }
      for (const g of gs) {
        if ((left.get(g.colour) ?? 0) >= g.need) left.set(g.colour, (left.get(g.colour) ?? 0) - g.need);
        else moving.push(g);
      }
    }
    const still: Group[] = [];
    for (const g of moving) {
      if (free >= g.need) free -= g.need;
      else still.push(g);
    }

    // 3. the rest move as groups, biggest first, to one colour each
    still.sort((a, b) => b.need - a.need || a.step - b.step);
    for (const g of still) {
      const to = pick(left, g.colour, g.need);
      if (to) {
        left.set(to, (left.get(to) ?? 0) - g.need);
        g.tiles.forEach(({ i }) => (out[i] = to));
        continue;
      }
      // 4. no one colour has room: tile by tile, its own colour first, then the same order, then the uncounted tiles
      for (const { i, k } of g.tiles) {
        if ((left.get(g.colour) ?? 0) >= k) {
          left.set(g.colour, (left.get(g.colour) ?? 0) - k);
          continue;
        }
        const c = pick(left, g.colour, k);
        if (c) {
          left.set(c, (left.get(c) ?? 0) - k);
          out[i] = c;
        } else if (free >= k) free -= k;
      }
    }
  }
  return out;
}

/** The shape a colour word is about: the noun after it ("red corner triangles" → tri-right). */
const NOUNS: [RegExp, ShapeId][] = [
  [/^\s*big squares?\b/i, "square-large"],
  [/^\s*squares?\b/i, "square"],
  [/^\s*corner triangles?\b/i, "tri-right"],
  [/^\s*tall triangles?\b/i, "tri-isosceles-tall"],
  [/^\s*triangles?\b/i, "tri-equilateral"],
  [/^\s*rectangles?\b/i, "rect-2x1"],
  [/^\s*windows?\b/i, "window"],
  [/^\s*doors?\b/i, "door"],
  [/^\s*fences?\b/i, "fence"],
];

export interface LineTile {
  shape: ShapeId;
  colour: Colour;
}

/** A step's line in the colours its tiles now have. A colour word is read with the shape after it ("yellow square",
    "yellow corner triangle"), or alone when no shape follows: when all of those tiles in the step became one colour it
    is named as that colour ("a yellow square" → "a blue square"); split over several, it loses its colour word ("a
    square"). "a"/"an" follows the new word. */
export function recolourLine(say: string, before: LineTile[], after: Colour[]): string {
  const to = new Map<string, Set<Colour>>();
  const add = (key: string, c: Colour) => to.set(key, (to.get(key) ?? new Set()).add(c));
  before.forEach((t, k) => {
    add(`${t.colour}|${t.shape}`, after[k]);
    add(t.colour, after[k]);
  });
  const now = (key: string): string | null => {
    const set = to.get(key);
    if (!set) return null;
    const [c] = key.split("|") as [Colour];
    if (set.size === 1 && set.has(c)) return null;
    return set.size === 1 ? COLOUR_NAMES[[...set][0]] : "";
  };
  if (![...to.keys()].some((k) => now(k) !== null)) return say;
  const byName = new Map(COLOURS.map((c) => [COLOUR_NAMES[c], c]));
  const names = [...new Set([...to.keys()].map((k) => COLOUR_NAMES[k.split("|")[0] as Colour]))]
    .sort((x, y) => y.length - x.length)
    .map((n) => n.replace(/ /g, "\\s+"));
  const article = (art: string | undefined, word: string) => {
    if (!art) return "";
    const an = /^[aeiou]/i.test(word) ? "an" : "a";
    return (art[0] === art[0].toUpperCase() ? an[0].toUpperCase() + an.slice(1) : an) + " ";
  };
  const re = new RegExp(`\\b(?:(a|an)\\s+)?(${names.join("|")})\\b(\\s?)(\\w?)`, "gi");
  return say.replace(re, (whole: string, art: string | undefined, w: string, gap: string, next: string, at: number) => {
    const colour = byName.get(w.toLowerCase().replace(/\s+/g, " "))!;
    const rest = say.slice(at + whole.length - next.length);
    const shape = NOUNS.find(([r]) => r.test(rest))?.[1];
    const n = (shape && to.has(`${colour}|${shape}`) ? now(`${colour}|${shape}`) : now(colour));
    if (n === null) return whole;
    const big = !art && w[0] === w[0].toUpperCase();
    // a colour word dropped at the start of a sentence hands its capital to the next word
    if (!n) return article(art, next) + (big ? next.toUpperCase() : next);
    return article(art, n) + (big ? n[0].toUpperCase() + n.slice(1) : n) + gap + next;
  });
}

/** The project drawn and named in the family's colours: a copy with those tiles' colours changed, and each step's
    line saying the colours its tiles now have. */
export function inColours(project: Project, colours: Record<number, Colour>): Project {
  if (!Object.keys(colours).length) return project;
  const placed = project.placed.map((p, i) => (colours[i] ? { ...p, colour: colours[i] } : p));
  const steps = project.steps.map((s) => {
    const mine = s.tiles.filter((t) => project.placed[t].colour);
    if (!mine.some((t) => colours[t])) return s;
    const before = mine.map((t) => ({ shape: project.placed[t].shape, colour: project.placed[t].colour! }));
    return { ...s, say: recolourLine(s.say, before, mine.map((t) => placed[t].colour!)) };
  });
  return { ...project, placed, steps };
}
