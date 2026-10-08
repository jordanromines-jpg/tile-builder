/* 2.3: builds for 9 and 10 (part one), 30 to 90 tiles, each from one 100-piece set: honeycombs, octagons, stars,
   triangle towers, a carpet of hexagons, squares and triangles, a spiral staircase. */
import type { Colour } from "../../engine/catalog";
import type { Project } from "../../engine/types";
import { Studio, hexagon, lattice, polygon, star, type P, type Tri } from "../studio";

const L = lattice(0, 0);
const EQH = Math.sqrt(3) / 2;
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];

function beeFlats(): Project {
  const s = new Studio();
  const cells = [hexagon(L, 1, 1), hexagon(L, 2, 2), hexagon(L, 3, 0)];
  const colours: Colour[] = ["yellow", "orange", "yellow"];
  cells.forEach((h, i) => s.walls(`flat number ${i + 1}`, h.corners, 2, [colours[i], "orange"], { closed: true, what: "in a hexagon, sharing walls with the flats next door" }));
  cells.forEach((h, i) => s.triLid(`flat number ${i + 1}`, h.tris, 2, i === 1 ? "yellow" : "orange", "a hexagon roof"));
  return s.build({ id: "bee-block-of-flats", title: "The Bee Block of Flats", theme: "homes", age: "c", done: "You built the Bee Block of Flats! Three flats, no corners, and the neighbours keep buzzing." });
}

function loudDucks(): Project {
  const s = new Studio();
  const o = polygon([0, 0], 8);
  s.walls("the bandstand", o, 3, ["green", "yellow", "green"], { closed: true, gap: 0, what: "in an octagon" });
  s.tower("the drum", 0, -1.707107, 1, ["blue"], { cap: "low", capColour: "orange" });
  return s.build({ id: "loud-duck-bandstand", title: "The Bandstand for Very Loud Ducks", theme: "gardens", age: "c", done: "You built the bandstand! The ducks play the drums. Every song is called Quack." });
}

function sirWobbles(): Project {
  const s = new Studio();
  const st = star(L, 2, 2);
  s.walls("the star fort", st.corners, 2, ["blue", "purple"], { closed: true, gap: 0, what: "in a six-point star" });
  s.triLid("the star fort", st.tris, 2, (i) => (i < 6 ? "yellow" : "orange"), "a star-shaped roof");
  return s.build({ id: "sir-wobbles-star-fort", title: "The Star Fort of Sir Wobbles", theme: "castles", age: "c", done: "You built Sir Wobbles' star fort! Six points to defend. Sir Wobbles defends one at a time, slowly." });
}

function pointyOpinions(): Project {
  const s = new Studio();
  const t1: Tri = [L(0, 0), L(1, 0), L(0, 1)];
  const t2: Tri = [L(1, 0), L(1, 1), L(0, 1)];
  for (let y = 0; y < 5; y++) {
    s.walls("the tall tower", t1, 1, [(["purple", "blue", "green"] as Colour[])[y % 3]], { closed: true, base: y, what: "in a triangle" });
    if (y < 3) s.walls("the short tower", t2, 1, [(["orange", "yellow"] as Colour[])[y % 2]], { closed: true, base: y, what: "in a triangle, sharing a wall, so the two towers hold each other steady" });
  }
  s.tetra("the short tower", t2, 3, "red");
  s.tetra("the tall tower", t1, 5, "red");
  s.fins("the towers", [L(0, 0), L(1, 0), L(1, 1), L(0, 1)].map((p) => ({ corner: p, out: [p[0] - 0.75, p[1] + EQH / 2] as P })), "yellow", "feet");
  return s.build({ id: "tower-of-pointy-opinions", title: "The Tower of Pointy Opinions", theme: "bridges", age: "c", done: "You built the Tower of Pointy Opinions! The tall one thinks it is right. The short one thinks so too." });
}
function ownWind(): Project {
  const s = new Studio();
  const h = hexagon(L, 1, 1);
  s.walls("the windmill", h.corners, 4, ["blue", "yellow"], { closed: true, gap: 0, what: "in a hexagon" });
  s.triLid("the windmill", h.tris, 4, "yellow", "a hexagon top");
  s.tetra("the windmill's cap", h.tris[0], 4, "red");
  s.tetra("the windmill's other cap", h.tris[3], 4, "red");
  return s.build({ id: "own-wind-windmill", title: "The Windmill That Makes Its Own Wind", theme: "gardens", age: "c", done: "You built the windmill! It does not wait for wind. It makes its own. Hold on to your hat." });
}

function robotButler(): Project {
  const s = new Studio();
  s.tower("the left leg", 0, 0, 2, ["blue", "purple"], { cap: "none" });
  s.tower("the right leg", 2, 0, 2, ["blue", "purple"], { cap: "none" });
  s.walls("the body", [[0, 1], [1, 1], [2, 1], [3, 1], [3, 0], [2, 0], [1, 0], [0, 0]], 2, ["orange", "red"], { closed: true, base: 2, what: "in a ring on the legs" });
  s.platform("the body", 0, 0, 3, 1, 4, "red");
  s.tower("the head", 1, 0, 2, ["yellow", "green"], { base: 4, cap: "lid", capColour: "green" });
  return s.build({ id: "robot-butler", title: "The Robot Butler Who Breaks Everything", theme: "homes", age: "c", done: "You built the Robot Butler! It made the tea. It also made the teapot into four teapots. Sorry." });
}

function hatBeetle(): Project {
  const s = new Studio();
  const h = hexagon(L, 1, 1);
  s.walls("the beetle", h.corners, 2, ["green", "blue"], { closed: true, what: "in a hexagon" });
  s.triLid("the beetle's back", h.tris, 2, (i) => (i % 2 ? "green" : "purple"));
  s.tetra("the hat", h.tris[1], 2, "red");
  s.tetra("the other hat", h.tris[4], 2, "orange");
  s.fins("the legs", h.corners.map((p) => ({ corner: p, out: [p[0] - h.centre[0], p[1] - h.centre[1]] as P })), "yellow", "six legs");
  return s.build({ id: "beetle-in-two-hats", title: "The Beetle Who Wears Two Hats", theme: "animals", age: "c", done: "You built the beetle! It wears two hats. One for Mondays. One for all the other days." });
}

function pinCushion(): Project {
  const s = new Studio();
  const o = polygon([0, 0], 8);
  s.walls("the porcupine", o, 4, ["orange", "red"], { closed: true, what: "in an octagon" });
  s.tetra("the nose", [[1, 0], [0, 0], [0.5, 0.866025]], 0, "purple");
  return s.build({ id: "porcupine-pin-cushion", title: "The Porcupine Who Is a Pin Cushion", theme: "animals", age: "c", done: "You built the porcupine! It holds all the pins. It is very proud. Do not sit on it." });
}

function tuesdaySaucer(): Project {
  const s = new Studio();
  const st = star(L, 2, 2);
  s.walls("the saucer", st.corners, 1, ["purple"], { closed: true, what: "in a six-point star" });
  s.triLid("the saucer", st.tris, 1, (i) => (i < 6 ? "blue" : "green"), "a star-shaped deck");
  s.tetra("the cockpit", st.tris[6], 1, "yellow");
  s.tetra("the radar", st.tris[9], 1, "red");
  s.fins("the landing legs", st.corners.filter((_, i) => i % 2 === 1).map((p) => ({ corner: p, out: [p[0] - st.centre[0], p[1] - st.centre[1]] as P })), "orange", "landing legs");
  return s.build({ id: "tuesday-flying-saucer", title: "The Flying Saucer That Only Flies on Tuesdays", theme: "space", age: "c", done: "You built the flying saucer! Is it Tuesday? No? Then it just sits there, looking shiny." });
}

function screenDoorSub(): Project {
  const s = new Studio();
  s.block("the submarine", 0, 0, 4, 1, 2, ["yellow", "orange"], { roof: "yellow" });
  s.tower("the lookout", 1, 0, 1, ["red"], { base: 2, cap: "none" });
  s.fins("the front", [{ corner: [4, 1], out: [1, 0] }, { corner: [4, 0], out: [1, 0] }], "red", "a pointy nose");
  s.fins("the tail", [{ corner: [0, 1], out: [-1, 1] }, { corner: [0, 0], out: [-1, -1] }], "green", "tail fins");
  return s.build({ id: "screen-door-submarine", title: "The Submarine with a Screen Door", theme: "vehicles", age: "c", done: "You built the submarine! It has a screen door to keep the fish out. The fish are not impressed." });
}

function broccoliVan(): Project {
  const s = new Studio();
  s.block("the van", 0, 0, 3, 2, 2, ["blue", "purple"], { door: true, roof: "blue" });
  s.roofs("the broccoli", [[0, 1], [2, 0]], 2, "low", "green");
  return s.build({ id: "broccoli-ice-cream-van", title: "The Ice Cream Van That Only Sells Broccoli", theme: "vehicles", age: "c", done: "You built the van! Ding ding! Who wants broccoli? Anyone? Anyone at all?" });
}

function grumpyGnomes(): Project {
  const s = new Studio();
  const cells: [number, number][] = [];
  for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) cells.push([x, z]);
  s.rug("the lawn", cells, (i) => (i % 2 ? "green" : "yellow"), "a lawn of squares");
  s.pad("the pond", 3, 0.5, "blue", "a big square pond");
  s.walls("the hedge", [[0, 3], [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3]], 1, ["green"], { what: "round three sides of the lawn" });
  [[0.3, 1.2], [1.7, 1.3], [0.3, 2.8], [1.7, 2.8]].forEach(([x, z], i) => s.tetra(`gnome number ${i + 1}`, [[x, z], [x + 1, z], [x + 0.5, z - EQH]], 0, (["red", "purple", "red", "blue"] as Colour[])[i]));
  return s.build({ id: "grumpy-gnome-garden", title: "The Garden of Grumpy Gnomes", theme: "gardens", age: "c", done: "You built the gnome garden! Four gnomes, four grumps. They are grumpy because you are too nice." });
}

function kaleidoCarpet(): Project {
  const s = new Studio();
  const h = hexagon(L, 1, 1);
  const v = h.corners;
  // the way out from the middle across each side
  const n = v.map((p, k) => {
    const q = v[(k + 1) % 6];
    const m: P = [(p[0] + q[0]) / 2 - h.centre[0], (p[1] + q[1]) / 2 - h.centre[1]];
    const d = Math.hypot(m[0], m[1]);
    return [m[0] / d, m[1] / d] as P;
  });
  s.triLid("the middle", h.tris, 0, (i) => (i % 2 ? "purple" : "blue"), "a hexagon of triangles");
  s.flats("the squares", v.map((p, k) => ({ shape: "square", colour: "yellow" as Colour, a: p, b: v[(k + 1) % 6], toward: add(p, n[k]) })), 0, "a square on each side");
  const gaps: Tri[] = v.map((p, k) => [add(p, n[(k + 5) % 6]), add(p, n[k]), p]);
  s.triLid("the gaps", gaps, 0, "red", "a triangle in each gap");
  s.walls("the rim", v.flatMap((p, k) => [add(p, n[(k + 5) % 6]), add(p, n[k])]), 1, ["green"], { closed: true, what: "standing round the edge, twelve sides" });
  return s.build({ id: "kaleidoscope-carpet", title: "The Kaleidoscope Carpet", theme: "patterns", age: "c", done: "You built the Kaleidoscope Carpet! Hexagon, squares, triangles, round and round. Look from the top." });
}

function nowhereStairs(): Project {
  const s = new Studio();
  const colours: Colour[] = ["red", "orange", "yellow", "green"];
  for (let k = 0; k < 4; k++) s.tower(`step ${k + 1}`, k, k, k + 1, [colours[k]], { cap: "low", capColour: "purple" });
  s.pad("the landing", -2.2, -1, "blue", "a big square");
  return s.build({ id: "staircase-to-nowhere", title: "The Staircase to Absolutely Nowhere", theme: "patterns", age: "c", done: "You built the Staircase to Nowhere! Four steps up, corner to corner, and then... nowhere. Lovely view though." });
}

function mummyTomb(): Project {
  const s = new Studio();
  const tris: Tri[] = [[L(0, 0), L(1, 0), L(0, 1)], [L(1, 0), L(2, 0), L(1, 1)], [L(0, 1), L(1, 1), L(0, 2)], [L(1, 0), L(1, 1), L(0, 1)]];
  tris.forEach((t, k) => s.walls(k < 3 ? `corner room ${k + 1}` : "the middle room", t, 2, ["yellow", "orange"], { closed: true, what: "in a triangle" }));
  s.triLid("the tomb", tris, 2, "yellow", "a triangle roof: every triangle rests on three walls");
  [0, 1, 2].forEach((k) => s.tetra("the tomb", tris[k], 2, "orange"));
  s.tower("the left statue", -1.5, -0.5, 2, ["blue", "purple"], { cap: "tall", capColour: "yellow" });
  s.tower("the right statue", 2.5, -0.5, 2, ["blue", "purple"], { cap: "tall", capColour: "yellow" });
  return s.build({ id: "polite-mummy-tomb", title: "The Triangle Tomb of the Polite Mummy", theme: "castles", age: "c", done: "You built the tomb! Four rooms, one polite mummy. She says please and thank you. And sorry about the bandages." });
}

export const FRESH_C1: Project[] = [
  beeFlats(),
  loudDucks(),
  sirWobbles(),
  pointyOpinions(),
  ownWind(),
  robotButler(),
  hatBeetle(),
  pinCushion(),
  tuesdaySaucer(),
  screenDoorSub(),
  broccoliVan(),
  grumpyGnomes(),
  kaleidoCarpet(),
  nowhereStairs(),
  mummyTomb(),
];
