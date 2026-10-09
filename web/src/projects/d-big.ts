/* The biggest builds for 11 to 16 (2.1): two-set showpieces of 79 to 154 tiles. Split from d.ts to keep files short. */
import type { Project } from "../engine/types";
import { Builder, TALL_TO_LOW } from "./helpers";

/** Mega Mansion of Mild Chaos: a wide two-storey house, wings and many roofs. */
function chaosMansion(): Project {
  const b = new Builder();
  b.tower(["yellow", "yellow"], 0, 0, 0, 5, 3);
  b.chunk(6, ["The mansion: squares round a five-by-three space.", "Keep going.", "Keep going.", "Close the ground floor; start upstairs.", "Keep going.", "Keep going.", "Close upstairs."]);
  b.inside("yellow", 0, 0, 5, 3, 0);
  b.inside("yellow", 0, 0, 5, 3, 1);
  b.chunk(6, ["Inside, walls from wall to wall: two from back to front, one from side to side. They hold up the roof.", "Keep going.", "Finish the first layer of inside walls; start the second on top.", "Keep going."]);
  b.lids("orange", 0, 0, 5, 3, 2);
  b.chunk(6, ["The roof: fifteen squares flat.", "Keep going.", "Close the roof."]);
  b.room("blue", 0, 0, 2, 2, 2);
  b.chunk(6, ["An attic room on the back left: a two-by-two ring.", "Close the ring with the last squares."]);
  b.lids("blue", 0, 0, 2, 2, 3);
  b.step("Its roof: four squares.");
  b.roof("red", 0, 0, 3);
  b.step("A tall roof on the attic.");
  b.roof("red", 1, 1, 3);
  b.step("Another, diagonal from it.");
  for (const x of [2, 3, 4]) {
    b.lowRoof("green", x, 2, 2);
    b.step(x === 2 ? "Short pyramids along the front of the roof." : "Another short pyramid, next along.");
  }
  return b.build({ id: "chaos-mansion", title: "Mega Mansion of Mild Chaos", theme: "homes", age: "d", stars: 1, done: "You built the Mega Mansion! Forty rooms, and still nobody can find the TV remote.", swaps: [TALL_TO_LOW] });
}

/** The Ultimate Sock Monster Skyscraper: a wide base, a middle block and a spire, with a terrace of pyramids. 140 tiles. */
function sockSkyscraper(): Project {
  const b = new Builder();
  b.tower(["purple", "purple"], 0, 0, 0, 4, 4);
  b.chunk(6, ["The base: sixteen squares round a four-by-four space. Start at the front left.", "Keep going round.", "Close the first layer.", "Second layer: stack on the top edges.", "Keep going.", "Close the base."]);
  b.inside("purple", 0, 0, 4, 4, 0);
  b.inside("purple", 0, 0, 4, 4, 1);
  b.chunk(6, ["Inside, a cross of squares from wall to wall. It holds up the terrace.", "Finish the cross and start a second layer on it.", "Finish the second layer."]);
  b.lids("green", 0, 0, 4, 4, 2);
  b.chunk(6, ["The terrace: sixteen squares flat on top, from the back left. Each rests on two edges.", "Keep tiling.", "Finish the terrace."]);
  b.tower(["blue", "blue", "blue"], 1, 1, 2, 2, 2);
  b.chunk(6, ["The middle block: a two-by-two ring in the centre of the terrace.", "Close it, and stack the next storey.", "Keep stacking.", "Three storeys."]);
  b.lids("yellow", 1, 1, 2, 2, 5);
  b.step("Its roof: four squares.");
  b.tower(["red", "orange", "red"], 1, 1, 5);
  b.chunk(4, ["The spire: a ring of four on the back left of the roof.", "Stack another.", "And a third."]);
  b.roof("purple", 1, 1, 8);
  b.step("The tip: four tall triangles. The sock monster lives up here.");
  const corners = [[0, 0], [3, 0], [0, 3], [3, 3]] as const;
  for (const [x, z] of corners) {
    b.roof("red", x, z, 2);
    b.step(x === 0 && z === 0 ? "On a corner of the terrace, a tall pyramid." : "The next corner.");
  }
  const edges = [[1, 0], [2, 0], [3, 1], [3, 2], [2, 3], [1, 3], [0, 2], [0, 1]] as const;
  for (const [x, z] of edges) {
    b.lowRoof("yellow", x, z, 2);
    b.step(x === 1 && z === 0 ? "Between the corners, a short pyramid on each square of the terrace's edge. Work your way round." : "The next one round.");
  }
  return b.build({ id: "sock-skyscraper", title: "The Ultimate Sock Monster Skyscraper", theme: "bridges", age: "d", stars: 3, done: "You built the Sock Monster Skyscraper! Every missing sock in the world is hiding at the top.", swaps: [TALL_TO_LOW] });
}

/** The Grand Hotel for Retired Pirates: three storeys, a lookout, a roof of pyramids and gangplanks. 154 tiles. */
function pirateHotel(): Project {
  const b = new Builder();
  b.room("blue", 0, 0, 5, 3, 0, [3], "square", 4);
  b.room("green", 0, 0, 5, 3, 1);
  b.chunk(5, ["The hotel: squares round a five-by-three space, with a gap at the front for the door.", "Keep going round.", "Close the ground floor.", "Second layer: the square over the door rests on its two neighbours.", "Keep going.", "Keep going.", "Close the ring with the last squares."]);
  b.inside("blue", 0, 0, 5, 3, 0);
  b.inside("green", 0, 0, 5, 3, 1);
  b.chunk(6, ["Inside, walls from wall to wall: two from back to front, one from side to side. They hold up the roof deck.", "Keep going.", "Finish the first layer of inside walls; start the second on top.", "Keep going."]);
  b.lids("orange", 0, 0, 5, 3, 2);
  b.chunk(6, ["The roof deck: fifteen squares.", "Keep tiling.", "Finish the deck."]);
  b.tower(["red", "red", "red"], 0, 0, 2);
  b.chunk(4, ["The crow's nest: a ring of four on the back left of the deck.", "Stack another.", "And a third."]);
  b.roof("purple", 0, 0, 5);
  b.step("Its tall pointed roof. Land ahoy!");
  const cells: [number, number][] = [];
  for (let z = 0; z < 3; z++) for (let x = 0; x < 5; x++) if (x || z) cells.push([x, z]);
  cells.forEach(([x, z], i) => {
    if (i % 2) b.roof("red", x, z, 2);
    else b.lowRoof("yellow", x, z, 2);
    b.step(i === 0 ? "Now a pyramid on every other square of the deck: short ones and tall ones, taking turns. Start next to the crow's nest." : "The next square along: the other kind of pyramid.");
  });
  for (const x of [0, 1, 2, 4, 5]) b.wallZ("tri-right", "purple", x, 0, 3);
  b.step("Gangplanks: five small triangles standing out from the front wall, square corner at the bottom, against the wall.");
  return b.build({ id: "pirate-hotel", title: "The Grand Hotel for Retired Pirates", theme: "homes", age: "d", stars: 2, done: "You built the Pirate Hotel! Breakfast is served at six bells. Parrots eat free.", swaps: [TALL_TO_LOW] });
}

export const AGE_D_BIG: Project[] = [chaosMansion(), sockSkyscraper(), pirateHotel()];
