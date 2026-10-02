/* Projects for 6 to 8 (plan keys 6j, 6k): up to three tiles a step (a whole roof counts as one), 12 to 40 tiles. Ten
   build from a Magna-Tiles 100; the robot, the bus and the cottage from a Connetix 60. Words from the 6–8 list: edge,
   face, cube, pyramid, half, row, layer, left, right, opposite, between, symmetrical. */
import type { Project } from "../engine/types";
import { Builder, TALL_TO_LOW } from "./helpers";


function pitchedHouse(): Project {
  const b = new Builder();
  b.room("red", 0, 0, 2, 1, 0);
  b.chunk(3, ["Stand three squares in a row: two along the front and one at the right end.", "Three more make the back and the left end. Now it is a long box."]);
  b.wallZ("square", "yellow", 1, 0, 0);
  b.step("A yellow square stands across the middle, between the front and the back. It splits the house into two rooms.");
  b.roof("blue", 0, 0, 1);
  b.step("Lean four tall triangles over the left room until their tips meet. That is a pyramid.");
  b.roof("blue", 1, 0, 1);
  b.step("Make a matching pyramid over the right room. The roof is symmetrical.");
  return b.build({ id: "pitched-house", title: "A house with a roof", theme: "homes", age: "b", stars: 1, done: "You built a house! Two rooms and two pointy roofs.", swaps: [TALL_TO_LOW] });
}

function garage(): Project {
  const b = new Builder();
  b.room("green", 0, 0, 2, 2, 0, [0, 1]);
  b.chunk(3, ["Stand two squares edge to edge for the right side, and one at the back.", "Finish the back and the left side. The front stays open for the car."]);
  b.wallZ("square", "green", 1, 0, 0);
  b.wallZ("square", "green", 1, 0, 1);
  b.step("Stand two squares across the middle, from the back to the open front. Now there are two parking spaces, and the roof has a wall to rest on.");
  b.lids("blue", 0, 0, 2, 2, 1);
  b.chunk(3, ["Lay three squares flat on top. Each one rests on two edges.", "The last square closes the roof."]);
  b.lowRoof("yellow", 1, 1, 1);
  b.step("Lean four triangles together on the roof until their tips meet. That is the sign.");
  return b.build({ id: "garage", title: "A garage", theme: "vehicles", age: "b", stars: 1, done: "You built a garage! Park a car inside." });
}

function twinBridge(): Project {
  const b = new Builder();
  b.room("blue", 0, 0, 1, 1, 0);
  b.chunk(3, ["Stand three squares in a U. That is half of the first tower.", "One more square closes the tower: a ring of four."]);
  b.room("blue", 2, 0, 1, 1, 0);
  b.chunk(3, ["Leave a gap of one square, then stand three squares in a U for the second tower.", "Close the second tower."]);
  b.lid("square", "yellow", 1, 1, 0);
  b.step("Lay a square flat between the tops of the towers: the bridge's deck. It rests on both towers.");
  b.room("purple", 0, 0, 1, 1, 1);
  b.chunk(3, ["Make the first tower one layer taller: three squares on the top edges.", "Close the new layer."]);
  b.room("purple", 2, 0, 1, 1, 1);
  b.chunk(3, ["Now the second tower: three squares on top.", "Close it. The towers are symmetrical."]);
  b.roof("red", 0, 0, 2);
  b.step("A pyramid of tall triangles on the first tower.");
  b.roof("red", 2, 0, 2);
  b.step("And one on the second tower.");
  return b.build({ id: "twin-bridge", title: "A bridge with two towers", theme: "bridges", age: "b", stars: 2, done: "You built a bridge! Can a car drive across the deck?", swaps: [TALL_TO_LOW] });
}

function rocket3d(): Project {
  const b = new Builder();
  b.room("blue", 0, 0, 1, 1, 0);
  b.stand("tri-right", "orange", [0, 1], [-1, 1]);
  b.stand("tri-right", "orange", [1, 1], [2, 1]);
  b.stand("tri-right", "orange", [1, 0], [2, 0]);
  b.stand("tri-right", "orange", [0, 0], [-1, 0]);
  b.chunk(3, [
    "Stand three squares in a U.",
    "Close the ring with a fourth square, then stand a corner triangle at a corner: its straight edge on the tower's edge. A fin.",
    "Two more fins at the other corners. Four fins, one at each corner.",
  ]);
  b.room("blue", 0, 0, 1, 1, 1);
  b.room("blue", 0, 0, 1, 1, 2);
  b.chunk(3, ["Stack three squares on the top edges.", "Close that layer and start the next one.", "Finish the top layer. The rocket is three squares tall."]);
  b.roof("red", 0, 0, 3);
  b.step("Lean four tall triangles in on top. A pointy nose.");
  return b.build({ id: "rocket-tower", title: "A rocket with fins", theme: "space", age: "b", stars: 1, done: "You built a rocket! Count down: five, four, three, two, one.", swaps: [TALL_TO_LOW] });
}

function robot(): Project {
  const b = new Builder();
  b.room("purple", 0, 0, 1, 1, 0);
  b.stand("square", "blue", [0, 1], [-1, 1]);
  b.stand("square", "blue", [1, 1], [2, 1]);
  b.chunk(3, ["Stand three squares in a U for the robot's legs.", "Close the ring, then stand a square out to the left at the front corner. A foot.", "The other foot, out to the right."]);
  b.room("purple", 0, 0, 1, 1, 1);
  b.room("green", 0, 0, 1, 1, 2);
  b.chunk(3, ["Stack three squares on the legs for the body.", "Close the body and start the head.", "Finish the head: a cube on top."]);
  b.lowRoof("yellow", 0, 0, 3);
  b.step("Lean four triangles together on the head until their tips meet. A pointy hat.");
  return b.build({ id: "robot", title: "A robot", theme: "space", age: "b", stars: 1, done: "You built a robot! What does it say?" });
}

function boat(): Project {
  const b = new Builder();
  b.lid("square", "blue", 0, 0, 0);
  b.lid("square", "blue", 1, 0, 0);
  b.step("Lay two squares flat, side by side. That is the bottom of the boat.");
  b.room("orange", 0, 0, 2, 1, 0);
  b.wallZ("square", "orange", 1, 0, 0);
  b.chunk(3, ["Stand three squares on the edges of the bottom.", "Three more go round the other edges.", "One square stands across the middle, between the sides."]);
  b.on("tri-equilateral", "yellow", [2, 0], [2, -1]);
  b.on("tri-equilateral", "yellow", [0, -1], [0, 0]);
  b.step("Lay a triangle flat at each end of the boat. A pointy front and back.");
  b.roof("red", 1, 0, 1);
  b.step("Lean four tall triangles together over the back room until their tips meet: the sail.");
  return b.build({ id: "boat", title: "A sailing boat", theme: "vehicles", age: "b", stars: 1, done: "You built a boat! Which way is the wind blowing?" });
}

function pyramidGarden(): Project {
  const b = new Builder();
  b.lids("green", 0, 0, 2, 2, 0);
  b.chunk(3, ["Lay three green squares flat in an L. The garden.", "One more square makes the garden a big square."]);
  b.lowRoof("yellow", 0, 0, 0);
  b.step("On one square, lean four triangles together until their tips meet. A pyramid.");
  b.lowRoof("orange", 1, 1, 0);
  b.step("Make another pyramid on the opposite corner.");
  b.roof("purple", 1, 0, 0);
  b.step("Tall triangles make a taller pyramid. Put it between the other two.");
  return b.build({ id: "pyramid-garden", title: "A pyramid garden", theme: "gardens", age: "b", stars: 1, done: "You built a garden of pyramids! Which one is tallest?", swaps: [TALL_TO_LOW] });
}

function keep(): Project {
  const b = new Builder();
  b.room("blue", 0, 0, 2, 2, 0);
  b.chunk(3, ["Stand three squares in a row along the front and round the corner.", "Three more go along the side and the back.", "Close the walls: eight squares in a big ring."]);
  b.lids("blue", 0, 0, 2, 2, 1);
  b.chunk(3, ["Lay three squares flat on top. Each one rests on two walls.", "The last square closes the roof."]);
  b.lowRoof("yellow", 0, 1, 1);
  b.step("Lean four triangles together on a front corner of the roof. A lookout.");
  b.lowRoof("yellow", 1, 0, 1);
  b.step("And another on the opposite corner. The keep is symmetrical.");
  return b.build({ id: "keep", title: "A small keep", theme: "castles", age: "b", stars: 1, done: "You built a keep! Eight walls, a roof and two lookouts." });
}

function bus(): Project {
  const b = new Builder();
  b.wallX("door", "yellow", 0, 0, 1);
  for (let x = 1; x < 4; x++) b.wallX("window", "yellow", x, 0, 1);
  b.wallZ("square", "yellow", 4, 0, 0);
  for (let x = 3; x >= 0; x--) b.wallX(x >= 2 ? "window" : "square", "yellow", x, 0, 0);
  b.wallZ("square", "yellow", 0, 0, 0);
  b.chunk(3, ["Stand a door and two windows in a row. That is the side of the bus.", "One more window, then a square at the front end.", "Along the back: two windows.", "Two squares finish the back and the end. A long box."]);
  b.lids("red", 0, 0, 4, 1, 1);
  b.chunk(3, ["Lay squares flat along the top.", "One more square closes the roof."]);
  return b.build({ id: "bus", title: "A bus", theme: "vehicles", age: "b", stars: 1, done: "You built a bus! Who gets on first?", needs: { brandExtras: ["window", "door"] } });
}

function cottage(): Project {
  const b = new Builder();
  b.wallX("door", "green", 0, 0, 1);
  b.wallX("window", "green", 1, 0, 1);
  b.wallZ("square", "green", 2, 0, 0);
  b.wallX("window", "green", 1, 0, 0);
  b.wallX("window", "green", 0, 0, 0);
  b.wallZ("square", "green", 0, 0, 0);
  b.chunk(3, ["Stand a door and a window side by side, and a square at the end.", "Two windows along the back, and a square at the other end."]);
  b.wallZ("square", "yellow", 1, 0, 0);
  b.step("A square across the middle makes two rooms.");
  b.roof("red", 0, 0, 1);
  b.step("Lean four tall triangles over the room with the door.");
  b.lowRoof("orange", 1, 0, 1);
  b.step("Four short triangles make a lower roof over the other room.");
  return b.build({ id: "cottage", title: "A cottage", theme: "homes", age: "b", stars: 1, done: "You built a cottage! Look through its windows.", needs: { brandExtras: ["window", "door"] }, swaps: [TALL_TO_LOW] });
}

function dinosaur(): Project {
  const b = new Builder();
  b.on("square-large", "green", [0, 0], [2, 0]);
  b.on("square", "green", [2, 1], [3, 1]);
  b.on("square", "green", [2, 2], [3, 2]);
  b.step("Lay a big square flat for the body. Two squares in a row up from its top corner make the neck.");
  b.on("square", "green", [3, 2], [4, 2]);
  b.on("tri-right", "red", [4, 2], [3, 2]);
  b.on("tri-isosceles-tall", "green", [0, 0.5], [0, 1.5]);
  b.step("A square for the head, a corner triangle under it for the jaw, and a tall triangle on the left edge: the tail.");
  b.on("tri-equilateral", "orange", [0, 2], [1, 2]);
  b.on("tri-equilateral", "orange", [1, 2], [2, 2]);
  b.on("tri-equilateral", "orange", [2, 3], [3, 3]);
  b.step("Three triangles along the top edges make spikes.");
  b.on("tri-equilateral", "orange", [3, 3], [4, 3]);
  b.on("square", "blue", [0, -1], [1, -1]);
  b.on("square", "blue", [1, -1], [2, -1]);
  b.step("One more spike on the head, and two squares under the body for legs.");
  return b.build({ id: "dinosaur", title: "A dinosaur", theme: "animals", age: "b", stars: 1, flat: true, done: "You made a dinosaur! Roar!" });
}

function star(): Project {
  const b = new Builder();
  const c = (i: number): [number, number] => [Math.cos((Math.PI / 3) * i), Math.sin((Math.PI / 3) * i)];
  const COLS = ["red", "orange", "yellow", "green", "blue", "purple"] as const;
  for (let i = 0; i < 6; i++) b.on("tri-equilateral", COLS[i], c(i), c(i + 1));
  b.chunk(3, ["Lay three triangles flat with their tips meeting in the middle.", "Three more close a hexagon: six triangles round one point."]);
  for (let i = 0; i < 6; i++) b.on("tri-equilateral", COLS[(i + 3) % 6], c(i + 1), c(i));
  b.chunk(3, ["Lay a triangle on an outside edge, pointing out. Do it on every other edge.", "Fill the other three edges. A star with six points: it is symmetrical."]);
  return b.build({ id: "star", title: "A six-point star", theme: "patterns", age: "b", stars: 1, flat: true, done: "You made a star! Count the points: six." });
}


export const AGE_B: Project[] = [pitchedHouse(), garage(), twinBridge(), rocket3d(), robot(), boat(), pyramidGarden(), keep(), bus(), cottage(), dinosaur(), star()];
