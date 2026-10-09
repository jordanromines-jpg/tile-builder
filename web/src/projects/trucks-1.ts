/* Monster trucks, the first fifteen (2.7): three for each age, from a little ramp and road for a baby's first truck to
   a mega ramp eight squares high. Built for 1:64 trucks; every one has a ramp, a jump, a drop or something to crash.
   Kit: track-kit.ts. Directions: N away from the child, S towards them, E right, W left. */
import { TRUCK_RULES } from "../engine/ages";
import type { Age, Project } from "../engine/types";
import { Builder } from "./helpers";
import { crashWall, crushCar, dominoes, fence, kicker, lane, ramp, tower, tunnel, type At } from "./track-kit";

const at = (x: number, z: number, y = 0): At => ({ x, y, z });
const RUN = Math.cos(Math.PI / 6); // one square of ramp runs this far

interface Meta {
  id: string;
  title: string;
  age: Age;
  done: string;
}

/** A finished truck build: theme trucks, stars by size within the trucks' rules for its age. */
export function truck(b: Builder, m: Meta): Project {
  const r = TRUCK_RULES[m.age];
  const third = (r.maxTiles - r.minTiles) / 3;
  const n = b.placed.length;
  const stars = n < r.minTiles + third ? 1 : n < r.minTiles + 2 * third ? 2 : 3;
  return b.build({ ...m, theme: "trucks", stars });
}

/* ---------- 0 to 3: built by a grown-up ---------- */

function littleRamp(): Project {
  const b = new Builder();
  lane(b, ["yellow", "green"], at(0, 0), "N", 4, 2, "Lay a road of eight squares flat on the table, two side by side, going away from you.");
  kicker(b, "red", at(0, -4), "N", { big: true, support: "blue", say: "Lean a big red square up from the end of the road onto the ring. A ramp!" });
  const lids = b.placed.length;
  b.lid("square", "blue", 0, 1, -4 - 2 * RUN - 1);
  b.lid("square", "blue", 1, 1, -4 - 2 * RUN - 1);
  b.step("Two blue squares flat on top of the ring. Put the truck up here, and let it roll down the ramp to the road.");
  b.deck(null, b.since(lids), "S");
  b.route(["deck-1", { down: "kicker-1" }, { down: "lane-1" }]);
  return truck(b, { id: "truck-little-ramp", title: "A little ramp and road", age: "t", done: "Wheee! Down the ramp and along the road. Again!" });
}

function knockDown(): Project {
  const b = new Builder();
  lane(b, ["blue", "blue", "yellow", "yellow"], at(0, 0), "N", 5, 2, "Lay a road of ten squares flat on the table, two side by side, going away from you.");
  crashWall(b, ["red", "orange", "yellow", "green"], at(0, -6), "N", 2, 4, (r) => (r === 0 ? "A little way past the end of the road, stand two squares side by side." : "Two more on top, just stacked. Don't join them round."));
  b.route(["lane-1", { through: "wall-1" }]);
  return truck(b, { id: "truck-knock-down-tower", title: "Knock-down tower", age: "t", done: "Crash! The truck knocked the tower down. Build it again!" });
}

function garage(): Project {
  const b = new Builder();
  lane(b, ["green", "yellow"], at(0, 0), "N", 4, 2, "Lay a road of eight squares flat on the table, two side by side, going away from you.");
  dominoes(b, ["yellow", "green", "orange"], at(0.5, -5), "N", 3, "A little way past the end of the road, stand three squares up, one at a time, a square apart. Skittles for the truck to knock down on the way in!");
  tunnel(b, "red", "blue", at(0, -10), "N", 1);
  b.route(["lane-1", { through: "dominoes-1" }, "tunnel-1"]);
  return truck(b, { id: "truck-big-square-garage", title: "A big-square garage", age: "t", done: "Beep, beep! Knock the skittles down, then into the garage for a sleep." });
}

/* ---------- 3 to 5: one tile a step ---------- */

function firstJump(): Project {
  const b = new Builder();
  lane(b, ["green"], at(0, 0), "N", 3, 1, "Put a green square flat on the table. The road starts here.", true);
  kicker(b, "red", at(0, -3), "N");
  lane(b, ["yellow"], at(0, -3 - 2 * RUN - 3), "N", 3, 1, "Leave a gap, then lay a yellow square flat. The truck lands here!", true);
  b.route(["lane-1", "kicker-1", { jump: "lane-2" }, "lane-2"]);
  return truck(b, { id: "truck-first-jump", title: "My first jump", age: "a", done: "Vroom, up the ramp, and fly! The truck jumped the gap." });
}

function crushCarJump(): Project {
  const b = new Builder();
  lane(b, ["blue"], at(0, 0), "N", 2, 1, "Put a blue square flat on the table. The road.", true);
  kicker(b, "orange", at(0, -2), "N");
  crushCar(b, "red", 0, -2 - 2 * RUN - 3);
  b.route(["lane-1", "kicker-1", { jump: "car-1" }, { through: "car-1" }]);
  return truck(b, { id: "truck-crush-car-jump", title: "Jump onto the crush car", age: "a", done: "Crunch! The truck landed right on the car." });
}

function truckTunnel(): Project {
  const b = new Builder();
  lane(b, ["yellow", "green"], at(0, 0), "N", 2, 2, "Put a yellow square flat on the table. The road starts here.", true);
  tunnel(b, "blue", "purple", at(0, -2), "N", 1);
  lane(b, ["yellow", "green"], at(0, -4), "N", 2, 2, "Past the tunnel, lay another square flat for the road.", true);
  crushCar(b, "red", 0.5, -8, "a crush car at the end of the road");
  b.route(["lane-1", "tunnel-1", "lane-2", { through: "car-1" }]);
  return truck(b, { id: "truck-tunnel", title: "Through the tunnel", age: "a", done: "Into the dark, out the other side, and crunch! Beep, beep." });
}

/* ---------- 6 to 8 ---------- */

function bigAir(): Project {
  const b = new Builder();
  lane(b, ["green", "yellow"], at(0, 0), "N", 2, 2, "Lay four squares flat for the run-up, two lanes side by side.");
  kicker(b, "red", at(0, -2), "N", { lanes: 2, support: "blue" });
  const far = -2 - 2 * RUN - 1 - 2 - 1 - 2 * RUN;
  ramp(b, "red", at(2, far), "S", 1, { lanes: 2, topTower: true, support: "blue", say: "Past a gap of two squares, lean the landing ramp up from the far side onto its ring." });
  lane(b, ["green", "yellow"], at(0, far), "N", 2, 2, "Four squares flat beyond the landing, for the truck to roll out.");
  b.route(["lane-1", "kicker-1", { jump: "ramp-1" }, { down: "ramp-1" }, "lane-2"]);
  return truck(b, { id: "truck-big-air-two-lanes", title: "Big air, two lanes", age: "b", done: "Two trucks, side by side, flying over the gap. Who lands first?" });
}

function crushCarRow(): Project {
  const b = new Builder();
  lane(b, ["blue", "purple"], at(0, 0), "N", 2, 2, "Lay four squares flat for the run-up, two lanes side by side.");
  kicker(b, "orange", at(0, -2), "N", { lanes: 2, support: "yellow" });
  const z = -2 - 2 * RUN - 1 - 1;
  crushCar(b, "red", 0.5, z - 1, "the first crush car");
  crushCar(b, "green", 0.5, z - 3, "the second crush car");
  crushCar(b, "blue", 0.5, z - 5, "the third crush car");
  b.route(["lane-1", "kicker-1", { jump: "car-1" }, { through: "car-1" }, { through: "car-2" }, { through: "car-3" }]);
  return truck(b, { id: "truck-crush-car-row", title: "The crush-car row", age: "b", done: "Crunch, crunch, crunch! Three cars flattened in one go." });
}

function rampToTheRoof(): Project {
  const b = new Builder();
  const top = ramp(b, "red", at(0, 0), "N", 3, { topTower: true, support: "blue", say: "Lean the ramp up, square by square, each on the last, from the table to the top of the tall tower." });
  const roof = b.lid("square", "yellow", 0, 3, top.z - 1);
  b.step("A yellow square flat on top of the tallest tower: the roof.");
  b.deck("roof", [roof], "N");
  lane(b, ["green", "green", "yellow"], at(0, top.z - 1), "N", 3, 1, "Behind the tower, lay three squares flat on the table. Drive off the roof and drop!");
  b.route(["ramp-1", "roof", { jump: "lane-1" }, "lane-1"]);
  return truck(b, { id: "truck-ramp-to-the-roof", title: "Ramp to the roof, and drop!", age: "b", done: "Up, up, up to the roof, then over the edge. Thump!" });
}

/* ---------- 9 to 10 ---------- */

function megaRamp4(): Project {
  const b = new Builder();
  const top = ramp(b, "purple", at(0, 0), "N", 4, { big: true, topTower: true, support: "blue", say: "Lean four big purple squares up, end to end, each resting on the last, from the table to the top tower. Every join sits on a tower, so the ramp can't fold like a hinge." });
  const lids = b.placed.length;
  b.lid("square", "yellow", 0, 4, top.z - 1);
  b.lid("square", "yellow", 1, 4, top.z - 1);
  b.step("Two yellow squares flat on top: the start deck. It rests on two opposite walls of the ring, so it can't tip into a corner.");
  b.deck("start", b.since(lids), "S");
  lane(b, ["green", "yellow"], at(2, 0), "S", 2, 2, "At the bottom, four squares flat for the trucks to land on.");
  lane(b, ["green", "yellow"], at(2, 2), "S", 2, 2, "Four more, to slow down.");
  crushCar(b, "red", 0, 4.5, "a crush car at the end");
  b.route(["start", { down: "ramp-1" }, "lane-1", "lane-2", { through: "car-1" }]);
  return truck(b, { id: "truck-mega-ramp-four", title: "Mega ramp, four high", age: "c", done: "From four squares up, the trucks roar down the mega ramp. What a run!" });
}

function towerDrop5(): Project {
  const b = new Builder();
  const deckZ = -5 * 2 * RUN - 1;
  tower(b, ["red", "orange", "yellow", "green", "blue"], 0, deckZ, 2, 1, 5, "purple", (r) => (r === 0 ? "Far from you, stand a ring of six squares, two wide. The drop tower: two across holds it steady at five high." : `Another ring on top: ${r + 1} high.`));
  ramp(b, "blue", at(0, 0), "N", 5, { support: "yellow", say: "Lean the ramp up from the table, square by square, onto each tower, to the deck at the top. The squares in the middle get a brace each next: triangles don't fold." });
  lane(b, ["green", "yellow"], at(0, deckZ), "N", 3, 2, "Behind the drop tower, six squares flat on the table. That's where the trucks land.");
  b.route(["ramp-1", "deck-1", { jump: "lane-1" }, "lane-1"]);
  return truck(b, { id: "truck-tower-drop-five", title: "Tower drop, five high", age: "c", done: "Up the ramp to the top, and over the edge. A five-square drop!" });
}

function crashTestCity(): Project {
  const b = new Builder();
  lane(b, ["blue", "purple"], at(0, 0), "N", 2, 2, "Lay four squares flat for the run-up, two lanes side by side.");
  kicker(b, "orange", at(0, -2), "N", { lanes: 2, support: "yellow" });
  const z = -2 - 2 * RUN - 1;
  lane(b, ["green", "yellow"], at(0, z), "N", 2, 2, "Past the kicker, lay four squares flat on the table, two lanes side by side. That's where the truck lands.");
  crashWall(b, ["red", "yellow", "blue", "green"], at(-1, z - 2), "N", 4, 3, (r) => (r === 0 ? "At the end of the landing, stand four squares in a row across the way, with a square turned back at each end. The turned squares make corners, so the wall stands until a truck hits it." : "Another row on top, just stacked."));
  crushCar(b, "green", -3, z - 1, "a crush car on the left");
  crushCar(b, "blue", 4, z - 1, "a crush car on the right");
  dominoes(b, ["red", "yellow"], at(-2.5, z - 5), "E", 4, "Behind the wall, stand four squares up one by one, a square apart: dominoes.");
  b.route(["lane-1", "kicker-1", { jump: "lane-2" }, { through: "wall-1" }, { through: "car-1" }, { through: "car-2" }, { to: [5.5, 0, -9.2] }, { through: "dominoes-1" }]);
  return truck(b, { id: "truck-crash-test-city", title: "Crash-test city", age: "c", done: "Kaboom! Through the wall, past the cars, and down go the dominoes." });
}

/* ---------- 11 to 16 ---------- */

function dropTower8(): Project {
  const b = new Builder();
  tower(b, ["red", "orange", "yellow", "green", "blue", "purple", "red", "orange"], 0, -2, 2, 2, 8, "yellow", (r) => (r === 0 ? "Stand a ring of eight squares, two by two. The drop tower starts here. Two across for eight high keeps it from tipping." : `Another ring on top: ${r + 1} squares high.`), "S");
  lane(b, ["green", "green", "blue"], at(2, 0), "S", 3, 2, "In front of the tower, lay six squares flat: the landing zone.");
  crushCar(b, "red", 3, -1, "a crush car beside the tower");
  crushCar(b, "blue", 3, 1.5, "another crush car");
  crushCar(b, "purple", -2, 1.5, "a third on the other side");
  crashWall(b, ["red", "yellow", "blue"], at(-1, 4), "N", 3, 3, (r) => (r === 0 ? "Past the landing zone, stand three squares in a row: a wall to smash." : "Another row on top, just stacked."));
  b.route(["deck-1", { jump: "lane-1" }, { through: "car-2" }, { through: "car-1" }, { to: [1, 0, 1.2] }, { through: "car-3" }, { to: [0.5, 0, 2.2] }, { through: "wall-1" }]);
  return truck(b, { id: "truck-drop-tower-eight", title: "The 8-high drop tower", age: "d", done: "From eight squares up, the drop of doom! Land it, and smash the wall." });
}

function megaRamp8(): Project {
  const b = new Builder();
  // the eight-high tower on the right: two squares across for every eight high, so it doesn't tip (R12)
  tower(b, ["red", "orange", "yellow", "green", "blue", "purple", "red", "orange"], 4, -9, 2, 2, 8, "yellow", (r) => (r === 0 ? "Stand a ring of eight squares, two by two. A tower can be four times as high as it is wide, so two across holds eight high." : `Another ring on top: ${r + 1} squares high.`), "S");
  // the mega ramp on the left: a whole ramp eight high would need more tiles than four sets hold, so it climbs to four
  const top = ramp(b, "red", at(0, 0), "N", 4, { topTower: true, support: "blue", say: "Lean the mega ramp up from the table, square by square, each resting on the last and on the towers, to the top. A join with nothing under it folds like a hinge, so every join sits on a tower." });
  const jumpOff = b.lid("square", "yellow", 0, 4, top.z - 1);
  b.step("A yellow square flat on top of the tallest ring: the ramp's jump-off deck, four squares up.");
  b.deck("ramp-deck", [jumpOff], "N");
  lane(b, ["green", "yellow"], at(0, top.z - 1), "N", 3, 2, "Beyond the ramp's deck, six squares flat on the table: where its jumpers land.");
  lane(b, ["green", "green", "blue"], at(6, -6), "S", 3, 2, "In front of the tall tower, lay six squares flat: the landing zone for the big drop.");
  crushCar(b, "red", 7.5, -9, "a crush car beside the tower");
  crushCar(b, "blue", -3, -3, "another crush car beside the ramp");
  crashWall(b, ["red", "yellow", "blue"], at(4, -1), "N", 3, 3, (r) => (r === 0 ? "Past the landing zone, stand three squares in a row, with a square turned back at each end: a wall to smash. The turned squares make corners, so it stands until a truck hits it." : "Another row on top, just stacked."));
  // two runs: up the ramp and off its deck; then the child puts the truck on the tall tower for the big drop
  b.route(["ramp-1", "ramp-deck", { jump: "lane-1" }, "lane-1", { to: [-2.5, 0, -10.5] }, { through: "car-2" }, { place: "deck-1" }, { jump: "lane-2" }, "lane-2", { through: "wall-1" }, { to: [9.2, 0, -0.5] }, { to: [9.2, 0, -8.5] }, { through: "car-1" }]);
  return truck(b, { id: "truck-mega-ramp-eight", title: "Mega ramp and the eight-high tower", age: "d", done: "Up the mega ramp and off the deck, then the big one: a drop from eight squares up, straight through the wall!" });
}

function stadium(): Project {
  const b = new Builder();
  // the arena, 16 by 12, with a gate in the middle of the front
  fence(b, "purple", 0, -12, 16, 12, [7, 8]);
  tunnel(b, "red", "blue", at(7, 0), "N", 1);
  kicker(b, "orange", at(7, -3), "N", { big: true, support: "yellow" });
  ramp(b, "orange", at(9, -3 - 2 * RUN - 1 - 2 - 1 - 2 * RUN), "S", 1, { big: true, topTower: true, support: "yellow", say: "Past a gap of two squares, lean a big square up onto its ring: the landing." });
  crushCar(b, "red", 2, -3, "a crush car by the left wall");
  crushCar(b, "green", 2, -5, "another");
  crushCar(b, "blue", 2, -7, "and a third");
  crashWall(b, ["red", "yellow", "blue"], at(12, -6), "N", 3, 3, (r) => (r === 0 ? "On the right, stand three squares in a row, with a square turned back at each end: a wall to smash. The turned squares make corners, so it stands until it's hit." : "Another row on top, just stacked."));
  dominoes(b, ["red", "yellow", "green"], at(1, -11.5), "E", 3, "Along the back, stand three squares up, a square apart: dominoes.");
  dominoes(b, ["blue", "purple"], at(11, -11.5), "E", 2, "Two more at the back right.");
  b.route(["tunnel-1", { to: [8, 0, -3] }, "kicker-1", { jump: "ramp-1" }, { down: "ramp-1" }, { to: [5, 0, -9] }, { through: "car-1" }, { through: "car-2" }, { through: "car-3" }, { through: "wall-1" }, { to: [15, 0, -11] }, { through: "dominoes-2" }, { through: "dominoes-1" }]);
  return truck(b, { id: "truck-monster-stadium", title: "The Monster stadium", age: "d", done: "Ladies and gentlemen, the Monster stadium! Through the tunnel, over the jump, crush the cars." });
}

export const TRUCKS_1: Project[] = [
  littleRamp(),
  knockDown(),
  garage(),
  firstJump(),
  crushCarJump(),
  truckTunnel(),
  bigAir(),
  crushCarRow(),
  rampToTheRoof(),
  megaRamp4(),
  towerDrop5(),
  crashTestCity(),
  dropTower8(),
  megaRamp8(),
  stadium(),
];
