/* Monster trucks (2.8), part 5: six big builds for 11–16. Kit: track-kit.ts; `truck` from trucks-1.ts.
   Local helpers (road, jump, crashBox, bigWall, pylon) could move into the kit. */
import type { Colour } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder } from "./helpers";
import { OPPOSITE, RIGHT, UP, crushCar, dominoes, fence, kicker, ramp, tower, tunnel, type At, type Dir } from "./track-kit";
import { truck } from "./trucks-1";

const at = (x: number, z: number, y = 0): At => ({ x, y, z });
const R3 = Math.sqrt(3); // one big square of ramp runs this far, and rises one square
const r6 = (v: number) => Math.round(v * 1e6) / 1e6;
const go = (p: At, d: Dir, along: number, across = 0): At => ({ x: p.x + UP[d][0] * along + RIGHT[d][0] * across, y: p.y, z: p.z + UP[d][1] * along + RIGHT[d][1] * across });
/** the 1 × 1 cell that starts at p and runs along d and across to the right: its low corner */
const cell = (p: At, d: Dir) => {
  const q = go(p, d, 1, 1);
  return { x: r6(Math.min(p.x, q.x)), z: r6(Math.min(p.z, q.z)) };
};
const mark = (b: Builder, from: number) => {
  for (let i = from; i < b.placed.length; i++) b.placed[i].role = "crash";
};
const car = (b: Builder, p: At, d: Dir, colour: Colour, say: string, solid = false) => {
  const c = cell(p, d);
  crushCar(b, colour, c.x, c.z, say, solid);
};

/** Two cars in the gap of a jump (gap 4), one in each lane, a row apart so no walls share a line: cars to leap over. */
function gapCars(b: Builder, from: At, d: Dir, rise: number, cols: [Colour, Colour], says: [string, string]) {
  car(b, go(from, d, R3 * rise + 2, 0), d, cols[0], says[0], true);
  car(b, go(from, d, R3 * rise + 3, 1), d, cols[1], says[1], true);
}

/** A flat road of squares on the table: `len` long, `lanes` wide, eight squares a step at most. */
function road(b: Builder, cols: Colour[], from: At, d: Dir, len: number, lanes: number, say: string) {
  const start = b.placed.length;
  let i = 0;
  for (let k = 0; k < len; k++)
    for (let l = 0; l < lanes; l++) {
      const c = cell(go(from, d, k, l), d);
      b.lid("square", cols[i++ % cols.length], c.x, from.y, c.z);
    }
  b.chunk(8, [say, "Carry on along the road, squares flat and edge to edge."]);
  b.deck(null, b.since(start), d, "lane");
}

interface JumpOpts {
  dir: Dir;
  rise?: number;
  land?: number;
  gap: number;
  kick: Colour;
  down: Colour;
  support: Colour;
  say: [string, string];
}
/** A two-lane jump of big squares from `from` (left corner): a kicker `rise` high, a gap, a landing ramp `land` high
    facing it. Returns the far end of the landing (left corner). */
function jump(b: Builder, from: At, o: JumpOpts): At {
  const rise = o.rise ?? 1;
  const land = o.land ?? rise;
  ramp(b, o.kick, from, o.dir, rise, { big: true, topTower: true, support: o.support, say: o.say[0] });
  const far = go(from, o.dir, R3 * rise + 2 + o.gap + R3 * land, 2);
  ramp(b, o.down, far, OPPOSITE[o.dir], land, { big: true, topTower: true, support: o.support, say: o.say[1] });
  return go(from, o.dir, R3 * (rise + land) + 2 + o.gap);
}

/** A building built to be flattened: rings of squares stacked, with a roof of flat squares (all role crash). */
function crashBox(b: Builder, cols: Colour[], x0: number, z0: number, w: number, d: number, h: number, roof: Colour, name: string) {
  const start = b.placed.length;
  for (let r = 0; r < h; r++) {
    const first = b.placed.length;
    b.room(cols[r % cols.length], x0, z0, w, d, r);
    mark(b, first);
    b.step(r === 0 ? `Stand ${2 * (w + d)} squares in a ring, ${w} by ${d}: ${name}. It is built to be smashed.` : `Another ring on top, just stacked: ${r + 1} high.`);
  }
  const first = b.placed.length;
  b.lids(roof, x0, z0, w, d, h);
  mark(b, first);
  b.step(`Lay ${w * d} ${roof} squares flat across the top: the roof.`);
  b.crash("wall", start);
}

/** A wall to smash of big squares, `n` wide and `levels` high, with a row of small squares on top and a return at each
    end of every row, turning back towards +z, so it stands as a U until it is hit (all role crash). */
function bigWall(b: Builder, cols: Colour[], x0: number, z: number, n: number, levels: number, topCol: Colour, say: (lvl: number) => string, topSay = `A row of ${2 * n} ${topCol} squares on the very top, with a small return at each end. Seven squares high, and ready to fall.`) {
  const turn = -Math.PI / 2;
  const start = b.placed.length;
  for (let l = 0; l < levels; l++) {
    for (let i = 0; i < n; i++) b.add("square-large", cols[(l + i) % cols.length], [x0 + 2 * i, 2 * l, z], [0, 0], "crash");
    for (const x of [x0, x0 + 2 * n]) b.add("square-large", cols[(l + n) % cols.length], [x, 2 * l, z], [0, turn], "crash");
    b.step(say(l));
  }
  for (let i = 0; i < 2 * n; i++) b.add("square", topCol, [x0 + i, 2 * levels, z], [0, 0], "crash");
  for (const x of [x0, x0 + 2 * n]) b.add("square", topCol, [x, 2 * levels, z], [0, turn], "crash");
  b.step(topSay);
  b.crash("wall", start);
}

/** Add one short "why" sentence to the nth step whose text contains `key`. */
function why(b: Builder, key: string, text: string, nth = 0) {
  const hits = b.steps.filter((s) => s.say.includes(key));
  if (!hits[nth]) throw new Error(`no step with "${key}"`);
  hits[nth].say += ` ${text}`;
}

/** A post `h` rings high with a pennant of four tall triangles leaning together on top. */
function pylon(b: Builder, cols: Colour[], x: number, z: number, h: number, tip: Colour, name: string) {
  tower(b, cols, x, z, 1, 1, h, null, (r) => (r === 0 ? `Stand four squares in a ring for ${name}.` : `Another ring on top: ${r + 1} high.`));
  b.roof(tip, x, z, h);
  b.step("Lean four tall triangles together on top, tips meeting: a pennant.");
}

/* ---------- 11 to 16 ---------- */

function worldFinals(): Project {
  const b = new Builder();
  fence(b, "purple", 0, -12, 16, 12, [7, 8]);
  tower(b, ["red", "orange", "yellow", "green", "blue", "purple", "red"], 1, -11, 2, 2, 7, "yellow", (r) => (r === 0 ? "In the back left corner, stand a ring of eight squares, two by two. The start tower." : `Another ring on top: ${r + 1} high.`), "E");
  tower(b, ["blue", "green", "yellow"], 4, -11, 2, 2, 3, "orange", (r) => (r === 0 ? "A square beyond the start tower, stand another ring of eight squares: the stair." : `Another ring on top: ${r + 1} high.`), "E");
  const mat = b.add("square-large", "green", [7, 0, -9], [-Math.PI / 2, 0]);
  b.step("A big green square flat on the table past the stair: the landing mat.");
  b.deck("mat", [mat], "E", "lane");
  jump(b, at(2, -6), { dir: "E", gap: 4, kick: "orange", down: "orange", support: "yellow", say: ["Lean a big orange square up onto its ring: the first kicker.", "Past a gap of four squares, lean a big orange square up onto its ring: the landing."] });
  gapCars(b, at(2, -6), "E", 1, ["red", "green"], ["a crush car in the gap", "another, a row further on"]);
  jump(b, at(14, -8), { dir: "S", gap: 1, kick: "green", down: "green", support: "purple", say: ["On the right, lean a big green square up onto its ring: a second kicker, pointing at you.", "Past a gap of one square, lean the green landing up onto its ring."] });
  bigWall(b, ["red", "yellow"], 4, -3, 2, 1, "blue", () => "Near the front wall, stand two big squares side by side, and one at each end turning back towards you: the bottom of a wall to smash.", "Four blue squares in a row on top, with a small return at each end. Smash it!");
  why(b, "Another ring on top: 7 high.", "A wide tower doesn't tip: two squares across for up to eight high.");
  why(b, "so the deck has walls to rest on", "The deck rests on two opposite walls, so it can't tip into the corner.");
  why(b, "Near the front wall", "The returns make corners, so the wall stands until it's hit.");
  b.route(["deck-1", { jump: "deck-2" }, "deck-2", { jump: "mat" }, { to: [8.5, 0, -7.5] }, { to: [1, 0, -7.5] }, { to: [1, 0, -4.7] }, { to: [1.7, 0, -4.7] }, "ramp-1", { jump: "ramp-2" }, { down: "ramp-2" }, { to: [12.1, 0, -4.8] }, { to: [14.8, 0, -4.8] }, { to: [14.8, 0, -9] }, { to: [13, 0, -9] }, { to: [13, 0, -8.2] }, "ramp-3", { jump: "ramp-4" }, { down: "ramp-4" }, { through: "wall-1" }]);
  return truck(b, { id: "truck-world-finals-freestyle", title: "World finals freestyle", age: "d", done: "The crowd roars! Down from seven squares up, over the cars, and through the wall. Freestyle champion!" });
}

function backflip(): Project {
  const b = new Builder();
  road(b, ["blue", "purple"], at(4, 0), "N", 3, 2, "Lay a run-up of six squares flat on the table, two lanes side by side, going away from you.");
  road(b, ["green", "yellow"], at(0, 0), "N", 3, 2, "To the left, lay a second run-up of six squares for the practice lane.");
  const p1 = at(0, -3);
  const p2 = at(4, -3);
  const sayDown = "Past a gap of four squares, lean the landing up onto its ring.";
  jump(b, p1, { dir: "N", gap: 4, kick: "orange", down: "orange", support: "yellow", say: ["Lean a big orange square up onto the ring: the practice kicker, one square high.", sayDown] });
  jump(b, p2, { dir: "N", rise: 2, land: 2, gap: 4, kick: "red", down: "red", support: "yellow", say: ["Now the backflip kicker: lean two big red squares up, end to end, to a ring two squares high. It looks steep!", "Past a gap of four squares, lean the landing ramp up, two big squares, onto its tower."] });
  gapCars(b, p2, "N", 2, ["blue", "green"], ["a crush car in the gap", "another, a row further on"]);
  road(b, ["green", "yellow"], go(p2, "N", R3 * 4 + 6), "N", 2, 2, "Beyond the landing, lay four squares flat: the run-out.");
  pylon(b, ["yellow", "orange", "red"], 2.5, -4, 1, "blue", "a judges' post between the two kickers");
  pylon(b, ["yellow", "orange", "red"], 2.5, -9, 1, "green", "a second judges' post");
  tower(b, ["red", "orange", "yellow"], 8, -8, 2, 1, 1, "blue", () => "To the right, stand a ring of six squares, two by one. The first step of the stands.");
  tower(b, ["orange", "yellow", "green"], 11, -8, 2, 1, 2, "blue");
  tower(b, ["yellow", "green", "purple"], 14, -8, 2, 1, 3, "blue");
  why(b, "The first step of the stands", "A deck rests on two opposite walls, so it can't tip into the corner.");
  why(b, "a pennant", "Triangles don't fold: four leaning together lock each other.");
  b.route(["lane-1", "ramp-3", { jump: "ramp-4" }, { down: "ramp-4" }, "lane-3"]);
  return truck(b, { id: "truck-backflip-ramp", title: "Backflip ramp", age: "d", done: "Up the steep kicker, flip in the air, and land the long ramp! Nailed the backflip." });
}

function crashZone(): Project {
  const b = new Builder();
  road(b, ["blue", "purple"], at(7, 0), "N", 2, 2, "Down the middle of the city, lay a road of four squares flat, going away from you.");
  const j = at(7, -2);
  jump(b, j, { dir: "N", gap: 4, kick: "orange", down: "red", support: "yellow", say: ["Lean a big orange square up onto its ring: the kicker, with the whole city ahead.", "Past a gap of four squares, lean the red landing up onto its ring."] });
  gapCars(b, j, "N", 1, ["red", "green"], ["a crush car parked in the street", "another, a row further on. Jump them!"]);
  crashBox(b, ["red", "yellow", "blue"], 0, -5, 2, 2, 3, "green", "a bank");
  crashBox(b, ["orange", "green", "purple"], 4, -5, 2, 1, 4, "yellow", "a tall shop");
  crashBox(b, ["blue", "red", "yellow"], 10, -5, 2, 2, 3, "orange", "a town hall");
  crashBox(b, ["green", "purple", "orange"], 15, -8, 1, 2, 3, "red", "a corner tower");
  // a warehouse of big squares: four walls and a roof, two squares high
  const [wx, wz] = [1, -12];
  const first = b.placed.length;
  b.wallX("square-large", "purple", wx, 0, wz + 2);
  b.wallZ("square-large", "purple", wx + 2, 0, wz);
  b.wallX("square-large", "purple", wx, 0, wz);
  b.wallZ("square-large", "purple", wx, 0, wz);
  mark(b, first);
  b.step("In the back corner, stand four big squares in a ring: a warehouse, two squares high.");
  b.add("square-large", "blue", [wx, 2, wz + 2], [-Math.PI / 2, 0], "crash");
  b.step("A big square flat on top: the warehouse roof. Ready to crash.");
  b.crash("wall", first);
  dominoes(b, ["red", "yellow", "green", "blue"], at(5.5, -13), "E", 4, "Across the end of the street, stand four squares up one by one, two squares apart: dominoes.");
  kicker(b, "green", at(11, -2), "E", { support: "blue", lanes: 2, say: "On the right, lean a two-lane kicker up onto its ring: a ramp to jump the parked car." });
  crushCar(b, "purple", 14.5, -2, "a crush car beyond the kicker");
  pylon(b, ["yellow", "orange"], 13, -12, 1, "red", "a street-corner post");
  why(b, "a bank", "Walls joined in a ring hold each other square, so a building stands until it's hit.");
  b.route(["lane-1", "ramp-1", { jump: "ramp-2" }, { down: "ramp-2" }, { to: [12.5, 0, -12.5] }, { through: "dominoes-1" }, { through: "wall-5" }, { to: [1, 0, -7.5] }, { through: "wall-1" }, { to: [3, 0, -4.5] }, { through: "wall-2" }, { to: [6.3, 0, -1] }, { to: [10.5, 0, -1] }, { through: "wall-3" }, { through: "wall-4" }, { to: [16.7, 0, 1] }, { to: [10, 0, 1] }, { to: [10, 0, -1.5] }, { to: [10.7, 0, -1.5] }, "kicker-1", { jump: "car-1" }, { through: "car-1" }]);
  return truck(b, { id: "truck-crash-zone-city", title: "Crash-zone city", age: "d", done: "Welcome to the Crash Zone! Jump the cars, flatten the shops, and topple the dominoes." });
}

function doubleDecker(): Project {
  const b = new Builder();
  road(b, ["green", "yellow"], at(8, 0), "N", 6, 2, "Lay the lower lane flat: six rows of two squares, going away from you.");
  tunnel(b, "red", "blue", at(8, -6), "N", 1, "E");
  road(b, ["green", "yellow"], at(8, -8), "N", 6, 2, "Beyond the tunnel, lay the lower lane on: six more rows of two squares.");
  const w = at(8 - 2 * R3, -8);
  road(b, ["blue", "purple"], go(w, "E", -4), "E", 4, 2, "On the left, lay eight squares flat to run up to the deck ramp.");
  ramp(b, "orange", w, "E", 2, { big: true, say: "Lean two big orange squares up, end to end, from the table onto the top of the tunnel: the ramp up to the deck." });
  ramp(b, "orange", at(10 + 2 * R3, -6), "W", 2, { big: true, say: "On the right, lean two big squares down the other way, from the tunnel roof to the table: the ramp down." });
  road(b, ["blue", "purple"], at(10 + 2 * R3, -8), "E", 4, 2, "On the right, lay eight squares flat to run out.");
  tower(b, ["red", "orange", "yellow"], 0, -13, 2, 1, 1, "blue", () => "Stand a ring of six squares, two by one, in the back left corner. The first step of the stands.");
  tower(b, ["orange", "yellow", "green"], 3, -13, 2, 1, 2, "blue");
  tower(b, ["yellow", "green", "purple"], 6, -13, 2, 1, 3, "blue");
  for (const [i, [x, z]] of ([[3, -3], [3, -9], [13, -3], [13, -13]] as [number, number][]).entries()) pylon(b, ["red", "yellow"], x, z, 1, i < 2 ? "blue" : "green", `corner post ${i + 1}`);
  why(b, "A tunnel!", "The deck rests on two opposite walls, so it can't tip into the corner.");
  why(b, "a pennant", "Triangles don't fold: four leaning together lock each other.");
  b.route(["lane-3", "ramp-1", "deck-1", { down: "ramp-2" }, "lane-4", { to: [18.5, 0, -7] }, { to: [18.5, 0, 1.5] }, { to: [9, 0, 1.5] }, { to: [9, 0, 0.3] }, "lane-1", "tunnel-1", "lane-2"]);
  return truck(b, { id: "truck-double-decker-race", title: "Double-decker race", age: "d", done: "Two levels of racing! Trucks on the deck, trucks underneath, and a roar at the crossing." });
}

function tripleAir(): Project {
  const b = new Builder();
  tower(b, ["red", "orange", "yellow", "green", "blue", "purple", "red"], 0, -8, 2, 2, 7, "yellow", (r) => (r === 0 ? "At the back, stand a ring of eight squares, two by two. The high start tower." : `Another ring on top: ${r + 1} high.`), "S");
  tower(b, ["blue", "green", "yellow", "orange"], 0, -5, 2, 2, 4, "purple", (r) => (r === 0 ? "A square in front of it, stand another ring of eight squares: the stair." : `Another ring on top: ${r + 1} high.`), "S");
  const mat = b.add("square-large", "green", [0, 0, 0], [-Math.PI / 2, 0]);
  b.step("A big green square flat on the table, one square past the stair: the landing mat.");
  b.deck(null, [mat], "E", "lane");
  const say = (n: number): [string, string] => [`Along the front, lean a big square up onto its ring: kicker number ${n}.`, `Past a gap of one square, lean its landing up onto its ring.`];
  let p = at(2, -2);
  const kicks: [Colour, Colour][] = [["orange", "orange"], ["purple", "purple"], ["green", "green"]];
  kicks.forEach(([k, d], n) => {
    p = jump(b, p, { dir: "E", gap: 1, kick: k, down: d, support: n === 1 ? "red" : "yellow", say: say(n + 1) });
  });
  road(b, ["blue", "yellow"], p, "E", 2, 2, "After the last landing, lay four squares flat for the run-out.");
  car(b, go(p, "E", 3, 0), "E", "red", "a crush car to finish");
  car(b, go(p, "E", 4, 1), "E", "blue", "a second, further on");
  why(b, "Another ring on top: 7 high.", "A wide tower doesn't tip: two squares across for up to eight high.");
  why(b, "so the deck has walls to rest on", "The deck rests on two opposite walls, so it can't tip into the corner.");
  b.route(["deck-1", { jump: "deck-2" }, "deck-2", { jump: "lane-1" }, { to: [1.7, 0, -1] }, "ramp-1", { jump: "ramp-2" }, { down: "ramp-2" }, "ramp-3", { jump: "ramp-4" }, { down: "ramp-4" }, "ramp-5", { jump: "ramp-6" }, { down: "ramp-6" }, "lane-2", { through: "car-1" }, { through: "car-2" }]);
  return truck(b, { id: "truck-triple-big-air", title: "Triple big air", age: "d", done: "Off the high tower, down the stair, then fly, fly, fly! Three jumps in a row." });
}

function wallOfDoom(): Project {
  const b = new Builder();
  fence(b, "green", 0, -16, 10, 17, [4, 5]);
  road(b, ["blue", "purple"], at(4, 0), "N", 3, 2, "Through the gate, lay a run-up of six squares flat, two lanes side by side.");
  ramp(b, "orange", at(4, -3), "N", 3, { big: true, topTower: true, support: "yellow", say: "Lean three big orange squares up, end to end, onto the towers. The run-up ramp launches the truck at the wall." });
  bigWall(b, ["red", "yellow", "blue"], 3, -12, 2, 3, "green", (l) => (l === 0 ? "Past the ramp, stand two big squares side by side across the way, and one at each end turning back towards the ramp: the base of the wall of doom." : `The same again on top of those: ${2 * (l + 1)} squares high.`));
  why(b, "the base of the wall of doom", "The returns make corners, so the wall stands until it's hit.");
  road(b, ["green", "yellow"], at(4, -12), "N", 2, 2, "Behind the wall, lay four squares flat. Where the trucks land.");
  car(b, at(2, -14), "N", "red", "a crush car on the left behind the wall");
  car(b, at(7, -14), "N", "purple", "and one on the right");
  dominoes(b, ["red", "yellow", "blue"], at(4.5, -14.5), "E", 3, "Across the road at the very back, stand three squares up, two apart: the last thing to fall.");
  b.route(["lane-1", "ramp-1", { jump: "wall-1" }, { through: "wall-1" }, "lane-2", { through: "car-1" }, { through: "dominoes-1" }, { through: "car-2" }]);
  return truck(b, { id: "truck-wall-of-doom", title: "Wall of doom", age: "d", done: "Up the ramp, through the wall of doom, all seven squares of it. Smash!" });
}

export const TRUCKS_5: Project[] = [worldFinals(), backflip(), crashZone(), doubleDecker(), tripleAir(), wallOfDoom()];
