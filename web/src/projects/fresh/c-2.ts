/* 2.3: builds for 9 and 10 (part two), 30 to 90 tiles, each from one 100-piece set: a triangle truss bridge, a ringed
   planet, a snowflake, a honeycomb hotel, a butterfly, pancakes of hexagons. */
import { EQ_H, type Colour } from "../../engine/catalog";
import type { Project } from "../../engine/types";
import type { Builder } from "../helpers";
import { Studio, hexagon, lattice, polygon, star, triOn, turtle, type P, type Tri } from "../studio";
import { corners } from "./parts";

const L = lattice(0, 0);
const tri = (x: number, z: number): Tri => [[x, z], [x + 1, z], [x + 0.5, z - EQ_H]];
/** The unit normal to the side p → q, on the side away from the shape's middle c. */
function outward(c: P, p: P, q: P): P {
  const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const n: P = [-(q[1] - p[1]) / d, (q[0] - p[0]) / d];
  const m: P = [(p[0] + q[0]) / 2 - c[0], (p[1] + q[1]) / 2 - c[1]];
  return n[0] * m[0] + n[1] * m[1] > 0 ? n : [-n[0], -n[1]];
}
const plus = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];

function moonHotDogs(): Project {
  const s = new Studio();
  s.pad("the moon dust", 0.2, 0.3, "purple", "a big square");
  s.pad("more moon dust", 2.4, 0.3, "purple", "a big square");
  const h = hexagon(L, 1, 1);
  s.walls("the hot dog stand", h.corners, 3, ["red", "yellow"], { closed: true, gap: 0, what: "in a hexagon" });
  s.triLid("the hot dog stand", h.tris, 3, "yellow");
  s.tetra("the ketchup", h.tris[0], 3, "red");
  s.tetra("the mustard", h.tris[3], 3, "yellow");
  s.tower("the delivery rocket", 4, -2, 4, ["blue", "green"], { cap: "tall", capColour: "red" });
  s.fins("the delivery rocket", corners(4, -2), "orange");
  return s.build({ id: "moon-hot-dog-stand", title: "The Hot Dog Stand on the Moon", theme: "space", age: "c", done: "You built the Hot Dog Stand on the Moon! The hot dogs float. Catch one quick, before it goes into orbit." });
}

function mostlyNeck(): Project {
  const s = new Studio();
  s.block("the giraffe", 0, 0, 3, 1, 1, ["yellow"], { roof: "orange" });
  s.tower("the neck", 2, 0, 5, ["yellow", "orange"], { base: 1, cap: "lid", capColour: "yellow" });
  s.fins("the legs", corners(0, 0, 3, 1), "yellow", "legs");
  return s.build({ id: "mostly-neck-giraffe", title: "The Giraffe Who Is Mostly Neck", theme: "animals", age: "c", done: "You built the giraffe! It is mostly neck. It can see what is for dinner three streets away." });
}

function livingRooms(): Project {
  const s = new Studio();
  const o = polygon([0, 0], 8);
  s.walls("the octagon house", o, 4, ["green", "blue"], { closed: true, gap: 0, what: "in an octagon" });
  s.tower("the fireplace", 0, -1.707107, 3, ["orange", "red"], { cap: "low", capColour: "yellow" });
  return s.build({ id: "every-room-living-room", title: "The Octagon House Where Every Room Is the Living Room", theme: "homes", age: "c", done: "You built the Octagon House! Eight walls, one room, one sofa, and everyone wants it." });
}

function rainedIndoors(): Project {
  const s = new Studio();
  const cells: [number, number][] = [];
  for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) cells.push([x, z]);
  s.rug("the field", cells, "green", "a field of squares");
  [[0.2, 1.1], [1.7, 1.1], [0.2, 2.8], [1.7, 2.8]].forEach(([x, z], i) => s.tetra(`tent number ${i + 1}`, tri(x, z), 0, (["orange", "purple", "blue", "red"] as Colour[])[i]));
  const t = triOn([4, 2], [5, 2]);
  s.walls("the toilet block", t, 3, ["yellow", "blue", "yellow"], { closed: true, what: "in a triangle" });
  s.tetra("the toilet block", t, 3, "blue");
  return s.build({ id: "rained-indoors-camp", title: "The Camping Trip Where It Rained Indoors", theme: "homes", age: "c", done: "You built the campsite! It rained inside the tents. Nobody knows how. Pass the towel." });
}

function circleTrain(): Project {
  const s = new Studio();
  const track: [number, number][] = [];
  for (let x = -1; x < 10; x++) track.push([x, 0]);
  s.rug("the track", track, "purple", "a line of squares for the track");
  s.block("the engine", 0, 0, 2, 1, 2, ["red", "orange"], { roof: "red" });
  s.block("the first carriage", 3, 0, 2, 1, 1, ["blue"], { roof: "green" });
  s.block("the second carriage", 6, 0, 2, 1, 1, ["green"], { roof: "blue" });
  s.fins("the cow-catcher", [{ corner: [0, 1], out: [-1, 0] }, { corner: [0, 0], out: [-1, 0] }], "yellow", "a cow-catcher");
  return s.build({ id: "round-in-circles-train", title: "The Train That Goes Round in Circles", theme: "vehicles", age: "c", done: "You built the train! Where does it go? Round. And round. Next stop: the same stop." });
}

function spareRing(): Project {
  const s = new Studio();
  const o = polygon([0, 0], 8);
  const h = hexagon(lattice(-1, -0.341081), 1, 1);
  s.walls("the planet", h.corners, 3, ["orange", "yellow", "orange"], { closed: true, what: "in a hexagon" });
  s.triLid("the planet", h.tris, 3, "orange");
  s.tetra("the planet", h.tris[2], 3, "red");
  s.walls("the ring", o, 1, ["blue"], { closed: true, what: "in an octagon round the planet" });
  return s.build({ id: "saturns-spare-ring", title: "Saturn's Spare Ring", theme: "space", age: "c", done: "You built Saturn's spare ring! Saturn keeps it in case the first one gets lost. Space is very big." });
}

function undecidedButterfly(): Project {
  const s = new Studio();
  s.pad("the right wing", 1, 0, "yellow", "a big square wing");
  s.pad("the left wing", -2, 0, "orange", "a big square wing");
  s.rug("the lower wings", [[1, 2], [-1, 2]], "red", "a square under each wing");
  s.flats("the wing tips", [{ shape: "tri-right", colour: "purple", a: [2, 2], b: [3, 2], toward: [2, 3] }, { shape: "tri-right", colour: "purple", a: [-1, 2], b: [-2, 2], toward: [-1, 3] }], 0, "corner triangles");
  s.triLid("the wing tops", [[[1, 0], [2, 0], [1.5, -EQ_H]], [[2, 0], [3, 0], [2.5, -EQ_H]], [[-2, 0], [-1, 0], [-1.5, -EQ_H]], [[-1, 0], [0, 0], [-0.5, -EQ_H]], [[1, 3], [2, 3], [1.5, 3 + EQ_H]], [[-1, 3], [0, 3], [-0.5, 3 + EQ_H]]], 0, "green", "triangles round the wings");
  s.block("the body", 0, 0, 1, 3, 2, ["purple", "blue"], { roof: "purple" });
  s.tetra("the head", triOn([0, 3], [1, 3], -1), 0, "purple");
  return s.build({ id: "undecided-butterfly", title: "The Butterfly Who Can't Decide", theme: "animals", age: "c", done: "You built the butterfly! One wing wants to go left. One wants to go right. It is still thinking." });
}

function stubbornSnowflake(): Project {
  const s = new Studio();
  const st = star(L, 2, 2);
  s.triLid("the snowflake", st.tris, 0, (i) => (i < 6 ? "blue" : "purple"), "a star of triangles");
  const arms: { p: P; q: P; n: P }[] = [];
  for (let k = 0; k < 6; k++) {
    const p = st.corners[2 * k];
    const q = st.corners[2 * k + 1];
    arms.push({ p, q, n: outward(st.centre, p, q) });
  }
  s.flats("the arms", arms.map(({ p, q, n }) => ({ shape: "square", colour: "blue", a: p, b: q, toward: plus(p, n) })), 0, "a square on one side of each point");
  const hex = hexagon(L, 2, 2);
  s.walls("the middle", hex.corners, 2, ["purple", "blue"], { closed: true, what: "in a hexagon round the middle" });
  s.triLid("the middle", hex.tris, 2, "yellow", "a hexagon top");
  return s.build({ id: "stubborn-snowflake", title: "The Snowflake That Refused to Melt", theme: "patterns", age: "c", done: "You built the snowflake! The sun came out. The snowflake said: no thank you. It is still here." });
}

function mostlyLid(): Project {
  const s = new Studio();
  s.block("the chest", 0, 0, 3, 2, 2, ["orange", "red"], { roof: "orange" });
  s.pad("the gold coins", 0, 2.2, "yellow", "a big square of gold");
  s.pad("more gold coins", 2.2, 2.2, "yellow", "a big square of gold");
  s.tetra("the ruby", tri(3.3, 1.2), 0, "red");
  s.tetra("the emerald", tri(-1.3, 1.2), 0, "green");
  return s.build({ id: "mostly-lid-chest", title: "The Treasure Chest That Is Mostly Lid", theme: "castles", age: "c", done: "You built the treasure chest! The treasure is outside it. The lid was too pointy to open." });
}

function wobblyPancakes(): Project {
  const s = new Studio();
  const h = hexagon(L, 1, 1);
  const colours: Colour[] = ["orange", "yellow", "red"];
  for (let y = 0; y < 3; y++) {
    s.walls(`pancake number ${y + 1}`, h.corners, 1, [colours[y]], { closed: true, base: y, what: "in a hexagon" });
    s.triLid(`pancake number ${y + 1}`, h.tris, y + 1, y % 2 ? "yellow" : "orange", "a hexagon of triangles");
  }
  return s.build({ id: "wobbly-pancake-tower", title: "The Tower of Wobbly Pancakes", theme: "bridges", age: "c", done: "You built the pancake tower! Three pancakes, six bits of butter, and a great big wobble." });
}

function dragonWall(): Project {
  const s = new Studio();
  const pts = turtle([0, 0], 30, [-60, 60, -60, 60, -60, 60, -60, 60]);
  s.tower("the gate tower", -1, 0, 3, ["purple", "blue"], { cap: "tall", capColour: "red" });
  s.walls("the dragon wall", pts, 3, ["green", "green", "yellow"], { what: "in a zigzag from the tower" });
  return s.build({ id: "dragon-zigzag-wall", title: "The Great Zigzag Wall of the Dragon Kingdom", theme: "castles", age: "c", done: "You built the Great Zigzag Wall! It zigs, it zags, and the dragon sleeps on top. Shh." });
}

function trussBridge(): Project {
  const s = new Studio();
  const Q = Math.PI / 2;
  for (const z of [1, 0]) {
    const side = z ? "front" : "back";
    const up = (b: Builder, i: number) => b.wallX("tri-equilateral", z ? "red" : "orange", i, 0, z);
    const down = (b: Builder, i: number) => b.add("tri-equilateral", "yellow", [i + 0.5, EQ_H, z], [Math.PI, 0]);
    // each upside-down triangle goes in after both its neighbours, in the same step
    s.part(0, (b) => (up(b, 0), up(b, 1), down(b, 0), 3), () => `The ${side} side: stand two triangles, then one upside down between them, point on the table.`);
    s.part(0, (b) => (up(b, 2), down(b, 1), up(b, 3), down(b, 2), 4), () => `The ${side} side: keep going, up, down, up, down.`);
  }
  s.part(
    1,
    (b) => {
      for (let i = 0; i < 3; i++) b.add("square", "green", [i + 0.5, EQ_H, 1], [-Q, 0]);
      return 3;
    },
    (k, of) => (k === 0 ? "The road: lay squares flat across, from the upside-down triangles at the front to the ones at the back." : k === of - 1 ? "The road: finish it." : "The road: keep going."),
  );
  s.tower("the left tower", -1, 0, 2, ["blue", "purple"], { cap: "tall", capColour: "red" });
  s.tower("the right tower", 4, 0, 2, ["blue", "purple"], { cap: "tall", capColour: "red" });
  return s.build({ id: "triangle-truss-bridge", title: "The Bridge Made Entirely of Triangles (and Some Squares)", theme: "bridges", age: "c", done: "You built the triangle bridge! Up, down, up, down: triangles are the strongest shape. Real bridges do this too." });
}

function antPicnic(): Project {
  const s = new Studio();
  const cells: [number, number][] = [];
  for (let x = 0; x < 4; x++) for (let z = 0; z < 3; z++) cells.push([x, z]);
  s.rug("the blanket", cells, (i) => ((Math.floor(i / 3) + (i % 3)) % 2 ? "red" : "yellow"), "a checked blanket");
  s.tower("the basket", 3, 0, 2, ["orange", "yellow"], { cap: "low", capColour: "green" });
  [[0.2, 1.1], [1.6, 2.8], [0.2, 2.8]].forEach(([x, z], i) => s.tetra(`ant number ${i + 1}`, tri(x, z), 0, "purple"));
  return s.build({ id: "ant-invaded-picnic", title: "The Picnic Blanket Invaded by Ants", theme: "gardens", age: "c", done: "You built the picnic! Three ants came. Then three hundred. Then they ate the basket." });
}

function slowSpinStation(): Project {
  const s = new Studio();
  const h = hexagon(L, 1, 1);
  s.walls("the hub", h.corners, 2, ["blue", "purple"], { closed: true, what: "in a hexagon" });
  [0, 2, 4].forEach((k, i) => {
    const c = h.corners[k];
    const u: P = [c[0] - h.centre[0], c[1] - h.centre[1]];
    const arm: P[] = [c, plus(c, u), plus(plus(c, u), u)];
    s.walls(`arm number ${i + 1}`, arm, 2, ["green", "yellow"], { what: "straight out from a corner" });
  });
  s.triLid("the hub", h.tris, 2, "purple", "a hexagon top");
  s.tetra("the hub", h.tris[0], 2, "red");
  return s.build({ id: "slow-spin-station", title: "The Space Station That Spins (Slowly)", theme: "space", age: "c", done: "You built the space station! It spins so slowly that nobody has noticed yet. Not even the astronauts." });
}

function honeycombHotel(): Project {
  const s = new Studio();
  const cells = [hexagon(L, 1, 1), hexagon(L, 2, 2), hexagon(L, 3, 0), hexagon(L, 4, 1)];
  const colours: Colour[] = ["yellow", "orange", "orange", "yellow"];
  cells.forEach((h, i) => s.walls(`room number ${i + 1}`, h.corners, 2, [colours[i], "yellow"], { closed: true, what: "in a hexagon, sharing walls" }));
  cells.slice(1).forEach((h, i) => s.triLid(`room number ${i + 2}`, h.tris, 2, i % 2 ? "yellow" : "orange", "a hexagon roof"));
  // the corners only one room has are on the outside: props on every other one
  const seen = new Map<string, number>();
  const all = cells.flatMap((h) => h.corners);
  all.forEach((p) => seen.set(p.join(), (seen.get(p.join()) ?? 0) + 1));
  const outer = all.filter((p) => seen.get(p.join()) === 1).filter((_, i) => i % 2 === 0);
  s.fins("the props", outer.map((p) => ({ corner: p, out: [p[0] - 3, p[1] + 0.866025] as P })), "purple", "props");
  [-1.5, 0.7, 2.9, 5.1].forEach((x, i) => s.pad(`garden number ${i + 1}`, x, 2, (["green", "blue", "green", "blue"] as Colour[])[i], "a big square"));
  return s.build({ id: "honeycomb-hotel", title: "The Honeycomb Hotel (Bees Only)", theme: "homes", age: "c", done: "You built the Honeycomb Hotel! Four rooms, no corners, and a sign on the door: bees only, no wasps." });
}

export const FRESH_C2: Project[] = [
  moonHotDogs(),
  mostlyNeck(),
  livingRooms(),
  rainedIndoors(),
  circleTrain(),
  spareRing(),
  undecidedButterfly(),
  stubbornSnowflake(),
  mostlyLid(),
  wobblyPancakes(),
  dragonWall(),
  trussBridge(),
  antPicnic(),
  slowSpinStation(),
  honeycombHotel(),
];
