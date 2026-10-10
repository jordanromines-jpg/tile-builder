/* 2.3: big builds for 11 to 16 (part four), the biggest: a hexagon palace, a space station of everything, hamster
   flats, a squished house, a fortress of three corners, a bat cave, a topiary zoo, a zigzag bridge. */
import type { Colour } from "../../engine/catalog";
import type { Project } from "../../engine/types";
import { Studio, hexagon, lattice, star, triOn, turtle, type P, type Tri } from "../studio";
import { away, bigTriPath, corners } from "./parts";

const L = lattice(0, 0);
const H = Math.sqrt(3) / 2;
const tri = (x: number, z: number): Tri => [[x, z], [x + 1, z], [x + 0.5, z - H]];
const triFront = (x: number, z: number): Tri => [[x, z], [x + 1, z], [x + 0.5, z + H]];
const up = (i: number, j: number): Tri => [L(i, j), L(i + 1, j), L(i, j + 1)];
const down = (i: number, j: number): Tri => [L(i + 1, j), L(i + 1, j + 1), L(i, j + 1)];
const RAINBOW: Colour[] = ["red", "orange", "yellow", "green", "blue", "purple"];
const FLOWER = [[3, 3], [4, 1], [3, 0], [1, 1], [0, 3], [1, 4]];
const unit = (v: P): P => {
  const d = Math.hypot(v[0], v[1]);
  return [v[0] / d, v[1] / d];
};
const r9 = (v: number) => Math.round(v * 1e9) / 1e9;

/** The corners that only one of the shapes has: the outside corners. */
function outsideCorners(shapes: { corners: P[] }[]): P[] {
  const count = new Map<string, number>();
  const all = shapes.flatMap((h) => h.corners);
  all.forEach((p) => count.set(p.join(), (count.get(p.join()) ?? 0) + 1));
  return all.filter((p) => count.get(p.join()) === 1);
}

function hamsterFlats(): Project {
  const s = new Studio();
  const flats = [[1, 1], [3, 0], [5, -1], [2, 2], [4, 1], [6, 0]].map(([i, j]) => hexagon(L, i, j));
  flats.forEach((h, k) => s.walls(`flat number ${k + 1}`, h.corners, 3, [RAINBOW[k], "yellow", RAINBOW[(k + 2) % 6]], { closed: true, gap: k < 3 ? 4 : undefined, what: "in a hexagon, sharing walls" }));
  flats.forEach((h, k) => s.triLid(`flat number ${k + 1}`, h.tris, 3, k % 2 ? "orange" : "yellow", "a hexagon roof"));
  const cs = outsideCorners(flats).filter((_, i) => i % 3 === 0);
  s.fins("the props", cs.map((p) => ({ corner: p, out: away([4.5, -0.43], p) })), "purple", "props", true);
  return s.build({ id: "hexagonal-hamster-flats", title: "The Apartment Block for Hexagonal Hamsters", theme: "homes", age: "d", done: "You built the hamster flats! Six flats, three floors, and a lot of wheels going round at night." });
}

function hexabellaPalace(): Project {
  const s = new Studio();
  const middle = hexagon(L, 2, 2);
  const ring = FLOWER.map(([i, j]) => hexagon(L, i, j));
  s.walls("the throne room", middle.corners, 6, ["purple", "blue", "purple", "yellow", "purple", "blue"], { closed: true, what: "in a hexagon" });
  ring.forEach((h, k) => s.walls(`wing ${k + 1}`, h.corners, 2, [RAINBOW[k], "yellow"], { closed: true, gap: k === 2 ? 4 : undefined, what: "in a hexagon, sharing walls" }));
  ring.forEach((h, k) => s.triLid(`wing ${k + 1}`, h.tris, 2, k % 2 ? "orange" : "yellow", "a hexagon roof"));
  s.fins("the palace", outsideCorners([middle, ...ring]).filter((_, i) => i % 2 === 0).map((p) => ({ corner: p, out: away(middle.centre, p) })), "blue", "banners", true);
  [-3.4, -1.2, 4.6, 6.8].forEach((x, i) => s.pad(`garden number ${i + 1}`, x, 1.6, i % 2 ? "green" : "blue", "a big square garden"));
  s.pad("the fountain", 1.7, 2.6, "blue", "a big square");
  return s.build({ id: "queen-hexabella-palace", title: "The Grand Hexagon Palace of Queen Hexabella", theme: "castles", age: "d", done: "You built Queen Hexabella's palace! Seven hexagons, not one single corner. The queen hates corners." });
}

function sevenHats(): Project {
  const s = new Studio();
  s.block("the mansion", 0, 0, 4, 3, 2, ["blue", "purple"], { door: true, floors: "yellow", roof: "orange" });
  s.roofs("the hats", [[0, 0], [2, 0], [1, 1], [3, 1], [0, 2], [2, 2]], 2, "tall", "red");
  s.roofs("the biggest hat", [[3, 2]], 2, "low", "yellow");
  s.fins("the steps", corners(0, 0, 4, 3), "green", "steps at the corners", true);
  return s.build({ id: "mansion-seven-pointy-hats", title: "The Mansion of Seven Pointy Hats", theme: "homes", age: "d", done: "You built the mansion! Seven pointy hats on the roof. One for each day of the week." });
}

function squishedHouse(): Project {
  const s = new Studio();
  const tris: Tri[] = [];
  for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) tris.push(up(i, j), down(i, j));
  // every little triangle is a room with walls all round, so each roof triangle rests on three walls (R10)
  tris.forEach((t, k) => s.walls(k ? "the squished house" : "the first room", t, 2, ["orange", "yellow"], { closed: true, what: "in a triangle, next to the last room" }));
  s.triLid("the squished house", tris, 2, (k) => (k % 2 ? "purple" : "blue"), "a roof of triangles, one on each room");
  [up(0, 0), up(2, 0), up(1, 1)].forEach((t) => s.tetra("a pointy bit", t, 2, "red"));
  s.pad("the garden", 0.4, 0.6, "green", "a big square");
  s.pad("the other garden", 2.6, 0.6, "green", "a big square");
  return s.build({ id: "squished-house", title: "The Squished House (Someone Sat on It)", theme: "homes", age: "d", done: "You built the squished house! Someone sat on it. The family inside say it's fine. A bit slanty." });
}

function threeCorners(): Project {
  const s = new Studio();
  const corner = [up(0, 0), up(5, 0), up(0, 5)];
  s.walls("the outer wall", bigTriPath(L, 0, 0, 6), 2, ["blue", "purple"], { closed: true, gap: 2, what: "in a giant triangle" });
  corner.forEach((t, k) => s.walls(`corner tower ${k + 1}`, t, 4, ["purple", "blue"], { closed: true, what: "in the corner" }));
  corner.forEach((t, k) => s.tetra(`corner tower ${k + 1}`, t, 4, "red"));
  const keep = hexagon(L, 2, 2);
  s.walls("the keep", keep.corners, 4, ["yellow", "orange"], { closed: true, gap: 4, what: "in a hexagon in the middle" });
  s.triLid("the keep", keep.tris, 4, "orange", "a hexagon top");
  s.tetra("the keep", keep.tris[1], 4, "red");
  return s.build({ id: "fortress-of-three-corners", title: "The Fortress of Three Corners (and One Hexagon)", theme: "castles", age: "d", done: "You built the fortress! Three corners to guard and a hexagon to hide in. The knights hide in the hexagon." });
}

function batCave(): Project {
  const s = new Studio();
  // each layer starts halfway along the front, round the end and along the back, so its first squares make a U: a
  // long straight line on its own falls over (R14); then the rest of the front
  const round: P[] = [[3, 1], [2, 1], [1, 1], [0, 1], [0, 0], ...Array.from({ length: 6 }, (_, i) => [i + 1, 0] as P)];
  s.walls("the rock", round, 3, ["purple", "blue", "purple"], { what: "from the middle of the front, round the end and along the back" });
  s.walls("the front rock", [[3, 1], [4, 1], [5, 1], [6, 1]], 3, ["purple", "blue", "purple"], { what: "on along the front" });
  s.platform("the cave roof", 0, 0, 6, 1, 3, "purple");
  s.roofs("the bats", [[1, 0], [3, 0], [5, 0]], 3, "low", "orange");
  ([[2, 2.9], [4, 2.9]] as [number, number][]).forEach(([x, z]) => s.tetra("a rock", triFront(x, z), 0, "green"));
  return s.build({ id: "upside-down-bat-cave", title: "The Bat Cave Where the Bats Sleep on the Roof", theme: "animals", age: "d", done: "You built the bat cave! The bats sleep on the roof, folded up like little tents. Shh, they're nocturnal." });
}

function marathonSnail(): Project {
  const s = new Studio();
  s.rug("the snail", [[-5, 0], [-4, 0], [-3, 0], [-2, 0], [-1, 0], [-5, 1], [-4, 1], [-3, 1], [-2, 1], [-1, 1]], "green", "a body of squares");
  const small = hexagon(L, 1, 1);
  const big = hexagon(L, 2, 2);
  s.walls("the shell", small.corners, 3, ["orange", "yellow", "orange"], { closed: true, what: "in a hexagon at the end of the body" });
  s.walls("the top of the curl", big.corners, 5, ["yellow", "orange", "red", "orange", "yellow"], { closed: true, what: "in a hexagon behind, sharing a wall" });
  s.triLid("the shell", small.tris, 3, "red", "a hexagon top");
  s.triLid("the top of the curl", big.tris, 5, "red", "a hexagon top");
  s.tetra("the medal", tri(-3.5, -0.1), 0, "yellow");
  s.tetra("the shell", big.tris[0], 5, "purple");
  return s.build({ id: "marathon-snail", title: "The Snail That Won the Marathon (Eventually)", theme: "animals", age: "d", done: "You built the marathon snail! It won. The race finished last Tuesday, but it won." });
}

function competitiveMarrows(): Project {
  const s = new Studio();
  const plot: [number, number][] = [];
  // each marrow stands in a square of the plot left bare: a tile can't stand in the middle of another (R14)
  const marrows: [number, number][] = [[0, 1], [2, 1], [4, 1], [1, 3], [3, 3], [5, 3]];
  for (let x = 0; x < 6; x++) for (let z = 0; z < 5; z++) if (!marrows.some(([a, b]) => a === x && b === z)) plot.push([x, z]);
  s.rug("the allotment", plot, (i) => (plot[i][0] % 2 ? "green" : "orange"), "an allotment of squares, with six squares left bare");
  marrows.forEach(([x, z], i) => s.tetra(`marrow number ${i + 1}`, tri(x, z + 1), 0, i % 2 ? "yellow" : "green"));
  const shed = triOn([7, 2], [8, 2]);
  s.walls("the shed", shed, 2, ["blue", "purple"], { closed: true, what: "in a triangle" });
  s.tetra("the shed", shed, 2, "red");
  s.tower("the scarecrow", 7, 3, 2, ["yellow", "orange"], { cap: "low", capColour: "red" });
  return s.build({ id: "competitive-marrow-allotment", title: "The Allotment of Competitive Marrows", theme: "gardens", age: "d", done: "You built the allotment! The marrows are having a growing contest. The yellow one is cheating." });
}

function topiaryZoo(): Project {
  const s = new Studio();
  const snake = turtle([0, 0], 30, [-60, 60, -60, 60, -60]);
  s.walls("the hedge snake", snake, 2, ["green", "green"], { what: "in a zigzag" });
  const t = hexagon(lattice(0.5, 3.5), 1, 1);
  s.walls("the hedge tortoise", t.corners, 1, ["green"], { closed: true, what: "in a hexagon" });
  s.triLid("the hedge tortoise", t.tris, 1, "green", "a shell of triangles");
  s.tetra("the hedge tortoise", t.tris[2], 1, "yellow");
  s.tower("the hedge giraffe", 7, 0, 4, ["green", "green"], { cap: "lid", capColour: "green" });
  // flat feet laid last, one on each side of the tower and of the shell, where standing legs creep (R14)
  const foot = (a: P, b: P, c: P) => {
    const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const d = Math.hypot(m[0] - c[0], m[1] - c[1]);
    return { shape: "tri-equilateral" as const, colour: "green" as Colour, a, b, toward: [m[0] + (m[0] - c[0]) / d, m[1] + (m[1] - c[1]) / d] as P };
  };
  s.flats("the hedge giraffe", [foot([7, 1], [8, 1], [7.5, 0.5]), foot([8, 1], [8, 0], [7.5, 0.5]), foot([8, 0], [7, 0], [7.5, 0.5]), foot([7, 0], [7, 1], [7.5, 0.5])], 0, "four feet", undefined, true);
  s.flats("the hedge tortoise", [0, 2, 3, 5].map((k) => foot(t.corners[k], t.corners[(k + 1) % 6], t.centre)), 0, "four feet", undefined, true);
  s.block("the hedge elephant", 5, 3, 2, 1, 2, ["green", "green"], { roof: "green" });
  s.fins("the hedge elephant", [{ corner: [7, 4], out: [1, 0] }], "green", "a trunk", true);
  s.pad("the pond", 3.9, 0.3, "blue", "a big square");
  return s.build({ id: "hedge-topiary-zoo", title: "The Topiary Zoo of Hedge Animals", theme: "gardens", age: "d", done: "You built the hedge zoo! A snake, a tortoise, a giraffe and an elephant. Nobody needs to feed them. Just water." });
}

function lemonadeBridge(): Project {
  const s = new Studio();
  const towers: [number, number][] = [[0, 0], [2, 0], [2, 2], [4, 2], [4, 4], [6, 4]];
  towers.forEach(([x, z], i) => s.tower(`pier number ${i + 1}`, x, z, 2, ["blue", "purple"], { cap: i === 0 || i === 5 ? "tall" : "none", capColour: "red" }));
  s.deck("span 1", "x", 1, 2, 0, 2, "yellow");
  s.deck("span 2", "z", 1, 2, 2, 2, "yellow");
  s.deck("span 3", "x", 3, 4, 2, 2, "yellow");
  s.deck("span 4", "z", 3, 4, 4, 2, "yellow");
  s.deck("span 5", "x", 5, 6, 4, 2, "yellow");
  [[0, 2], [6, 0], [-0.2, 4.4], [2.2, 4.4]].forEach(([x, z], i) => s.pad(`lemonade ${i + 1}`, x, z, "yellow", "a big square of lemonade"));
  return s.build({ id: "lemonade-lake-zigzag-bridge", title: "The Zigzag Bridge Across Lemonade Lake", theme: "bridges", age: "d", done: "You built the zigzag bridge! It goes left, right, left, right, all the way across. Don't drink the lake." });
}

function eiffelCousin(): Project {
  const s = new Studio();
  s.tower("the bottom", 0, 0, 3, ["purple", "blue", "purple"], { size: 2, cap: "none" });
  s.tower("the left spire", 0, 0, 3, ["blue", "purple"], { base: 3, cap: "tall", capColour: "red" });
  s.tower("the right spire", 1, 1, 3, ["blue", "purple"], { base: 3, cap: "tall", capColour: "red" });
  s.fins("the feet", corners(0, 0, 2, 2), "yellow", "feet", true);
  return s.build({ id: "eiffel-tower-wobbly-cousin", title: "The Eiffel Tower's Wobbly Cousin (with Two Tops)", theme: "bridges", age: "d", done: "You built the Eiffel Tower's cousin! It is from a small town and it is very proud. And slightly wobbly." });
}

function wrongTurnRover(): Project {
  const s = new Studio();
  const ground: [number, number][] = [];
  for (let x = -1; x < 5; x++) ground.push([x, 3], [x, 4]);
  s.rug("Mars", ground, "red", "red squares for Mars");
  s.block("the rover", 0, 0, 3, 2, 1, ["orange"], { roof: "yellow" });
  s.tower("the mast", 2, 0, 2, ["blue", "purple"], { base: 1, cap: "lid", capColour: "blue" });
  for (const x of [-0.1, 1, 2.1]) {
    s.tetra("a wheel", triFront(x, 2.05), 0, "purple");
    s.tetra("a wheel", tri(x, -0.05), 0, "purple");
  }
  s.tetra("a rock sample", tri(0.5, 4), 0, "orange");
  s.tetra("another rock sample", tri(2.5, 4), 0, "yellow");
  return s.build({ id: "wrong-turn-mars-rover", title: "The Mars Rover That Took a Wrong Turn", theme: "space", age: "d", done: "You built the Mars rover! It took a wrong turn at Jupiter. Now it's on Mars by accident. Lucky." });
}

function everythingStation(): Project {
  const s = new Studio();
  const st = star(L, 3, 3);
  s.walls("the hub", st.corners, 2, ["blue", "purple"], { closed: true, what: "in a six-point star" });
  s.triLid("the hub", st.tris, 2, (i) => (i < 6 ? "yellow" : "orange"), "a star-shaped deck");
  st.tris.slice(0, 6).forEach((t, k) => s.tetra(`point ${k + 1}`, t, 2, RAINBOW[k]));
  const h = hexagon(L, 3, 3);
  s.walls("the control tower", h.corners, 4, ["green", "yellow"], { closed: true, base: 2, what: "in a hexagon on the deck" });
  st.corners
    .filter((_, i) => i % 2 === 1)
    .forEach((t, k) => {
      const u = unit(away(st.centre, t));
      const arm: P[] = [t, [r9(t[0] + u[0]), r9(t[1] + u[1])], [r9(t[0] + 2 * u[0]), r9(t[1] + 2 * u[1])]];
      s.walls(`arm number ${k + 1}`, arm, 2, ["orange", "red"], { what: "straight out from a point" });
      s.fins(`arm number ${k + 1}`, [{ corner: arm[2], out: u }], "yellow", "a docking rocket", true);
    });
  // no antennas between the arms: a corner triangle hung by one edge from the star's inner corner swung over (R14)
  [-3.6, 7.6].forEach((x, i) => s.pad(`landing pad ${i + 1}`, x, -2, "purple", "a big square"));
  [-3.6, 7.6].forEach((x, i) => s.pad(`spare pad ${i + 1}`, x, 0.4, "blue", "a big square"));
  return s.build({ id: "space-station-of-everything", title: "The Space Station of Absolutely Everything", theme: "space", age: "d", done: "You built the Space Station of Absolutely Everything! It has everything. Except a kettle. Somebody forgot the kettle." });
}

export const FRESH_D4: Project[] = [
  hamsterFlats(),
  hexabellaPalace(),
  sevenHats(),
  squishedHouse(),
  threeCorners(),
  batCave(),
  marathonSnail(),
  competitiveMarrows(),
  topiaryZoo(),
  lemonadeBridge(),
  eiffelCousin(),
  wrongTurnRover(),
  everythingStation(),
];
