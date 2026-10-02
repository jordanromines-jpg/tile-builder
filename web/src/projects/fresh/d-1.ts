/* 2.3: big builds for 11 to 16 (part one), 60 to 175 tiles from two 100-piece sets: star and octagon castles,
   a hill of triangles, a honeycomb citadel, a chess set, a crown of upside-down triangles, a street of hexagons. */
import type { Colour } from "../../engine/catalog";
import type { Project } from "../../engine/types";
import { Studio, hexagon, lattice, polygon, star, triOn, type P, type Tri } from "../studio";
import { away, bigTri, bigTriPath, sides, triOut } from "./parts";

const L = lattice(0, 0);
const H = Math.sqrt(3) / 2;
const tri = (x: number, z: number): Tri => [[x, z], [x + 1, z], [x + 0.5, z - H]];
const RAINBOW: Colour[] = ["red", "orange", "yellow", "green", "blue", "purple"];

function custardStar(): Project {
  const s = new Studio();
  const st = star(L, 3, 3);
  s.walls("the star wall", st.corners, 3, ["blue", "purple", "blue"], { closed: true, gap: 0, what: "in a six-point star" });
  s.triLid("the star wall", st.tris, 3, (i) => (i < 6 ? "yellow" : "orange"), "a star-shaped roof");
  const h = hexagon(L, 3, 3);
  s.walls("the keep", h.corners, 3, ["yellow", "orange", "yellow"], { closed: true, base: 3, what: "in a hexagon in the middle of the roof" });
  s.triLid("the keep", h.tris, 6, "orange", "a hexagon top");
  s.tetra("the keep", h.tris[0], 6, "red");
  return s.build({ id: "captain-custard-star-fortress", title: "The Star Fortress of Captain Custard", theme: "castles", age: "d", done: "You built the Star Fortress! Captain Custard defends all six points. Mostly with custard." });
}

function kevinKeep(): Project {
  const s = new Studio();
  const o = polygon([0, 0], 8);
  s.rug("the path", [[0, 0], [0, 1], [0, 2], [0, 3]], "yellow", "a path to the door");
  s.walls("the keep", o, 4, ["blue", "purple"], { closed: true, gap: 0, what: "in an octagon" });
  const spots: [number, number][] = [[-2.2, 0.3], [2.2, 0.3], [-2.2, -3.7], [2.2, -3.7]];
  spots.forEach(([x, z], i) => s.tower(`corner tower ${i + 1}`, x, z, 3, ["green", "blue"], { cap: "tall", capColour: "yellow" }));
  return s.build({ id: "king-kevin-octagon-keep", title: "The Octagon Keep of King Kevin the Kind-of-Brave", theme: "castles", age: "d", done: "You built King Kevin's keep! Eight walls, four towers, one king. He is kind of brave. Mostly kind." });
}

function triangleHill(): Project {
  const s = new Studio();
  s.walls("the hill fort", bigTriPath(L, 0, 0, 3), 2, ["green", "yellow"], { closed: true, gap: 1, what: "in a big triangle, three on each side" });
  const lid = bigTri(L, 0, 0, 3);
  s.triLid("the hill fort", lid.tris, 2, "green", "a roof of triangles, row by row", lid.atoms);
  [lid.tris[0], lid.tris[3], lid.tris[5]].forEach((t) => s.tetra("a hilltop", t, 2, "orange"));
  ([[-1.2, 0.1], [3.2, 0.1], [1, -3.8]] as [number, number][]).forEach(([x, z], i) => s.tower(`watchtower ${i + 1}`, x, z, 3, ["purple", "blue"], { cap: "tall", capColour: "red" }));
  return s.build({ id: "castle-on-triangle-hill", title: "The Castle on Triangle Hill", theme: "castles", age: "d", done: "You built the Castle on Triangle Hill! Three sides, three towers, three hills, and one very tired knight." });
}

function sixKnights(): Project {
  const s = new Studio();
  const middle = hexagon(L, 2, 2);
  const ring = [[3, 3], [4, 1], [3, 0], [1, 1], [0, 3], [1, 4]].map(([i, j]) => hexagon(L, i, j));
  s.walls("the great hall", middle.corners, 4, ["purple", "blue"], { closed: true, what: "in a hexagon" });
  ring.forEach((h, k) => s.walls(`knight ${k + 1}'s tower`, h.corners, 2, [RAINBOW[k], "yellow"], { closed: true, what: "in a hexagon, sharing walls" }));
  s.triLid("the great hall", middle.tris, 4, "yellow", "a hexagon top");
  s.tetra("the great hall", middle.tris[2], 4, "red");
  const count = new Map<string, number>();
  const all = [middle, ...ring].flatMap((h) => sides(h.corners));
  const k = ([a, b]: [P, P]) => [a.join(), b.join()].sort().join("|");
  all.forEach((e) => count.set(k(e), (count.get(k(e)) ?? 0) + 1));
  return s.build({ id: "six-grumpy-knights-citadel", title: "The Hexagon Citadel of Six Grumpy Knights", theme: "castles", age: "d", done: "You built the citadel! Six towers for six grumpy knights. They are grumpy because nobody has corners to sulk in." });
}

function pawnsWon(): Project {
  const s = new Studio();
  const board: [number, number][] = [];
  for (let x = 0; x < 5; x++) for (let z = 0; z < 4; z++) board.push([x, z]);
  s.rug("the board", board, (i) => ((Math.floor(i / 4) + (i % 4)) % 2 ? "blue" : "yellow"), "a chessboard");
  for (const x of [0, 4]) {
    s.tower(`the rook`, x, 0, 2, ["red", "orange"], { cap: "none" });
  }
  s.tower("the king", 2, 0, 3, ["purple", "red"], { cap: "tall", capColour: "yellow" });
  s.tower("the queen", 2, 2, 2, ["purple", "red"], { cap: "low", capColour: "yellow" });
  ([[0, 1.95], [1, 2.95], [3, 2.95], [4, 1.95]] as [number, number][]).forEach(([x, z], i) => s.tetra(`pawn number ${i + 1}`, tri(x, z), 0, "green"));
  return s.build({ id: "pawns-won-chess-set", title: "The Chess Set Where the Pawns Won", theme: "castles", age: "d", done: "You built the chess set! The pawns won. Nobody expected it. The king is still sulking in the corner." });
}

function upsideDownCrown(): Project {
  const s = new Studio();
  s.block("the castle", 0, 0, 4, 4, 3, ["blue", "purple", "blue"], { door: true, roof: "purple" });
  return s.build({ id: "upside-down-crown-castle", title: "The Castle with an Upside-Down Crown", theme: "castles", age: "d", done: "You built the castle! Half the crown is upside down. The queen says it is the fashion now." });
}

function hexStreet(): Project {
  const s = new Studio();
  const heights = [2, 2, 3, 2, 2];
  const houses = heights.map((_, k) => hexagon(L, 1 + 2 * k, 1 - k));
  houses.forEach((h, k) => s.walls(`house number ${k + 1}`, h.corners, heights[k], [RAINBOW[k], "yellow", RAINBOW[k + 1]], { closed: true, gap: 4, what: "in a hexagon, next to the last house" }));
  houses.forEach((h, k) => s.triLid(`house number ${k + 1}`, h.tris, heights[k], k % 2 ? "orange" : "red", "a hexagon roof"));
  s.tetra("the chimney", houses[1].tris[1], 2, "purple");
  s.tetra("the tallest chimney", houses[2].tris[1], 3, "purple");
  return s.build({ id: "hexagon-street", title: "The Hexagon Street Where Every House Is a Bit Different", theme: "homes", age: "d", done: "You built Hexagon Street! Five houses, and number three is the tallest. The postman needs a ladder." });
}

function giantDollHouse(): Project {
  const s = new Studio();
  s.bigRoom("the big room", 0, 0, "blue", "yellow");
  s.block("the little room", 3, 0, 2, 1, 2, ["orange", "red"], { door: true, roof: "red" });
  s.block("the upstairs", 0, 0, 2, 2, 2, ["green", "purple"], { base: 2, roof: "green" });
  s.roofs("the upstairs", [[0, 0], [1, 0], [0, 1], [1, 1]], 4, "tall", "red");
  s.pad("the lawn", -2.2, 0, "green", "a big square");
  s.pad("the pond", 5.2, 0, "blue", "a big square");
  s.rug("the steps", [[0, 2], [1, 2], [0, 3], [1, 3]], "orange", "steps up to the front");
  return s.build({ id: "giants-doll-house", title: "The Giant's Doll's House", theme: "homes", age: "d", done: "You built the Giant's Doll's House! The bottom is giant-sized. The top is doll-sized. Everyone is confused." });
}

function flamingoStilts(): Project {
  const s = new Studio();
  for (const [x, z] of [[0, 0], [2, 0], [0, 2], [2, 2], [1, 1]] as [number, number][]) s.tower("a stilt", x, z, 2, ["purple", "red"], { cap: "none" });
  s.fins("the feet", [{ corner: [0, 0], out: [-1, -1] }, { corner: [3, 0], out: [1, -1] }, { corner: [0, 3], out: [-1, 1] }, { corner: [3, 3], out: [1, 1] }], "orange", "feet");
  s.platform("the floor", 0, 0, 3, 3, 2, "yellow");
  s.block("the house", 0, 0, 3, 3, 2, ["orange", "red"], { base: 2, roof: "orange" });
  s.roofs("the roof", [[0, 0], [2, 0], [0, 2], [2, 2]], 4, "tall", "red");
  s.roofs("the roof", [[1, 1]], 4, "low", "yellow");
  return s.build({ id: "nervous-flamingo-stilt-house", title: "The Stilt House for a Nervous Flamingo", theme: "homes", age: "d", done: "You built the stilt house! The flamingo stands on one leg. The house stands on four. Much safer." });
}

function tripleDecker(): Project {
  const s = new Studio();
  s.block("the bus", 0, 0, 5, 2, 3, ["red", "red", "yellow"], { door: true, floors: "orange", roof: "red" });
  s.fins("the bumpers", [{ corner: [5, 2], out: [1, 0] }, { corner: [5, 0], out: [1, 0] }, { corner: [0, 2], out: [-1, 0] }, { corner: [0, 0], out: [-1, 0] }], "purple", "bumpers");
  return s.build({ id: "triple-decker-bus", title: "The Triple-Decker Bus (One Deck Too Many)", theme: "vehicles", age: "d", done: "You built the triple-decker bus! Mind the bridges. Mind the trees. Mind the birds, actually." });
}

function sevenStages(): Project {
  const s = new Studio();
  const h = hexagon(L, 1, 1);
  for (let y = 0; y < 7; y++) {
    s.walls(`stage ${y + 1}`, h.corners, 1, [RAINBOW[y % 6]], { closed: true, base: y, what: "in a hexagon" });
    if (y === 1 || y === 3) s.triLid(`stage ${y + 1}`, h.tris, y + 1, "yellow", "a floor of triangles");
  }
  s.triLid("the top", h.tris, 7, "red", "a hexagon top");
  s.tetra("the nose", h.tris[0], 7, "red");
  s.tetra("the other nose", h.tris[3], 7, "orange");
  for (const k of [1, 4]) {
    const t = triOut(h.centre, h.corners[k], h.corners[(k + 1) % 6]);
    s.walls("a booster", t, 3, ["blue", "purple", "blue"], { closed: true, what: "in a triangle against the side" });
    s.tetra("a booster", t, 3, "yellow");
  }
  s.fins("the fins", [0, 3].map((k) => ({ corner: h.corners[k], out: away(h.centre, h.corners[k]) })), "green");
  return s.build({ id: "seven-stage-rocket", title: "The Rocket with Seven Stages (Six Too Many)", theme: "space", age: "d", done: "You built the seven-stage rocket! Stage one goes up. Stage seven is still waiting for its turn." });
}

function smallPlaneCarrier(): Project {
  const s = new Studio();
  s.block("the ship", 0, 0, 7, 2, 2, ["blue", "purple"], { roof: "purple" });
  s.tower("the bridge", 5, 0, 3, ["yellow", "orange"], { base: 2, cap: "lid", capColour: "yellow" });
  s.fins("the bow", [{ corner: [7, 2], out: [1, 0] }, { corner: [7, 0], out: [1, 0] }], "red", "a pointy front");
  [-0.3, 2.2, 4.7].forEach((x, i) => s.pad(`wave number ${i + 1}`, x, 2.2, "green", "a big square of sea"));
  return s.build({ id: "very-small-plane-carrier", title: "The Aircraft Carrier for Very Small Planes", theme: "vehicles", age: "d", done: "You built the aircraft carrier! The planes are so small they take off by sneezing." });
}

function snowflakeStation(): Project {
  const s = new Studio();
  const st = star(L, 3, 3);
  s.walls("the hub", st.corners, 2, ["blue", "purple"], { closed: true, what: "in a six-point star" });
  s.triLid("the hub", st.tris, 2, (i) => (i < 6 ? "yellow" : "orange"), "a star-shaped deck");
  const h = hexagon(L, 3, 3);
  s.walls("the control room", h.corners, 2, ["green", "yellow"], { closed: true, base: 2, what: "in a hexagon on the deck" });
  s.triLid("the control room", h.tris, 4, "green", "a hexagon top");
  s.tetra("the aerial", h.tris[1], 4, "red");
  st.corners
    .filter((_, i) => i % 2 === 1)
    .forEach((t, k) => {
      const u = away(st.centre, t);
      const d = Math.hypot(u[0], u[1]);
      const arm: P[] = [t, [t[0] + u[0] / d, t[1] + u[1] / d], [t[0] + (2 * u[0]) / d, t[1] + (2 * u[1]) / d]];
      s.walls(`arm number ${k + 1}`, arm, 1, ["orange"], { what: "straight out from a point" });
    });
  return s.build({ id: "snowflake-space-station", title: "The Space Station Shaped Like a Snowflake", theme: "space", age: "d", done: "You built the snowflake station! Six arms, one control room, and nobody can find the toilet." });
}

function sparkleCave(): Project {
  const s = new Studio();
  const o = polygon([0, 0], 8);
  const cave = o.slice(0, 6);
  s.walls("the cave", cave, 3, ["purple", "blue", "purple"], { what: "in a curve" });
  const floor: [number, number][] = [];
  for (let x = -1; x < 2; x++) for (let z = 1; z < 4; z++) floor.push([x, z]);
  s.rug("the cave floor", floor, "purple", "a floor of squares");
  ([[-0.9, 1.95], [0.6, 1.95], [-0.9, 3.95], [0.6, 3.95], [1.05, 2.95], [-0.45, 2.95]] as [number, number][]).forEach(([x, z], i) => s.tetra(`crystal number ${i + 1}`, tri(x, z), 0, (["yellow", "green", "orange", "red", "yellow", "green"] as Colour[])[i]));
  for (const x of [3, 5]) {
    const t = triOn([x, 3], [x + 1, 3]);
    s.walls("a giant crystal", t, 2, ["green", "yellow"], { closed: true, what: "in a triangle" });
    s.tetra("a giant crystal", t, 2, "yellow");
  }
  return s.build({ id: "planet-sparkle-crystal-cave", title: "The Crystal Cave on Planet Sparkle", theme: "space", age: "d", done: "You built the crystal cave! Everything sparkles. Even the space bats wear sunglasses." });
}

export const FRESH_D1: Project[] = [
  custardStar(),
  kevinKeep(),
  triangleHill(),
  sixKnights(),
  pawnsWon(),
  upsideDownCrown(),
  hexStreet(),
  giantDollHouse(),
  flamingoStilts(),
  tripleDecker(),
  sevenStages(),
  smallPlaneCarrier(),
  snowflakeStation(),
  sparkleCave(),
];
