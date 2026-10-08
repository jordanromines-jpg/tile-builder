/* 2.2: towers, bridges, patterns and gardens, 50 to 175 tiles, written as plans for the layout kit (projects/kit.ts).
   The biggest here use almost every square and triangle in two 100-piece sets. */
import type { Colour } from "../../engine/catalog";
import type { Project } from "../../engine/types";
import { Site } from "../kit";

/** Pyramids on the cells of a w × d roof that are not under the smaller block on top of it (x0..x0+iw, z0..z0+id). */
/** Add one short, true "why" sentence to the first step whose line starts with `start` (ages 9 and up only). */
function why(p: Project, start: string, text: string): Project {
  const st = p.steps.find((x) => x.say.startsWith(start));
  if (!st) throw new Error(`${p.id}: no step starts "${start}"`);
  st.say += ` ${text}`;
  return p;
}

function ring(s: Site, name: string, w: number, d: number, y: number, inner: [number, number, number, number], kind: "tall" | "low" | "mix", c: Colour) {
  const [ix, iz, iw, id] = inner;
  const cells: [number, number][] = [];
  for (let x = 0; x < w; x++) for (let z = 0; z < d; z++) if (!(x >= ix && x < ix + iw && z >= iz && z < iz + id)) cells.push([x, z]);
  s.roofs(name, cells, y, kind, c);
}

function longWayBridge(): Project {
  const s = new Site();
  for (const [x, z, n] of [[0, 0, "the start tower"], [2, 0, "the corner tower"], [2, 2, "the end tower"]] as const) s.tower(n, x, z, 5, ["purple", "blue"], { cap: "lid", capColour: "yellow" });
  s.deck("the first bridge", "x", 1, 2, 0, 5, "green");
  s.deck("the second bridge", "z", 1, 2, 2, 5, "green");
  return s.build({ id: "long-way-bridge", title: "The Bridge That Goes the Long Way Round", theme: "bridges", age: "d", done: "You built the Bridge That Goes the Long Way Round! It's slower. But the view is lovely." });
}

function tripleTrouble(): Project {
  const s = new Site();
  const xs = [0, 2, 4, 6];
  xs.forEach((x, i) => s.tower(`pier number ${i + 1}`, x, 0, 3, ["red", "orange"], { cap: "tall", capColour: "yellow" }));
  s.deck("the first span", "x", 1, 2, 0, 3, "blue");
  s.deck("the second span", "x", 3, 4, 0, 3, "blue");
  s.deck("the third span", "x", 5, 6, 0, 3, "blue");
  s.plaza("the river", 0, 2, 7, 1, "blue");
  return s.build({ id: "triple-trouble-bridge", title: "The Triple Bridge of Triple Trouble", theme: "bridges", age: "d", done: "You built the Triple Bridge of Triple Trouble! Three spans, three trolls, three times the trouble." });
}

function lateClock(): Project {
  const s = new Site();
  const base = s.block("the clock shop", 0, 0, 4, 3, 1, ["blue"], { door: true, roof: "yellow" });
  const t = s.tower("the clock tower", 1, 0, 6, ["purple", "blue"], { base: base.top, size: 2, cap: "lid", capColour: "yellow" });
  s.roofs("the clock's pointy hat", [[1, 0]], t.top, "tall", "red");
  s.roofs("the clock's other hat", [[2, 1]], t.top, "low", "red");
  s.roofs("the shop roofs", [[0, 2], [3, 2]], base.top, "low", "green");
  return s.build({ id: "always-late-clock", title: "The Clock Tower That Is Always Late", theme: "bridges", age: "d", done: "You built the Clock Tower That Is Always Late! What time is it? About ten minutes ago." });
}

function toastTowers(): Project {
  const s = new Site();
  const toaster = s.block("the toaster", 0, 0, 3, 2, 2, ["red", "orange"], { roof: "blue" });
  s.tower("the white toast tower", 0, 0, 3, ["yellow", "orange"], { base: toaster.top, cap: "tall", capColour: "orange" });
  s.tower("the brown toast tower", 2, 0, 3, ["orange", "yellow"], { base: toaster.top, cap: "tall", capColour: "orange" });
  s.deck("the butter bridge", "x", 1, 2, 0, 5, "yellow");
  s.plaza("the jam river", 0, 2, 3, 2, "red");
  return why(s.build({ id: "toast-towers", title: "The Twin Towers of Toast", theme: "bridges", age: "c", done: "You built the Twin Towers of Toast! Butter side up, always." }), "The toaster", "A wide base doesn't tip: a toaster two squares deep holds both towers steady.");
}

function zipLine(): Project {
  const s = new Site();
  const hi = s.block("the top station", 0, 0, 2, 2, 5, ["red", "orange"], { roof: "yellow" });
  s.roofs("the top station", [[0, 0]], hi.top, "tall", "blue");
  s.tower("the bottom station", 6, 0, 2, ["green"], { size: 2, cap: "lid", capColour: "yellow" });
  s.plaza("the field below", 2, 0, 4, 2, "green");
  return s.build({ id: "zip-line-station", title: "The Zip-Line Station", theme: "bridges", age: "d", done: "You built the Zip-Line Station! WHEEEEE. Mind the tree." });
}

function appleAqueduct(): Project {
  const s = new Site();
  const xs = [0, 2, 4, 6, 8];
  xs.forEach((x, i) => s.tower(`arch leg ${i + 1}`, x, 0, 3, ["green", "yellow"], { cap: "none" }));
  s.platform("the channel", 0, 0, 9, 1, 3, "blue");
  return s.build({ id: "apple-aqueduct", title: "The Aqueduct of Apple Juice", theme: "bridges", age: "d", done: "You built the Aqueduct of Apple Juice! Sticky, but delicious." });
}

function lemonadeTower(): Project {
  const s = new Site();
  for (const [x, z] of [[0, 0], [2, 0], [0, 2], [2, 2], [1, 1]] as const) s.tower("a leg", x, z, 2, ["blue", "blue"], { cap: "none" });
  const p = s.platform("the platform", 0, 0, 3, 3, 2, "yellow");
  const tank = s.block("the lemonade tank", 0, 0, 3, 3, 2, ["yellow", "orange"], { base: p.top, roof: "yellow" });
  s.roofs("the lid", [[1, 1]], tank.top, "tall", "green");
  s.roofs("the lemon slices", [[0, 0], [2, 2]], tank.top, "low", "yellow");
  return s.build({ id: "warm-lemonade-tower", title: "The Water Tower of Warm Lemonade", theme: "bridges", age: "d", done: "You built the Water Tower of Warm Lemonade! Turn on any tap: warm lemonade. Hmm." });
}

function tallestTower(): Project {
  const s = new Site();
  const t = s.tower("the tallest tower nobody asked for", 0, 0, 9, ["red", "orange", "yellow", "green", "blue", "purple"], { size: 2, cap: "lid", capColour: "yellow" });
  s.roofs("the very top", [[0, 0]], t.top, "tall", "red");
  return s.build({ id: "tallest-tower", title: "The Tallest Tower Nobody Asked For", theme: "bridges", age: "d", done: "You built the Tallest Tower Nobody Asked For! Grown-up, please hold it. Please." });
}

function hamsterRopeBridge(): Project {
  const s = new Site();
  const den = s.block("the hamster den", 0, 0, 3, 2, 2, ["purple", "blue"], { roof: "green" });
  s.tower("the left hamster tower", 0, 0, 5, ["orange", "yellow"], { base: den.top, cap: "lid", capColour: "orange" });
  s.tower("the right hamster tower", 2, 0, 5, ["orange", "yellow"], { base: den.top, cap: "lid", capColour: "orange" });
  s.deck("the rope bridge", "x", 1, 2, 0, 7, "green");
  s.plaza("the hamster ball pit", 0, 2, 3, 2, "purple");
  return why(s.build({ id: "hamster-rope-bridge", title: "The Rope Bridge of Raging Hamsters", theme: "bridges", age: "d", done: "You built the Rope Bridge! The hamsters are racing across. They are VERY angry. Nobody knows why." }), "The hamster den", "A wide base doesn't tip: the den is two squares deep and ties both towers into one wide shape.");
}

function zebraZiggurat(): Project {
  const s = new Site();
  const a = s.block("the bottom step", 0, 0, 4, 4, 1, ["purple"], { roof: "yellow" });
  const b = s.block("the second step", 0, 0, 3, 3, 1, ["purple"], { base: a.top, roof: "yellow" });
  const c = s.block("the third step", 0, 0, 2, 2, 1, ["purple"], { base: b.top, roof: "yellow" });
  const t = s.tower("the top step", 0, 0, 1, ["purple"], { base: c.top, cap: "tall", capColour: "red" });
  ring(s, "the bottom terrace", 4, 4, a.top, [0, 0, 3, 3], "low", "green");
  ring(s, "the middle terrace", 3, 3, b.top, [0, 0, 2, 2], "tall", "blue");
  ring(s, "the top terrace", 2, 2, c.top, [0, 0, 1, 1], "low", "orange");
  void t;
  return s.build({ id: "zebra-ziggurat", title: "The Rainbow Ziggurat of Zebras", theme: "patterns", age: "d", done: "You built the Rainbow Ziggurat of Zebras! Stripes on every step. The zebras feel at home." });
}

function maze(): Project {
  const s = new Site();
  s.wall("the outer wall, front", "x", 0, 6, 6, 2, "blue");
  s.wall("the outer wall, back", "x", 0, 6, 0, 2, "blue");
  s.wall("the outer wall, left", "z", 0, 5, 0, 2, "blue");
  s.wall("the outer wall, right", "z", 1, 6, 6, 2, "blue");
  s.wall("a tricky wall", "x", 0, 4, 2, 2, "red");
  s.wall("another tricky wall", "x", 2, 6, 4, 2, "green");
  s.wall("a sneaky wall", "z", 2, 4, 2, 1, "yellow");
  s.tent("the prize in the middle", 4, 2, "low", "purple");
  return s.build({ id: "mild-confusion-maze", title: "The Maze of Mild Confusion", theme: "patterns", age: "c", done: "You built the Maze of Mild Confusion! Can a marble find its way to the prize?" });
}

function pyramidParty(): Project {
  const s = new Site();
  s.plaza("the dance floor", 0, 0, 6, 3, "purple");
  const cols: Colour[] = ["red", "orange", "yellow", "green", "blue", "purple"];
  for (let x = 0; x < 6; x++) for (const z of [0, 2]) s.tent(`a party pyramid`, x, z, (x + z) % 4 === 0 ? "tall" : "low", cols[x], 0);
  return s.build({ id: "pyramid-party", title: "The Pyramid Party", theme: "patterns", age: "d", done: "You built the Pyramid Party! Twelve pyramids, all doing the conga." });
}

function sillySpiral(): Project {
  const s = new Site();
  const spots: [number, number][] = [[0, 0], [2, 0], [4, 0], [4, 2], [4, 4], [2, 4], [0, 4], [0, 2]];
  spots.forEach(([x, z], i) => s.tower(`step ${i + 1}`, x, z, Math.ceil((i + 1) / 2), ["red", "orange", "yellow", "green"], { cap: i === 7 ? "low" : "lid", capColour: "blue" }));
  return s.build({ id: "silly-spiral", title: "The Spiral of Silly Steps", theme: "patterns", age: "d", done: "You built the Spiral of Silly Steps! Each step is a little bit taller. Walk round and round." });
}

function wigglyWall(): Project {
  const s = new Site();
  const xs = [0, 4, 8];
  xs.forEach((x, i) => s.tower(`watchtower ${i + 1}`, x, 0, 3, ["red", "orange"], { cap: "tall", capColour: "yellow" }));
  s.wall("the first stretch", "x", 1, 4, 1, 2, "green");
  s.wall("the second stretch", "x", 5, 8, 1, 2, "purple");
  return s.build({ id: "wiggly-wall", title: "The Great Wall of Wiggly Colours", theme: "patterns", age: "d", done: "You built the Great Wall of Wiggly Colours! Visible from space. Well, from the sofa." });
}

function triangleTown(): Project {
  const s = new Site();
  const homes = [[0, 0, "red"], [3, 0, "blue"], [6, 0, "green"], [0, 3, "yellow"], [3, 3, "purple"], [6, 3, "orange"]] as const;
  homes.forEach(([x, z, c], i) => {
    const h = s.block(`triangle house ${i + 1}`, x, z, 2, 2, 1, [c], { roof: c });
    s.roofs(`triangle house ${i + 1}`, [[x + (i % 2), z + 1]], h.top, i % 3 === 0 ? "tall" : "low", "yellow");
  });
  return s.build({ id: "triangle-town", title: "Triangle Town", theme: "patterns", age: "d", done: "You built Triangle Town! Population: six families, all very pointy." });
}

function dominoCity(): Project {
  const s = new Site();
  for (let i = 0; i < 5; i++) {
    const d = s.block(`domino ${i + 1}`, i * 2, 0, 1, 2, 2 + (i % 2), [i % 2 ? "purple" : "yellow"], { roof: i % 2 ? "yellow" : "purple" });
    s.roofs(`domino ${i + 1}`, [[i * 2, 0]], d.top, "low", "red");
  }
  return s.build({ id: "domino-city", title: "Domino City", theme: "patterns", age: "d", done: "You built Domino City! Don't push the first one. Seriously. Don't." });
}

function mushroomVillage(): Project {
  const s = new Site();
  const spots = [[0, 0, 2], [3, 0, 3], [6, 0, 2], [1, 3, 3], [4, 3, 2], [7, 3, 3]] as const;
  spots.forEach(([x, z, h], i) => s.tower(`mushroom ${i + 1}`, x, z, h, ["yellow"], { cap: "low", capColour: i % 2 ? "red" : "orange" }));
  s.plaza("the forest floor", 0, 2, 8, 1, "green");
  return s.build({ id: "mushroom-village", title: "Mushroom Village", theme: "gardens", age: "d", done: "You built Mushroom Village! The gnomes are moving in tomorrow." });
}

function sunflowerTower(): Project {
  const s = new Site();
  const root = s.tower("the thick sunflower stem", 1, 1, 3, ["green", "green"], { size: 2, cap: "none" });
  const t = s.tower("the thin sunflower stem", 1, 1, 3, ["green", "green"], { base: root.top, cap: "lid", capColour: "yellow" });
  s.plaza("the flower bed", 0, 0, 3, 3, "orange");
  s.roofs("the flower", [[1, 1]], t.top, "tall", "yellow");
  for (const [x, z] of [[0, 0], [2, 0], [0, 2]] as const) s.tent("a seedling", x, z, "low", "green", 0);
  s.tent("a seedling on the ledge", 2, 2, "low", "green", root.top);
  return why(s.build({ id: "sunflower-watch-tower", title: "The Sunflower Watch Tower", theme: "gardens", age: "c", done: "You built the Sunflower Watch Tower! It always turns to face the sun. And the snacks." }), "The thick sunflower stem", "A wide base doesn't tip: the stem is two squares across at the bottom and one at the top.");
}

function secretShed(): Project {
  const s = new Site();
  const shed = s.block("the garden shed", 0, 0, 3, 2, 3, ["green", "orange"], { door: true, roof: "orange" });
  s.roofs("the shed roof", [[0, 0], [2, 1]], shed.top, "tall", "red");
  s.plaza("the vegetable patch", 0, 3, 3, 2, "green");
  s.tower("the scarecrow", 4, 3, 3, ["yellow"], { cap: "low", capColour: "orange" });
  return s.build({ id: "secret-shed", title: "The Garden Shed of Secrets", theme: "gardens", age: "d", done: "You built the Garden Shed of Secrets! Inside: a lawnmower, a spade, and a rocket. Shh." });
}

function everythingTower(): Project {
  const s = new Site();
  const base = s.block("the everything base", 0, 0, 5, 4, 2, ["blue", "purple"], { door: true, roof: "yellow" });
  const t = s.tower("the everything tower", 1, 1, 2, ["red", "orange"], { base: base.top, size: 2, cap: "lid", capColour: "green" });
  s.roofs("the very top", [[1, 1]], t.top, "tall", "purple");
  ring(s, "the everything terrace", 5, 4, base.top, [1, 1, 2, 2], "mix", "green");
  return s.build({ id: "everything-tower", title: "The Tower of Absolutely Everything", theme: "bridges", age: "d", done: "You built the Tower of Absolutely Everything! It uses nearly every tile you own. Count them!" });
}

function compostCastle(): Project {
  const s = new Site();
  const c = s.block("the compost castle", 0, 0, 4, 4, 2, ["orange", "green"], { roof: "orange" });
  ring(s, "the stinky battlements", 4, 4, c.top, [1, 1, 2, 2], "mix", "green");
  s.tower("the worm tower", 1, 1, 3, ["green", "orange"], { base: c.top, size: 2, cap: "lid", capColour: "yellow" });
  return s.build({ id: "compost-castle", title: "The Compost Heap Castle", theme: "gardens", age: "d", done: "You built the Compost Heap Castle! It smells amazing. If you're a worm." });
}

export const MORE_TOWERS: Project[] = [
  longWayBridge(),
  tripleTrouble(),
  lateClock(),
  toastTowers(),
  zipLine(),
  appleAqueduct(),
  lemonadeTower(),
  tallestTower(),
  hamsterRopeBridge(),
  zebraZiggurat(),
  maze(),
  pyramidParty(),
  sillySpiral(),
  wigglyWall(),
  triangleTown(),
  dominoCity(),
  mushroomVillage(),
  sunflowerTower(),
  secretShed(),
  everythingTower(),
  compostCastle(),
];
