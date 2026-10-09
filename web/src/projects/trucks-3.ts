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

/** Local helper: a ring of squares to be knocked down (role crash). */
function crashRing(b: Builder, colour: Colour, x: number, z: number, y: number, say: string) {
  const from = b.placed.length;
  b.room(colour, x, z, 1, 1, y);
  for (let i = from; i < b.placed.length; i++) b.placed[i].role = "crash";
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
  const z0 = r6(-6 * RUN);
  const h = [3, 2, 1]; // the heights of the three steps
  const cross = [3, 3, 2, 1]; // the riser across the front of each step (and the last)
  const zb = (j: number) => z0 - j;
  for (let y = 0; y < 3; y++) {
    for (let j = 0; j < 4; j++) {
      if (cross[j] > y) b.wallX("square", y === 0 ? "blue" : y === 1 ? "purple" : "red", 0, y, zb(j));
      if (j < 3 && h[j] > y) {
        b.wallZ("square", y === 0 ? "blue" : y === 1 ? "purple" : "red", 0, y, zb(j) - 1);
        b.wallZ("square", y === 0 ? "blue" : y === 1 ? "purple" : "red", 1, y, zb(j) - 1);
      }
    }
    b.chunk(4, [y === 0 ? "Stand squares in a tidy staircase, four at a time: a wall across, and a wall down each side." : y === 1 ? "The second row goes on top, stepping down as before." : "The top row, just by the start.", "Keep going, edge to edge."]);
  }
  const decks = b.placed.length;
  for (let i = 0; i < 3; i++) b.lid("square", ["green", "yellow", "orange"][i] as Colour, 0, h[i], zb(i) - 1);
  b.step("Lay a square flat on top of each step: three decks, stepping down.");
  // the top step is a deck; the truck bumps down the other two, whose noses make a slope as steep as the stairs
  b.deck("top-step", [decks], "N");
  b.feature({ name: "stairs", kind: "ramp", dir: "N", tiles: [decks + 1, decks + 2], surface: { kind: "slope", from: [0.5, 3, r6(zb(0) - 1)], to: [0.5, 1, r6(zb(2) - 1)], width: 1 } });
  ramp(b, "red", at(0, 0), "N", 3, { support: "yellow", say: "Lean the ramp up from the table, square by square, onto each tower, to the top step." });
  const mat = b.add("square-large", "green", [-0.5, 0, zb(3)], [-Q, 0]);
  b.step("At the bottom of the stairs, a big green square flat on the table. A soft landing.");
  b.deck("mat", [mat], "N", "lane");
  crushCar(b, "red", -0.5, zb(3) - 4, "a crush car beyond the landing");
  bigWall(b, "blue", -2, zb(3) - 6.5, 2, "Behind the car, stand two big squares side by side. A big wall to smash.");
  b.route(["ramp-1", "top-step", "stairs", { jump: "mat" }, "mat", { through: "car-1" }, { through: "wall-1" }]);
  return truck(b, { id: "truck-stair-step-drops", title: "Stair-step drops", age: "b", done: "Bump, bump, bump, down the stairs! Three drops, then a crash at the bottom." });
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
  const left = b.placed.length;
  crashRing(b, "purple", -2, -8, 0, "Two squares past the kicker, on the left, stand four squares in a ring. A castle tower.");
  crashRing(b, "purple", -2, -8, 1, "Another ring on top of it: two high.");
  b.roof("red", -2, -8, 2);
  b.step("Lean four tall red triangles together on top, tips touching. A pointy turret!");
  b.crash("wall", left);
  const right = b.placed.length;
  crashRing(b, "purple", 3, -8, 0, "On the right, the same again: four squares in a ring. The second tower.");
  crashRing(b, "purple", 3, -8, 1, "Another ring on top: two high.");
  b.roof("red", 3, -8, 2);
  b.step("Four tall red triangles on top, tips touching. The second turret!");
  b.crash("wall", right);
  const rows = b.placed.length;
  for (let r = 0; r < 2; r++) {
    for (let i = 0; i < 4; i++) b.add("square", (["blue", "green", "yellow", "orange"] as Colour[])[(r + i) % 4], [-1 + i, r, -7], [0, 0], "crash");
    b.step(r === 0 ? "Between the towers, stand four squares side by side, edge to edge. The castle wall." : "Another row on top, just stacked.");
  }
  b.crash("wall", rows);
  bigWall(b, "blue", 0, -11, 2, "Behind the wall, stand two big squares side by side. The castle keep.");
  b.route(["lane-1", "kicker-1", { jump: "lane-2" }, { through: "wall-3" }, { through: "wall-4" }, { to: [5, 0, -11.9] }, { to: [5, 0, -7.5] }, { through: "wall-2" }, { through: "wall-1" }]);
  return truck(b, { id: "truck-crash-castle", title: "Crash castle", age: "b", done: "Launch! Right over the wall and smash. The crash castle never stood a chance." });
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
