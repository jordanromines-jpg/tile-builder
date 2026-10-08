/* Wildflowers (2.9), part 4: bouquets, window boxes and a trellis for 9 to 10, from one Magna-Tiles 100. A box or
   vase of rings with a lid (or the bare table); stems of rings stand on it and share walls where they touch, so a bouquet stands as one wide plant (R12); heads are closed pyramids of leaning triangles.
   Flat leaves lie on the table. */
import type { Colour } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder, TALL_TO_LOW } from "./helpers";

interface Stem {
  x: number;
  z: number;
  /** rings high */
  h: number;
  head: "tall" | "low";
  colour: Colour;
  /** the colour of this stem's top rings (a flower's own colour under its head), and how many rings */
  top?: Colour;
  topN?: number;
}
interface Leaf {
  /** flat on the table by its base edge: a triangle pointing N (away from you) or S (towards you), or a square */
  x: number;
  y: number;
  dir: "N" | "S" | "sq";
}
interface Spec {
  id: string;
  title: string;
  done: string;
  /** the vase or box; without it the stems stand on the table */
  base?: { w: number; d: number; rings: Colour[]; lid: Colour; what: string };
  stems: Stem[];
  leaves?: Leaf[];
  /** the "why" line, said with the first stem ring */
  why: string;
  /** the colour note, said once with the first head */
  note?: string;
  bloom: string;
}

const G: Colour = "green";
// c: 30 to 100 tiles, so under 53.3 is one star, under 76.7 two
const starsFor = (n: number): 1 | 2 | 3 => (n < 30 + 70 / 3 ? 1 : n < 30 + 140 / 3 ? 2 : 3);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function garden(s: Spec): Project {
  const b = new Builder();
  const H = s.base ? s.base.rings.length : 0;
  if (s.leaves?.length) {
    for (const l of s.leaves) {
      if (l.dir === "N") b.on("tri-equilateral", G, [l.x, l.y], [l.x + 1, l.y]);
      else if (l.dir === "S") b.on("tri-equilateral", G, [l.x + 1, l.y], [l.x, l.y]);
      else b.flat("square", G, l.x, l.y);
    }
    b.chunkBy(
      s.leaves.map(() => 1),
      s.leaves.map((l, i) => (i === 0 ? `Lay a green ${l.dir === "sq" ? "square" : "triangle"} flat on the table: a leaf. Leaves first.` : "Another leaf, flat on the table.")),
    );
  }
  if (s.base) {
    const { w, d, rings, lid, what } = s.base;
    rings.forEach((c, r) => {
      b.room(c, 0, 0, w, d, r);
      b.chunk(4, [r === 0 ? `Stand squares up in a ring, ${w} by ${d}: the ${what}. Four at a time.` : "A second ring on top, the same size.", "Keep going round the ring.", "Keep going.", "Close the ring."]);
    });
    const inner = rings.length === 1 ? b.inside(rings[0], 0, 0, w, d, 0) : 0;
    if (inner) b.chunk(4, [`Inside, stand ${plural(inner, "square")} across the ${what}. They hold the lid up.`]);
    b.lids(lid, 0, 0, w, d, rings.length);
    b.chunk(4, ["Lay squares flat across the top: the lid, to plant in.", "More lid squares.", "Keep laying.", "Close the lid."]);
  }
  // the stems: one wall on each edge of a stem's cell, one wall where two cells touch
  const maxH = Math.max(...s.stems.map((t) => t.h));
  for (let r = 0; r < maxH; r++) {
    const act = s.stems.filter((t) => t.h > r);
    const edges = new Map<string, { make: (c: Colour) => number; cols: Colour[] }>();
    const addEdge = (key: string, make: (c: Colour) => number, t: Stem) => {
      const e = edges.get(key) ?? { make, cols: [] };
      e.cols.push(t.top && r >= t.h - (t.topN ?? 1) ? t.top : G);
      edges.set(key, e);
    };
    for (const t of act) {
      addEdge(`x${t.x},${t.z + 1}`, (c) => b.wallX("square", c, t.x, H + r, t.z + 1), t);
      addEdge(`z${t.x + 1},${t.z}`, (c) => b.wallZ("square", c, t.x + 1, H + r, t.z), t);
      addEdge(`x${t.x},${t.z}`, (c) => b.wallX("square", c, t.x, H + r, t.z), t);
      addEdge(`z${t.x},${t.z}`, (c) => b.wallZ("square", c, t.x, H + r, t.z), t);
    }
    // lay the walls round a connected group at a time, each one touching the one before (R6), four to a step
    const todo = [...edges.entries()].map(([key, e]) => {
      const [k, rest] = [key[0], key.slice(1)];
      const [x, z] = rest.split(",").map(Number);
      const ends = k === "x" ? [`${x},${z}`, `${x + 1},${z}`] : [`${x},${z}`, `${x},${z + 1}`];
      return { e, ends };
    });
    let first = r === 0;
    while (todo.length) {
      const group = [todo.shift()!];
      for (let grew = true; grew; ) {
        grew = false;
        const at = todo.findIndex((c) => group.some((g) => g.ends.some((p) => c.ends.includes(p))));
        if (at >= 0) {
          group.push(todo.splice(at, 1)[0]);
          grew = true;
        }
      }
      for (const g of group) g.e.make(g.e.cols.find((c) => c !== G) ?? G);
      b.chunk(4, [
        first ? `Now the stems. Stand green squares in a ring round each stem, on ${s.base ? "the lid" : "the table"}. ${s.why}` : r === 0 ? "Next, the ring round another stem." : `Ring ${r + 1} of the stems: only the ${plural(act.length, "stem")} that are still growing.`,
        "Keep going round.",
        "More squares for this ring.",
        "Close this ring.",
      ]);
      first = false;
    }
  }
  s.stems.forEach((t, i) => {
    if (t.head === "tall") b.roof(t.colour, t.x, t.z, H + t.h);
    else b.lowRoof(t.colour, t.x, t.z, H + t.h);
    const how = t.head === "tall" ? "four tall triangles" : "four short triangles";
    b.step(`Lean ${how} together on top of ${i === 0 ? `a stem, tips meeting: the first ${s.bloom}` : "the next stem: another flower"}.${i === 0 && s.note ? ` ${s.note}` : ""}`);
  });
  return b.build({ id: s.id, title: s.title, theme: "flowers", age: "c", stars: starsFor(b.placed.length), done: s.done, swaps: [TALL_TO_LOW] });
}

const sunflowerVase = () =>
  garden({
    id: "flower-kansas-sunflower-vase",
    title: "Kansas sunflower vase",
    done: "You built a sunflower vase! The sunflower is the state flower of Kansas.",
    base: { w: 2, d: 2, rings: ["blue"], lid: "green", what: "vase" },
    stems: [
      { x: 0, z: 0, h: 4, head: "low", colour: "purple", top: "yellow" },
      { x: 1, z: 0, h: 3, head: "low", colour: "purple", top: "yellow" },
      { x: 0, z: 1, h: 3, head: "low", colour: "purple", top: "yellow" },
    ],
    leaves: [
      { x: 1, y: -2, dir: "S" },
      { x: 1, y: 0, dir: "N" },
    ],
    why: "The vase is two squares across, and the stems lean on each other, so the tall bunch doesn't tip.",
    note: "Sunflower middles are brown; we use purple.",
    bloom: "sunflower",
  });

const prairieBox = () =>
  garden({
    id: "flower-kansas-prairie-window-box",
    title: "Kansas prairie window box",
    done: "You built a prairie window box! Butterfly milkweed has orange flowers that attract butterflies and many other insects.",
    base: { w: 3, d: 2, rings: ["red"], lid: "green", what: "window box" },
    stems: [
      { x: 0, z: 0, h: 3, head: "tall", colour: "red", top: "purple" },
      { x: 1, z: 1, h: 2, head: "low", colour: "purple", top: "yellow" },
      { x: 2, z: 0, h: 3, head: "low", colour: "orange", top: "orange" },
    ],
    leaves: [
      { x: 0, y: -2, dir: "S" },
      { x: 2, y: -2, dir: "S" },
    ],
    why: "The box is longer than any stem is tall, so it sits steady.",
    note: "Coneflower petals are pink and its cone is brown; we use purple and red.",
    bloom: "purple coneflower",
  });

const goldenrodBouquet = () =>
  garden({
    id: "flower-kansas-goldenrod-blazing-star-bouquet",
    title: "Kansas goldenrod and blazing star bouquet",
    done: "You built a bouquet! Goldenrod is pollinated by insects, not wind, so it does not cause hay fever.",
    base: { w: 2, d: 2, rings: ["orange"], lid: "green", what: "vase" },
    stems: [
      { x: 0, z: 0, h: 4, head: "tall", colour: "purple", top: "purple", topN: 2 },
      { x: 1, z: 0, h: 3, head: "tall", colour: "purple", top: "purple", topN: 2 },
      { x: 0, z: 1, h: 3, head: "tall", colour: "yellow", top: "yellow", topN: 2 },
      { x: 1, z: 1, h: 2, head: "low", colour: "yellow", top: "yellow" },
    ],
    leaves: [{ x: 0, y: -2, dir: "S" }],
    why: "Stems that touch hold each other up, so the tall spike can stand.",
    bloom: "blazing star spike",
  });

const compassPlant = () =>
  garden({
    id: "flower-kansas-compass-plant",
    title: "Kansas compass plant",
    done: "You built a compass plant! Its leaves point their edges north and south.",
    base: { w: 2, d: 2, rings: ["blue", "blue"], lid: "green", what: "pot" },
    stems: [
      { x: 0, z: 0, h: 4, head: "low", colour: "yellow", top: "yellow" },
      { x: 1, z: 0, h: 3, head: "low", colour: "yellow", top: "yellow" },
    ],
    leaves: [
      { x: 0, y: 0, dir: "N" },
      { x: 1, y: 0, dir: "N" },
      { x: 0, y: -2, dir: "S" },
      { x: 1, y: -2, dir: "S" },
    ],
    why: "Two stems side by side lean on each other, so the tall plant stands.",
    bloom: "yellow flower",
  });

const violetBox = () =>
  garden({
    id: "flower-chicago-violet-window-box",
    title: "Chicago violet window box",
    done: "You built a violet window box! The violet is the state flower of Illinois; schoolchildren voted for it in 1907.",
    base: { w: 4, d: 2, rings: ["blue"], lid: "green", what: "window box" },
    stems: [
      { x: 0, z: 0, h: 2, head: "low", colour: "purple", top: "yellow" },
      { x: 1, z: 1, h: 1, head: "low", colour: "purple", top: "yellow" },
      { x: 2, z: 0, h: 2, head: "low", colour: "purple", top: "yellow" },
      { x: 3, z: 1, h: 1, head: "low", colour: "purple", top: "yellow" },
    ],
    leaves: [
      { x: 1, y: -2, dir: "S" },
      { x: 3, y: -2, dir: "S" },
    ],
    why: "A wide box with short stems has a low middle, so it can't tip.",
    bloom: "violet",
  });

const blazingBergamot = () =>
  garden({
    id: "flower-chicago-blazing-star-bergamot-bouquet",
    title: "Chicago prairie blazing star and bergamot bouquet",
    done: "You built a bouquet! Monarchs stop at prairie blazing star to sip nectar on their way south.",
    base: { w: 2, d: 2, rings: ["orange", "orange"], lid: "green", what: "vase" },
    stems: [
      { x: 0, z: 0, h: 3, head: "tall", colour: "purple", top: "purple", topN: 2 },
      { x: 1, z: 0, h: 2, head: "low", colour: "blue", top: "blue" },
      { x: 0, z: 1, h: 2, head: "low", colour: "blue", top: "blue" },
    ],
    leaves: [
      { x: 1, y: -2, dir: "S" },
      { x: 1, y: 0, dir: "N" },
    ],
    why: "The short stems sit against the tall one, so it has two neighbours to lean on.",
    note: "Bergamot is pale purple-pink; we use blue.",
    bloom: "blazing star spike",
  });

const bluebells = () =>
  garden({
    id: "flower-chicago-virginia-bluebells",
    title: "Chicago Virginia bluebells patch",
    done: "You built Virginia bluebells! They open pink and turn blue, and their leaves fade by mid-summer.",
    stems: [
      { x: 0, z: 0, h: 2, head: "low", colour: "blue", top: "blue" },
      { x: 1, z: 0, h: 3, head: "low", colour: "purple", top: "purple" },
      { x: 0, z: 1, h: 3, head: "low", colour: "purple", top: "purple" },
      { x: 1, z: 1, h: 2, head: "low", colour: "blue", top: "blue" },
    ],
    leaves: [
      { x: -2, y: -1, dir: "sq" },
      { x: -1, y: 0, dir: "sq" },
      { x: 2, y: -1, dir: "sq" },
      { x: 2, y: -2, dir: "sq" },
    ],
    why: "Four stems in a block are two squares across, so the bunch stands up on the table.",
    note: "Bluebell buds are pink; we use purple.",
    bloom: "bluebell bud",
  });

const azalea = () =>
  garden({
    id: "flower-carolina-flame-azalea-bush",
    title: "North Carolina flame azalea bush",
    done: "You built a flame azalea bush! It grows on Appalachian mountain slopes and attracts hummingbirds.",
    stems: [
      { x: 0, z: 0, h: 3, head: "low", colour: "orange", top: "orange" },
      { x: 1, z: 0, h: 3, head: "low", colour: "red", top: "red" },
      { x: 0, z: 1, h: 2, head: "low", colour: "yellow", top: "yellow" },
      { x: 1, z: 1, h: 2, head: "low", colour: "orange", top: "orange" },
      { x: 2, z: 0, h: 2, head: "tall", colour: "red", top: "red" },
      { x: 2, z: 1, h: 2, head: "tall", colour: "yellow", top: "yellow" },
    ],
    leaves: [
      { x: -2, y: -1, dir: "sq" },
      { x: 3, y: -1, dir: "sq" },
    ],
    why: "A bush is wide and low, three squares across and three high, so it is very steady.",
    bloom: "azalea flower",
  });

const laurel = () =>
  garden({
    id: "flower-carolina-mountain-laurel-bouquet",
    title: "North Carolina mountain laurel bouquet",
    done: "You built a mountain laurel bouquet! Mountain laurel flowers spring a trap: when a bee lands, ten stamens pop out and dust it with pollen.",
    base: { w: 2, d: 2, rings: ["blue"], lid: "green", what: "vase" },
    stems: [
      { x: 0, z: 0, h: 4, head: "low", colour: "purple", top: "red" },
      { x: 1, z: 0, h: 3, head: "low", colour: "purple", top: "red" },
      { x: 0, z: 1, h: 3, head: "low", colour: "purple", top: "red" },
      { x: 1, z: 1, h: 2, head: "low", colour: "purple", top: "red" },
    ],
    why: "The tallest stem has three neighbours to lean on.",
    note: "Mountain laurel is pink or white; we use purple.",
    bloom: "mountain laurel flower",
  });

const WORD: Record<string, string> = { y: "yellow", b: "blue", g: "green", r: "red" };
const COL: Record<string, Colour> = { y: "yellow", b: "blue", g: "green", r: "red" };

/** A trellis: a standing wall of squares, top row first in the picture, with a square going back at each end of every
    row, so the tall thin wall can't fold over (R10) or tip (R12). The vine is green and the trumpets red. */
function trellis(): Project {
  const b = new Builder();
  const rows = ["ybrgy", "yrgby", "ygrby", "ygbby", "ybbby"];
  const W = 5;
  for (let x = 0; x < W; x++) b.flat("square", G, x, -1);
  b.chunkBy([4, 1], ["Lay four green squares flat on the table, in a line: the ground in front of the trellis.", "One more green square at the end of the line."]);
  const names = (row: string, from: number, to: number) => [...row].slice(from, to).map((c) => WORD[c]).join(", ");
  for (let r = 0; r < rows.length; r++) {
    const row = rows[rows.length - 1 - r];
    for (let x = 0; x < W; x++) b.wallX("square", COL[row[x]], x, r, 0);
    b.wallZ("square", "yellow", 0, r, -1);
    b.wallZ("square", "yellow", W, r, -1);
    b.chunkBy(
      [4, 3],
      r === 0
        ? [`Stand the bottom row of the wall, left to right: ${names(row, 0, 4)}. The yellow ones are the posts.`, `The last one: ${names(row, 4, 5)}. Then a yellow square going back at each end: the feet. A tall, thin wall needs them, or it tips.`]
        : [`Row ${r + 1} of the wall, left to right: ${names(row, 0, 4)}.${r === 1 ? " A trellis is wood; we use blue and yellow." : ""}`, `The last one: ${names(row, 4, 5)}. Then a yellow square going back at each end, on the feet below. They stop the wall folding over.`],
    );
  }
  return b.build({ id: "flower-carolina-trumpet-creeper-trellis", title: "North Carolina trumpet creeper on a trellis", theme: "flowers", age: "c", stars: starsFor(b.placed.length), done: "You built a trumpet creeper on a trellis! Hummingbirds are the main visitors to its red trumpet flowers." });
}

export const FLOWERS_4: Project[] = [sunflowerVase(), prairieBox(), goldenrodBouquet(), compassPlant(), violetBox(), blazingBergamot(), bluebells(), azalea(), laurel(), trellis()];
