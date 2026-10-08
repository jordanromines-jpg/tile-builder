/* Projects for 9 to 10 (plan keys 6l, 6m): up to four tiles a step (a ring of four, or a whole roof), 30 to 100 tiles.
   With the castle, six build from a Magna-Tiles 100 (some with swaps). Words from the 9–10 list: net, vertex, vertices,
   equilateral, isosceles, parallel, quarter turn, top view, faces and edges. */
import type { Project } from "../engine/types";
import { Builder, TALL_TO_LOW } from "./helpers";

function barn(): Project {
  const b = new Builder();
  b.room("red", 0, 0, 3, 2, 0);
  b.chunk(4, ["Stand four squares edge to edge: three along the front, one round the corner.", "Four more along the right side and the back.", "Close the barn: ten squares, a rectangle three by two."]);
  b.wallZ("square", "blue", 2, 0, 0);
  b.wallZ("square", "blue", 2, 0, 1);
  b.step("Stand two squares across the inside, from the front to the back. They hold the floor up.");
  b.lids("yellow", 0, 0, 3, 2, 1);
  b.chunk(4, ["Lay four squares flat on the walls. Each rests on two or more edges.", "Two more finish the floor of the hay loft."]);
  b.room("red", 0, 0, 2, 1, 1);
  b.wallZ("square", "orange", 1, 1, 0);
  b.chunk(4, ["On the loft floor, at the back left, stand four squares: two along the front, one at the end, one along the back.", "Two more close the loft, and one stands across its middle."]);
  b.roof("blue", 0, 0, 2);
  b.step("Lean four isosceles triangles over the left half of the loft until their vertices meet.");
  b.roof("blue", 1, 0, 2);
  b.step("A matching pyramid over the right half.");
  return b.build({ id: "barn", title: "A barn with a hay loft", theme: "animals", age: "c", stars: 1, done: "You built a barn! The animals sleep downstairs and the hay goes upstairs.", swaps: [TALL_TO_LOW] });
}

function lighthouse(): Project {
  const b = new Builder();
  b.room("blue", 0, 0, 2, 2, 0);
  b.chunk(4, ["Stand four squares edge to edge round a corner.", "Close the base: eight squares round a two-by-two square."]);
  b.room("blue", 0, 0, 2, 2, 1);
  b.chunk(4, ["Stack a second ring of the same size. A wide base doesn't tip: two squares across holds it steady.", "Close it: eight squares again."]);
  b.lids("blue", 0, 0, 2, 2, 2);
  b.step("Lay four squares flat on top. The base is a cube two squares wide.");
  const C = ["red", "yellow", "red"] as const;
  C.forEach((c, i) => b.room(c, 0, 0, 1, 1, i + 2));
  b.chunk(4, ["On one corner of the top, make a ring of four squares.", "Stack another ring on it. Stripes.", "And another: the tower is three squares tall."]);
  b.roof("red", 0, 0, 5);
  b.step("Top it with a pyramid of isosceles triangles. Four faces, one vertex at the top.");
  return b.build({ id: "lighthouse", title: "A lighthouse", theme: "bridges", age: "c", stars: 1, done: "You built a lighthouse! Ships can see it from far away.", swaps: [TALL_TO_LOW] });
}

function longBridge(): Project {
  const b = new Builder();
  for (const x of [0, 2, 4]) b.room("purple", x, 0, 1, 1, 0);
  b.chunk(4, ["Make a ring of four squares: the first pier.", "Leave a gap of one square and make a second ring.", "Another gap, a third ring. Three piers in a row."]);
  for (const x of [1, 3]) b.lid("square", "blue", x, 1, 0);
  b.step("Lay a square flat across each gap: the deck runs from pier to pier, resting on both.");
  for (const x of [0, 2, 4]) b.room("purple", x, 0, 1, 1, 1);
  b.chunk(4, ["Make the first pier a layer taller.", "Now the middle pier.", "And the last one."]);
  for (const x of [0, 2, 4]) b.lowRoof("red", x, 0, 2);
  b.chunk(4, ["Four equilateral triangles lean together on the first pier.", "The same on the middle pier.", "And on the last. Count the vertices at the top: three."]);
  return b.build({ id: "long-bridge", title: "A long bridge", theme: "bridges", age: "c", stars: 1, done: "You built a long bridge! How many cars fit on the deck?" });
}

function station(): Project {
  const b = new Builder();
  const cube = (x0: number, wall: "blue" | "purple") => {
    b.lids("yellow", x0, 0, 2, 2, 0);
    b.room(wall, x0, 0, 2, 2, 0);
    b.lids("yellow", x0, 0, 2, 2, 1);
  };
  cube(0, "blue");
  b.chunk(4, ["Lay four squares flat in a two-by-two square: the floor of the first module.", "Stand four squares up on the floor's edges.", "Four more close the walls.", "Four squares flat on top. A box two by two by one: six faces."]);
  cube(3, "purple");
  b.chunk(4, ["Leave a gap of one square. Lay the floor of the second module.", "Stand four walls on it.", "Close the walls.", "Put on its lid."]);
  b.lid("square", "green", 2, 0, 0);
  b.wallX("square", "green", 2, 0, 1);
  b.wallX("square", "green", 2, 0, 0);
  b.lid("square", "green", 2, 1, 0);
  b.step("Join the modules with a tunnel: a floor, two parallel walls, and a lid.");
  b.lowRoof("red", 0, 1, 1);
  b.step("Lean four triangles together on the first module's roof: an antenna.");
  b.lowRoof("red", 4, 1, 1);
  b.step("And an antenna on the second module.");
  return b.build({ id: "space-station", title: "A space station", theme: "space", age: "c", stars: 1, done: "You built a space station! Two modules and a tunnel between them." });
}

function stadium(): Project {
  const b = new Builder();
  b.room("green", 0, 0, 4, 3, 0);
  b.chunk(4, ["Stand four squares in a row: the front of the stadium.", "Turn the corner: four more.", "Four more along the back and round the corner.", "Close the ring. Fourteen squares round a four-by-three space."]);
  b.room("blue", 0, 0, 4, 3, 1);
  b.chunk(4, ["Start the second layer: four squares on the top edges.", "Keep going round.", "Keep going.", "Close the second layer."]);
  b.room("red", 0, 0, 4, 3, 2);
  b.chunk(4, ["A third layer: the top row of seats.", "Keep going round.", "Keep going.", "Close the top layer."]);
  return b.build({ id: "stadium", title: "A race-car stadium", theme: "vehicles", age: "c", stars: 1, bigRing: true, done: "You built a stadium! Race your cars round the inside." });
}

function townHall(): Project {
  const b = new Builder();
  b.wallX("window", "blue", 0, 0, 2);
  b.wallX("door", "blue", 1, 0, 2);
  b.wallX("window", "blue", 2, 0, 2);
  b.wallZ("square", "blue", 3, 0, 1);
  b.wallZ("square", "blue", 3, 0, 0);
  b.wallX("window", "blue", 2, 0, 0);
  b.wallX("window", "blue", 1, 0, 0);
  b.wallX("window", "blue", 0, 0, 0);
  b.wallZ("square", "blue", 0, 0, 0);
  b.wallZ("square", "blue", 0, 0, 1);
  b.chunk(4, ["Stand a window, the door, another window, and a square round the corner.", "A square, then three windows along the back.", "Close the ground floor with two squares."]);
  b.wallZ("square", "blue", 2, 0, 0);
  b.wallZ("square", "blue", 2, 0, 1);
  b.step("Stand two squares across the inside, from the front to the back. They hold the floor up.");
  b.lids("yellow", 0, 0, 3, 2, 1);
  b.chunk(4, ["Lay four squares flat on the walls.", "Two more: the first floor."]);
  b.room("green", 0, 0, 3, 2, 1);
  b.chunk(4, ["Stand four squares on the edges for the upper walls.", "Four more squares go round the corner and along the back.", "Close the upper floor."]);
  for (let x = 0; x < 3; x++) b.wallX("fence", "red", x, 2, 2);
  b.wallZ("fence", "red", 3, 2, 1);
  b.step("Stand fences along the front edge of the top, and round the corner.");
  return b.build({ id: "town-hall", title: "A town hall", theme: "homes", age: "c", stars: 1, done: "You built a town hall! Who works inside?", needs: { brandExtras: ["window", "door", "fence"] } });
}

function sculpture(): Project {
  const b = new Builder();
  b.lids("blue", 0, 0, 3, 3, 0);
  b.chunk(4, ["Lay four squares flat: the start of a three-by-three grid.", "Four more squares fill most of the grid.", "The last one finishes the grid: nine squares."]);
  b.room("purple", 1, 0, 1, 1, 0);
  b.step("In the middle of the back row, stand four squares in a ring.");
  b.lowRoof("yellow", 0, 2, 0);
  b.step("On a front corner square, lean four equilateral triangles together. A square pyramid: five faces.");
  b.lowRoof("orange", 2, 2, 0);
  b.step("The same on the other front corner: a quarter turn of the top view brings one onto the other.");
  b.lowRoof("green", 0, 0, 0);
  b.step("A pyramid on a back corner.");
  b.lowRoof("red", 2, 0, 0);
  b.step("And on the last corner. Four pyramids, symmetrical.");
  b.roof("purple", 1, 0, 1);
  b.step("Last, isosceles triangles on the ring in the middle: the tallest point.");
  return b.build({ id: "sculpture", title: "A pyramid sculpture", theme: "patterns", age: "c", stars: 1, done: "You built a sculpture! Walk round it: does it look the same from every side?", swaps: [TALL_TO_LOW] });
}

export const AGE_C: Project[] = [barn(), lighthouse(), longBridge(), station(), stadium(), townHall(), sculpture()];
