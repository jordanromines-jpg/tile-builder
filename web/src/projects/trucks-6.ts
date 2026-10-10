/* Monster trucks (2.8), part 6: the biggest builds for 11 to 16. Kit: track-kit.ts; `truck` from trucks-1.ts.
   Directions: N away from the child (−z), S towards them (+z), E right, W left. */
import type { Colour } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder } from "./helpers";
import { arenaWall, crashWall, crushCar, dominoes, kicker, lane, ramp, tower, tunnel, type At } from "./track-kit";
import { truck } from "./trucks-1";

const at = (x: number, z: number, y = 0): At => ({ x, y, z });
const R6 = (v: number) => Math.round(v * 1e6) / 1e6;
const L = 2 * Math.sqrt(3); // two big squares of ramp run this far
const Q = Math.PI / 2;
const RUN = Math.cos(Math.PI / 6);

/** Add the why to the step just closed: one short, true sentence for ages 9 and up. */
function why(b: Builder, text: string) {
  const last = b.steps[b.steps.length - 1];
  last.say = `${last.say} ${text}`;
}

/** A 1-lane landing: a 1 × 1 tower of `h` rings with a square flat on top, where a ramp ends and the next one starts. */
function landing(b: Builder, colours: Colour[], x0: number, z0: number, h: number, lid: Colour, name: string) {
  tower(b, colours, R6(x0), R6(z0), 1, 1, h, lid, (r) => (r === 0 ? `Stand a ring of four squares. ${name}` : `Another ring on top: ${r + 1} high.`));
}

function spiral(): Project {
  const b = new Builder();
  // the pinwheel: two landings at 2 and 4 high, a ramp of four squares between, up onto a 6-high tower of big squares.
  // (It was 8 high round 1-wide towers: in the physics (R14) a tower one square wide and over 4 high sways while it
  // stands alone, before the ramps tie it in, and two wide it took more squares than four sets have.)
  landing(b, ["blue", "green"], 0, -L - 1, 2, "yellow", "The first landing, two squares up.");
  ramp(b, "red", at(-L, -L - 1), "E", 2, { support: "blue", say: "Lean four red squares up from the table, end to end, going right, to the first landing. The ramp starts here." });
  why(b, "Triangles don't fold: the brace locks the join.");
  landing(b, ["orange", "purple", "red", "yellow"], 1 + L, -L - 1, 4, "yellow", "The second landing, four squares up.");
  ramp(b, "orange", at(1, -L - 1, 2), "E", 2, { support: "purple", say: "From the first landing, lean four squares up, going right, to the second landing." });
  // the big tower: a ring of squares, two rings of big squares, a ring of squares (so the last ramp's brace has a top
  // edge 5 high to lean from), and a big square on top
  // centred on the last ramp, so the truck drives from the deck's middle straight onto it
  const tx = R6(0.5 + L);
  b.room("green", tx, 0, 2, 2, 0);
  b.step("Stand eight squares in a ring, two by two, beside the second landing. The big tower starts here.");
  for (const [r, c] of [[0, "blue"], [1, "purple"]] as [number, Colour][]) {
    b.wallX("square-large", c, tx, 1 + 2 * r, 2);
    b.wallZ("square-large", c, tx + 2, 1 + 2 * r, 0);
    b.wallX("square-large", c, tx, 1 + 2 * r, 0);
    b.wallZ("square-large", c, tx, 1 + 2 * r, 0);
    b.step(`Four big squares in a ring on top: ${3 + 2 * r} squares high.`);
  }
  b.room("green", tx, 0, 2, 2, 5);
  b.step("Eight squares in a ring on top: 6 high.");
  const lid = b.add("square-large", "red", [tx, 6, 2], [-Q, 0]);
  b.step("A big square flat on top: the deck, six squares up. The truck starts here.");
  b.deck(null, [lid], "N");
  ramp(b, "green", at(2 + L, -L, 4), "S", 2, { support: "red", say: "From the second landing, lean the last four squares up, coming back towards you, onto the big tower." });
  why(b, "The ramps tie the landings to the tower, so the whole spiral stands as one wide shape and doesn't tip.");
  lane(b, ["green", "yellow"], at(-L, 0.5 - L), "W", 1, 2, "At the bottom of the first ramp, in line with it, lay two squares flat: the landing zone.");
  // the tunnel's floor first: its walls stand on its edges, so the tunnel can't lean over like a parallelogram (R14)
  b.add("square-large", "green", [R6(-L - 3), 0, R6(0.5 - L)], [-Q, 0]);
  b.step("At the end of the landing zone, lay a big square flat: the tunnel's floor.");
  tunnel(b, "red", "blue", at(-L - 1, 0.5 - L), "W", 1);
  // from the top deck, all the way down the spiral, turning on each landing, then along the lane and through the tunnel
  b.route(["deck-3", { down: "ramp-3" }, { to: [4.9, 4, -3.9] }, { down: "ramp-2" }, { to: [0, 2, -3.96] }, { down: "ramp-1" }, "lane-1", "tunnel-1"]);
  return truck(b, { id: "truck-spiral-ramp", title: "Spiral ramp round a big 6-high tower", age: "d", done: "Round and round, up to six! Now roll all the way down and through the tunnel." });
}

/** A pylon: a 1 × 1 tower of `h` rings with a cone of four tall triangles on top. */
function pylon(b: Builder, colours: Colour[], cone: Colour, x: number, z: number, h: number, name: string) {
  tower(b, colours, x, z, 1, 1, h, null, (r) => (r === 0 ? `For ${name}, stand a ring of four squares.` : `Another ring on top: ${r + 1} high.`));
  b.roof(cone, x, z, h);
  b.step("Four tall triangles leaning in on top, tips together: a cone!");
}

function pit(): Project {
  const b = new Builder();
  arenaWall(b, "purple", 0, -6, 3, 3, [{ side: "front", at: 1 }]);
  why(b, "Where two walls meet at a corner they hold each other up.");
  lane(b, ["green", "yellow"], at(2, 3), "N", 3, 2, "In front of the gate, lay six squares flat. The way into the pit.");
  ramp(b, "red", at(R6(-2 - 4 * RUN), -4), "E", 2, { lanes: 2, topTower: true, towersFirst: true, support: "blue", say: "On the left, lean a ramp up, two squares wide, onto its tower. Jump over the wall!" });
  ramp(b, "orange", at(R6(8 + 4 * RUN), -2), "W", 2, { lanes: 2, topTower: true, towersFirst: true, support: "blue", say: "On the right, lean a matching ramp up onto its tower." });
  why(b, "Triangles don't fold: the brace locks the join.");
  crashWall(b, ["red", "yellow", "green"], at(0.6, -3), "N", 2, 3, (r) => (r === 0 ? "Inside the pit, stand two squares in a row, with a square turned at each end. A stack to smash. The turned squares make corners, so it stands until it's hit." : "Another row on top, just stacked."));
  crashWall(b, ["blue", "orange", "purple", "red"], at(3.4, -3.8), "N", 2, 4, (r) => (r === 0 ? "A second stack: two squares in a row." : "Another row on top, just stacked."));
  crushCar(b, "red", 0.4, -5.4, "a crush car in the back left corner");
  crushCar(b, "green", 2, -5.4, "a crush car beside it");
  crushCar(b, "blue", 4.7, -1.8, "a crush car by the right wall");
  crushCar(b, "purple", 0.4, -1.8, "a crush car by the left wall");
  dominoes(b, ["yellow", "green"], at(2.2, -1.8), "E", 2, "Between the two cars at the front, stand two squares up, two squares apart: dominoes.");
  pylon(b, ["red"], "green", -3.5, -8, 1, "a corner cone, back left");
  pylon(b, ["blue"], "orange", 8.5, -8, 1, "a corner cone, back right");
  pylon(b, ["yellow"], "red", -3.5, 2, 1, "a corner cone, front left");
  pylon(b, ["orange"], "blue", 8.5, 2, 1, "a corner cone, front right");
  b.route([{ to: [-5.9, 0, -3.5] }, "ramp-1", { jump: "wall-1" }, { through: "wall-1" }, { to: [3, 0, -2.4] }, { to: [0.9, 0, -2.4] }, { through: "car-4" }, { through: "dominoes-1" }, { through: "car-3" }, { through: "wall-2" }, { through: "car-2" }, { through: "car-1" }]);
  return truck(b, { id: "truck-rollover-pit", title: "Rollover pit", age: "d", done: "Over the wall, into the pit, and smash! Stacks flying everywhere." });
}

/** A train piece (role crash): an open wagon `len` squares long and `h` high on the 1-wide track already laid at z0: a
    front row with a square turned at each end (the kit's crashWall), then the back row between the ends. */
function wagon(b: Builder, colours: Colour[], x: number, z0: number, len: number, h: number, name: string, own = true) {
  const start = b.placed.length;
  crashWall(b, colours, at(x, z0 + 1), "N", len, h, (r) => (r === 0 ? `For ${name}, stand ${len} squares along the front edge of the track, with a square turned back at each end.` : `Another row on top, just stacked: ${r + 1} high.`), false);
  for (let r = 0; r < h; r++) {
    for (let i = 0; i < len; i++) b.add("square", colours[(r + i + 1) % colours.length], [x + i, r, z0], [0, 0], "crash");
    b.step(r === 0 ? `Stand ${len} squares along the back edge, between the turned ones.` : `Another row on top, ${r + 1} high.`);
  }
  if (own) b.crash("wall", start);
}

function trainYard(): Project {
  const b = new Builder();
  const top = ramp(b, "red", at(0, 0), "N", 3, { big: true, topTower: true, support: "blue", say: "Lean three big red squares up, end to end, each resting on the last and on the towers." });
  why(b, "A big square rises a whole square, so every join sits on a tower. Nothing hangs in the air.");
  lane(b, ["green", "yellow"], at(0, 2), "N", 2, 2, "Lay four squares flat in front of the ramp, for the run-up.");
  const tz = R6(top.z - 1 - 3 - 1);
  // the track: eighteen squares in one lane, the floor of the whole train
  lane(b, ["blue", "blue", "purple", "purple"], at(-9, tz), "E", 8, 1, "Far to the left, past the ramp, lay eight squares flat in one lane. The track starts here.");
  lane(b, ["blue", "blue", "purple", "purple"], at(-1, tz), "E", 8, 1, "Carry the track on, eight more squares in the same lane.");
  lane(b, ["blue", "blue", "purple", "purple"], at(7, tz), "E", 2, 1, "Two more squares. The track is eighteen long.");
  const engine = b.placed.length;
  wagon(b, ["red", "orange", "yellow"], -9, tz, 3, 3, "the engine", false);
  why(b, "The turned squares make corners, so the engine stands until it's hit.");
  const roofFrom = b.placed.length;
  for (let k = 0; k < 3; k++) b.lid("square", "purple", -9 + k, 3, tz);
  for (let i = roofFrom; i < b.placed.length; i++) b.placed[i].role = "crash";
  b.step("Three squares flat across the top of the engine: its roof.");
  b.crash("wall", engine);
  wagon(b, ["green", "blue", "purple"], -5, tz, 4, 2, "the first wagon");
  wagon(b, ["orange", "red", "yellow"], 0, tz, 4, 2, "the second wagon");
  wagon(b, ["purple", "green", "blue"], 5, tz, 4, 2, "the third wagon");
  ramp(b, "orange", at(2, R6(tz - 2 - Math.sqrt(3))), "S", 1, { big: true, topTower: true, support: "yellow", say: "On the far side of the train, a square away, lean a big square up onto its ring. The landing." });
  crushCar(b, "blue", 0.5, R6(tz - 5.6), "a crush car where the trucks land");
  crushCar(b, "red", 0.5, R6(tz - 7.2), "another to flatten");
  // over the whole train and onto the landing, crunch the cars, then back across the train, wagon by wagon, side on (a truck driving along the track rides between the wagons' side walls and leaves them standing)
  b.route(["lane-1", "ramp-1", { jump: "ramp-2" }, { down: "ramp-2" }, { through: "car-1" }, { through: "car-2" }, { to: [1, 0, -19] }, { to: [4, 0, -19] }, { to: [4, 0, -14.7] }, { through: "wall-4" }, { to: [11, 0, -7] }, { to: [11.5, 0, -14.7] }, { to: [5.2, 0, -14.7] }, { through: "wall-3" }, { to: [-0.5, 0, -6.8] }, { through: "wall-2" }, { to: [-5, 0, -13.5] }, { through: "wall-1" }]);
  return truck(b, { id: "truck-train-yard", title: "Train-yard crash", age: "d", done: "Up the ramp, over the whole train, and crunch! The train yard will never be the same." });
}

/** One end of a bridge: a ring of squares, two wide and one deep, `h` high, at (x0, z0). */
function bridgePost(b: Builder, colours: Colour[], x0: number, z0: number, h: number, say: string) {
  tower(b, colours, x0, z0, 2, 1, h, null, (r) => (r === 0 ? say : `Another ring on top: ${r + 1} high.`));
}

/** A bridge deck: a big square flat on two posts that stand two squares apart; then a lid of squares on each post. */
function deck(b: Builder, colour: Colour, lids: Colour, x0: number, zNear: number, h: number, say: string) {
  const start = b.placed.length;
  b.add("square-large", colour, [x0, h, R6(zNear - 1)], [-Q, 0]);
  b.step(say);
  for (const z of [zNear, R6(zNear - 3)]) for (let x = 0; x < 2; x++) b.lid("square", lids, x0 + x, h, R6(z - 1));
  b.step("Four squares flat on top of the two posts, two on each, to join up with the big square.");
  b.deck(null, b.since(start), "N");
}

function bridges(): Project {
  const b = new Builder();
  lane(b, ["green", "yellow"], at(0, 2), "N", 1, 2, "Lay two squares flat side by side for the run-up.");
  const top = ramp(b, "red", at(0, 0), "N", 4, { big: true, topTower: true, support: "blue", say: "Lean four big red squares up, end to end, each resting on the last and on the towers, to the first bridge." });
  // each bridge is 4 long: front post, a big square across, back post; then a gap of 3
  const zA = top.z;
  const zB = R6(zA - 7);
  const zC = R6(zB - 7);
  bridgePost(b, ["purple", "orange", "yellow", "green"], 0, R6(zA - 4), 4, "At the far end of the first bridge, stand a ring of six squares, two wide. The back post.");
  deck(b, "yellow", "purple", 0, zA, 4, "Lay a big square flat across the two posts. The first bridge: four squares up.");
  why(b, "The deck rests on two opposite walls, so it can't tip into a corner.");
  bridgePost(b, ["blue", "purple", "red"], 0, R6(zB - 1), 3, "Three squares past the first bridge, stand a ring of six squares, two wide. The second bridge starts here.");
  bridgePost(b, ["orange", "yellow", "green"], 0, R6(zB - 4), 3, "At the far end, another ring of six. The back post.");
  deck(b, "green", "blue", 0, zB, 3, "A big square flat across the two posts. The second bridge: three squares up.");
  bridgePost(b, ["yellow", "green"], 0, R6(zC - 1), 2, "Three squares on, a ring of six, two high. The third bridge starts here.");
  bridgePost(b, ["red", "orange"], 0, R6(zC - 4), 2, "At the far end, another ring of six, two high.");
  deck(b, "orange", "red", 0, zC, 2, "A big square flat across the two posts. The third bridge: two squares up.");
  why(b, "Each post is no more than four times as high as it is wide, so it stands firm.");
  const zEnd = R6(zC - 4);
  ramp(b, "purple", at(2, R6(zEnd - 2 * Math.sqrt(3))), "S", 2, { big: true, say: "Lean two big squares up from the table, coming towards the bridge, onto the back post. The way down." });
  lane(b, ["green", "yellow"], at(0, R6(zEnd - 2 * Math.sqrt(3))), "N", 2, 2, "At the bottom of the way down, lay four squares flat.");
  crushCar(b, "red", 0.5, R6(zA - 6), "a car under the first jump", true);
  crashWall(b, ["red", "yellow", "blue"], at(0.2, R6(zEnd - 2 * Math.sqrt(3) - 5)), "N", 2, 2, (r) => (r === 0 ? "At the very end, stand two squares in a row. A wall to smash." : "Another row on top, just stacked."));
  pylon(b, ["red"], "green", -3, 0, 1, "a cone by the start of the run");
  pylon(b, ["blue"], "orange", 4.5, 0, 1, "a cone on the other side");
  b.route(["lane-1", { to: [1, 0, 0] }, "ramp-1", "deck-1", { jump: "deck-2" }, "deck-2", { jump: "deck-3" }, "deck-3", { down: "ramp-2" }, "lane-2", { through: "wall-1" }]);
  return truck(b, { id: "truck-bridge-to-bridge", title: "Bridge-to-bridge", age: "d", done: "Over one bridge, across the gap, over the next, and down! Which bridge was the scariest?" });
}

function arena(): Project {
  const b = new Builder();
  const lip = R6(4 * Math.sqrt(3)); // the mega ramp's lip, and the tower under it
  // the start tower: 2 × 2, eight high, a big square on top, two squares east of the ramp's tower
  const tx = R6(lip + 1 + 2);
  tower(b, ["red", "orange", "yellow", "green", "blue", "purple", "red", "orange"], tx, 0, 2, 2, 8, null, (r) => (r === 0 ? "Stand a ring of eight squares, two by two, on the right. The start tower begins here." : `Another ring on top: ${r + 1} squares high.`));
  why(b, "A tower can be four times as tall as it is wide: two across lets this one stand eight high.");
  const start = b.add("square-large", "purple", [tx, 8, 2], [-Q, 0]);
  b.step("A big square flat on top: the start deck, eight squares up.");
  b.deck("start", [start], "W");
  ramp(b, "red", at(0, 0), "E", 4, { big: true, topTower: true, support: "blue", say: "Lean four big red squares up, end to end, each resting on a tower, to the tall tower under the lip. The mega ramp!" });
  why(b, "A big square rises a whole square, so every join sits on a tower. Nothing hangs in the air.");
  for (let i = 0; i < 5; i++) b.wallX("square-large", "purple", -9 + 2 * i, 0, -3);
  b.step("Along the back, stand five big squares edge to edge. The arena wall.");
  for (let i = 0; i < 3; i++) b.wallZ("square-large", "purple", -9, 0, -3 + 2 * i);
  b.step("Turn the corner: three big squares down the left side.");
  why(b, "The corner braces both walls, so they stand.");
  kicker(b, "orange", at(0, 2), "W", { big: true, support: "yellow", say: "At the foot of the mega ramp, lean a big square up onto its ring. The jump!" });
  ramp(b, "orange", at(R6(-2 * Math.sqrt(3) - 1 - 2 - 1), 0), "E", 1, { big: true, topTower: true, support: "yellow", say: "Past a gap of two squares, lean the landing ramp up onto its ring." });
  crushCar(b, "red", -8, -2.4, "a crush car by the back wall");
  crushCar(b, "green", -5.2, -2.4, "another beside it");
  crushCar(b, "blue", -3, 2.6, "a third by the jump");
  pylon(b, ["red"], "green", -10.5, -5.5, 1, "a corner cone, back left");
  pylon(b, ["blue"], "orange", -10.5, 4.5, 1, "a corner cone, front left");
  pylon(b, ["yellow"], "red", 12.5, -5.5, 1, "a corner cone, back right");
  pylon(b, ["orange"], "blue", 12.5, 4.5, 1, "a corner cone, front right");
  b.route(["start", { jump: "ramp-1" }, { down: "ramp-1" }, "kicker-1", { jump: "ramp-2" }, { down: "ramp-2" }, { through: "car-1" }, { through: "car-2" }, { to: [-3.73, 0, -0.9] }, { to: [-3.73, 0, 2.4] }, { through: "car-3" }]);
  return truck(b, { id: "truck-ultimate-arena", title: "The ultimate arena", age: "d", done: "Off the eight-high tower, down the mega ramp, over the jump and into the crush cars. The crowd goes wild!" });
}

function canyon(): Project {
  const b = new Builder();
  // the high cliff: 2 × 2, seven high, a big square on top. The truck starts here and flies the canyon.
  tower(b, ["purple", "orange", "yellow", "green", "blue", "red", "purple"], 0, 0, 2, 2, 7, null, (r) => (r === 0 ? "Stand a ring of eight squares, two by two, at the front. The high cliff." : `Another ring on top: ${r + 1} high.`));
  why(b, "A tower can be four times as tall as it is wide: two across lets this one stand eight high.");
  const cliff = b.add("square-large", "green", [0, 7, 2], [-Q, 0]);
  b.step("A big green square flat on top of the cliff: the take-off, seven squares up. The truck starts here.");
  b.deck("cliff", [cliff], "N");
  // the far side: a ramp whose lip is four high, five squares away
  const lipZ = -6;
  ramp(b, "red", at(2, R6(lipZ - 4 * Math.sqrt(3))), "S", 4, { big: true, topTower: true, support: "blue", say: "Across the canyon, five squares from the cliff, lean four big red squares up towards you, each resting on a tower. The landing slope." });
  why(b, "A big square rises a whole square, so every join sits on a tower. Nothing hangs in the air.");
  const zs = -6;
  for (const [x, turn, col] of [[-4.5, -4.5, "purple"], [6.5, 4.5, "orange"]] as const) {
    for (let i = 0; i < 3; i++) b.wallZ("square-large", col, x, 0, zs + 2 * i);
    b.wallX("square-large", col, turn, 0, zs);
    b.step(x < 0 ? "On the left of the canyon, stand three big squares in a line, and one across the end. A rock wall." : "The same on the right, facing it. Now the canyon has walls.");
    if (x < 0) why(b, "The turn at the end braces the wall: it can't fold flat.");
  }
  lane(b, ["green", "yellow"], at(0, R6(lipZ - 4 * Math.sqrt(3))), "N", 2, 2, "At the bottom of the landing slope, lay four squares flat for the trucks to roll out on.");
  crushCar(b, "red", 0.4, -1.9, "a car at the bottom of the canyon", true);
  crushCar(b, "blue", 0.4, -3.6, "a second car, in case you fall short", true);
  crushCar(b, "green", 0.5, R6(lipZ - 4 * Math.sqrt(3) - 4.5), "a third at the end of the run");
  dominoes(b, ["red", "yellow", "blue"], at(-1.5, R6(lipZ - 4 * Math.sqrt(3) - 7.5)), "E", 3, "Beyond it, stand three squares up, a square apart: dominoes.");
  b.route(["cliff", { jump: "ramp-1" }, { down: "ramp-1" }, "lane-1", { through: "car-1" }, { to: [-3.5, 0, -19.93] }, { through: "dominoes-1" }]);
  return truck(b, { id: "truck-canyon-jump", title: "Canyon jump", age: "d", done: "Off the high cliff, over the canyon, and onto the landing slope. A seven-square leap!" });
}

export const TRUCKS_6: Project[] = [spiral(), canyon(), pit(), trainYard(), bridges(), arena()];
