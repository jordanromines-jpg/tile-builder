/* 2.3: big builds for 11 to 16 (part three): pictures in walls, a Sierpinski triangle, a square spiral, waves,
   a hovercraft, a paddle steamer, a mountain of triangles, a lunar lander, an embassy of hexagons. */
import type { Colour } from "../../engine/catalog";
import type { Project } from "../../engine/types";
import { Studio, hexagon, lattice, star, turtle, type P, type Tri } from "../studio";
import { away, bigTri, bigTriPath, pixelWall, triOut } from "./parts";

const L = lattice(0, 0);
const H = Math.sqrt(3) / 2;
const tri = (x: number, z: number): Tri => [[x, z], [x + 1, z], [x + 0.5, z - H]];
const triFront = (x: number, z: number): Tri => [[x, z], [x + 1, z], [x + 0.5, z + H]];
const up = (i: number, j: number): Tri => [L(i, j), L(i + 1, j), L(i, j + 1)];
const RAINBOW: Colour[] = ["red", "orange", "yellow", "green", "blue", "purple"];

function wallSaysHi(): Project {
  const s = new Studio();
  pixelWall(s, "The sign", 0, 0, ["ppppppppp", "bybybyyyb", "byyybbybb", "bybybbybb", "bybybyyyb", "bbbbbbbbb"]);
  // feet each way at both ends: six high and one square thick, the sign tipped over towards the child (R14)
  s.part(
    0,
    (b) => {
      for (const x of [0, 9]) {
        b.wallZ("square", "blue", x, 0, -2);
        b.wallZ("square", "blue", x, 0, 0);
      }
      return 4;
    },
    () => "The sign's feet: at each end of the bottom row, one more square going back and one coming forward, in line with the one there. A deep base doesn't tip either way.",
  );
  s.rug("the path", Array.from({ length: 9 }, (_, i) => [i, 1] as [number, number]), "green", "a path in front");
  ([[0.2, 3.2], [2.7, 3.2], [5.2, 3.2], [7.7, 3.2]] as [number, number][]).forEach(([x, z], i) => s.tetra(`flower number ${i + 1}`, tri(x, z), 0, RAINBOW[i]));
  return s.build({ id: "wall-that-says-hi", title: "The Wall That Says HI (and Nothing Else)", theme: "patterns", age: "d", done: "You built the wall that says HI! Say hi back. It won't answer. It only knows the one word." });
}

function worriedSmiley(): Project {
  const s = new Studio();
  pixelWall(s, "The face", 0, 0, ["gyyyyyg", "yyyyyyy", "ybyyyby", "yyyyyyy", "yyrrryy", "yryyyry", "gyyyyyg"]);
  // the wall is seven high and one square thick, so its bottom row gets a second square going back at each end: two deep
  s.part(
    0,
    (b) => {
      b.wallZ("square", "green", 0, 0, -2);
      b.wallZ("square", "green", 7, 0, -2);
      // and one coming forward: with its weight at its front, the face tipped forward with feet only behind (R14)
      b.wallZ("square", "green", 0, 0, 0);
      b.wallZ("square", "green", 7, 0, 0);
      return 4;
    },
    () => "The face's feet: at each end of the bottom row, one more square going back and one coming forward, in line with the one there. A deep base doesn't tip either way: the tall face stands steady.",
  );
  s.rug("the shadow", Array.from({ length: 7 }, (_, i) => [i, 1] as [number, number]), "green", "a strip in front");
  return s.build({ id: "slightly-worried-smiley", title: "The Smiley That Is Slightly Worried", theme: "patterns", age: "d", done: "You built the smiley! It is slightly worried. Did it leave the oven on? Probably not. Probably." });
}

function sierpinski(): Project {
  const s = new Studio();
  const ups: Tri[] = [];
  for (let j = 0; j < 8; j++) for (let i = 0; i + j < 8; i++) if ((i & j) === 0) ups.push(up(i, j));
  // the frame first, then the pattern inside it and the corners on the pattern: flat tiles joined to a frame that is
  // still going up get lifted as it rocks (R14)
  s.walls("the frame", bigTriPath(L, 0, 0, 8), 2, ["purple", "blue"], { closed: true, what: "round the outside" });
  s.triLid("the pattern", ups, 0, (k) => RAINBOW[k % 6], "triangles flat, leaving the holes empty", undefined, true);
  [up(0, 0), up(7, 0), up(0, 7)].forEach((t) => s.tetra("a corner", t, 0, "yellow", true));
  return s.build({ id: "sierpinski-say-it-five-times", title: "The Sierpinski Triangle (Say It Five Times Fast)", theme: "patterns", age: "d", done: "You built the Sierpinski triangle! Triangles in triangles in triangles. Now say Sierpinski five times fast." });
}

function squareSpiral(): Project {
  const s = new Studio();
  const runs = [1, 1, 2, 2, 3, 3, 4, 4, 5];
  const turns: number[] = Array<number>(runs[0] - 1).fill(0);
  runs.slice(1).forEach((n) => turns.push(90, ...Array<number>(n - 1).fill(0)));
  const pts = turtle([0, 0], 0, turns);
  s.walls("the spiral", pts, 3, ["purple", "blue", "green"], { what: "round and round, turning left at each corner" });
  return s.build({ id: "dizzy-square-spiral", title: "The Square Spiral That Makes You Dizzy", theme: "patterns", age: "d", done: "You built the square spiral! Follow it with your finger to the middle. Now you are dizzy." });
}

function waveWalls(): Project {
  const s = new Studio();
  const heights = [2, 3, 4, 3, 2];
  const pipes = heights.map((_, k) => hexagon(L, 1 + 2 * k, 1 - k));
  pipes.forEach((h, k) => s.walls(`pipe number ${k + 1}`, h.corners, heights[k], RAINBOW.slice(k, k + 4), { closed: true, what: "in a hexagon, next to the last pipe" }));
  pipes.forEach((h, k) => s.triLid(`pipe number ${k + 1}`, h.tris, heights[k], k % 2 ? "yellow" : "orange", "a hexagon top"));
  return s.build({ id: "wave-walls", title: "The Hexagon Organ That Plays Itself", theme: "patterns", age: "d", done: "You built the Hexagon Organ! Short pipe, tall pipe, short pipe. It plays a tune when nobody is looking." });
}

function kaleidoTower(): Project {
  const s = new Studio();
  const h = hexagon(L, 1, 1);
  const v = h.corners;
  const n = v.map((p, k) => {
    const q = v[(k + 1) % 6];
    const m: P = [(p[0] + q[0]) / 2 - h.centre[0], (p[1] + q[1]) / 2 - h.centre[1]];
    const d = Math.hypot(m[0], m[1]);
    return [m[0] / d, m[1] / d] as P;
  });
  const plus = (a: P, b: P): P => [Math.round((a[0] + b[0]) * 1e9) / 1e9, Math.round((a[1] + b[1]) * 1e9) / 1e9];
  s.triLid("the floor", h.tris, 0, (i) => (i % 2 ? "purple" : "blue"), "a hexagon of triangles");
  s.flats("the floor", v.map((p, k) => ({ shape: "square", colour: "yellow" as Colour, a: p, b: v[(k + 1) % 6], toward: plus(p, n[k]) })), 0, "a square on each side");
  s.triLid("the floor", v.map((p, k) => [plus(p, n[(k + 5) % 6]), plus(p, n[k]), p] as Tri), 0, "red", "a triangle in each gap");
  const ring: P[] = v.flatMap((p, k) => [plus(p, n[(k + 5) % 6]), plus(p, n[k])]);
  s.walls("the outer wall", ring, 4, ["green", "orange"], { closed: true, gap: 1, what: "round the outside, twelve sides" });
  s.walls("the inner tower", v, 4, ["purple", "blue"], { closed: true, what: "round the hexagon in the middle" });
  s.triLid("the inner tower", h.tris, 4, "yellow", "a hexagon top");
  s.tetra("the inner tower", h.tris[0], 4, "orange");
  return s.build({ id: "kaleidoscope-tower", title: "The Kaleidoscope Tower", theme: "patterns", age: "d", done: "You built the Kaleidoscope Tower! A hexagon in a twelve-sided wall, with squares and triangles in between." });
}

function tooTallStar(): Project {
  const s = new Studio();
  const st = star(L, 2, 2);
  s.walls("the star", st.corners, 5, ["red", "orange", "yellow", "green", "blue"], { closed: true, gap: 0, what: "in a six-point star" });
  s.triLid("the star", st.tris, 5, (i) => (i < 6 ? "blue" : "purple"), "a star-shaped top");
  return s.build({ id: "star-that-was-too-tall", title: "The Star That Was Too Tall", theme: "patterns", age: "d", done: "You built the star that was too tall! It used to be a flat star. Then it kept growing." });
}

function puddleHovercraft(): Project {
  const s = new Studio();
  const hull = [L(0, 0), L(1, 0), L(2, 0), L(3, 0), L(3, 1), L(2, 2), L(1, 2), L(0, 2), L(-1, 2), L(-1, 1)];
  s.walls("the hovercraft", hull, 2, ["orange", "red"], { closed: true, what: "in a long hexagon" });
  const cabin = hexagon(L, 1, 1);
  s.walls("the cabin", cabin.corners, 5, ["blue", "purple"], { closed: true, what: "in a hexagon inside the hull, sharing two of its walls" });
  s.triLid("the cabin", cabin.tris, 5, "blue");
  s.tetra("the radar", cabin.tris[1], 5, "red");
  s.fins("the front", [{ corner: L(3, 0), out: [1, 0.3] }, { corner: L(3, 1), out: [1, -0.3] }], "purple", "a bumper");
  [-0.5, 1.7, 3.9].forEach((x, i) => s.pad(`puddle number ${i + 1}`, x, 1, "blue", "a big square puddle"));
  return s.build({ id: "puddle-hovercraft", title: "The Hovercraft That Mostly Hovers Over Puddles", theme: "vehicles", age: "d", done: "You built the hovercraft! It can cross the sea. But it prefers puddles. Less splashy." });
}

function sixteenWheels(): Project {
  const s = new Studio();
  s.block("the truck", 0, 0, 4, 2, 2, ["red", "orange"], { roof: "red" });
  s.block("the cab", 3, 0, 1, 2, 1, ["yellow"], { base: 2, roof: "yellow" });
  s.fins("the bull bar", [{ corner: [4, 2], out: [1, 0] }, { corner: [4, 0], out: [1, 0] }], "blue", "a bull bar");
  for (let i = 0; i < 4; i++) {
    s.tetra(`a wheel`, triFront(i * 1.02 - 0.02, 2.05), 0, "purple");
    s.tetra(`a wheel`, tri(i * 1.02 - 0.02, -0.05), 0, "purple");
  }
  return s.build({ id: "monster-truck-many-wheels", title: "The Monster Truck with Far Too Many Wheels", theme: "vehicles", age: "d", done: "You built the monster truck! Eight wheels. Or is it more? Nobody can count them when it goes past." });
}

function paddleSteamer(): Project {
  const s = new Studio();
  const hull: P[] = [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [5, 1], [5, 0], [4, 0], [3, 0], [2, 0], [1, 0], [0, 0], [0, 1]];
  s.walls("the hull", hull, 1, ["blue"], { closed: true, what: "in a long box" });
  for (const x of [2, 4]) s.walls("the hull's inside", [[x, 0], [x, 1], [x, 2]], 1, ["blue"], { what: "across the inside, back to front. It holds the deck up" });
  s.platform("the deck", 0, 0, 5, 2, 1, "orange");
  for (const seg of [[[2, 2], [3, 2]], [[3, 0], [2, 0]]] as [P, P][]) {
    const t = triOut([2.5, 1], seg[0], seg[1]);
    s.walls("a paddle box", t, 1, ["red"], { closed: true, what: "in a triangle against the side" });
    s.tetra("a paddle box", t, 1, "yellow");
  }
  s.block("the cabin", 1, 0, 3, 1, 2, ["yellow", "green"], { base: 1, roof: "yellow" });
  for (const x of [1, 3]) {
    s.tower("a funnel", x, 0, 2, ["red", "purple"], { base: 3, cap: "none" });
  }
  s.fins("the bow", [{ corner: [5, 2], out: [1, 0] }, { corner: [5, 0], out: [1, 0] }], "purple", "a pointy bow", true);
  return s.build({ id: "polite-pirate-paddle-steamer", title: "The Paddle Steamer of Polite Pirates", theme: "vehicles", age: "d", done: "You built the paddle steamer! The pirates say: may we please have your treasure? Thank you ever so much." });
}

function illegalRocketCar(): Project {
  const s = new Studio();
  const body: P[] = [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [5, 1], [5, 0], [4, 0], [3, 0], [2, 0], [1, 0], [0, 0], [0, 1]];
  s.walls("the car", body, 1, ["purple"], { closed: true, what: "in a long box" });
  for (const x of [2, 4]) s.walls("the car's inside", [[x, 0], [x, 1], [x, 2]], 1, ["purple"], { what: "across the inside, back to front. It holds the roof up" });
  s.platform("the car", 0, 0, 5, 2, 1, "purple");
  for (const seg of [[[0, 2], [0, 1]], [[0, 1], [0, 0]]] as [P, P][]) {
    const t = triOut([2.5, 1], seg[0], seg[1]);
    s.walls("a rocket engine", t, 2, ["orange", "red"], { closed: true, what: "in a triangle at the back" });
    s.tetra("a rocket engine", t, 2, "yellow");
  }
  s.tower("the cockpit", 3, 0, 1, ["blue"], { base: 1, cap: "lid", capColour: "blue" });
  s.fins("the nose", [{ corner: [5, 2], out: [1, 0] }, { corner: [5, 0], out: [1, 0] }], "red", "a pointy nose", true);
  for (const x of [0.6, 3.4]) {
    s.tetra("a wheel", triFront(x, 2.05), 0, "green");
    s.tetra("a wheel", tri(x, -0.05), 0, "green");
  }
  return s.build({ id: "technically-illegal-rocket-car", title: "The Rocket Car That Is Technically Illegal", theme: "vehicles", age: "d", done: "You built the rocket car! It goes from nought to sixty in no seconds. The police are very confused." });
}

const triKey = (t: Tri) => t.map((p) => p.map((v) => v.toFixed(3)).join(",")).sort().join("|");

function bananaMountain(): Project {
  const s = new Studio();
  const colours: Colour[] = ["green", "yellow"];
  [3, 2].forEach((n, y) => {
    const level = bigTri(L, 0, 0, n).tris;
    // a wall under every edge of every triangle, so each triangle of the floor above rests on three walls (R10)
    level.forEach((t) => s.walls(`the mountain, level ${y + 1}`, t, 1, [colours[y]], { closed: true, base: y, what: "in a triangle, next to the last one" }));
    // no floor under the rooms of the level above: its walls stand on the walls below, not on the seams between floor
    // tiles, which a hand holding them would set swinging (R14)
    const above = new Set((y === 0 ? bigTri(L, 0, 0, 2).tris : []).map(triKey));
    s.triLid(`the mountain, level ${y + 1}`, level.filter((t) => !above.has(triKey(t))), y + 1, colours[y], "a floor of triangles, one on each little room");
  });
  s.tetra("the peak", up(0, 0), 2, "orange");
  s.tower("the cable car station", 5, 0.5, 3, ["blue", "purple"], { cap: "tall", capColour: "red" });
  s.rug("the path", [[4, 1.5], [4, 2.5], [3, 2.5], [2, 2.5], [1, 2.5]], "orange", "a path to the station");
  return s.build({ id: "banana-mountain-cable-car", title: "The Cable Car Station on Banana Mountain", theme: "vehicles", age: "d", done: "You built Banana Mountain! The cable car goes up to the top. Nobody knows why it's called Banana Mountain. Nobody asks." });
}

function headfirstLander(): Project {
  const s = new Studio();
  const st = star(L, 2, 2);
  s.triLid("the landing star", st.tris, 0, (i) => (i < 6 ? "yellow" : "orange"), "a star on the ground");
  const h = hexagon(L, 2, 2);
  s.walls("the lander", h.corners, 5, ["blue", "purple"], { closed: true, what: "in a hexagon on the star" });
  s.triLid("the lander", h.tris, 5, "blue");
  s.tetra("the lander", h.tris[0], 5, "red");
  s.tetra("the lander", h.tris[3], 5, "red");
  s.fins("the legs", h.corners.map((c) => ({ corner: c, out: away(h.centre, c) })), "orange", "legs", true);
  [-2.6, 5.6, 1.5].forEach((x, i) => s.pad(`moon rock ${i + 1}`, x, i === 2 ? 1.8 : -1.5, "purple", "a big square"));
  return s.build({ id: "lander-landed-on-its-head", title: "The Lunar Lander That Landed on Its Head", theme: "space", age: "d", done: "You built the lunar lander! Is it the right way up? The astronauts aren't sure either." });
}

function politeAlienEmbassy(): Project {
  const s = new Studio();
  const middle = hexagon(L, 2, 2);
  const ring = [[3, 3], [4, 1], [3, 0], [1, 1], [0, 3], [1, 4]].map(([i, j]) => hexagon(L, i, j));
  s.walls("the great hall", middle.corners, 4, ["green", "blue"], { closed: true, what: "in a hexagon" });
  ring.forEach((h, k) => s.walls(`office ${k + 1}`, h.corners, 2, [RAINBOW[k], "purple"], { closed: true, gap: k === 2 ? 4 : undefined, what: "in a hexagon, sharing walls" }));
  ring.forEach((h, k) => s.triLid(`office ${k + 1}`, h.tris, 2, k % 2 ? "yellow" : "orange", "a hexagon roof"));
  const count = new Map<string, number>();
  const all = [middle, ...ring].flatMap((h) => h.corners);
  all.forEach((p) => count.set(p.join(), (count.get(p.join()) ?? 0) + 1));
  const outer = all.filter((p) => count.get(p.join()) === 1).filter((_, i) => i % 2 === 0);
  s.fins("the embassy", outer.map((p) => ({ corner: p, out: away(middle.centre, p) })), "red", "welcome flags", true);
  return s.build({ id: "polite-alien-embassy", title: "The Embassy for Very Polite Aliens", theme: "space", age: "d", done: "You built the Alien Embassy! The aliens say: greetings, Earthlings, please wipe your feet." });
}

export const FRESH_D3: Project[] = [
  wallSaysHi(),
  worriedSmiley(),
  sierpinski(),
  squareSpiral(),
  waveWalls(),
  kaleidoTower(),
  tooTallStar(),
  puddleHovercraft(),
  sixteenWheels(),
  paddleSteamer(),
  illegalRocketCar(),
  bananaMountain(),
  headfirstLander(),
  politeAlienEmbassy(),
];
