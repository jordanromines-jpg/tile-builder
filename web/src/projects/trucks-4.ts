/* Monster trucks (2.8), part 4: nine builds for 9–10, from two or three Magna-Tiles 100 sets. Kit: track-kit.ts; `truck`
   from trucks-1.ts. Local pieces that could move into the kit: bigFlats, road, ring, cone, bus, bowlSide.
   Directions: N away from the child (−z), S towards them (+z), E right, W left. */
import type { Colour } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder } from "./helpers";
import { crushCar, dominoes, OPPOSITE, ramp, RIGHT, tunnel, UP, type At, type Dir } from "./track-kit";
import { truck } from "./trucks-1";

const Q = Math.PI / 2;
const BR = 2 * Math.cos(Math.PI / 6); // one big ramp square runs this far
const at = (x: number, z: number): At => ({ x, y: 0, z });

type Cell = [number, number];
const cells = (x0: number, z0: number, w: number, d: number): Cell[] => {
  const out: Cell[] = [];
  for (let z = z0; z < z0 + d; z++) for (let x = x0; x < x0 + w; x++) out.push([x, z]);
  return out;
};
const alt = (a: Colour, c: Colour) => (x: number, z: number) => ((x + z) & 1 ? a : c);

/** Big squares flat on the table, left corner at each spot (they may share a step: a step of big squares is one group). */
function bigFlats(b: Builder, colour: Colour, spots: Cell[], say: string, dir: Dir = "N", merge = false) {
  const from = b.placed.length;
  for (const [x, z] of spots) b.add("square-large", colour, [x, 0, z + 2], [-Q, 0]);
  b.step(say);
  // each is a lane for the course, or all together one wide pad
  if (merge) b.deck(null, b.since(from), dir, "lane");
  else for (const t of b.since(from)) b.deck(null, [t], dir, "lane");
}

/** A road of single squares flat on the table (cells are the left-back corner of each), six to a step. */
function road(b: Builder, cs: Cell[], colour: (x: number, z: number) => Colour, says: string[], dir?: Dir): number {
  const from = b.placed.length;
  for (const [x, z] of cs) b.lid("square", colour(x, z), x, 0, z);
  b.chunk(6, says);
  if (dir) b.deck(null, b.since(from), dir, "lane");
  return from;
}

/** A straight run of `n` squares of a road laid from tile `from`, as a lane of the course. */
function run(b: Builder, from: number, n: number, dir: Dir, name: string) {
  b.deck(name, Array.from({ length: n }, (_, i) => from + i), dir, "lane");
}

/** A ring of squares standing round the w × d cell at (x0, z0), at any corner (the loops are counted, not compared). */
function ring(b: Builder, colour: Colour, x0: number, z0: number, w: number, d: number, y: number, say: string) {
  for (let i = 0; i < w; i++) b.wallX("square", colour, x0 + i, y, z0 + d);
  for (let i = d - 1; i >= 0; i--) b.wallZ("square", colour, x0 + w, y, z0 + i);
  for (let i = w - 1; i >= 0; i--) b.wallX("square", colour, x0 + i, y, z0);
  for (let i = 0; i < d; i++) b.wallZ("square", colour, x0, y, z0 + i);
  b.step(say);
}

/** A cone: a pyramid of four tall triangles on the table, over the cell at (cx, cz); one step each. */
function cones(b: Builder, colours: Colour[], spots: Cell[], first: string) {
  spots.forEach(([cx, cz], i) => {
    b.roof(colours[i % colours.length], cx, cz, 0);
    b.step(i === 0 ? first : "Another cone, the same way: four tall triangles, tips together.");
  });
}

const crash = (b: Builder, from: number) => {
  for (let i = from; i < b.placed.length; i++) b.placed[i].role = "crash";
};

/** A bus: a long crush car lying across the way, a ring of twelve squares four by two with two big squares for a roof
    (role crash). */
function bus(b: Builder, colour: Colour, x: number, z: number, name: string, solid = false) {
  const start = b.placed.length;
  let first = start;
  b.room(colour, x, z, 4, 2, 0);
  if (!solid) crash(b, first);
  b.step(`For ${name}, stand twelve ${colour} squares in a ring, four long and two deep.`);
  first = b.placed.length;
  b.add("square-large", colour, [x, 1, z + 2], [-Q, 0]);
  b.add("square-large", colour, [x + 2, 1, z + 2], [-Q, 0]);
  if (!solid) crash(b, first);
  b.step(`Two big ${colour} squares flat side by side on top: the roof. Each rests on two opposite walls, so the roof sits firm.`);
  if (!solid) b.crash("car", start);
}

/* ---------- the builds ---------- */

function bigAirGap(): Project {
  const b = new Builder();
  bigFlats(b, "green", [[0, -4], [0, -2]], "Lay two big green squares flat, end to end, going away from you: the run-up.");
  ramp(b, "red", at(0, -4), "N", 2, { big: true, topTower: true, support: "blue", say: "Lean two big red squares up from the run-up onto the tall ring: the kicker, two squares high. Every join sits on a tower, so the ramp can't fold like a hinge." });
  const lip = -4 - 2 * BR;
  const gap = 4;
  dominoes(b, ["purple", "green"], { x: -2, y: 0, z: -1 }, "N", 4, "Down the left of the run-up and kicker, stand four squares up, a square apart: the crowd.");
  dominoes(b, ["green", "purple"], { x: 3, y: 0, z: -1 }, "N", 4, "Four more down the right, for the crowd on that side.");
  cones(b, ["orange", "yellow"], [[-2, -9], [3, -9], [-2, -12], [3, -12]], "Beside the gap, on the table, lean four tall triangles together until their tips meet: a cone.");
  const top = lip - 1 - gap - 1; // the landing ramp's top edge; its ring is on the gap side
  ramp(b, "red", at(2, top - BR), "S", 1, { big: true, topTower: true, support: "blue", say: "Four squares past the kicker, lean a big red square down towards you from its ring: the landing ramp." });
  bigFlats(b, "green", [[0, top - BR - 2], [0, top - BR - 4]], "Beyond the landing ramp, two big green squares flat for the run-out.");
  crushCar(b, "yellow", -4, top - 1.5, "a crush car on the left");
  crushCar(b, "purple", 4, top - 1.5, "a crush car on the right");
  b.route(["lane-2", "lane-1", "ramp-1", { jump: "ramp-2" }, { down: "ramp-2" }, "lane-3", "lane-4", { to: [-3.5, 0, -19] }, { through: "car-1" }, { to: [-1.5, 0, 1.5] }, { through: "dominoes-1" }, { to: [-1.5, 0, 1.5] }, { to: [3.5, 0, 1.5] }, { through: "dominoes-2" }, { to: [5.3, 0, -7.5] }, { through: "car-2" }]);
  return truck(b, { id: "truck-big-air-gap", title: "Big-air gap", age: "c", done: "Up the kicker, four squares of nothing but air, and a soft landing. Big air!" });
}

/** One side of the bowl: a 4-square-wide rim ring with lids, and two big ramps leaning up to it from the floor. */
function bowlSide(b: Builder, dir: Dir, start: At, colours: { ramp: Colour; rim: Colour }, name: string) {
  const up = UP[dir];
  const right = RIGHT[dir];
  const top = { x: start.x + up[0] * BR, z: start.z + up[1] * BR };
  const xs = [top.x, top.x + up[0] + right[0] * 4];
  const zs = [top.z, top.z + up[1] + right[1] * 4];
  const x0 = Math.min(...xs);
  const z0 = Math.min(...zs);
  const across = dir === "N" || dir === "S";
  ring(b, colours.rim, x0, z0, across ? 4 : 1, across ? 1 : 4, 0, `On the ${name}, a little way out from the floor, stand ten ${colours.rim} squares in a long ring, four across and one deep. The corners hold the walls up.`);
  const lids = b.placed.length;
  for (let i = 0; i < 4; i++) b.lid("square", colours.rim, across ? x0 + i : x0, 1, across ? z0 : z0 + i);
  b.step("Lay four squares flat on top of the ring. The rim. Each square rests on two opposite walls, so it can't tip.");
  b.deck(null, b.since(lids), OPPOSITE[dir]);
  ramp(b, colours.ramp, start, dir, 1, { big: true, say: `Lean a big ${colours.ramp} square up from the floor onto the rim, facing in.` });
  ramp(b, colours.ramp, { ...start, x: start.x + right[0] * 2, z: start.z + right[1] * 2 }, dir, 1, { big: true, say: `A second big ${colours.ramp} square beside it. The ${name} ramp is four squares wide.` });
}

function freestyleBowl(): Project {
  const b = new Builder();
  bowlSide(b, "N", at(0, 0), { ramp: "red", rim: "purple" }, "far side");
  bowlSide(b, "E", at(4, 0), { ramp: "yellow", rim: "blue" }, "right side");
  bowlSide(b, "S", at(4, 4), { ramp: "green", rim: "purple" }, "near side");
  bowlSide(b, "W", at(0, 4), { ramp: "orange", rim: "blue" }, "left side");
  cones(b, ["orange", "yellow"], [[-2, -2], [4, -2], [-2, 5], [4, 5]], "In each corner outside the bowl, lean four tall triangles together until their tips meet: a cone.");
  crushCar(b, "red", 1.5, 1.5, "a crush car in the middle of the bowl");
  b.route(["deck-1", { down: "ramp-1" }, { through: "car-1" }, { to: [3, 0, 3.9] }, "ramp-5", { down: "deck-3" }]);
  return truck(b, { id: "truck-freestyle-bowl", title: "Freestyle bowl", age: "c", done: "Up one wall, over the middle, down the other side. Four ramps, one bowl, no rules!" });
}

function busJump(): Project {
  const b = new Builder();
  bigFlats(b, "green", [[0, 0]], "Lay a big green square flat on the table: the start.");
  ramp(b, "orange", at(0, 0), "N", 2, { big: true, topTower: true, support: "blue", say: "Lean two big orange squares up from the start onto the tall ring: a kicker, two squares high." });
  // the buses are to be jumped, not crushed
  bus(b, "red", -1, -7, "the first bus, across the way", true);
  bus(b, "yellow", -1, -10, "the second bus, a square behind the first", true);
  bus(b, "blue", -1, -13, "the third bus, a square behind the second", true);
  dominoes(b, ["green", "purple"], { x: -4, y: 0, z: -5 }, "N", 5, "Down the left of the buses, stand five squares up, a square apart: the crowd.");
  dominoes(b, ["purple", "green"], { x: 5, y: 0, z: -5 }, "N", 5, "Down the right, five more squares for the crowd on that side.");
  ramp(b, "orange", at(2, -15 - BR), "S", 1, { big: true, topTower: true, support: "blue", say: "Past the third bus, lean a big orange square down towards you from its ring: the landing ramp." });
  bigFlats(b, "green", [[0, -15 - BR - 2]], "Beyond the landing ramp, a big green square flat for the run-out.");
  cones(b, ["orange", "yellow"], [[-3, -17], [4, -17]], "Beside the landing, lean four tall triangles together until their tips meet: a cone.");
  b.route(["lane-1", "ramp-1", { jump: "ramp-2" }, { down: "ramp-2" }, "lane-2", { to: [-3.5, 0, -17.5] }, { through: "dominoes-1" }, { to: [-3.5, 0, 1.5] }, { to: [5.5, 0, 1.5] }, { through: "dominoes-2" }]);
  return truck(b, { id: "truck-bus-jump", title: "Bus jump", age: "c", done: "Over one bus, over two, over three! The crowd goes wild." });
}

function figureEight(): Project {
  const b = new Builder();
  const botN = -1 - 2 * BR;
  const botS = 3 + 2 * BR;
  bigFlats(b, "purple", [[0, -6], [0, 6]], "Lay two big purple squares flat, one far from you and one near: the feet of the bridge ramps.");
  const ne = alt("yellow", "orange");
  const sw = alt("green", "blue");
  // each straight run of road is a lane of the course (the squares go down in the order of the cells)
  run(b, road(b, cells(0, 1, 7, 1), ne, ["Under the middle, lay a road of single squares flat, and carry it to the right.", "Carry on to the right, edge to edge."]), 7, "E", "mid");
  run(b, road(b, cells(6, -8, 1, 9).reverse(), ne, ["At the right end, turn the road away from you: single squares, edge to edge.", "Carry on away from you."]), 9, "S", "east");
  const back = road(b, cells(1, -9, 6, 1).reverse().concat(cells(0, -9, 1, 3)), ne, ["Turn left along the far side, towards the left.", "Carry on, then turn towards you, down to the far big square."]);
  run(b, back, 6, "E", "back");
  run(b, back + 6, 3, "N", "far-col");
  const near = road(b, cells(0, 8, 1, 3).concat(cells(-6, 10, 6, 1).reverse()), sw, ["From the near big square, lay the road towards you, then turn left.", "Carry on to the left."]);
  run(b, near, 3, "N", "near-col");
  run(b, near + 3, 6, "E", "bottom-row");
  run(b, road(b, cells(-6, 2, 1, 8).reverse(), sw, ["At the left end, turn the road away from you.", "Carry on away from you, up the left side."]), 8, "S", "left-col");
  run(b, road(b, cells(-6, 1, 6, 1), sw, ["At the top of the left side, turn right, back towards the middle.", "Carry on, up to the road under the bridge. A figure eight!"]), 6, "W", "left-row");
  ramp(b, "red", at(2, botN), "S", 2, { big: true, topTower: true, support: "blue", say: "Lean two big red squares down from the ring towards you, to the far big square: the north bridge ramp. Every join sits on a tower, so the ramp can't fold like a hinge." });
  const north = b.placed.length;
  b.lid("square", "yellow", 0, 2, -1);
  b.lid("square", "yellow", 1, 2, -1);
  b.step("Lay two squares flat on top of the far ring.");
  b.deck("north-deck", b.since(north), "N");
  ramp(b, "red", at(0, botS), "N", 2, { big: true, topTower: true, support: "blue", say: "Lean two big red squares up from the near big square onto the near ring: the south bridge ramp." });
  const south = b.placed.length;
  b.lid("square", "yellow", 0, 2, 2);
  b.lid("square", "yellow", 1, 2, 2);
  b.step("Lay two squares flat on top of the near ring.");
  b.deck("south-deck", b.since(south), "N");
  const bridge = b.add("square-large", "purple", [0, 2, 2], [-Q, 0]);
  b.step("A big purple square across the gap between the rings. The bridge deck, two squares above the road below. It rests on two opposite walls, so it can't tip into a corner.");
  b.deck("bridge", [bridge], "N");
  // over the bridge, round the far loop and back under it, then round the near loop home
  b.route(["ramp-2", "south-deck", "bridge", "north-deck", { down: "ramp-1" }, "lane-1", "far-col", "back", "east", { down: "mid" }, "left-row", "left-col", "bottom-row", "near-col"]);
  return truck(b, { id: "truck-figure-eight-bridge", title: "Figure-eight with a crossover bridge", age: "c", done: "Round one loop, over the bridge, round the other loop, and under it. A figure eight!" });
}

function skillsCourse(): Project {
  const b = new Builder();
  bigFlats(b, "green", [[0, 0]], "Lay a big green square flat on the table. The start.");
  cones(b, ["orange"], [[-1, 0], [2, 0]], "Either side of the start, lean four tall triangles together until their tips meet: a cone. Triangles leaning together lock each other, so a cone holds its shape.");
  cones(b, ["orange", "yellow"], [[0, -3], [1, -6], [0, -9]], "Down the track, two squares apart, make a row of three cones, taking turns: left, right, left. This is the slalom.");
  bigFlats(b, "purple", [[0, -14]], "At the end of the row, a big purple square flat: the corner. From here the course turns right.");
  cones(b, ["yellow", "orange"], [[5, -15], [5, -12], [8, -14], [8, -11]], "Two gates, each two squares wide: a cone either side. The second gate is a square nearer to you than the first.");
  tunnel(b, "red", "blue", at(11, -14), "E", 1);
  ramp(b, "red", at(15, -14), "E", 1, { big: true, topTower: true, support: "blue", say: "A square past the tunnel, lean a big red square up onto its ring: a small kicker." });
  crushCar(b, "green", 19, -13.5, "a car to jump", true);
  bigFlats(b, "green", [[21, -14], [23, -14]], "Past the car, two big green squares flat: the landing.", "E");
  dominoes(b, ["red", "yellow"], { x: 21, y: 0, z: -16 }, "E", 2, "Beside the landing, stand two squares up on the far side, a square apart: posts.");
  dominoes(b, ["yellow", "red"], { x: 21, y: 0, z: -11 }, "E", 2, "And two on the near side. The finish!");
  b.route(["lane-1", { to: [1.75, 0, -1.8] }, { to: [1.75, 0, -3.3] }, { to: [0.25, 0, -4.7] }, { to: [0.25, 0, -6.3] }, { to: [1.75, 0, -7.7] }, { to: [1.75, 0, -9.3] }, { to: [1, 0, -11.9] }, "lane-2", { to: [5.5, 0, -13] }, { to: [8.5, 0, -12] }, { to: [10.8, 0, -13] }, "tunnel-1", { to: [15, 0, -13] }, "ramp-1", { jump: "lane-3" }, "lane-3", "lane-4", { to: [25, 0, -15.5] }, { through: "dominoes-1" }, { to: [25.5, 0, -10.5] }, { through: "dominoes-2" }]);
  return truck(b, { id: "truck-skills-course", title: "Skills course", age: "c", done: "Weave the cones, thread the gates, through the tunnel and over the car. A perfect run!" });
}

function donutCircle(): Project {
  const b = new Builder();
  bigFlats(b, "green", [[1, 1], [3, 1], [1, 3], [3, 3]], "In the middle, four big green squares flat, two by two. The donut pad.", "N", true);
  road(b, cells(1, 0, 4, 1).concat(cells(1, 5, 4, 1), cells(0, 1, 1, 4), cells(5, 1, 1, 4)), alt("yellow", "orange"), ["Round the pad, a ring of single squares flat, edge to edge.", "Carry on round the pad, edge to edge."]);
  const tri = (colour: Colour, cx: number, cz: number, rightAngle: "tl" | "tr" | "bl" | "br") => {
    const x = cx;
    const y = -(cz + 1);
    if (rightAngle === "bl") b.on("tri-right", colour, [x, y], [x + 1, y]);
    else if (rightAngle === "br") b.on("tri-right", colour, [x + 1, y], [x + 1, y + 1]);
    else if (rightAngle === "tr") b.on("tri-right", colour, [x + 1, y + 1], [x, y + 1]);
    else b.on("tri-right", colour, [x, y + 1], [x, y]);
  };
  tri("red", 0, 0, "br");
  tri("red", 5, 0, "bl");
  tri("red", 0, 5, "tr");
  tri("red", 5, 5, "tl");
  b.step("Fill each corner with a corner triangle, the square corner pointing in. The pad is round now!");
  cones(b, ["orange", "yellow"], [[1, -1], [4, -1], [6, 1], [6, 4], [-1, 1], [-1, 4], [1, 6], [4, 6]], "Outside the pad, lean four tall triangles together until their tips meet: a cone. Four triangles lock each other, so they don't fold. Eight cones will ring the pad.");
  bigFlats(b, "purple", [[2, 8 + BR]], "South of the pad, lay a big purple square flat for the run-up.");
  ramp(b, "red", at(2, 8 + BR), "N", 1, { big: true, topTower: true, support: "blue", say: "Lean a big red square up from the run-up onto its ring: the kicker, a square from the pad." });
  crushCar(b, "blue", -4, 2, "a crush car on the left");
  crushCar(b, "red", 9, 2, "a crush car on the right");
  const lap: [number, number, number][] = [[4.3, 0, 3], [3.9, 0, 2.1], [3, 0, 1.7], [2.1, 0, 2.1], [1.7, 0, 3], [2.1, 0, 3.9], [3, 0, 4.3], [3.9, 0, 3.9]];
  b.route(["lane-2", "ramp-1", { jump: "lane-1" }, ...lap.map((to) => ({ to })), ...lap.map((to) => ({ to })), { to: [1.7, 0, 3] }, { through: "car-1" }, { through: "car-2" }]);
  return truck(b, { id: "truck-donut-circle", title: "Donut circle", age: "c", done: "Jump in over the kicker, spin round and round, and leave a donut in the dust!" });
}

function rampToRamp(): Project {
  const b = new Builder();
  bigFlats(b, "green", [[0, 2], [0, 0]], "Lay two big green squares flat, going away from you: the run-up.");
  ramp(b, "red", at(0, 0), "N", 3, { big: true, topTower: true, support: "blue", say: "Lean three big red squares up from the run-up, onto the tall rings, three squares high. Every join sits on a tower, so the ramp can't fold like a hinge." });
  const lip = -3 * BR;
  const top = lip - 1 - 3 - 1;
  crushCar(b, "yellow", 0.5, lip - 3.5, "a car in the gap to jump over", true);
  ramp(b, "orange", at(2, top - 3 * BR), "S", 3, { big: true, topTower: true, support: "blue", say: "Three squares past the first ring, lean three big orange squares down towards you from their ring: the second ramp." });
  bigFlats(b, "green", [[0, top - 3 * BR - 2]], "Beyond the second ramp, a big green square flat for the run-out.");
  cones(b, ["orange", "yellow"], [[-2, lip - 2], [3, lip - 2], [-2, lip - 5], [3, lip - 5]], "Beside the gap, lean four tall triangles together until their tips meet: a cone.");
  b.route(["lane-1", "lane-2", "ramp-1", { jump: "ramp-2" }, { down: "ramp-2" }, "lane-3"]);
  return truck(b, { id: "truck-ramp-to-ramp", title: "Ramp-to-ramp", age: "c", done: "Three squares up, a leap across the gap, and down the other side. Now go back the other way!" });
}

function cliffJump(): Project {
  const b = new Builder();
  bigFlats(b, "green", [[0, 2], [0, 0]], "Lay two big green squares flat, going away from you: the run-up.");
  const top = ramp(b, "red", at(0, 0), "N", 7, { big: true, topTower: true, support: "blue", say: "Lean seven big red squares up, end to end, each resting on the last and on the rings, all the way to the top. Every join sits on a tower, and a wide tower doesn't tip: two squares across for every seven high." });
  const edge = b.placed.length;
  b.lid("square", "yellow", 0, 7, top.z - 1);
  b.lid("square", "yellow", 1, 7, top.z - 1);
  b.step("Two yellow squares flat on top of the tallest ring: the top of the cliff, seven squares up. They rest on two opposite walls, so they can't tip into the corner.");
  b.deck("cliff-top", b.since(edge), "N");
  const base = top.z - 1;
  bigFlats(b, "green", [[0, base - 2], [0, base - 4], [0, base - 6]], "At the foot of the cliff, far side, three big green squares flat. The truck lands here.");
  crushCar(b, "red", -3, base - 3.5, "a crush car at the foot of the cliff");
  crushCar(b, "purple", 4, base - 3.5, "another on the other side");
  cones(b, ["orange", "yellow"], [[-3, base - 7], [4, base - 7]], "At the far end of the landing, lean four tall triangles together until their tips meet: a cone.");
  b.route(["lane-1", "lane-2", "ramp-1", "cliff-top", { jump: "lane-3" }, "lane-3", { through: "car-1" }, { through: "car-2" }, { to: [1, 0, base - 5] }, "lane-5"]);
  return truck(b, { id: "truck-cliff-jump", title: "Cliff jump", age: "c", done: "Up the long ramp, off the edge, and seven squares down to the landing. Hold on tight!" });
}

function twoLaneRace(): Project {
  const b = new Builder();
  const lane = (blueRow: number) => (x: number, z: number) => ((x < 2 ? x === 0 : z === blueRow) ? "blue" : "yellow");
  const lanes = lane(-16);
  road(b, cells(0, -1, 2, 1), (x) => (x ? "green" : "red"), ["Lay the start line: a red square and a green square, side by side."], "N");
  cones(b, ["orange"], [[-2, -1], [3, -1]], "Beside the start line, lean four tall triangles together until their tips meet: a cone.");
  road(b, cells(0, -5, 2, 4).reverse(), lanes, ["Behind the start line, away from you, two lanes of single squares: blue on the left, yellow on the right.", "Carry on away from you, edge to edge."], "N");
  tunnel(b, "red", "purple", at(0, -5), "N", 2);
  road(b, cells(0, -16, 2, 7).reverse(), lanes, ["Past the tunnel, the two lanes go on: blue, yellow, blue, yellow.", "Carry on, and stop at the corner."], "N");
  road(b, cells(2, -16, 4, 2), lanes, ["At the corner, turn the lanes to the right, blue on the outside, yellow on the inside.", "Carry on to the right."], "E");
  ramp(b, "orange", at(6, -16), "E", 1, { big: true, topTower: true, support: "red", say: "Lean a big orange square up onto its ring: a kicker across both lanes. Its join sits on a ring, so it can't fold like a hinge." });
  road(b, cells(10, -16, 3, 2), lanes, ["Past the kicker, a gap of one square, then the lanes go on: the landing."], "E");
  road(b, cells(13, -16, 1, 2), (x, z) => (z === -16 ? "purple" : "orange"), ["A purple and an orange square across both lanes: the finish line."], "E");
  crushCar(b, "green", 15, -16, "a crush car beyond the finish");
  crushCar(b, "red", 16.5, -15, "and another a little further on");
  b.route(["lane-1", "lane-2", "tunnel-1", "lane-3", "lane-4", "ramp-1", { jump: "lane-5" }, "lane-5", "lane-6", { through: "car-1" }, { through: "car-2" }]);
  return truck(b, { id: "truck-two-lane-race-tunnel", title: "Two-lane race with tunnel", age: "c", done: "Three, two, one, go! Through the tunnel, over the kicker, and across the line. Who won?" });
}

export const TRUCKS_4: Project[] = [bigAirGap(), freestyleBowl(), busJump(), figureEight(), skillsCourse(), donutCircle(), rampToRamp(), cliffJump(), twoLaneRace()];
