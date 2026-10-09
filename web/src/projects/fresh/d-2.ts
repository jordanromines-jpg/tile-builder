/* 2.3: big builds for 11 to 16 (part two): a whale with a lighthouse, a dragon, an octopus, a tortoise, a peacock,
   gardens of hexagons and mushrooms, a long truss bridge, a corkscrew tower. */
import type { Colour } from "../../engine/catalog";
import type { Project } from "../../engine/types";
import { reorderSteps } from "../helpers";
import { Studio, hexagon, lattice, polygon, triOn, turtle, type P, type Tri } from "../studio";
import { away, sides, triOut, trussBridge } from "./parts";

const L = lattice(0, 0);
const H = Math.sqrt(3) / 2;
const tri = (x: number, z: number): Tri => [[x, z], [x + 1, z], [x + 0.5, z - H]];
const RAINBOW: Colour[] = ["red", "orange", "yellow", "green", "blue", "purple"];
const unit = (v: P): P => {
  const d = Math.hypot(v[0], v[1]);
  return [v[0] / d, v[1] / d];
};

function lighthouseWhale(): Project {
  const s = new Studio();
  const body = [L(0, 0), L(1, 0), L(2, 0), L(3, 0), L(4, 0), L(4, 1), L(3, 2), L(2, 2), L(1, 2), L(0, 2), L(-1, 2), L(-1, 1)];
  s.pad("the sea", -2.5, 0.4, "green", "a big square of sea");
  s.pad("more sea", 4.5, 0.4, "green", "a big square of sea");
  s.walls("the whale", body, 2, ["blue", "purple"], { closed: true, what: "in a long hexagon" });
  const h = hexagon(L, 1, 1);
  s.walls("the lighthouse", h.corners, 5, ["red", "yellow", "red", "yellow", "red"], { closed: true, what: "in a hexagon inside the whale, sharing two of its walls" });
  s.triLid("the lighthouse", h.tris, 5, "yellow", "the lamp floor");
  s.tetra("the lighthouse", h.tris[0], 5, "red");
  s.fins("the tail", [{ corner: L(-1, 1), out: [-1, -0.4] }, { corner: L(-1, 2), out: [-1, -1] }], "purple", "a tail");
  return s.build({ id: "whale-swallowed-lighthouse", title: "The Whale Who Swallowed a Lighthouse", theme: "animals", age: "d", done: "You built the whale! It swallowed a lighthouse by mistake. Now it glows at night and ships follow it home." });
}

function mouseScaredDragon(): Project {
  const s = new Studio();
  const pts = turtle([0, 0], 30, [-60, 60, -60, 60, -60, 60, -60, 60, -60]);
  s.tower("the head", -1, 0, 3, ["red", "orange"], { cap: "tall", capColour: "yellow" });
  s.walls("the dragon", pts, 4, ["green", "green", "yellow", "green"], { what: "in a zigzag from the head" });
  s.fins("the wings", [2, 4, 6, 8].map((k) => ({ corner: pts[k], out: [k % 4 ? 0.3 : -0.3, k % 4 ? 1 : -1] as P })), "purple", "little wings", true);
  const end = pts[pts.length - 1];
  const before = pts[pts.length - 2];
  s.fins("the tail", [{ corner: end, out: [end[0] - before[0], end[1] - before[1]] }], "orange", "a pointy tail", true);
  s.tetra("the mouse", tri(-1.4, 2.4), 0, "blue");
  return s.build({ id: "dragon-scared-of-mice", title: "The Dragon Who Is Scared of Mice", theme: "animals", age: "d", done: "You built the dragon! Fire, spikes, wings, the lot. And there is the mouse. EEEK, says the dragon." });
}

function lostCountOctopus(): Project {
  const s = new Studio();
  const o = polygon([0, 0], 8);
  const c: P = [0.5, -1.207107];
  s.walls("the octopus", o, 4, ["purple", "red"], { closed: true, what: "in an octagon" });
  o.forEach((p, k) => {
    const u = unit(away(c, p));
    const leg: P[] = [p, [p[0] + u[0], p[1] + u[1]], [p[0] + 2 * u[0], p[1] + 2 * u[1]]];
    s.walls(`leg number ${k + 1}`, leg, 1, [RAINBOW[k % 6]], { what: "straight out from a corner" });
    s.fins(`leg number ${k + 1}`, [{ corner: leg[2], out: u }], "yellow", "a curly tip", true);
  });
  s.pad("the ink puddle", 4.3, 1, "purple", "a big square");
  s.pad("the other ink puddle", 4.3, -1.4, "blue", "a big square");
  s.tetra("the crab", tri(4.8, 2.6), 0, "red");
  const octopus = s.build({ id: "octopus-lost-count", title: "The Octopus Who Lost Count of Its Legs", theme: "animals", age: "d", done: "You built the octopus! Count the legs. Eight? The octopus says seven. Or nine. It keeps losing count." });
  // body first, then the legs: a leg swings on its corner while the walls above it are held (R14)
  return reorderSteps(octopus, [0, 1, 2, 3, 12, 13, 14, 15, 16, 17, 18, 4, 5, 6, 7, 8, 9, 10, 11, 19, 20, 21, 22, 23, 24, 25, 26]);
}

function accidentalTortoise(): Project {
  const s = new Studio();
  const middle = hexagon(L, 2, 2);
  const ring = [[3, 3], [4, 1], [3, 0], [1, 1], [0, 3], [1, 4]].map(([i, j]) => hexagon(L, i, j));
  s.walls("the shell", middle.corners, 2, ["green", "yellow"], { closed: true, what: "in a hexagon" });
  ring.forEach((h, k) => s.walls(`shell piece ${k + 1}`, h.corners, 1, [k % 2 ? "green" : "blue"], { closed: true, what: "in a hexagon round the middle" }));
  ring.forEach((h, k) => s.triLid(`shell piece ${k + 1}`, h.tris, 1, k % 2 ? "green" : "yellow", "a hexagon of triangles"));
  const hc = ring[1];
  const head = triOut(hc.centre, hc.corners[5], hc.corners[0]);
  s.walls("the head", head, 2, ["yellow", "green"], { closed: true, what: "in a triangle against the shell" });
  s.tetra("the head", head, 2, "green");
  // the feet are little pyramids against the outside of four shell pieces: a foot hung on a corner by one edge swung
  // (R14), and three triangles leaning together stand by themselves
  ([[0, 0], [2, 4], [3, 3], [5, 1]] as [number, number][]).forEach(([r, k], i) => {
    const h = ring[r];
    s.tetra(`foot number ${i + 1}`, triOut(h.centre, h.corners[k], h.corners[(k + 1) % 6]), 0, "yellow", true);
  });
  return s.build({ id: "tortoise-won-by-accident", title: "The Tortoise Who Won by Accident", theme: "animals", age: "d", done: "You built the tortoise! It won the race by accident. It was going the other way. Still counts." });
}

function showOffPeacock(): Project {
  const s = new Studio();
  const fan = turtle([0, 0], 90, [-30, -30, -30, -30, -30]);
  s.walls("the tail", fan, 4, ["blue", "green", "purple", "green"], { what: "in a big curve" });
  const h = hexagon(lattice(0.366, 2.07), 1, 1);
  s.walls("the body", h.corners, 2, ["blue", "purple"], { closed: true, what: "in a hexagon in front of the tail" });
  s.triLid("the body", h.tris, 2, "blue");
  s.tetra("the head", h.tris[4], 2, "purple");
  ([[0.2, 3.9], [2.6, 3.9], [-1.2, 2.4], [4, 2.4], [-1.6, 0.9], [4.4, 0.9]] as [number, number][]).forEach(([x, z], i) => s.tetra(`eye feather ${i + 1}`, tri(x, z), 0, RAINBOW[i]));
  s.fins("the feet", [{ corner: h.corners[3], out: [-0.4, 1] }, { corner: h.corners[5], out: [0.4, 1] }], "orange", "feet");
  return s.build({ id: "show-off-peacock", title: "The Peacock Who Shows Off", theme: "animals", age: "d", done: "You built the peacock! Look at that tail. The peacock says: yes, look at it. Look at it more." });
}

function tooMuchFlowerBed(): Project {
  const s = new Studio();
  const spots: [number, number][] = [[1, 1], [4, 1], [7, 1], [2.5, -1.6], [5.5, -1.6], [4, 3.6]];
  spots.forEach(([x, z], k) => {
    const h = hexagon(lattice(x - 1.5, z + H), 1, 1);
    s.triLid(`flower number ${k + 1}`, h.tris, 0, (i) => (i % 2 ? RAINBOW[k] : "yellow"), "a hexagon flower of triangles");
    if (k < 3) s.walls(`flower number ${k + 1}`, h.corners, 1, [RAINBOW[(k + 3) % 6]], { closed: true, what: "standing round the flower's edge, petals up" });
  });
  const path: [number, number][] = [];
  for (let x = -1; x < 10; x++) path.push([x, 5.5]);
  s.rug("the path", path, "orange", "a garden path");
  return s.build({ id: "flower-bed-grew-too-much", title: "The Flower Bed That Grew Too Much", theme: "gardens", age: "d", done: "You built the flower bed! It grew and grew. Now the path is the only bit that isn't flowers." });
}

function snackMaze(): Project {
  const s = new Studio();
  const middle = hexagon(L, 2, 2);
  const ring = [[3, 3], [4, 1], [3, 0], [1, 1], [0, 3], [1, 4]].map(([i, j]) => hexagon(L, i, j));
  const k = ([a, b]: [P, P]) => [a.join(), b.join()].sort().join("|");
  const count = new Map<string, number>();
  const all = [middle, ...ring].flatMap((h) => sides(h.corners));
  all.forEach((e) => count.set(k(e), (count.get(k(e)) ?? 0) + 1));
  const outer = all.filter((e) => count.get(k(e)) === 1);
  // chain the outside edges into one loop
  const loop: P[] = [outer[0][0], outer[0][1]];
  const left = outer.slice(1);
  while (left.length) {
    const end = loop[loop.length - 1].join();
    const i = left.findIndex(([a, b]) => a.join() === end || b.join() === end);
    const [a, b] = left.splice(i, 1)[0];
    loop.push(a.join() === end ? b : a);
  }
  loop.pop();
  s.walls("the outside wall", loop, 3, ["green", "green", "yellow"], { closed: true, gap: 0, what: "round the outside of the maze" });
  s.walls("the inside wall", middle.corners.slice(0, 5), 2, ["blue", "blue"], { what: "round most of the middle" });
  for (const c of [middle.corners[0], middle.corners[2], middle.corners[4]]) {
    const out = unit(away(middle.centre, c));
    s.walls("a hedge", [c, [Math.round((c[0] + out[0]) * 1e9) / 1e9, Math.round((c[1] + out[1]) * 1e9) / 1e9]], 2, ["green", "green"], { what: "from the middle out to the edge" });
  }
  s.tetra("the snack", middle.tris[5], 0, "orange");
  return s.build({ id: "hexagon-snack-maze", title: "The Maze of Hexagons (Bring a Snack)", theme: "gardens", age: "d", done: "You built the hexagon maze! The snack is in the middle. Can your finger find the way in?" });
}

function giantTomatoes(): Project {
  const s = new Studio();
  s.block("the greenhouse", 0, 0, 4, 2, 2, ["green", "blue"], { door: true, roof: "blue" });
  s.roofs("the glass pyramids", [[0, 0], [1, 1], [2, 0], [3, 1]], 2, "low", "green");
  ([[-1.6, 1.5], [4.6, 1.5], [-1.6, 3.4], [4.6, 3.4]] as [number, number][]).forEach(([x, z], i) => s.tetra(`tomato number ${i + 1}`, tri(x, z), 0, "red"));
  s.pad("the vegetable patch", 0, 2.4, "orange", "a big square");
  s.pad("the other patch", 2.2, 2.4, "orange", "a big square");
  return s.build({ id: "giant-tomato-greenhouse", title: "The Greenhouse of Giant Tomatoes", theme: "gardens", age: "d", done: "You built the greenhouse! The tomatoes grew so big they had to live outside. Watch your toes." });
}

function gossipGazebo(): Project {
  const s = new Studio();
  const o = polygon([0, 0], 8);
  s.rug("the path", [[0, 0], [0, 1], [0, 2], [-1, 2], [1, 2], [0, 3]], "yellow", "a path to the gazebo");
  s.walls("the gazebo", o, 5, ["purple", "blue"], { closed: true, gap: 0, what: "in an octagon" });
  s.tower("the cake table", 0, -1.707107, 1, ["orange"], { cap: "lid", capColour: "red" });
  ([[-2.6, 1.2], [2.6, 1.2], [-2.6, -2.2], [2.6, -2.2]] as [number, number][]).forEach(([x, z], i) => s.tetra(`a bush`, tri(x, z), 0, i % 2 ? "green" : "blue"));
  return s.build({ id: "gossiping-grannies-gazebo", title: "The Gazebo Where Grannies Gossip", theme: "gardens", age: "d", done: "You built the gazebo! The grannies are in there now. They know everything about everyone. Shh." });
}

function arguingFairies(): Project {
  const s = new Studio();
  const pond = hexagon(L, 1, 1);
  s.triLid("the pond", pond.tris, 0, (i) => (i % 2 ? "blue" : "purple"), "a hexagon pond");
  pond.corners.forEach((c, k) => {
    const u = unit(away(pond.centre, c));
    const p: P = [Math.round((c[0] + 1.6 * u[0]) * 1e6) / 1e6, Math.round((c[1] + 1.6 * u[1]) * 1e6) / 1e6];
    const t = triOn(p, [Math.round((p[0] + u[1]) * 1e6) / 1e6, Math.round((p[1] - u[0]) * 1e6) / 1e6]);
    s.walls(`mushroom number ${k + 1}`, t, 2, ["yellow", "orange"], { closed: true, what: "in a triangle, the stalk" });
    s.tetra(`mushroom number ${k + 1}`, t, 2, k % 2 ? "red" : "purple");
  });
  return s.build({ id: "fairy-mushroom-ring", title: "The Mushroom Ring Where Fairies Argue", theme: "gardens", age: "d", done: "You built the mushroom ring! Six fairies, six mushrooms, and one argument about whose turn it is to sweep." });
}

function custardRiver(): Project {
  const s = new Studio();
  const river: [number, number][] = [];
  for (let z = -2; z < 4; z++) river.push([3, z], [4, z]);
  s.rug("the custard river", river, "yellow", "a river of squares under where the bridge goes");
  trussBridge(s, "The bridge", 0, 8, "red", "orange", "green");
  s.tower("the left gate", -1.7, 0, 3, ["blue", "purple"], { cap: "tall", capColour: "red" });
  s.tower("the right gate", 8.7, 0, 3, ["blue", "purple"], { cap: "tall", capColour: "red" });
  return s.build({ id: "custard-river-truss-bridge", title: "The Long Truss Bridge Over the Custard River", theme: "bridges", age: "d", done: "You built the truss bridge! Up, down, up, down, all the way across. Don't fall in. It's custard." });
}

function upForAges(): Project {
  const s = new Studio();
  const h = hexagon(L, 1, 1);
  for (let y = 0; y < 10; y++) {
    s.walls(`floor ${y + 1}`, h.corners, 1, [RAINBOW[y % 6]], { closed: true, base: y, gap: y === 0 ? 4 : undefined, what: "in a hexagon" });
    if (y === 2 || y === 5) s.triLid(`floor ${y + 1}`, h.tris, y + 1, "yellow", "a floor of triangles");
  }
  s.triLid("the top", h.tris, 10, "orange", "a hexagon top");
  s.tetra("the top", h.tris[0], 10, "red");
  s.tetra("the top", h.tris[3], 10, "purple");
  s.fins("the feet", h.corners.map((c) => ({ corner: c, out: away(h.centre, c) })), "blue", "six feet", true);
  return s.build({ id: "hexagon-tower-up-for-ages", title: "The Hexagon Tower That Goes Up for Ages", theme: "bridges", age: "d", done: "You built the tower that goes up for ages! Ten floors. The lift is broken. Good luck." });
}

function tinyTrainViaduct(): Project {
  const s = new Studio();
  const xs = [0, 2, 4, 6, 8];
  xs.forEach((x, i) => s.tower(`pier number ${i + 1}`, x, 0, 2, ["purple", "blue"], { cap: i === 0 || i === 4 ? "tall" : "lid", capColour: "red" }));
  for (const x of [1, 3, 5, 7]) s.deck("a span", "x", x, x + 1, 0, 2, "green");
  s.rug("the stream", [[5, -2], [5, -1], [5, 1], [5, 2], [5, 3]], "blue", "a stream under the middle span");
  s.tower("the tiny train", 2, 0, 1, ["orange"], { base: 2, cap: "none" });
  return s.build({ id: "tiny-train-viaduct", title: "The Viaduct for Very Small Trains", theme: "bridges", age: "d", done: "You built the viaduct! The train is so small it stops at every pier for a rest." });
}

function wizardCorkscrew(): Project {
  const s = new Studio();
  const h = hexagon(L, 1, 1);
  s.walls("the wizard's tower", h.corners, 6, ["purple", "blue"], { closed: true, what: "in a hexagon" });
  s.triLid("the wizard's tower", h.tris, 6, "yellow", "a hexagon top");
  s.tetra("the wizard's hat", h.tris[0], 6, "purple");
  for (let k = 0; k < 6; k++) {
    const t = triOut(h.centre, h.corners[k], h.corners[(k + 1) % 6]);
    s.walls(`step ${k + 1}`, t, k + 1, [RAINBOW[k]], { closed: true, what: "in a triangle against the tower" });
    s.tetra(`step ${k + 1}`, t, k + 1, "yellow");
  }
  return s.build({ id: "wizard-corkscrew-tower", title: "The Wizard's Corkscrew Tower", theme: "bridges", age: "d", done: "You built the Corkscrew Tower! Six points, each one higher than the last. The wizard walks round and round to get home." });
}

export const FRESH_D2: Project[] = [
  lighthouseWhale(),
  mouseScaredDragon(),
  lostCountOctopus(),
  accidentalTortoise(),
  showOffPeacock(),
  tooMuchFlowerBed(),
  snackMaze(),
  giantTomatoes(),
  gossipGazebo(),
  arguingFairies(),
  custardRiver(),
  upForAges(),
  tinyTrainViaduct(),
  wizardCorkscrew(),
];
