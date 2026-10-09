/* Monster trucks (2.8), part 2: small road builds. Three for 0 to 3 (a grown-up lays them) and four for 3 to 5 (one tile
   a step). Kit: track-kit.ts; `truck` from trucks-1.ts. Directions: N away from the child, S towards them. */
import type { Colour } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder } from "./helpers";
import { crushCar, kicker, lane, ramp, type At } from "./track-kit";
import { truck } from "./trucks-1";

const Q = Math.PI / 2;
const RUN = Math.cos(Math.PI / 6);
/** from the foot of a kicker to the far side of the tower under its lip */
const KICKER = 2 * RUN + 1;
const r6 = (v: number) => Math.round(v * 1e6) / 1e6;
const at = (x: number, z: number): At => ({ x, y: 0, z: r6(z) });

/** A big square lying flat on the table: it covers x..x+2 and z..z+2 (local helper; could join the kit). */
function bigFlat(b: Builder, colour: Colour, x: number, z: number, say: string) {
  const flat = b.add("square-large", colour, [x, 0, z + 2], [-Q, 0]);
  b.step(say);
  b.deck(null, [flat], "N", "lane");
}

/** One small square standing alone to be knocked down, along +x from (x, z) at height y (role crash; local helper). */
function crashSquare(b: Builder, colour: Colour, x: number, y: number, z: number, say: string) {
  b.add("square", colour, [x, y, z], [0, 0], "crash");
  b.step(say);
}

/* ---------- 0 to 3: built by a grown-up ---------- */

function roadLoop(): Project {
  const b = new Builder();
  const blue: Colour[] = ["blue", "purple"];
  const warm: Colour[] = ["yellow", "green"];
  lane(b, blue, at(0, 4), "E", 4, 2, "Lay the front of the road flat on the table: eight squares, four long and two wide.");
  lane(b, warm, at(4, 4), "E", 3, 2, "Carry on to the right: six squares, three long and two wide, to the corner.");
  lane(b, blue, at(5, 4), "N", 2, 2, "Turn up the right-hand side: four squares flat, two long and two wide.");
  lane(b, warm, at(4, 0), "E", 3, 2, "At the back right, six squares flat, three long and two wide.");
  lane(b, blue, at(0, 0), "E", 4, 2, "Carry the road along the back: eight squares flat, four long and two wide.");
  lane(b, warm, at(0, 4), "N", 2, 2, "Down the left-hand side, four squares flat, and the road is a loop.");
  kicker(b, "red", { x: 2, y: 0, z: 2 }, "E", { big: true, support: "orange", say: "Lean a big red square up onto the ring, pointing at the right-hand road. A kicker in the middle of the loop!" });
  b.route(["lane-1", "lane-2", "lane-3", { down: "lane-4" }, { down: "lane-5" }, { to: [1.7, 0, 3] }, "kicker-1", { jump: "lane-3" }]);
  return truck(b, { id: "truck-road-loop", title: "Truck road loop", age: "t", done: "Round and round the loop! Or take the kicker in the middle and fly across to the other side." });
}

function bumpyRoad(): Project {
  const b = new Builder();
  lane(b, ["yellow", "green"], at(0, 0), "N", 2, 2, "Lay a road flat on the table: four squares, two long and two wide, going away from you.");
  kicker(b, "red", at(0, -2), "N", { big: true, support: "blue", say: "Lean a big red square up onto the ring, from the end of the road. The first kicker!" });
  const z1 = -2 - KICKER;
  lane(b, ["green", "yellow"], at(0, z1), "N", 2, 2, "Lay four squares flat past the kicker, for the truck to land on.");
  kicker(b, "orange", at(0, z1 - 2), "N", { big: true, support: "purple", say: "Lean a big orange square up onto the ring. The second kicker!" });
  const z2 = z1 - 2 - KICKER;
  lane(b, ["yellow", "green"], at(0, z2), "N", 3, 2, "Past the second kicker, lay six squares flat. The finish of the road.");
  b.route(["lane-1", "kicker-1", { jump: "lane-2" }, "lane-2", "kicker-2", { jump: "lane-3" }, "lane-3"]);
  return truck(b, { id: "truck-bumpy-road", title: "Bumpy road with two kickers", age: "t", done: "Bump, fly, bump, fly! Two jumps on one little road." });
}

function crushCubes(): Project {
  const b = new Builder();
  lane(b, ["green", "yellow"], at(0, 0), "N", 3, 2, "Lay a road flat on the table: six squares, three long and two wide, going away from you.");
  kicker(b, "orange", at(0, -3), "N", { big: true, support: "blue", say: "Lean a big orange square up onto the ring, from the end of the road. A kicker!" });
  const z = -3 - KICKER;
  crushCar(b, "red", 0.5, z - 2, "the first crush cube, a square past the kicker");
  crushCar(b, "purple", 0.5, z - 4, "the second crush cube, a square further on");
  b.route(["lane-1", "kicker-1", { jump: "car-1" }, { through: "car-1" }, { through: "car-2" }]);
  return truck(b, { id: "truck-crush-the-cubes", title: "Crush-the-cubes", age: "t", done: "Fly off the kicker and crunch! Two cubes squashed. Build them again!" });
}

/* ---------- 3 to 5: one tile a step ---------- */

function knockDownWall(): Project {
  const b = new Builder();
  bigFlat(b, "green", 0, 0, "Put a big green square flat on the table. It is a road with two lanes!");
  bigFlat(b, "yellow", 0, -2, "Put a big yellow square flat in front of it, going away from you. The road gets longer.");
  const wall = b.placed.length;
  // a U: a back wall of three with a short side wall at each end, two high, so it stands until it is hit
  const colours: Colour[] = ["red", "orange", "yellow", "blue", "green", "purple"];
  const side = (colour: Colour, x: number, y: number, say: string) => {
    b.add("square", colour, [x, y, -3], [0, -Q], "crash");
    b.step(say);
  };
  crashSquare(b, colours[0], -0.5, 0, -3, "A little way past the road, stand a red square up on the table. The back of the wall.");
  crashSquare(b, colours[1], 0.5, 0, -3, "Stand an orange square up next to it, in the middle.");
  crashSquare(b, colours[2], 1.5, 0, -3, "Stand a yellow square up next to that, on the right.");
  side(colours[3], -0.5, 0, "On the left end, stand a blue square up, turned to face the road. A side for the wall!");
  side(colours[4], 2.5, 0, "On the right end, stand a green square up, turned the same way. Now the wall has two sides.");
  crashSquare(b, colours[5], -0.5, 1, -3, "Stand a purple square on top of the red one. Just stacked, not joined!");
  crashSquare(b, colours[0], 0.5, 1, -3, "Stand a red square on top of the orange one.");
  crashSquare(b, colours[1], 1.5, 1, -3, "Stand an orange square on top of the yellow one.");
  side(colours[2], -0.5, 1, "Stand a yellow square on top of the blue side.");
  side(colours[3], 2.5, 1, "And a blue square on top of the green side. The wall is done!");
  b.crash("wall", wall);
  b.route(["lane-1", "lane-2", { through: "wall-1" }]);
  return truck(b, { id: "truck-knock-down-wall", title: "Knock-down wall", age: "a", done: "Crash! Down came the wall. Build it up and do it again." });
}

function rampAndDrop(): Project {
  const b = new Builder();
  const zTop = r6(-2 * RUN);
  const z0 = r6(zTop - 2);
  lane(b, ["green"], at(0, 1), "N", 1, 1, "Put a green square flat on the table. The road starts here.", true);
  b.wallX("square", "blue", 0, 0, zTop);
  b.wallX("square", "blue", 0, 0, z0);
  b.wallZ("square", "blue", 0, 0, z0);
  b.wallZ("square", "blue", 0, 0, r6(z0 + 1));
  b.wallZ("square", "blue", 1, 0, z0);
  b.wallZ("square", "blue", 1, 0, r6(z0 + 1));
  b.step("Stand six blue squares in a ring on the table, two long. It is the deck's tower.");
  const deck = b.placed.length;
  b.lid("square", "yellow", 0, 1, z0);
  b.step("Lay a yellow square flat on top of the ring, at the far end.");
  b.lid("square", "yellow", 0, 1, r6(z0 + 1));
  b.step("Lay another yellow square flat on top, next to the first. Now the deck is done.");
  b.deck(null, b.since(deck), "N");
  ramp(b, "red", at(0, 0), "N", 1, { say: "Lean two red squares up, one on the last, from the road to the deck. The ramp!" });
  lane(b, ["yellow", "green"], at(0, z0), "N", 3, 1, "Past the deck, lay a yellow square flat on the table. The truck lands here!", true);
  b.route(["lane-1", "ramp-1", "deck-1", { jump: "lane-2" }, "lane-2"]);
  return truck(b, { id: "truck-ramp-and-drop", title: "Ramp and drop", age: "a", done: "Up the ramp, across the deck, and drop! Thump, the truck landed." });
}

function littleArena(): Project {
  const b = new Builder();
  const big = (colour: Colour, along: "x" | "z", cells: [number, number][], say: string) => {
    for (const [x, z] of cells) (along === "x" ? b.wallX : b.wallZ).call(b, "square-large", colour, x, 0, z);
    b.step(say);
  };
  big("purple", "z", [[4, 0], [4, 2], [4, 4]], "Stand three big purple squares up in a row, side by side. The right wall of the arena!");
  big("blue", "x", [[0, 0], [2, 0]], "Stand two big blue squares up in a row, joined to the right wall at the back.");
  big("purple", "z", [[0, 0], [0, 2], [0, 4]], "Stand three more big purple squares up for the left wall, joined to the back.");
  big("blue", "x", [[0, 6]], "Stand one big blue square up at the front on the left. Leave a gap on the right: the gate!");
  lane(b, ["green"], at(2, 6), "N", 1, 1, "Put a green square flat on the table, just inside the gate.", true);
  kicker(b, "red", at(2, 5), "N", { support: "yellow", say: "Lean two red squares up onto the ring. A little kicker!" });
  crushCar(b, "orange", 2, 0.5, "a crush car at the back of the arena");
  const skittles = b.placed.length;
  crashSquare(b, "green", 0.5, 0, 4, "On the left, stand a green square up on its own. A skittle to knock down.");
  crashSquare(b, "yellow", 0.5, 0, 2, "Stand a yellow square up a little further on. Another skittle!");
  b.crash("dominoes", skittles, "N");
  b.route(["lane-1", "kicker-1", { jump: "car-1" }, { through: "car-1" }, { to: [1, 0, 1] }, { through: "dominoes-1" }]);
  return truck(b, { id: "truck-little-arena", title: "Little arena", age: "a", done: "Into the arena! Jump the kicker, crunch the car and knock over the skittles." });
}

function twoLaneRamp(): Project {
  const b = new Builder();
  bigFlat(b, "green", 0, 0, "Put a big green square flat on the table. It is a road with two lanes.");
  kicker(b, "red", at(0, 0), "N", { big: true, support: "blue", say: "Lean a big red square up onto the ring. One big square is a ramp for two trucks!" });
  lane(b, ["yellow", "green"], at(0, -KICKER - 1), "N", 2, 2, "Leave a gap, then lay a yellow square flat. The trucks land here!", true);
  b.route(["lane-1", "kicker-1", { jump: "lane-2" }, "lane-2"]);
  return truck(b, { id: "truck-two-lane-ramp", title: "Two-lane ramp", age: "a", done: "Two trucks, side by side, up the ramp and away! Who flies furthest?" });
}

export const TRUCKS_2: Project[] = [roadLoop(), bumpyRoad(), crushCubes(), knockDownWall(), rampAndDrop(), littleArena(), twoLaneRamp()];
