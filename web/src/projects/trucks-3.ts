/* Monster trucks (2.8), part 3: seven builds for ages 6–8 (b), 30–90 tiles each, from one or two Magna-Tiles 100 sets.
   Kit: track-kit.ts; `truck` from trucks-1.ts. Directions: N away from the child, S towards them, E right, W left. */
import type { Colour } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder } from "./helpers";
import { crashWall, crushCar, dominoes, kicker, lane, ramp, tower, tunnel, type At, type Dir } from "./track-kit";
import { truck } from "./trucks-1";

const at = (x: number, z: number, y = 0): At => ({ x, y, z });
const Q = Math.PI / 2;
const RUN = Math.cos(Math.PI / 6);
const r6 = (v: number) => Math.round(v * 1e6) / 1e6;

/** Local helper (kit candidate): a road of flat squares on the table, w × d from the corner (x0, z0), at most four
    squares a step. */
function road(b: Builder, colours: Colour[], x0: number, z0: number, w: number, d: number, says: string[], dir: Dir = "N") {
  const from = b.placed.length;
  let i = 0;
  for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) b.lid("square", colours[i++ % colours.length], x0 + x, 0, z0 + z);
  b.chunk(4, says);
  b.deck(null, b.since(from), dir, "lane");
}

/** Local helper (kit candidate): a traffic cone: a ring of four squares with four tall triangles leaning on top. */
function cone(b: Builder, ring: Colour, top: Colour, x: number, z: number, name: string) {
  b.room(ring, x, z, 1, 1, 0);
  b.step(`Stand four ${ring} squares in a ring, ${name}.`);
  b.roof(top, x, z, 1);
  b.step(`Lean four tall ${top} triangles together on top, tips touching. A cone!`);
}

/** Local helper: a ring of four squares at height y, one step. */
function ring(b: Builder, colour: Colour, x: number, z: number, y: number, say: string) {
  b.room(colour, x, z, 1, 1, y);
  b.step(say);
}

/** Local helper: standing big squares in a row along x (role crash), one step. */
function bigWall(b: Builder, colour: Colour, x: number, z: number, n: number, say: string) {
  const from = b.placed.length;
  for (let i = 0; i < n; i++) b.add("square-large", colour, [x + 2 * i, 0, z], [0, 0], "crash");
  b.step(say);
  b.crash("wall", from);
}

function dragStrip(): Project {
  const b = new Builder();
  const zd = r6(4 * RUN);
  tower(b, ["blue", "purple"], 0, zd, 2, 2, 2, "yellow", (r) => (r === 0 ? "Near you, stand eight squares in a ring, two by two. The start tower." : "Another ring on top: two high."));
  ramp(b, "red", at(2, 0), "S", 2, { big: true, say: "Lean two big red squares up from the table to the top of the tower, end to end. The start ramp." });
  road(b, ["green", "yellow"], 0, -8, 2, 8, ["Lay four squares flat at the bottom of the ramp, two lanes side by side.", "Four more, going away from you.", "Keep going: four more squares in the two lanes.", "The last four. A long strip, eight squares to the finish!"]);
  cone(b, "orange", "yellow", -2, -9, "left of the finish");
  cone(b, "orange", "yellow", 3, -9, "right of the finish");
  crashWall(b, ["red", "yellow", "blue"], at(0, -10), "N", 2, 3, (r) => (r === 0 ? "Past the finish, stand two squares side by side. The crash wall." : "Another row on top, just stacked."));
  b.route(["deck-1", { down: "ramp-1" }, "lane-1", { through: "wall-1" }]);
  return truck(b, { id: "truck-drag-strip", title: "Two-lane drag strip", age: "b", done: "Ready, set, go! Two trucks down the ramp and along the strip. Who hits the wall first?" });
}

function bigTunnel(): Project {
  const b = new Builder();
  road(b, ["yellow", "green"], 0, -3, 2, 3, ["Lay four squares flat on the table, two lanes side by side.", "Two more squares to finish the road."]);
  cone(b, "orange", "yellow", -2, -1, "left of the road");
  cone(b, "orange", "yellow", 3, -1, "right of the road");
  tunnel(b, "red", "blue", at(0, -3), "N", 2);
  kicker(b, "purple", at(0, -7), "N", { big: true, support: "yellow", say: "Where the tunnel ends, lean a big square up onto the ring. The kicker!" });
  lane(b, ["yellow", "green"], at(0, r6(-7 - 2 * RUN - 1)), "N", 2, 2, "Past the kicker, lay four squares flat on the table. That's where the truck lands.");
  crushCar(b, "red", -0.5, -13, "a crush car, left");
  crushCar(b, "green", 1.5, -13, "a crush car, right");
  crashWall(b, ["blue", "orange"], at(0, -15), "N", 2, 2, (r) => (r === 0 ? "Behind the cars, stand two squares side by side. A wall to smash." : "Two more on top, just stacked."));
  b.route(["lane-1", "tunnel-1", "kicker-1", { jump: "lane-2" }, { through: "car-1" }, { through: "car-2" }, { through: "wall-1" }]);
  return truck(b, { id: "truck-big-tunnel", title: "The big tunnel", age: "b", done: "Into the dark, out the end, off the kicker and crunch! Two cars flat." });
}

function stairDrops(): Project {
  const b = new Builder();
  // the way up: three big squares to a tower under the lip, three squares high
  const top = ramp(b, "red", at(0, 0), "N", 3, { big: true, topTower: true, support: "yellow", say: "Lean three big red squares up from the table, end to end, each resting on a tower, to the top step." });
  b.lid("square", "green", 0, 3, top.z - 1);
  b.lid("square", "green", 1, 3, top.z - 1);
  b.step("Two green squares flat on top of the last tower: the top step. The truck starts its drops from here.");
  b.deck("top-step", b.since(b.placed.length - 2), "N");
  // two more steps, each a square lower and a square further on, with air between: a truck hops from one to the next
  const steps: { name: string; h: number; cols: Colour[]; deck: Colour; word: string }[] = [
    { name: "step-2", h: 2, cols: ["blue", "purple"], deck: "orange", word: "second" },
    { name: "step-3", h: 1, cols: ["purple"], deck: "yellow", word: "third" },
  ];
  steps.forEach((st, i) => {
    const z0 = r6(top.z - 4 - 3 * i);
    tower(b, st.cols, 0, z0, 2, 2, st.h, null, (r) => (r === 0 ? `A square past the last step, stand a ring of eight squares, two by two: the ${st.word} step.` : `Another ring on top: ${r + 1} high.`));
    const lid = b.add("square-large", st.deck, [0, st.h, z0 + 2], [-Q, 0]);
    b.step(`A big ${st.deck} square flat on top: the ${st.word} step, a square lower.`);
    b.deck(st.name, [lid], "N");
  });
  const zm = r6(top.z - 10);
  const mat = b.add("square-large", "green", [0, 0, zm + 2], [-Q, 0]);
  b.step("A square past the last step, a big green square flat on the table. A soft landing.");
  b.deck("mat", [mat], "N", "lane");
  crushCar(b, "red", 0.5, zm - 3, "a crush car beyond the landing");
  bigWall(b, "blue", -1, zm - 5.5, 2, "Behind the car, stand two big squares side by side. A big wall to smash.");
  b.route(["ramp-1", "top-step", { jump: "step-2" }, "step-2", { jump: "step-3" }, "step-3", { jump: "mat" }, "mat", { through: "car-1" }, { through: "wall-1" }]);
  return truck(b, { id: "truck-stair-step-drops", title: "Stair-step drops", age: "b", done: "Hop, hop, hop, down the stairs! Three drops, then a crash at the bottom." });
}

function monsterGarage(): Project {
  const b = new Builder();
  b.wallX("square-large", "red", 0, 0, 0);
  b.wallZ("square-large", "orange", 0, 0, 0);
  b.wallZ("square-large", "orange", 2, 0, 0);
  b.step("Stand a big red square for the back wall. Stand a big orange square at each end of it, coming towards you. The garage walls.");
  crushCar(b, "yellow", 0.5, 0.5, "a crush car inside the garage");
  const roof = b.add("square-large", "blue", [0, 2, 2], [-Q, 0]);
  b.step("Lay a big blue square flat across the two side walls. The garage roof.");
  b.deck("roof", [roof], "W");
  ramp(b, "purple", at(r6(2 + 4 * RUN), 2), "W", 2, { big: true, say: "At the right-hand side, lean two big purple squares up to the roof, end to end. A ramp onto the roof!" });
  road(b, ["yellow", "green"], 0, 2, 2, 4, ["In front of the garage door, lay four squares flat.", "Four more, for the road in."]);
  crushCar(b, "green", 0.5, 7, "a car parked in the street");
  road(b, ["green", "yellow"], -3, 0, 3, 2, ["On the left, lay six squares flat on the table. Drive off the roof and drop onto them!", "The other two."], "W");
  crushCar(b, "blue", -5.5, 0.5, "a crush car at the end of the drop");
  b.route(["ramp-1", "roof", { jump: "lane-2" }, "lane-2", { through: "car-3" }, { to: [-3, 0, 9] }, { to: [1, 0, 9] }, { through: "car-2" }, { to: [1, 0, 6] }, "lane-1", { through: "car-1" }]);
  return truck(b, { id: "truck-monster-garage", title: "Monster garage", age: "b", done: "In the door and smash the cars, or up the roof ramp and drop. The Monster garage is open!" });
}

function bounceBridge(): Project {
  const b = new Builder();
  const top = 0; // the south face of the near tower
  tower(b, ["blue", "purple"], 0, top - 1, 2, 1, 2, "yellow", (r) => (r === 0 ? "Stand six squares in a ring, two wide. The near tower." : "Another ring on top: two high."));
  tower(b, ["blue", "purple"], 0, top - 4, 2, 1, 2, "yellow", (r) => (r === 0 ? "Leave a gap of two squares beyond it, and stand another ring of six. The far tower." : "Another ring on top: two high."));
  const bridge = b.add("square-large", "red", [0, 2, top - 1], [-Q, 0]);
  b.step("Lay a big red square flat across the gap, from tower to tower. The bridge!");
  b.deck("bridge", [bridge], "N");
  ramp(b, "green", at(0, r6(top + 4 * RUN)), "N", 2, { big: true, say: "In front of the near tower, lean two big green squares up to its top, end to end. The way up." });
  ramp(b, "green", at(2, r6(top - 4 - 4 * RUN)), "S", 2, { big: true, say: "Beyond the far tower, lean two big green squares up to its top, the other way. The way down." });
  const zc = r6(top - 4 - 4 * RUN - 2);
  crushCar(b, "red", -0.5, zc, "a crush car at the bottom, left");
  crushCar(b, "orange", 1.5, zc, "a crush car at the bottom, right");
  cone(b, "orange", "yellow", -2, 2, "left of the way up");
  cone(b, "orange", "yellow", 3, 2, "right of the way up");
  b.route(["ramp-1", "deck-1", "bridge", "deck-2", { down: "ramp-2" }, { through: "car-1" }, { through: "car-2" }]);
  return truck(b, { id: "truck-bounce-bridge", title: "Bounce bridge", age: "b", done: "Up, across and bounce! Down the far ramp and into the cars." });
}

function crashCastle(): Project {
  const b = new Builder();
  road(b, ["green", "yellow"], 0, -2, 2, 2, ["Lay four squares flat, two lanes side by side. The road to the castle."]);
  kicker(b, "orange", at(0, -2), "N", { big: true, support: "yellow", say: "Lean a big orange square up onto the ring. A kicker to launch the trucks at the castle!" });
  lane(b, ["blue", "orange"], at(0, r6(-2 - 2 * RUN - 1)), "N", 2, 2, "Past the kicker, lay four squares flat on the table. That's where the trucks land.");
  ring(b, "purple", -2, -8, 0, "Two squares past the kicker, on the left, stand four squares in a ring. A castle tower.");
  ring(b, "purple", -2, -8, 1, "Another ring on top of it: two high.");
  b.lowRoof("red", -2, -8, 2);
  b.step("Lean four red triangles together on top, tips touching. A pointy turret!");
  ring(b, "purple", 2, -8, 0, "On the right, the same again: four squares in a ring. The second tower.");
  ring(b, "purple", 2, -8, 1, "Another ring on top: two high.");
  b.lowRoof("red", 2, -8, 2);
  b.step("Four red triangles on top, tips touching. The second turret!");
  const rows = b.placed.length;
  for (let r = 0; r < 2; r++) {
    for (let i = 0; i < 3; i++) b.add("square", (["blue", "green", "yellow", "orange"] as Colour[])[(r + i) % 4], [-1 + i, r, -7], [0, 0], "crash");
    b.step(r === 0 ? "Between the towers, stand three squares side by side, edge to edge. The castle wall." : "Another row on top, just stacked.");
  }
  b.crash("wall", rows);
  bigWall(b, "blue", 0, -11, 2, "Behind the wall, stand two big squares side by side. The castle keep.");
  // the towers stand: a roof (a pyramid, role roof) is held still in the truck run, so it would pin a tower that was meant to fall
  b.route(["lane-1", "kicker-1", { jump: "lane-2" }, { through: "wall-1" }, { through: "wall-2" }]);
  return truck(b, { id: "truck-crash-castle", title: "Crash castle", age: "b", done: "Launch! Over the gap and smash. Down came the wall and the keep; only the towers are left standing." });
}

function dominoRun(): Project {
  const b = new Builder();
  const zd = r6(4 * RUN);
  tower(b, ["blue", "purple"], 0, zd, 2, 1, 2, "yellow", (r) => (r === 0 ? "Stand six squares in a ring, two wide. The start tower." : "Another ring on top: two high."));
  ramp(b, "red", at(2, 0), "S", 2, { big: true, say: "Lean two big red squares down from the top of the tower to the table, end to end. The start ramp." });
  type V = [number, number];
  const D: Record<Dir, V> = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
  let c: V = [1, -1.5];
  let prev: Dir | null = null;
  const segs: [Dir, string][] = [
    ["N", "At the bottom of the ramp, stand four squares up in a line going away from you, one square apart."],
    ["E", "Turn the corner: four more squares standing up, one square apart, going to the right."],
    ["S", "Turn again, towards you: four more squares standing, a square apart."],
  ];
  const cols: Colour[] = ["red", "yellow", "green", "blue", "purple", "orange"];
  let k = 0;
  for (const [dir, say] of segs) {
    if (prev) c = [c[0] + D[prev][0] + 2 * D[dir][0], c[1] + D[prev][1] + 2 * D[dir][1]];
    const p: V = dir === "N" ? [c[0] - 0.5, c[1]] : dir === "E" ? [c[0], c[1] - 0.5] : dir === "S" ? [c[0] + 0.5, c[1]] : [c[0], c[1] + 0.5];
    dominoes(b, [cols[k % 6], cols[(k + 1) % 6]], at(p[0], p[1]), dir, 4, say);
    k += 2;
    c = [c[0] + 6 * D[dir][0], c[1] + 6 * D[dir][1]];
    prev = dir;
  }
  crushCar(b, "red", c[0] - 0.5, c[1] + 2.5, "a crush car where the run ends");
  b.route(["deck-1", { down: "ramp-1" }, { through: "dominoes-1" }, { through: "dominoes-2" }, { through: "dominoes-3" }, { through: "car-1" }]);
  return truck(b, { id: "truck-domino-run", title: "Domino run", age: "b", done: "Down the ramp, tap, and click-clack-clack, the whole run falls. The last one flattens the car!" });
}

export const TRUCKS_3: Project[] = [dragStrip(), bigTunnel(), stairDrops(), monsterGarage(), bounceBridge(), crashCastle(), dominoRun()];
