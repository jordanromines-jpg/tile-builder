/* 2.3: fifteen builds for 6 to 8, 12 to 40 tiles, from one 100-piece set. Each is built mostly from a part off the
   square grid (studio.ts): hexagons, three-triangle pyramids, zigzags, fins, sails, flat pictures. */
import type { Project } from "../../engine/types";
import { Studio, hexagon, lattice, polygon, triOn, turtle } from "../studio";
import { corners, row, triCorners } from "./parts";

const L = lattice(0, 0);

function tidyBee(): Project {
  const s = new Studio();
  const h = hexagon(L, 1, 1);
  s.walls("the hut", h.corners, 2, ["yellow", "orange"], { closed: true, gap: 0, what: "in a hexagon" });
  s.triLid("the hut", h.tris, 2, "yellow", "a hexagon roof of triangles");
  s.tetra("the chimney", h.tris[3], 2, "red");
  return s.build({ id: "tidy-bee-hut", title: "The Hexagon Hut of a Very Tidy Bee", theme: "homes", age: "b", done: "You built the Hexagon Hut! The bee says: shoes off, please, and no honey on the walls." });
}

function goblinCamp(): Project {
  const s = new Studio();
  const t = triOn([2, 0], [3, 0]);
  s.walls("the lookout", t, 3, ["green", "blue", "green"], { closed: true, what: "in a triangle" });
  s.tetra("the lookout", t, 3, "red");
  s.tetra("the first tent", triOn([0, 2], [1, 2]), 0, "orange");
  s.tetra("the second tent", triOn([4, 2], [5, 2]), 0, "purple");
  s.rug("the campfire", [[2, 2]], "yellow", "a square");
  return s.build({ id: "worried-goblin-camp", title: "The Campsite for One Small Worried Goblin", theme: "gardens", age: "b", done: "You built the goblin's campsite! The goblin is still worried. But now the goblin is worried in a tent." });
}

function zigzagSnake(): Project {
  const s = new Studio();
  const pts = turtle([0, 0], 30, [-60, 60, -60, 60, -60, 60, -60]);
  s.walls("Sssssid", pts, 2, ["green", "yellow"], { what: "in a zigzag" });
  const end = pts[pts.length - 1];
  const before = pts[pts.length - 2];
  s.fins("Sssssid", [{ corner: end, out: [end[0] - before[0], end[1] - before[1]] }], "red", "a tongue");
  return s.build({ id: "zigzag-snake", title: "Sssssid the Zigzag Snake", theme: "animals", age: "b", done: "You built Sssssid! Sssssid says thank you very much. Well. Sssssid says sssss." });
}

function burpRocket(): Project {
  const s = new Studio();
  s.tower("the rocket", 0, 0, 4, ["blue", "purple"], { cap: "tall", capColour: "red" });
  s.fins("the rocket", corners(0, 0), "orange");
  return s.build({ id: "burp-rocket", title: "The Rocket Fuelled by Burps", theme: "space", age: "b", done: "You built the Burp Rocket! Three, two, one... BURRRP. Excuse me. Lift-off!" });
}

function sailBoat(): Project {
  const s = new Studio();
  s.block("the boat", 0, 0, 3, 1, 1, ["blue"], { roof: "yellow" });
  s.fins("the boat", [{ corner: [3, 1], out: [1, 0] }, { corner: [3, 0], out: [1, 0] }], "red", "a pointy front");
  s.tower("the mast", 1, 0, 2, ["orange", "red"], { base: 1, cap: "tall", capColour: "purple" });
  return s.build({ id: "mostly-sail-boat", title: "The Boat That Is Mostly Sail", theme: "vehicles", age: "b", done: "You built the boat that is mostly sail! It goes very fast. Nobody knows how to stop it." });
}

function crumbCrown(): Project {
  const s = new Studio();
  const o = polygon([0, 0], 8);
  s.rug("the cushion", [[0, -1.707107]], "red", "a square in the middle");
  s.walls("the crown", o, 2, ["yellow", "orange"], { closed: true, what: "in an octagon, eight sides" });
  s.tetra("the jewel", triOn([0, -0.75], [1, -0.75]), 0, "purple");
  return s.build({ id: "queen-of-crumbs-crown", title: "The Crown of the Queen of Crumbs", theme: "castles", age: "b", done: "You built the crown! The Queen of Crumbs puts it on. It has biscuit in it already." });
}

function soreStego(): Project {
  const s = new Studio();
  s.block("the body", 0, 0, 3, 1, 1, ["green"], { roof: "green" });
  // the head and tail go on after the roof: a long ring skews like a parallelogram until its roof holds it (R14)
  s.tetra("the head", triOn([3, 1], [3, 0], -1), 0, "green", true);
  s.fins("the tail", [{ corner: [0, 1], out: [-1, 0] }, { corner: [0, 0], out: [-1, 0] }], "purple", "a pointy tail", true);
  return s.build({ id: "sore-stegosaurus", title: "The Stegosaurus with a Sore Back", theme: "animals", age: "b", done: "You built the stegosaurus! Its back is sore because of all the spiky plates. Gently does it." });
}

function nearlySnail(): Project {
  const s = new Studio();
  s.rug("the snail's body", row(0, 4, 0), "green", "a line of squares");
  const h = hexagon(L, 1, 1);
  s.walls("the shell", h.corners, 2, ["orange", "yellow"], { closed: true, what: "in a hexagon behind the body" });
  s.triLid("the shell", h.tris, 2, (i) => (i % 2 ? "orange" : "purple"), "the top of the shell");
  return s.build({ id: "nearly-there-snail", title: "The Snail Who Is Always Nearly There", theme: "animals", age: "b", done: "You built the snail! Is it there yet? Nearly. It is always nearly there." });
}

function tinyDucks(): Project {
  const s = new Studio();
  s.pad("the pond", 0, 0, "blue", "a big square for the pond");
  const ring: [number, number][] = [[-1, -1], ...row(0, 2, -1), [2, -1], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [-1, 2], [-1, 1], [-1, 0]];
  s.rug("the grass", ring, "green", "squares all round the pond");
  s.tetra("the duck", triOn([0.5, 1.5], [1.5, 1.5]), 0, "yellow");
  return s.build({ id: "tiny-duck-pond", title: "The Pond for Extremely Tiny Ducks", theme: "gardens", age: "b", done: "You built the pond! The ducks are so tiny you cannot see them. But they say thank you. Quack." });
}

function coneFactory(): Project {
  const s = new Studio();
  s.block("the factory", 0, 0, 2, 1, 2, ["blue", "purple"], { door: true, roof: "blue" });
  [3, 4.5, 6].forEach((x, i) => s.tetra(`cone number ${i + 1}`, triOn([x, 1], [x + 1, 1]), 0, "orange"));
  return s.build({ id: "traffic-cone-factory", title: "The Traffic Cone Factory", theme: "vehicles", age: "b", done: "You built the Traffic Cone Factory! Every cone points up. That is the rule. Beep beep." });
}

function sandwichLighthouse(): Project {
  const s = new Studio();
  const h = hexagon(L, 1, 1);
  s.walls("the lighthouse", h.corners, 3, ["red", "yellow", "red"], { closed: true, gap: 0, what: "in a hexagon" });
  s.triLid("the lighthouse", h.tris, 3, "yellow", "the lamp floor");
  s.tetra("the lighthouse", h.tris[0], 3, "red");
  return s.build({ id: "lost-sandwich-lighthouse", title: "The Lighthouse for Lost Sandwiches", theme: "bridges", age: "b", done: "You built the lighthouse! Lost sandwiches can find their way home now. The cheese ones get lost a lot." });
}

function wigglyFence(): Project {
  const s = new Studio();
  const pts = turtle([0, 0], 0, [90, -90, -90, 90, 90, -90]);
  s.walls("the fence", pts, 2, ["purple", "green"], { what: "that turns left and right" });
  s.tetra("the first flower", triOn([-1.2, 0.2], [-0.2, 0.2]), 0, "red");
  s.tetra("the last flower", triOn([pts[7][0] + 0.2, pts[7][1] + 0.2], [pts[7][0] + 1.2, pts[7][1] + 0.2]), 0, "yellow");
  return s.build({ id: "wiggly-fence", title: "The Wiggly Fence That Keeps Out Nothing", theme: "patterns", age: "b", done: "You built the wiggly fence! It keeps out nothing at all. But it does it beautifully." });
}

function wobbleTent(): Project {
  const s = new Studio();
  const t = triOn([0, 0], [1, 0]);
  s.walls("the space tent", t, 2, ["blue", "purple"], { closed: true, what: "in a triangle" });
  s.tetra("the space tent", t, 2, "yellow");
  s.fins("the space tent", triCorners(t), "red", "legs");
  s.pad("the landing pad", 2.5, -1, "yellow", "a big square");
  s.tetra("the satellite dish", triOn([5, 0], [6, 0]), 0, "green");
  return s.build({ id: "planet-wobble-tent", title: "The Space Tent on Planet Wobble", theme: "space", age: "b", done: "You built the space tent! On Planet Wobble everything wobbles. Even the tent. Even you." });
}

function braveAnt(): Project {
  const s = new Studio();
  s.tower("the first tower", 0, 0, 2, ["red", "orange"], { cap: "low", capColour: "yellow" });
  s.tower("the second tower", 2, 0, 2, ["red", "orange"], { cap: "low", capColour: "yellow" });
  s.deck("the bridge", "x", 1, 2, 0, 2, "green");
  s.fins("the props", [{ corner: [0, 1], out: [-1, 1] }, { corner: [0, 0], out: [-1, -1] }, { corner: [3, 1], out: [1, 1] }, { corner: [3, 0], out: [1, -1] }], "purple", "props at the outside corners");
  return s.build({ id: "brave-ant-bridge", title: "The Bridge for One Very Brave Ant", theme: "bridges", age: "b", done: "You built the bridge! The ant walks across. Then back. Then across again. Very brave." });
}

function beepRobot(): Project {
  const s = new Studio();
  s.tower("the left leg", 0, 0, 1, ["blue"], { cap: "none" });
  s.tower("the right leg", 2, 0, 1, ["blue"], { cap: "none" });
  // starting at the back, so each square over the gap between the legs goes on after its neighbours
  s.walls("the body", [[1, 0], [0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 0], [2, 0]], 1, ["purple"], { closed: true, base: 1, what: "in a ring on the legs" });
  s.platform("the body", 0, 0, 3, 1, 2, "purple");
  s.tower("the head", 1, 0, 1, ["yellow"], { base: 2, cap: "none" });
  return s.build({ id: "beep-robot", title: "The Robot Who Only Says Beep", theme: "space", age: "b", done: "You built the robot! It says beep. Just beep. It means hello. And goodbye. And pass the ketchup." });
}

export const FRESH_B: Project[] = [
  tidyBee(),
  goblinCamp(),
  zigzagSnake(),
  burpRocket(),
  sailBoat(),
  crumbCrown(),
  soreStego(),
  nearlySnail(),
  tinyDucks(),
  coneFactory(),
  sandwichLighthouse(),
  wigglyFence(),
  wobbleTent(),
  braveAnt(),
  beepRobot(),
];
