/* Wildflowers (2.9), part 5: ten big builds for 11 to 16 (up to two Magna-Tiles 100 sets). Bouquets are stems tied
   together: square towers that share walls, so the bunch stands as one wide plant, growing out of a pot of big squares.
   Heads are closed shapes (pyramids), or a drum of walls with a flat lid. Kit: tots-kit.ts. */
import type { Colour } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder } from "./helpers";
import { bigFlat, bigRing } from "./tots-kit";

interface Head {
  kind: "tall" | "low";
  colour: Colour;
}
/** One stem of a bunch: the cell (x, z), how many rings high, the colour of each ring (by height), and its head. */
interface Stem {
  name: string;
  x: number;
  z: number;
  h: number;
  ring: (y: number) => Colour;
  head: Head;
}

const bloomRings = (stem: Colour, bloom: Colour, n: number, h: number) => (y: number): Colour => (y >= h - n ? bloom : stem);
const SIX = 6;

/** Walls round the stems (squares shared where two stems touch), a layer at a time, six squares a step. */
function bunch(b: Builder, stems: Stem[], y0: number, words: (layer: number, first: boolean, n: number, c: Colour) => string) {
  const top = Math.max(...stems.map((s) => s.h));
  for (let y = 0; y < top; y++) {
    const seen = new Set<string>();
    const walls: { o: "x" | "z"; x: number; z: number; c: Colour }[] = [];
    for (const s of stems.filter((t) => t.h > y)) {
      for (const w of [{ o: "x", x: s.x, z: s.z + 1 }, { o: "z", x: s.x + 1, z: s.z }, { o: "x", x: s.x, z: s.z }, { o: "z", x: s.x, z: s.z }] as const) {
        const k = `${w.o}${w.x},${w.z}`;
        if (!seen.has(k)) {
          seen.add(k);
          walls.push({ ...w, c: s.ring(y) });
        }
      }
    }
    // order so that each square touches one already down (they share a corner post)
    const ends = (w: (typeof walls)[number]) => (w.o === "x" ? [`${w.x},${w.z}`, `${w.x + 1},${w.z}`] : [`${w.x},${w.z}`, `${w.x},${w.z + 1}`]);
    const order: typeof walls = [walls[0]];
    const rest = walls.slice(1);
    while (rest.length) {
      const posts = new Set(order.flatMap(ends));
      const i = rest.findIndex((w) => ends(w).some((p) => posts.has(p)));
      order.push(...rest.splice(i < 0 ? 0 : i, 1));
    }
    for (let i = 0; i < order.length; i += SIX) {
      const part = order.slice(i, i + SIX);
      for (const w of part) (w.o === "x" ? b.wallX : b.wallZ).call(b, "square", w.c, w.x, y0 + y, w.z);
      b.step(words(y, i === 0, part.length, part[0].c));
    }
  }
  for (const s of stems) {
    if (s.head.kind === "tall") b.roof(s.head.colour, s.x, s.z, y0 + s.h);
    else b.lowRoof(s.head.colour, s.x, s.z, y0 + s.h);
    b.step(`${s.name}: lean four ${s.head.colour} triangles in on top of its tower, tips together.`);
  }
}

/** A pot of big squares: `nx` big squares across and one deep (two high), with a big square flat over each. */
function bigPot(b: Builder, colour: Colour, x: number, z: number, nx: number, lid: Colour, say: [string, string]) {
  for (let i = 0; i < nx; i++) {
    b.wallX("square-large", colour, x + 2 * i, 0, z + 2);
    b.wallX("square-large", colour, x + 2 * i, 0, z);
  }
  b.wallZ("square-large", colour, x + 2 * nx, 0, z);
  b.wallZ("square-large", colour, x, 0, z);
  b.step(say[0]);
  for (let i = 0; i < nx; i++) bigFlat(b, lid, x + 2 * i, 2, z);
  b.step(say[1]);
}

/** A flower on the table (or a flat bed): `rings` square towers of one square, then a head of triangles; one step each. */
function plant(b: Builder, x: number, z: number, rings: Colour[], head: Head | null, y = 0, name = "A flower") {
  rings.forEach((c, i) => {
    b.room(c, x, z, 1, 1, y + i);
    b.step(i === 0 ? `${name}: stand four ${c} squares in a ring.` : `${name}: another ${c} ring on top.`);
  });
  if (head) {
    if (head.kind === "tall") b.roof(head.colour, x, z, y + rings.length);
    else b.lowRoof(head.colour, x, z, y + rings.length);
    b.step(`${name}: lean four ${head.colour} triangles in on top, tips together.`);
  }
}

const tall = (colour: Colour): Head => ({ kind: "tall", colour });
const low = (colour: Colour): Head => ({ kind: "low", colour });

/** Add one short, true "why" sentence to the first step whose line starts with `start`. */
function why(p: Project, start: string, text: string): Project {
  const st = p.steps.find((x) => x.say.startsWith(start));
  if (!st) throw new Error(`${p.id}: no step starts "${start}"`);
  st.say += ` ${text}`;
  return p;
}

const grow = (n: number, c: Colour, h: number) => bloomRings("green", c, n, h);
const S = (name: string, x: number, z: number, h: number, c: Colour, n: number, head: Head): Stem => ({ name, x, z, h, ring: grow(n, c, h), head });
const layer = (y: number, first: boolean, n: number, c: Colour) =>
  first ? `Layer ${y + 1} of the bunch: ${n} ${c} squares go up as walls, shared where two stems touch.` : `${n} more ${c} squares to finish the layer.`;

/** Big squares laid flat on the table in a w × d grid (in big squares) from the cell (x, z): a floor, four a step. */
function floor(b: Builder, colour: Colour, x: number, z: number, w: number, d: number, say: string) {
  for (let j = 0; j < d; j++) for (let i = 0; i < w; i++) {
    bigFlat(b, colour, x + 2 * i, 0, z + 2 * j);
    if ((j * w + i) % 4 === 3 || (j === d - 1 && i === w - 1)) b.step(say);
  }
}

/** Squares lying flat on the table, on the cells given, six a step. */
function flats(b: Builder, colour: Colour | ((x: number, z: number) => Colour), cells: [number, number][], say: string) {
  cells.forEach(([x, z], i) => {
    b.lid("square", typeof colour === "string" ? colour : colour(x, z), x, 0, z);
    if (i % SIX === SIX - 1 || i === cells.length - 1) b.step(say);
  });
}

function kansasBouquet(): Project {
  const b = new Builder();
  bigPot(b, "orange", 0, 0, 2, "blue", ["Stand six big squares in a long ring, four squares across and two deep: the pot.", "Lay two big squares flat on top: the soil."]);
  bunch(b, [
    S("Blue false indigo", 0, 0, 3, "blue", 1, tall("blue")),
    S("Dotted blazing star", 1, 0, 5, "purple", 2, tall("purple")),
    S("Dotted blazing star", 2, 0, 6, "purple", 2, tall("purple")),
    S("Blue false indigo", 3, 0, 4, "blue", 2, tall("blue")),
    S("Black-eyed Susan", 0, 1, 2, "yellow", 1, low("purple")),
    S("Butterfly milkweed", 1, 1, 3, "orange", 1, low("orange")),
    S("Black-eyed Susan", 2, 1, 2, "yellow", 1, low("purple")),
    S("Butterfly milkweed", 3, 1, 3, "orange", 1, low("orange")),
  ], 2, layer);
  const p = b.build({ id: "flower-kansas-prairie-bouquet", title: "Kansas prairie bouquet", theme: "flowers", age: "d", stars: 2, done: "You built a Kansas prairie bouquet! Dotted blazing star, a Kansas native, has a taproot about 15 feet deep, so it survives drought." });
  why(p, "Lay two big squares", "The pot is four squares across, so a bunch of tall stems tied together doesn't tip.");
  why(p, "Black-eyed Susan: lean", "Black-eyed Susan has a dark brown centre; we use a purple one.");
  return p;
}

function kansasDozen(): Project {
  const b = new Builder();
  const rows: { name: string; rings: Colour[]; head: Head }[][] = [
    [
      { name: "Compass plant", rings: ["green", "green", "yellow"], head: tall("yellow") },
      { name: "Maximilian sunflower", rings: ["green", "green", "yellow"], head: low("yellow") },
      { name: "Goldenrod", rings: ["green", "yellow", "yellow"], head: tall("yellow") },
      { name: "Blue false indigo", rings: ["green", "blue", "blue"], head: tall("blue") },
    ],
    [
      { name: "Dotted blazing star", rings: ["green", "purple"], head: tall("purple") },
      { name: "Purple coneflower", rings: ["green", "purple"], head: low("red") },
      { name: "Butterfly milkweed", rings: ["green", "orange"], head: low("orange") },
      { name: "Black-eyed Susan", rings: ["green", "yellow"], head: low("purple") },
    ],
    [
      { name: "Sunflower", rings: ["yellow"], head: low("purple") },
      { name: "Indian blanket", rings: ["red"], head: low("yellow") },
      { name: "Prairie coneflower", rings: ["yellow"], head: tall("red") },
      { name: "Winecup", rings: ["purple"], head: low("purple") },
    ],
  ];
  rows.forEach((row, j) => row.forEach((f, i) => plant(b, 2 * i, 2 * j, f.rings, f.head, 0, f.name)));
  const p = b.build({ id: "flower-kansas-dozen-prairie", title: "A Kansas prairie with twelve flowers", theme: "flowers", age: "d", stars: 2, done: "You built a Kansas prairie of twelve flowers! Goldenrod gets blamed for hay fever, but insects carry its pollen, not the wind." });
  why(p, "Compass plant: stand", "Each flower is one square wide and at most about five squares tall, so none can tip over.");
  why(p, "Purple coneflower: lean", "Purple coneflowers are pink-purple with a brown cone; we use purple petals and a red cone.");
  why(p, "Indian blanket: stand", "Indian blanket is red and yellow with a brown middle; we use red and yellow.");
  return p;
}

/** A sunflower on a stem of four big squares (two squares across): a drum of yellow walls with a flat disc on top. */
function bigSunflower(b: Builder, x: number, z: number, disc: "big" | "small") {
  bigRing(b, "green", x, z, 0);
  b.step("Sunflower stem: stand four big squares in a ring. It is two squares across.");
  b.room("yellow", x, z, 2, 2, 2);
  b.chunk(SIX, ["Sunflower head: eight yellow squares in a ring on top of the stem.", "Sunflower head: the last two yellow squares."]);
  b.wallZ("square", "yellow", x + 1, 2, z);
  b.wallZ("square", "yellow", x + 1, 2, z + 1);
  b.step("Sunflower head: two more yellow squares across the middle, for the disc to rest on.");
  if (disc === "big") {
    bigFlat(b, "purple", x, 3, z);
    b.step("Sunflower head: a big purple square flat on top: the middle of the flower.");
  } else {
    for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) b.lid("square", "purple", x + i, 3, z + j);
    b.step("Sunflower head: four purple squares flat on top: the middle of the flower.");
  }
}

function kansasSunflowers(): Project {
  const b = new Builder();
  bigSunflower(b, 1, 0, "small");
  bigSunflower(b, 4, 0, "small");
  [0, 2, 4, 6].forEach((x, i) => plant(b, x, 3, ["green", "yellow"], low("purple"), 0, `Small sunflower ${i + 1}`));
  const p = b.build({ id: "flower-kansas-sunflower-field", title: "A Kansas sunflower field", theme: "flowers", age: "d", stars: 1, done: "You built a Kansas sunflower field! The sunflower is the state flower of Kansas." });
  why(p, "Sunflower stem", "The stem is two squares across, so the heavy head on top doesn't tip.");
  why(p, "Small sunflower 1: stand", "A sunflower's middle is brown; we use purple.");
  return p;
}

/** The garden's butterfly, lying flat: two big orange wings, a purple body and four small wings, from the cell (x, z). */
function monarch(b: Builder, x: number, z: number) {
  bigFlat(b, "orange", x, 0, z);
  bigFlat(b, "orange", x + 3, 0, z);
  b.step("The butterfly's top wings: two big orange squares flat on the table, with a gap between.");
  for (let k = 0; k < 4; k++) b.lid("square", "purple", x + 2, 0, z + k);
  b.step("The butterfly's body: four purple squares in a line in the gap.");
  for (const [i, j] of [[1, 2], [1, 3], [3, 2], [3, 3]]) b.lid("square", "orange", x + i, 0, z + j);
  b.step("The butterfly's lower wings: two orange squares on each side, under the big wings.");
  for (const [i, j] of [[0, 2], [4, 2]]) b.lid("square", "purple", x + i, 0, z + j);
  b.step("The wing edges: a purple square on each side, as a monarch's wings have dark edges.");
  b.on("tri-equilateral", "purple", [x + 2, -z], [x + 3, -z]);
  b.step("The butterfly's head: a purple triangle on the end of the body, pointing away.");
}

function chicagoPollinators(): Project {
  const b = new Builder();
  plant(b, 0, 0, ["green", "green", "purple"], tall("purple"), 0, "Prairie blazing star 1");
  plant(b, 2, 0, ["green", "green", "purple"], tall("purple"), 0, "Prairie blazing star 2");
  plant(b, 4, 0, ["green", "green", "purple"], tall("purple"), 0, "Purple prairie clover");
  plant(b, 1, 2, ["green", "purple"], low("purple"), 0, "Wild bergamot 1");
  plant(b, 3, 2, ["green", "purple"], low("purple"), 0, "Wild bergamot 2");
  monarch(b, 0, 4);
  const p = b.build({ id: "flower-chicago-pollinator-garden", title: "A Chicago pollinator garden", theme: "flowers", age: "d", stars: 1, done: "You built a Chicago pollinator garden! Monarchs stop at prairie blazing star to sip nectar on their way south." });
  why(p, "The butterfly's top wings", "The butterfly lies flat, so it can't tip, and the flowers beside it are one square wide and short enough to stand.");
  return p;
}


function chicagoBouquet(): Project {
  const b = new Builder();
  bigPot(b, "blue", 0, 0, 2, "orange", ["Stand six big squares in a long ring, four squares across and two deep: the pot.", "Lay two big squares flat on top: the soil."]);
  bunch(b, [
    S("Spiderwort", 0, 0, 4, "blue", 1, low("blue")),
    S("Prairie dock", 1, 0, 6, "yellow", 2, tall("yellow")),
    S("Prairie blazing star", 2, 0, 5, "purple", 2, tall("purple")),
    S("Rattlesnake master", 3, 0, 3, "green", 1, low("green")),
    S("Wild bergamot", 0, 1, 3, "purple", 1, low("purple")),
    S("Purple prairie clover", 1, 1, 4, "purple", 2, tall("purple")),
    S("Wild bergamot", 2, 1, 3, "purple", 1, low("purple")),
    S("Spiderwort", 3, 1, 2, "blue", 1, low("blue")),
  ], 2, layer);
  const p = b.build({ id: "flower-chicago-prairie-bouquet", title: "Chicago prairie bouquet", theme: "flowers", age: "d", stars: 2, done: "You built a Chicago prairie bouquet! Prairie dock has huge leaves and flower stalks up to 10 feet tall." });
  why(p, "Lay two big squares", "The tallest stem, the prairie dock, stands in the middle of the pot, with shorter stems tied on both sides to hold it up.");
  why(p, "Rattlesnake master: lean", "Rattlesnake master is whitish green; we use green.");
  return p;
}

function chicagoWoodland(): Project {
  const b = new Builder();
  floor(b, "green", 0, 0, 4, 2, "Big squares flat on the table: the woodland floor.");
  const tree = ["green", "green", "green"] as Colour[];
  plant(b, 0, 0, tree, tall("green"), 0, "Tree 1");
  plant(b, 7, 0, tree, tall("green"), 0, "Tree 2");
  plant(b, 2, 0, ["green", "red"], low("yellow"), 0, "Columbine 1");
  plant(b, 5, 0, ["green", "red"], low("yellow"), 0, "Columbine 2");
  [1, 3, 5, 7].forEach((x, i) => plant(b, x, 2, ["green", "blue"], low("blue"), 0, `Bluebell ${i + 1}`));
  [0, 2, 4, 6].forEach((x, i) => plant(b, x, 3, ["purple"], low("purple"), 0, `Violet ${i + 1}`));
  const p = b.build({ id: "flower-chicago-woodland-bluebells", title: "A Chicago woodland of bluebells and columbine", theme: "flowers", age: "d", stars: 2, done: "You built a woodland! Virginia bluebells open pink and turn blue, and their leaves fade by mid-summer." });
  why(p, "Tree 1: stand", "Each tree is one square wide and three tall, plus its top, well under six times as tall as wide, so it stands.");
  why(p, "Bluebell 1: stand", "Virginia bluebell buds are pink and the open bells are light blue; we use blue.");
  return p;
}

function chicagoWreath(): Project {
  const b = new Builder();
  const band: [number, number][] = [];
  for (let x = 0; x < 9; x++) for (let z = 0; z < 9; z++) if (x === 0 || x === 8 || z === 0 || z === 8) band.push([x, z]);
  flats(b, "green", band, "Squares flat on the table in a big ring, one square wide: the leaves.");
  const blooms: { at: [number, number]; name: string; ring: Colour; head: Head }[] = [
    { at: [0, 0], name: "Violet", ring: "purple", head: low("purple") },
    { at: [2, 0], name: "Columbine", ring: "red", head: low("yellow") },
    { at: [4, 0], name: "Bluebell", ring: "blue", head: tall("blue") },
    { at: [6, 0], name: "Columbine", ring: "red", head: low("yellow") },
    { at: [8, 0], name: "Violet", ring: "purple", head: low("purple") },
    { at: [8, 4], name: "Bluebell", ring: "blue", head: tall("blue") },
    { at: [8, 8], name: "Violet", ring: "purple", head: low("purple") },
    { at: [6, 8], name: "Columbine", ring: "red", head: low("yellow") },
    { at: [4, 8], name: "Bluebell", ring: "blue", head: tall("blue") },
    { at: [2, 8], name: "Columbine", ring: "red", head: low("yellow") },
    { at: [0, 8], name: "Violet", ring: "purple", head: low("purple") },
    { at: [0, 4], name: "Bluebell", ring: "blue", head: tall("blue") },
  ];
  blooms.forEach((f, i) => plant(b, f.at[0], f.at[1], [f.ring], f.head, 0, `${f.name} ${i + 1}`));
  bigFlat(b, "red", 2, 0, 9);
  bigFlat(b, "red", 5, 0, 9);
  b.step("The bow: two big red squares flat below the wreath, side by side with a gap.");
  b.lid("square", "purple", 4, 0, 9);
  b.lid("square", "purple", 4, 0, 10);
  b.step("The knot of the bow: two purple squares in the gap.");
  const p = b.build({ id: "flower-chicago-big-wreath", title: "A big Chicago wreath", theme: "flowers", age: "d", stars: 2, done: "You built a big wreath! The violet is the state flower of Illinois; schoolchildren voted for it in 1907." });
  why(p, "Violet 1: stand", "The leaves lie flat, so they can't tip, and every flower on the ring is only a square wide and two high.");
  why(p, "Bluebell 3: stand", "Bluebells open pink and turn blue; we use blue.");
  return p;
}

function carolinaBouquet(): Project {
  const b = new Builder();
  bigPot(b, "purple", 0, 0, 2, "orange", ["Stand six big squares in a long ring, four squares across and two deep: the pot.", "Lay two big squares flat on top: the soil."]);
  bunch(b, [
    S("Catawba rhododendron", 0, 0, 4, "purple", 1, low("purple")),
    S("Turk's cap lily", 1, 0, 5, "orange", 2, tall("orange")),
    S("Cardinal flower", 2, 0, 6, "red", 2, tall("red")),
    S("Flame azalea", 3, 0, 4, "orange", 1, low("orange")),
    S("Flame azalea", 0, 1, 3, "orange", 1, low("orange")),
    S("Catawba rhododendron", 1, 1, 3, "purple", 1, low("purple")),
    S("Cardinal flower", 2, 1, 4, "red", 2, tall("red")),
    S("Catawba rhododendron", 3, 1, 2, "purple", 1, low("purple")),
  ], 2, layer);
  const p = b.build({ id: "flower-carolina-mountain-bouquet", title: "A North Carolina mountain bouquet", theme: "flowers", age: "d", stars: 2, done: "You built a mountain bouquet! Flame azalea grows on Appalachian mountain slopes and attracts hummingbirds." });
  why(p, "Lay two big squares", "The pot is four squares across and the tall cardinal flower has shorter stems tied beside it, so the bunch doesn't tip.");
  why(p, "Catawba rhododendron: lean", "Catawba rhododendron flowers are lavender-pink; we use purple.");
  return p;
}

function carolinaBog(): Project {
  const b = new Builder();
  floor(b, "blue", 0, 0, 4, 2, "Big squares flat on the table: the shallow water of the bog.");
  [0, 2, 4].forEach((x, i) => plant(b, x, 0, ["green", "green", "green", "yellow"], null, 0, `Yellow pitcher plant ${i + 1}`));
  plant(b, 7, 0, ["green", "green", "green"], low("yellow"), 0, "Flytrap in flower");
  [1, 3, 5, 7].forEach((x, i) => plant(b, x, 2, ["green", "red"], low("green"), 0, `Venus flytrap ${i + 1}`));
  const p = b.build({ id: "flower-carolina-bog-garden", title: "A Carolina bog with flytraps and pitcher plants", theme: "flowers", age: "d", stars: 2, done: "You built a bog garden! Venus flytraps grow wild only near Wilmington, North Carolina, and a bit of South Carolina." });
  why(p, "Yellow pitcher plant 1: stand", "A pitcher plant is a tall trumpet that traps insects. Each is one square wide and four tall, so it stands.");
  why(p, "Flytrap in flower: lean", "Venus flytrap flowers are white; we use yellow.");
  return p;
}

function trio(): Project {
  const b = new Builder();
  bigSunflower(b, 0, 0, "big");
  [[3, 0], [3, 2], [5, 1]].forEach(([x, z], i) => plant(b, x, z, ["green", "purple"], low("purple"), 0, `Violet ${i + 1}`));
  const arm = (name: string, x: number, z: number): Stem => ({ name, x, z, h: 2, ring: (y) => (y === 0 ? "green" : "yellow"), head: low("yellow") });
  const centre: Stem = { name: "Dogwood centre", x: 8, z: 1, h: 2, ring: () => "green", head: low("green") };
  bunch(b, [arm("Dogwood petal left", 7, 1), arm("Dogwood petal back", 8, 0), centre, arm("Dogwood petal right", 9, 1), arm("Dogwood petal front", 8, 2)], 0, (y, first, n, c) =>
    first ? `Dogwood blossom, layer ${y + 1}: ${n} ${c} squares go up as walls in a plus shape, shared where two touch.` : `${n} more ${c} squares to finish the layer.`);
  const p = b.build({ id: "flower-carolina-state-flowers", title: "North Carolina dogwood and two more state flowers", theme: "flowers", age: "d", stars: 1, done: "You built three state flowers! The sunflower is Kansas's, the violet is Illinois's and the dogwood is North Carolina's." });
  why(p, "Sunflower stem", "The sunflower of Kansas stands on a stem two squares across, so its heavy head doesn't tip.");
  why(p, "Dogwood blossom, layer 1", "Dogwood flowers are white; we use yellow. The four white petals are really bracts, leaves that look like petals.");
  return p;
}

export const FLOWERS_5: Project[] = [kansasBouquet(), kansasDozen(), kansasSunflowers(), chicagoBouquet(), chicagoPollinators(), chicagoWoodland(), chicagoWreath(), carolinaBouquet(), carolinaBog(), trio()];
