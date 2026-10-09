/* More projects for 9 to 10 (2.1): silly names, up to four tiles a step, 30 to 100 tiles, mostly from one 100-piece
   set. Words: net, vertex, vertices, equilateral, isosceles, parallel, quarter turn, faces and edges. */
import type { Colour } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder, TALL_TO_LOW } from "./helpers";

function burritoBridge(): Project {
  const b = new Builder();
  const piers = [0, 2, 4];
  for (const y of [0, 1]) for (const x of piers) b.room("orange", x, 0, 1, 1, y);
  b.chunk(4, ["Three piers in a row, one square apart. Start with a ring of four.", "The second ring.", "The third pier: another ring of four.", "Stack a second ring on the first pier.", "And the second.", "And the third."]);
  for (const g of [1, 3]) b.lid("square", "yellow", g, 2, 0);
  b.step("Lay the deck: a square flat across each gap, resting on a pier at each end.");
  for (const x of piers) {
    b.lowRoof("yellow", x, 0, 2);
    b.step(x === 0 ? "A cheesy pyramid on the first pier." : "And on the next pier.");
  }
  return b.build({ id: "burrito-bridge", title: "The giant burrito bridge", theme: "bridges", age: "c", stars: 1, done: "You built the burrito bridge! Cars drive over it. Hungry trolls live under it." });
}

function sneezealot(): Project {
  const b = new Builder();
  b.room("blue", 0, 0, 3, 3, 0);
  b.chunk(4, ["The keep: four squares along the front and round the corner.", "Keep going round.", "Close the ring: twelve squares round a three-by-three space."]);
  for (let z = 0; z < 3; z++) b.wallZ("square", "purple", 2, 0, z);
  for (let x = 0; x < 3; x++) b.wallX("square", "purple", x, 0, 2);
  b.chunk(3, ["Inside, stand three squares in a line from the back to the front. They will hold the roof up.", "Three more across, from left to right. Every roof square will rest on two walls."]);
  b.lids("purple", 0, 0, 3, 3, 1);
  b.chunk(4, ["Lay a roof: four squares flat, from the back left.", "Four more squares, flat on top.", "One more closes it."]);
  for (const x of [0, 2]) b.tower(["red", "red"], x, 0, 1);
  b.chunk(4, ["A tower on the back left corner of the roof: a ring of four.", "Stack another.", "A tower on the back right corner.", "Stack another."]);
  for (const x of [0, 2]) {
    b.roof("yellow", x, 0, 3);
    b.step(x === 0 ? "Tall triangles lean together on the left tower. Their vertices meet." : "The same on the right tower.");
  }

  return b.build({ id: "sneezealot-castle", title: "Sir Sneezealot's castle", theme: "castles", age: "c", stars: 1, done: "You built Sir Sneezealot's castle! He is allergic to dragons. Bless him.", swaps: [TALL_TO_LOW] });
}

function cheeseLighthouse(): Project {
  const b = new Builder();
  b.room("yellow", 0, 0, 2, 2, 0);
  b.chunk(4, ["The base: four squares round a corner.", "Close it: eight squares round a two-by-two space."]);
  b.room("orange", 0, 0, 2, 2, 1);
  b.chunk(4, ["A second ring on top, the same size. A wide base doesn't tip: two squares across holds it steady.", "Close it: eight squares again."]);
  b.lids("yellow", 0, 0, 2, 2, 2);
  b.step("Four squares flat on top.");
  const c: Colour[] = ["orange", "yellow", "orange"];
  b.tower(c, 1, 1, 2);
  b.chunk(4, ["On the front right of the top, a ring of four.", "Stack another ring: holes in cheese are optional.", "One more ring: three rings tall."]);
  b.roof("red", 1, 1, 5);
  b.step("A pyramid of isosceles triangles on top: the lamp. It smells for miles.");
  return b.build({ id: "cheese-lighthouse", title: "The stinky cheese lighthouse", theme: "bridges", age: "c", stars: 1, done: "You built the stinky cheese lighthouse! Ships can't see it in the fog, but they can smell it.", swaps: [TALL_TO_LOW] });
}

function butlerMansion(): Project {
  const b = new Builder();
  b.room("blue", 0, 0, 3, 2, 0, [2], "square", 3);
  b.chunk(4, ["The ground floor: squares round a three-by-two space, with a doorway at the front right.", "Keep going round.", "Close the ring with the last squares."]);
  for (let z = 0; z < 2; z++) b.wallZ("square", "blue", 2, 0, z);
  b.step("Two squares across the inside, from the back to the front. They hold the floor up.");
  b.lids("yellow", 0, 0, 3, 2, 1);
  b.chunk(4, ["The first floor: four squares flat on top.", "Two more squares finish it."]);
  b.room("green", 0, 0, 3, 2, 1);
  b.chunk(4, ["Upstairs walls: four squares round the corner.", "Keep going.", "Close upstairs."]);
  for (let z = 0; z < 2; z++) b.wallZ("square", "green", 2, 1, z);
  b.step("Two squares across the inside again, on the line below. They hold the roof up.");
  b.lids("orange", 0, 0, 3, 2, 2);
  b.chunk(4, ["The roof: four squares.", "Two more squares finish it."]);
  for (const x of [0, 1, 2]) {
    b.roof("red", x, 0, 2);
    b.step(x === 0 ? "A tall pyramid on the back left of the roof." : "Another, next along. Three in a parallel row.");
  }
  return b.build({ id: "butler-mansion", title: "The robot butler's mansion", theme: "homes", age: "c", stars: 1, done: "You built the robot butler's mansion! He brings you a cup of tea. And a cup of bolts.", swaps: [TALL_TO_LOW] });
}

function wormTunnel(): Project {
  const b = new Builder();
  for (let x = 0; x < 9; x++) {
    b.wallX("square", "green", x, 0, 1);
    b.wallX("square", "green", x, 0, 0);
  }
  b.chunk(4, ["Two parallel rows of squares, one square apart: the start of the tunnel.", "Keep both rows going.", "Keep going.", "Keep going.", "Keep going until it is nine squares long."]);
  for (let x = 0; x < 9; x++) b.lid("square", x % 2 ? "yellow" : "orange", x, 1, 0);
  b.chunk(4, ["Lay squares flat across the top: the tunnel roof.", "Keep going: stripes, like a worm.", "Finish the roof."]);
  b.roof("purple", 0, 0, 1, "tri-equilateral");
  b.step("A worm head on one end: four equilateral triangles leaning together.");
  b.wallZ("tri-right", "green", 9, 0, 0);
  b.step("A small triangle closes the other end: the tail.");
  return b.build({ id: "worm-tunnel", title: "The wiggly worm tunnel", theme: "gardens", age: "c", stars: 1, done: "You built the wiggly worm tunnel! Roll a marble through. The worm says it tickles." });
}

function spaceToilet(): Project {
  const b = new Builder();
  b.room("blue", 0, 0, 2, 2, 0);
  b.chunk(4, ["The cabin: four squares round a corner.", "Close it: eight squares."]);
  b.room("blue", 0, 0, 2, 2, 1);
  b.chunk(4, ["Stack a second layer.", "Close the ring with the last squares."]);
  b.lids("purple", 0, 0, 2, 2, 2);
  b.step("A roof of four squares.");
  b.tower(["green", "green"], 0, 0, 2);
  b.chunk(4, ["The tank on top: a ring of four on the back left.", "Stack another."]);
  b.roof("red", 0, 0, 4, "tri-equilateral");
  b.step("A pyramid on the tank: the flush button.");
  b.lowRoof("yellow", 1, 1, 2);
  b.step("Another on the front right: the rocket booster. For emergencies.");
  return b.build({ id: "space-toilet", title: "The space toilet", theme: "space", age: "c", stars: 1, done: "You built the space toilet! In space, nobody can hear you flush." });
}

function underpantsFactory(): Project {
  const b = new Builder();
  b.room("purple", 0, 0, 4, 2, 0);
  b.chunk(4, ["The factory: four squares along the front.", "Round the corner and along the back.", "Close it: twelve squares round a four-by-two space."]);
  for (let z = 0; z < 2; z++) b.wallZ("square", "purple", 2, 0, z);
  b.step("Two squares across the middle, from the back to the front. They hold the roof up.");
  b.lids("blue", 0, 0, 4, 2, 1);
  b.chunk(4, ["The roof: four squares flat.", "Four more squares, flat on top."]);
  for (const x of [0, 3]) b.tower(["red", "orange", "red"], x, 0, 1);
  b.chunk(4, ["A chimney on the back left of the roof: a ring of four.", "Stack another ring on top.", "Three rings.", "Another chimney on the back right.", "Stack another ring on top.", "Three rings each."]);

  return b.build({ id: "underpants-factory", title: "The underpants factory", theme: "homes", age: "c", stars: 1, done: "You built the underpants factory! It makes a million pants a day. Clean ones." });
}

function penguinParty(): Project {
  const b = new Builder();
  b.lids("blue", 0, 0, 3, 2, 0);
  b.chunk(4, ["The pool: lay four squares flat on the table.", "Two more: a three-by-two pool."]);
  for (let x = 0; x < 3; x++) b.wallX("square", "blue", x, 0, 2);
  b.wallZ("square", "blue", 3, 0, 1);
  b.chunk(4, ["Stand squares up along the front edge of the pool, and round the corner."]);
  b.wallZ("square", "blue", 3, 0, 0);
  for (let x = 2; x >= 0; x--) b.wallX("square", "blue", x, 0, 0);
  b.chunk(4, ["The right side and the back.", "Finish the back."]);
  b.wallZ("square", "blue", 0, 0, 0);
  b.wallZ("square", "blue", 0, 0, 1);
  b.step("Close the pool on the left.");
  b.tower(["purple", "purple", "purple"], 4, 0, 0);
  b.chunk(4, ["Beside the pool, the diving tower: a ring of four.", "Stack another.", "And another. Very high."]);
  b.lid("square", "yellow", 4, 3, 0);
  b.step("A diving board on top.");
  b.lowRoof("green", 4, 0, 3);
  b.step("A tiny pyramid on the board: the lifeguard's hat.");
  return b.build({ id: "penguin-party", title: "The penguin pool party", theme: "animals", age: "c", stars: 1, done: "You built the penguin pool party! Everyone does a belly flop. Splash!" });
}

function spaghettiTower(): Project {
  const b = new Builder();
  const c: Colour[] = ["red", "orange", "green", "blue", "purple", "red", "orange"];
  b.room("red", 0, 0, 2, 2, 0);
  b.room("orange", 0, 0, 2, 2, 1);
  b.chunk(4, ["The base: four squares round a corner.", "Close the ring: eight squares round a two-by-two space.", "Stack a second ring: orange.", "Close it. A wide base doesn't tip: two squares across holds it steady."]);
  b.lids("yellow", 0, 0, 2, 2, 2);
  b.step("Four squares flat on top: the plate.");
  b.tower(c.slice(2), 0, 0, 2);
  b.chunk(4, ["Now the spaghetti: stand four squares in a ring on one corner of the plate.", "A blue ring on top.", "Purple. Grown-up, hold the bottom.", "Red again, on top.", "Orange: five rings of spaghetti."]);
  b.roof("yellow", 0, 0, 7, "tri-equilateral");
  b.step("A meatball on top: four equilateral triangles meeting at one vertex.");
  return b.build({ id: "spaghetti-tower", title: "The spaghetti tower", theme: "patterns", age: "c", stars: 1, done: "You built the spaghetti tower! Forty-four tiles of pasta. Don't slurp it." });
}

function dragonDaycare(): Project {
  const b = new Builder();
  b.room("green", 0, 0, 4, 3, 0, [0]);
  b.chunk(4, ["The pen: squares round a four-by-three space, with a gate gap at the front left.", "Keep going round.", "Keep going.", "Close the pen."]);
  b.room("red", 4, 0, 1, 1, 0, [3]);
  b.step("Right beside the pen, the nap tower shares the pen's wall. Stand three squares. Sharing a wall ties the tower to the pen, so it doesn't tip.");
  b.tower(["red", "red", "red"], 4, 0, 1);
  b.chunk(4, ["Stack a ring of four on top.", "And a third.", "And a fourth."]);
  b.roof("orange", 4, 0, 4);
  b.step("A tall roof: dragon babies nap under it.");
  return b.build({ id: "dragon-daycare", title: "Dragon daycare", theme: "animals", age: "c", stars: 1, done: "You built dragon daycare! Naptime is at two. Snack time is a whole sheep.", swaps: [TALL_TO_LOW] });
}

function notBouncyCastle(): Project {
  const b = new Builder();
  b.room("red", 0, 0, 3, 3, 0);
  b.chunk(4, ["Four squares along the front and round the corner.", "Keep going round.", "Close it: twelve squares."]);
  b.room("yellow", 0, 0, 3, 3, 1);
  b.chunk(4, ["A second layer.", "Keep going.", "Close the ring with the last squares."]);
  for (const [x, z] of [[0, 0], [2, 0], [0, 2], [2, 2]] as const) {
    b.lid("square", "blue", x, 2, z);
  }
  b.chunk(4, ["A square flat over each corner. Each rests on two edges: the corner of the walls."]);
  for (const [x, z] of [[0, 0], [2, 0], [0, 2], [2, 2]] as const) {
    b.lowRoof("blue", x, z, 2);
    b.step(x === 0 && z === 0 ? "A pyramid on the back left corner." : "The next corner.");
  }
  return b.build({ id: "not-bouncy-castle", title: "The bouncy castle that doesn't bounce", theme: "castles", age: "c", stars: 1, done: "You built the bouncy castle! Please do not bounce on it. It is made of magnets." });
}

function llamaTheatre(): Project {
  const b = new Builder();
  b.room("purple", 0, 0, 4, 2, 0);
  b.chunk(4, ["The stage: four squares along the front.", "Round the corner and along the back.", "Close the ring with the last squares."]);
  for (let z = 0; z < 2; z++) b.wallZ("square", "purple", 2, 0, z);
  b.step("Two squares across the middle, from the back to the front. They hold the stage floor up.");
  b.lids("yellow", 0, 0, 4, 2, 1);
  b.chunk(4, ["The stage floor: four squares flat.", "Four more squares, flat on top."]);
  b.room("red", 0, 0, 4, 1, 1);
  b.chunk(4, ["The back wall of the stage, standing on the back half of the floor.", "Keep going.", "Close the ring with the last squares."]);
  b.lids("red", 0, 0, 4, 1, 2);
  b.step("Four squares flat on the back wall: its top.");

  b.lowRoof("green", 0, 0, 2);
  b.step("A pyramid on the left end: the llama's dressing room.");
  return b.build({ id: "llama-theatre", title: "The llama drama theatre", theme: "homes", age: "c", stars: 1, done: "You built the llama drama theatre! Tonight's show: Romeo and Juli-llama." });
}

export const AGE_C2: Project[] = [
  burritoBridge(),
  sneezealot(),
  cheeseLighthouse(),
  butlerMansion(),
  wormTunnel(),
  spaceToilet(),
  underpantsFactory(),
  penguinParty(),
  spaghettiTower(),
  dragonDaycare(),
  notBouncyCastle(),
  llamaTheatre(),
];
