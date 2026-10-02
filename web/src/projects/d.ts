/* Projects for 11 to 16 (2.1): big builds of 60 to 200 tiles, up to six tiles a step, made for a family with up to two
   100-piece sets. Silly names, real engineering: storeys with floors, towers, piers and decks, stepped pyramids. Words
   for this age: storey, span, pier, deck, cantilever, symmetry, tessellate, face, edge, vertex. */
import type { Colour } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder, TALL_TO_LOW } from "./helpers";

const RAINBOW: Colour[] = ["red", "orange", "yellow", "green", "blue", "purple"];

/** The Nap Temple of Zzz: a stepped pyramid, four storeys shrinking to a pointed top. */
function napTemple(): Project {
  const b = new Builder();
  b.room("yellow", 0, 0, 4, 4, 0);
  b.chunk(6, ["Stand six squares in an L: four along the front, two up the right side.", "Six more round the back.", "Close the base: sixteen squares round a four-by-four space."]);
  b.lids("orange", 0, 0, 4, 4, 1);
  b.chunk(6, ["Lay a floor on top, starting at the front left corner. Each new square rests on two edges.", "Keep tiling the floor.", "Finish the first terrace: sixteen squares."]);
  b.room("green", 0, 0, 3, 3, 1);
  b.chunk(6, ["Second storey: a three-by-three ring set back from the front and right edges.", "Close it: twelve squares."]);
  b.lids("blue", 0, 0, 3, 3, 2);
  b.chunk(6, ["Floor the second storey.", "Three more squares close it."]);
  b.room("purple", 0, 0, 2, 2, 2);
  b.chunk(6, ["Third storey: a two-by-two ring in the back corner.", "Two more close it."]);
  b.lids("red", 0, 0, 2, 2, 3);
  b.step("Four squares make its roof.");
  b.room("yellow", 0, 0, 1, 1, 3);
  b.step("The shrine on top: a ring of four.");
  b.roof("orange", 0, 0, 4);
  b.step("Crown it with four tall triangles meeting at one vertex. Shh, the temple is sleeping.");
  return b.build({ id: "nap-temple", title: "The Nap Temple of Zzz", theme: "patterns", age: "d", stars: 1, done: "You built the Nap Temple! Four terraces, one tiny shrine, zero alarm clocks.", swaps: [TALL_TO_LOW] });
}

/** The Leaning Tower of Pizza: a two-by-two tower seven storeys tall (it leans only in your imagination). */
function pizzaTower(): Project {
  const b = new Builder();
  const c: Colour[] = ["yellow", "orange", "red", "yellow", "orange", "red", "yellow"];
  b.tower(c, 0, 0, 0, 2, 2);
  b.chunk(6, [
    "Ground storey: six squares round a two-by-two space, then two more close it.",
    "Close the ring and start the next storey on top.",
    "Keep stacking. Each square sits on one top edge.",
    "Cheese layer. Keep going.",
    "Tomato layer. Keep going.",
    "Higher. Grown-up, steady the base.",
    "Nearly at the top.",
    "Keep stacking.",
    "Last ring of the seventh storey.",
  ]);
  b.lids("green", 0, 0, 2, 2, 7);
  b.step("Four green squares on top: the basil.");
  b.roof("red", 0, 0, 7);
  b.step("A pointed pepperoni on the back left square.");
  b.roof("orange", 1, 1, 7);
  b.step("Another on the front right: a diagonal, so the top balances.");
  return b.build({ id: "pizza-tower", title: "The Leaning Tower of Pizza", theme: "bridges", age: "d", stars: 1, done: "You built the Leaning Tower of Pizza! It does not lean. It is just very hungry.", swaps: [TALL_TO_LOW] });
}

/** Cat Hotel (Five Stars, Zero Dogs): four storeys of rooms and a roof garden of pyramids. */
function catHotel(): Project {
  const b = new Builder();
  const floors: Colour[] = ["purple", "blue", "green", "yellow"];
  floors.forEach((c, i) => {
    b.room(c, 0, 0, 3, 2, i, i === 0 ? [2] : []);
    b.lids("orange", 0, 0, 3, 2, i + 1);
  });
  b.chunk(6, [
    "Ground floor: nine squares round a three-by-two lobby, with a gap at the front right for the cat flap.",
    "Lay the first floor: six squares flat on top.",
    "First floor walls: ten squares all the way round.",
    "Floor it over, then start the second floor walls.",
    "Close the second floor and lay its ceiling.",
    "Third floor walls.",
    "Finish them, then the roof deck.",
    "Close the roof deck.",
  ]);
  b.lowRoof("red", 0, 0, 4);
  b.step("Roof garden: a pyramid of short triangles on one corner.");
  b.lowRoof("red", 2, 1, 4);
  b.step("And one on the opposite corner. Symmetry, for fussy cats.");
  return b.build({ id: "cat-hotel", title: "Cat Hotel (Five Stars, Zero Dogs)", theme: "animals", age: "d", stars: 1, done: "You built the Cat Hotel! Room service brings fish. Dogs must wait outside." });
}

/** The Totally Normal Evil Lair: a fortress block, a central tower, corner pyramids and spikes. Very normal. */
function evilLair(): Project {
  const b = new Builder();
  b.tower(["purple", "purple"], 0, 0, 0, 3, 3);
  b.chunk(6, ["Twelve squares round a three-by-three space: the lair's outer wall.", "Close the ring.", "A second layer on top.", "Close it."]);
  b.lids("blue", 0, 0, 3, 3, 2);
  b.chunk(6, ["Lay the roof: nine squares, starting in a corner.", "Three more close it."]);
  b.tower(["red", "purple", "red"], 1, 1, 2);
  b.chunk(4, ["In the middle of the roof, a ring of four: the tower of doom.", "Stack another ring.", "And one more."]);
  b.roof("red", 1, 1, 5);
  b.step("Tall triangles lean together on the tower: very pointy, very normal.");
  for (const [x, z] of [[0, 0], [2, 0], [0, 2], [2, 2]] as const) {
    b.lowRoof("purple", x, z, 2);
    b.step(x === 0 && z === 0 ? "A small pyramid on a corner of the roof." : "Another corner pyramid.");
  }
  b.wallX("tri-isosceles-tall", "yellow", 1, 2, 3);
  b.wallX("tri-isosceles-tall", "yellow", 1, 2, 0);
  b.wallZ("tri-isosceles-tall", "yellow", 0, 2, 1);
  b.wallZ("tri-isosceles-tall", "yellow", 3, 2, 1);
  b.step("Spikes: a tall triangle standing on the middle of each edge of the roof, between the corner pyramids.");
  return b.build({ id: "evil-lair", title: "The Totally Normal Evil Lair", theme: "castles", age: "d", stars: 1, done: "You built the Evil Lair! Nothing suspicious here. Just a very pointy tower.", swaps: [TALL_TO_LOW] });
}

/** The Hamster Olympics Stadium: a long oval of three tiers with flags. */
function hamsterStadium(): Project {
  const b = new Builder();
  b.tower(["green", "blue", "yellow"], 0, 0, 0, 6, 4);
  b.chunk(6, [
    "Stand six squares along the front: the start of a six-by-four ring.",
    "Round the corner and up the side.",
    "Along the back.",
    "Down the last side. Twenty squares close the first tier.",
    "Second tier: stack squares on the top edges.",
    "Keep going round.",
    "Keep going.",
    "Close the second tier.",
    "Third tier.",
    "Keep going round.",
  ]);
  for (const [x, z] of [[0, 4], [5, 4], [5, 0], [0, 0]] as const) b.wallX("tri-isosceles-tall", "red", x, 3, z);
  b.step("Four tall triangles on the corner squares: flags for the hamster nations.");
  return b.build({ id: "hamster-stadium", title: "The Hamster Olympics Stadium", theme: "animals", age: "d", stars: 1, bigRing: true, done: "You built the Hamster Olympics! Gold medal for wheel-running goes to... everyone.", swaps: [] });
}

/** Llama Airport: a terminal, a control tower and a runway. Llamas must keep their hooves inside. */
function llamaAirport(): Project {
  const b = new Builder();
  for (let x = 0; x < 8; x++) for (const z of [3, 4]) b.lid("square", x % 2 ? "yellow" : "blue", x, 0, z);
  b.chunk(6, ["The runway: lay squares flat on the table, two wide, blue and yellow.", "Keep laying the runway.", "Finish it: eight long."]);
  b.tower(["blue", "blue"], 0, 0, 0, 4, 2);
  b.chunk(6, ["Behind the runway, the terminal: twelve squares round a four-by-two hall.", "Close the hall.", "A second layer.", "Close it."]);
  b.lids("orange", 0, 0, 4, 2, 2);
  b.chunk(6, ["Terminal roof: eight squares flat.", "Two more close it."]);
  b.tower(["green", "green", "green"], 3, 0, 2);
  b.chunk(4, ["On the right end of the roof, the control tower: a ring of four.", "Stack another ring.", "And a third."]);
  b.lid("square", "purple", 3, 5, 0);
  b.step("A square on top of the tower: the lookout.");
  b.roof("red", 0, 0, 2, "tri-equilateral");
  b.step("A pyramid on the terminal's left end: the departure lounge sign.");
  return b.build({ id: "llama-airport", title: "Llama Airport", theme: "vehicles", age: "d", stars: 1, done: "You built Llama Airport! Please keep your hooves inside the plane at all times." });
}

/** The Very Important Bridge to Nowhere: four piers, three spans and railings. */
function bridgeToNowhere(): Project {
  const b = new Builder();
  const piers = [0, 3, 6, 9];
  (["purple", "blue", "purple"] as Colour[]).forEach((c, y) => piers.forEach((x) => b.room(c, x, 0, 1, 1, y)));
  b.chunk(6, ["Four piers in a row, two squares apart: start with a ring of four, then half of the next.", "Finish the second ring and start the third.", "Finish the first layer of all four piers.", "Second layer on each pier.", "Keep going.", "Third layer.", "Keep going.", "Finish the piers: three rings each."]);
  for (const g of [1, 4, 7]) {
    b.lid("square", "yellow", g, 3, 0);
    b.lid("square", "yellow", g + 1, 3, 0);
  }
  b.chunk(6, ["Grown-up, hold the piers. Lay the deck: two squares across each gap, from pier to pier. Each one meets a pier and its neighbour."]);
  for (const g of [1, 2, 4, 5, 7, 8]) b.wallX("tri-equilateral", "green", g, 3, 1);
  b.step("Railings along the front of the deck: six triangles standing on its edge.");
  for (const g of [1, 2, 4, 5, 7, 8]) b.wallX("tri-equilateral", "green", g, 3, 0);
  b.step("Six more along the back, parallel.");
  for (const x of piers) {
    b.roof("red", x, 0, 3);
    b.step(x === 0 ? "A tall pyramid on the first pier." : "And the next pier.");
  }
  return b.build({ id: "bridge-to-nowhere", title: "The Very Important Bridge to Nowhere", theme: "bridges", age: "d", stars: 1, done: "You built the Bridge to Nowhere! It goes nowhere, very importantly.", swaps: [TALL_TO_LOW] });
}

/** Space Elevator to the Snack Bar: a wide base and a very long shaft. */
function spaceElevator(): Project {
  const b = new Builder();
  b.tower(["blue", "blue"], 0, 0, 0, 3, 3);
  b.chunk(6, ["The launch building: twelve squares round a three-by-three space.", "Close it.", "A second layer.", "Close it."]);
  b.lids("purple", 0, 0, 3, 3, 2);
  b.chunk(6, ["Roof it: nine squares, corner first.", "Close the roof."]);
  const shaft: Colour[] = ["yellow", "orange", "yellow", "orange", "yellow", "orange", "yellow", "orange"];
  b.tower(shaft, 1, 1, 2);
  b.chunk(4, ["In the middle of the roof, the elevator shaft: a ring of four.", "Stack another ring. Up, up.", "Higher.", "Higher.", "Grown-up, hold the base.", "Nearly in orbit.", "Keep going.", "Last ring."]);
  b.roof("red", 1, 1, 10);
  b.step("A pyramid nose cone on top. Next stop: snacks.");
  return b.build({ id: "space-elevator", title: "Space Elevator to the Snack Bar", theme: "space", age: "d", stars: 1, done: "You built the Space Elevator! Ten storeys up for one packet of crisps. Worth it.", swaps: [TALL_TO_LOW] });
}

/** Mega Mall for Mice: two long storeys with a dividing wall and twin roofs. */
function mouseMall(): Project {
  const b = new Builder();
  b.room("red", 0, 0, 5, 3, 0, [2]);
  b.chunk(6, ["Ground floor: squares round a five-by-three space, leaving a doorway in the middle of the front.", "Keep going round.", "Close the ground floor."]);
  for (let z = 0; z < 3; z++) b.wallZ("square", "yellow", 2, 0, z);
  b.step("Inside, a dividing wall of three squares from back to front, so the floor has two shops.");
  b.lids("blue", 0, 0, 5, 3, 1);
  b.chunk(6, ["Lay the first floor, starting at the back left.", "Keep tiling.", "Finish: fifteen squares."]);
  b.room("green", 0, 0, 5, 3, 1);
  b.chunk(6, ["Upstairs walls, all the way round.", "Keep going.", "Close the upstairs."]);
  b.lids("orange", 0, 0, 5, 3, 2);
  b.chunk(6, ["The roof.", "Keep tiling.", "Close the roof."]);
  b.lowRoof("purple", 0, 1, 2);
  b.step("A short pyramid on the left: the cheese shop sign.");
  b.lowRoof("purple", 4, 1, 2);
  b.step("Another on the right: the other cheese shop.");
  return b.build({ id: "mouse-mall", title: "Mega Mall for Mice", theme: "homes", age: "d", stars: 1, done: "You built the Mega Mall! Every shop sells cheese. Some sell more cheese." });
}

/** The Castle of Infinite Snacks: four corner towers, curtain walls and battlements. */
function snackCastle(): Project {
  const b = new Builder();
  const corners = [[0, 0], [4, 0], [0, 4], [4, 4]] as const;
  for (const c of ["blue", "blue"] as Colour[]) {
    const y = b.placed.length ? 1 : 0;
    for (const [x, z] of corners) b.room(c, x, z, 1, 1, y);
  }
  b.chunk(6, ["Four towers on the corners of a five-by-five square: start with a ring of four in each corner.", "Keep going round the corners.", "Finish the first ring of every tower.", "Stack a second ring on each.", "Keep going.", "Finish the second rings."]);
  for (let x = 1; x < 4; x++) b.wallX("square", "red", x, 0, 5);
  for (let z = 1; z < 4; z++) b.wallZ("square", "red", 5, 0, z);
  b.chunk(6, ["Curtain wall along the front, tower to tower, and down the right side."]);
  for (let x = 1; x < 4; x++) b.wallX("square", "red", x, 0, 0);
  for (let z = 1; z < 4; z++) b.wallZ("square", "red", 0, 0, z);
  b.chunk(6, ["The back wall and the left side close the courtyard."]);
  for (let x = 1; x < 4; x++) b.wallX("tri-equilateral", "yellow", x, 1, 5);
  for (let z = 1; z < 4; z++) b.wallZ("tri-equilateral", "yellow", 5, 1, z);
  b.chunk(6, ["Battlements: triangles standing on the front wall and the right wall."]);
  for (let x = 1; x < 4; x++) b.wallX("tri-equilateral", "yellow", x, 1, 0);
  for (let z = 1; z < 4; z++) b.wallZ("tri-equilateral", "yellow", 0, 1, z);
  b.chunk(6, ["And along the back and left walls."]);
  for (const y of [2, 3]) for (const [x, z] of corners) b.room("purple", x, z, 1, 1, y);
  b.chunk(6, ["Raise the towers: a third ring on each.", "Keep going.", "Finish the third rings.", "A fourth ring on each.", "Keep going.", "Finish the towers."]);
  for (const [x, z] of corners) {
    b.roof("red", x, z, 4);
    b.step(x === 0 && z === 0 ? "A tall pointed roof on the back left tower." : "And the next tower.");
  }
  return b.build({ id: "snack-castle", title: "The Castle of Infinite Snacks", theme: "castles", age: "d", stars: 1, done: "You built the Castle of Infinite Snacks! The moat is full of juice.", swaps: [TALL_TO_LOW] });
}

/** Grandpa's Secret Rocket Garage: a three-storey garage and the rocket parked beside it. */
function rocketGarage(): Project {
  const b = new Builder();
  b.room("green", 0, 0, 3, 2, 0, [2]);
  b.room("green", 0, 0, 3, 2, 1);
  b.room("green", 0, 0, 3, 2, 2);
  b.chunk(5, ["The garage: squares round a three-by-two space, with a gap at the front right for the door.", "Keep going round.", "Second layer: the square over the door gap rests on its two neighbours.", "Keep going.", "Third layer.", "Keep going.", "Close the third layer."]);
  b.lids("yellow", 0, 0, 3, 2, 3);
  b.step("Roof the garage: six squares flat.");
  b.tower(["red", "orange", "red", "orange", "red", "orange"], 4, 0, 0);
  b.chunk(4, ["One square to the right of the garage, the rocket: a ring of four.", "Stack it.", "Keep stacking.", "Higher.", "Higher.", "Six rings."]);
  b.roof("purple", 4, 0, 6);
  b.step("A tall nose cone. Grandpa says it is a garden shed.");
  b.lowRoof("blue", 0, 0, 3);
  b.step("A short pyramid on the garage roof: the radar dish (definitely not a radar dish).");
  return b.build({ id: "rocket-garage", title: "Grandpa's Secret Rocket Garage", theme: "space", age: "d", stars: 1, done: "You built Grandpa's Rocket Garage! It's a shed. A shed with a countdown.", swaps: [TALL_TO_LOW] });
}

/** Robot Dinosaur Museum: a long hall, and a dinosaur skeleton of towers on its roof. */
function dinoMuseum(): Project {
  const b = new Builder();
  b.room("orange", 0, 0, 6, 2, 0);
  b.chunk(6, ["The museum hall: six squares along the front.", "Round the right end and along the back.", "Keep going.", "Close the hall: sixteen squares."]);
  b.lids("yellow", 0, 0, 6, 2, 1);
  b.chunk(6, ["Roof the hall: six squares.", "Six more."]);
  b.tower(["green", "green", "green"], 0, 0, 1);
  b.chunk(6, ["The dinosaur's neck: a ring at the left end of the roof, and two more squares.", "Keep stacking: the neck is three rings tall."]);
  b.roof("green", 0, 0, 4, "tri-equilateral");
  b.step("Its head: a short pyramid on top of the neck.");
  b.room("green", 2, 0, 2, 2, 1);
  b.chunk(6, ["The body: a two-by-two ring in the middle of the roof.", "Two more close it."]);
  for (let x = 4; x < 6; x++) b.wallX("tri-right", "green", x, 1, 1);
  b.step("Its tail: two small triangles standing in a line on the roof, behind the body.");
  b.lids("green", 2, 0, 2, 2, 2);
  b.step("Close the body with four squares on top.");
  b.lowRoof("red", 2, 0, 2);
  b.step("Spikes on its back: a short pyramid.");
  b.lowRoof("red", 3, 1, 2);
  b.step("More spikes: robot dinosaurs have extra.");
  return b.build({ id: "dino-museum", title: "Robot Dinosaur Museum", theme: "animals", age: "d", stars: 1, done: "You built the Robot Dinosaur Museum! Do not feed the robot dinosaur. It eats batteries." });
}

/** The Wi-Fi Tower That Never Works: a lattice mast tapering to a spike. */
function wifiTower(): Project {
  const b = new Builder();
  b.tower(["blue", "purple", "blue", "purple"], 0, 0, 0, 2, 2);
  b.chunk(6, ["The base of the mast: eight squares round a two-by-two space.", "Close it and start the next ring.", "Keep stacking.", "Keep stacking.", "Four rings tall.", "Finish the fourth ring."]);
  b.lids("yellow", 0, 0, 2, 2, 4);
  b.step("A platform: four squares flat on top.");
  b.tower(["red", "orange", "red", "orange", "red"], 1, 1, 4);
  b.chunk(4, ["The top mast: a ring of four on the front right of the platform.", "Stack another.", "Higher.", "Nearly there.", "Last ring."]);
  b.roof("yellow", 1, 1, 9);
  b.step("The spike: four tall triangles. Still no signal.");
  for (const [x, z] of [[0, 0], [1, 0], [0, 1]] as const) b.lowRoof("green", x, z, 4);
  b.chunk(4, ["Three small pyramids on the platform's other squares: the dishes. One for each bar of signal you won't get."]);
  return b.build({ id: "wifi-tower", title: "The Wi-Fi Tower That Never Works", theme: "space", age: "d", stars: 1, done: "You built the Wi-Fi Tower! Try turning it off and on again.", swaps: [TALL_TO_LOW] });
}

/** Duck Pond Skyscraper: a pond frame on the table and a tall tower beside it. */
function duckSkyscraper(): Project {
  const b = new Builder();
  for (let x = 2; x < 6; x++) b.lid("square", "blue", x, 0, 0);
  for (let x = 2; x < 6; x++) b.lid("square", "blue", x, 0, 1);
  b.chunk(6, ["The pond: lay squares flat on the table, two rows of four.", "Two more finish the pond."]);
  b.tower(["green", "yellow", "green", "yellow", "green", "yellow"], 0, 0, 0, 2, 2);
  b.chunk(6, ["Left of the pond, the skyscraper: eight squares round a two-by-two space.", "Close it, start the next storey.", "Keep stacking.", "Keep stacking.", "Grown-up, hold it steady.", "Higher.", "Higher.", "Six storeys."]);
  b.lids("orange", 0, 0, 2, 2, 6);
  b.step("A roof deck: four squares.");
  b.roof("red", 0, 0, 6);
  b.step("A tall pointed top on the back left of the deck.");
  for (let x = 2; x < 6; x++) b.wallX("tri-equilateral", "yellow", x, 0, 2);
  b.step("Ducks: four triangles standing along the front edge of the pond.");
  return b.build({ id: "duck-skyscraper", title: "Duck Pond Skyscraper", theme: "gardens", age: "d", stars: 1, done: "You built the Duck Pond Skyscraper! The ducks take the lift to the penthouse.", swaps: [TALL_TO_LOW] });
}

/** The Pyramid of Unfinished Homework: a terrace topped with a field of nine pyramids. */
function homeworkPyramid(): Project {
  const b = new Builder();
  b.tower(["blue", "purple"], 0, 0, 0, 3, 3);
  b.chunk(6, ["Twelve squares round a three-by-three space.", "Close it.", "A second layer.", "Close it."]);
  b.lids("yellow", 0, 0, 3, 3, 2);
  b.chunk(6, ["Lay a flat top: nine squares.", "Three more."]);
  for (let x = 0; x < 3; x++)
    for (let z = 0; z < 3; z++) {
      b.lowRoof(RAINBOW[(x + z * 2) % 6], x, z, 2);
      b.step(x === 0 && z === 0 ? "A pyramid of short triangles on one square of the top: one page of homework." : "Another pyramid on the next square. They tessellate.");
    }
  return b.build({ id: "homework-pyramid", title: "The Pyramid of Unfinished Homework", theme: "patterns", age: "d", stars: 1, done: "You built the Pyramid of Unfinished Homework! Nine pyramids, all due tomorrow." });
}

/** The Great Wall of Laundry: a long wall with three towers. */
function laundryWall(): Project {
  const b = new Builder();
  const towers = [0, 4, 8];
  for (const y of [0, 1]) for (const x of towers) b.room("red", x, 0, 1, 1, y);
  b.chunk(6, ["Three towers in a row, three squares apart: a ring of four, and half of the next.", "Finish the rings.", "A second ring on each tower.", "Finish the second rings."]);
  for (const x of [1, 2, 3, 5, 6, 7]) b.wallX("square", "yellow", x, 0, 1);
  b.chunk(6, ["Join the towers with a wall: six squares along the front, tower to tower."]);
  for (const x of [1, 2, 3, 5, 6, 7]) b.wallX("square", "orange", x, 1, 1);
  b.chunk(6, ["A second layer on the wall."]);
  for (const x of [1, 2, 3, 5, 6, 7]) b.wallX("tri-equilateral", "green", x, 2, 1);
  b.chunk(6, ["Socks drying on the line: triangles standing on top of the wall."]);
  for (const x of towers) b.room("purple", x, 0, 1, 1, 2);
  b.chunk(6, ["Raise each tower one more ring.", "Finish them."]);
  for (const x of towers) {
    b.roof("blue", x, 0, 3);
    b.step(x === 0 ? "A tall roof on the first tower." : "And the next tower.");
  }
  return b.build({ id: "laundry-wall", title: "The Great Wall of Laundry", theme: "castles", age: "d", stars: 1, done: "You built the Great Wall of Laundry! It keeps out invaders and smelly socks.", swaps: [TALL_TO_LOW] });
}

/** The Supervillain's Gift Shop: a two-storey shop, a wing, and a lookout. */
function villainShop(): Project {
  const b = new Builder();
  b.room("purple", 0, 0, 4, 2, 0, [3]);
  b.chunk(6, ["The shop: squares round a four-by-two space, with a door gap at the front right.", "Close it."]);
  b.room("purple", 0, 2, 2, 2, 0, [4, 5]);
  b.chunk(6, ["The wing: a two-by-two room in front of the left end. Its back is the shop's front wall."]);
  b.lids("green", 0, 0, 4, 2, 1);
  b.lids("green", 0, 2, 2, 2, 1);
  b.chunk(6, ["Roof the shop.", "Finish the shop roof; roof the wing."]);
  b.room("blue", 0, 0, 4, 2, 1);
  b.chunk(6, ["Upstairs: walls round the shop's roof.", "Close upstairs."]);
  b.lids("orange", 0, 0, 4, 2, 2);
  b.chunk(6, ["Upstairs roof.", "Two more."]);
  b.tower(["red", "red"], 0, 0, 2);
  b.chunk(4, ["A lookout on the back left of the roof: a ring of four.", "Another ring on it."]);
  b.roof("yellow", 0, 0, 4);
  b.step("A tall pointed hat for the lookout.");
  b.lowRoof("orange", 1, 3, 1);
  b.step("A small pyramid on the wing: the souvenir dome.");
  b.lowRoof("orange", 3, 1, 2);
  b.step("And one on the shop's front right.");
  return b.build({ id: "villain-shop", title: "The Supervillain's Gift Shop", theme: "homes", age: "d", stars: 1, done: "You built the Supervillain's Gift Shop! Today only: evil mugs, half price.", swaps: [TALL_TO_LOW] });
}

/** The Moon Base of Mild Inconvenience: three domes joined by tunnels. */
function moonBase(): Project {
  const b = new Builder();
  const pods = [0, 3, 6];
  for (const x of pods) {
    b.room("blue", x, 0, 2, 2, 0);
  }
  b.chunk(6, ["The first pod: eight squares round a two-by-two space.", "Close it; start the next pod one square to the right of it.", "Keep going.", "Close the third pod."]);
  for (const x of pods) b.lids("yellow", x, 0, 2, 2, 1);
  b.chunk(6, ["Lay a roof on the first pod.", "Roofs on the other two.", "Finish the roofs."]);
  for (const x of [2, 5]) {
    b.wallX("square", "green", x, 0, 2);
    b.wallX("square", "green", x, 0, 1);
    b.lid("square", "green", x, 1, 1);
  }
  b.chunk(6, ["Tunnels between the pods: two walls and a lid in each gap. Mind the gap between the walls: one square."]);
  for (const x of pods) {
    b.roof("purple", x, 0, 1, "tri-equilateral");
    b.step(x === 0 ? "A dome on the back left of the first pod: a short pyramid." : "A dome on the next pod.");
  }
  for (const x of pods) b.lowRoof("red", x + 1, 1, 1);
  b.chunk(4, ["Antennas: a red pyramid on the front right of each pod. The wi-fi still drops out."]);
  return b.build({ id: "moon-base", title: "The Moon Base of Mild Inconvenience", theme: "space", age: "d", stars: 1, done: "You built the Moon Base! The shower is in one pod and the towels are in another." });
}

/** The Overengineered Sandwich Tower: four storeys, each a crust of walls, a pillar of filling and a flat slice. */
function sandwichTower(): Project {
  const b = new Builder();
  const slices: Colour[] = ["green", "yellow", "red", "orange"];
  slices.forEach((c, i) => {
    b.room("orange", 0, 0, 3, 3, i);
    b.room("purple", 1, 1, 1, 1, i);
    b.lids(c, 0, 0, 3, 3, i + 1);
  });
  b.chunk(6, [
    "The crust: twelve squares round a three-by-three space.",
    "Close the crust, and stand a ring of four in the middle: the filling holds up the slice.",
    "Finish the filling. Lay the first slice: nine squares flat on top.",
    "Finish the slice.",
    "Next storey: a crust on the slice, and filling in the middle.",
    "Keep going. Same again.",
    "Keep going.",
    "Lay the slice.",
    "Keep going.",
    "Third storey.",
    "Keep going.",
    "Keep going.",
    "Keep going.",
    "Last storey.",
    "Keep going.",
    "Keep going.",
    "Last slice.",
  ]);
  b.roof("red", 1, 1, 4, "tri-equilateral");
  b.step("A cocktail stick on top: a short pyramid in the middle.");
  return b.build({ id: "sandwich-tower", title: "The Overengineered Sandwich Tower", theme: "patterns", age: "d", stars: 1, done: "You built the Sandwich Tower! Four storeys to hold one slice of cheese." });
}

/** The Haunted Homework Factory: two storeys, two chimneys and a spooky roof. */
function hauntedFactory(): Project {
  const b = new Builder();
  b.tower(["purple", "purple"], 0, 0, 0, 4, 3);
  b.chunk(6, ["The factory: squares round a four-by-three space.", "Keep going.", "Close the ring and start the second storey.", "Keep stacking.", "Keep going.", "Close the second storey."]);
  b.lids("blue", 0, 0, 4, 3, 2);
  b.chunk(6, ["The roof: twelve squares flat, from the back left.", "Keep going.", "Close the roof."]);
  for (const x of [0, 3]) b.tower(["red", "orange", "red"], x, 0, 2);
  b.chunk(4, ["Chimneys: a ring on the back left corner of the roof.", "Stack it.", "Three rings.", "Now the back right chimney.", "Stack it.", "Three rings each."]);
  b.roof("purple", 1, 1, 2);
  b.step("A spooky spire in the middle of the roof.");
  b.roof("purple", 2, 1, 2);
  b.step("And another. Who is doing the homework? Nobody knows.");
  return b.build({ id: "haunted-factory", title: "The Haunted Homework Factory", theme: "homes", age: "d", stars: 1, done: "You built the Haunted Homework Factory! The ghosts do maths all night. Badly.", swaps: [TALL_TO_LOW] });
}

/** Mega Mansion of Mild Chaos: a wide two-storey house, wings and many roofs. */
function chaosMansion(): Project {
  const b = new Builder();
  b.tower(["yellow", "yellow"], 0, 0, 0, 5, 3);
  b.chunk(6, ["The mansion: squares round a five-by-three space.", "Keep going.", "Keep going.", "Close the ground floor; start upstairs.", "Keep going.", "Keep going.", "Close upstairs."]);
  b.lids("orange", 0, 0, 5, 3, 2);
  b.chunk(6, ["The roof: fifteen squares flat.", "Keep going.", "Close the roof."]);
  b.room("blue", 0, 0, 2, 2, 2);
  b.chunk(6, ["An attic room on the back left: a two-by-two ring.", "Close it."]);
  b.lids("blue", 0, 0, 2, 2, 3);
  b.step("Its roof: four squares.");
  b.roof("red", 0, 0, 3);
  b.step("A tall roof on the attic.");
  b.roof("red", 1, 1, 3);
  b.step("Another, diagonal from it.");
  for (const x of [2, 3, 4]) {
    b.lowRoof("green", x, 2, 2);
    b.step(x === 2 ? "Short pyramids along the front of the roof." : "Another.");
  }
  return b.build({ id: "chaos-mansion", title: "Mega Mansion of Mild Chaos", theme: "homes", age: "d", stars: 1, done: "You built the Mega Mansion! Forty rooms, and still nobody can find the TV remote.", swaps: [TALL_TO_LOW] });
}

/** The Ultimate Sock Monster Skyscraper: a wide base, a middle block and a spire, with a terrace of pyramids. 140 tiles. */
function sockSkyscraper(): Project {
  const b = new Builder();
  b.tower(["purple", "purple"], 0, 0, 0, 4, 4);
  b.chunk(6, ["The base: sixteen squares round a four-by-four space. Start at the front left.", "Keep going round.", "Close the first layer.", "Second layer: stack on the top edges.", "Keep going.", "Close the base."]);
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
  return b.build({ id: "sock-skyscraper", title: "The Ultimate Sock Monster Skyscraper", theme: "bridges", age: "d", stars: 2, done: "You built the Sock Monster Skyscraper! Every missing sock in the world is hiding at the top.", swaps: [TALL_TO_LOW] });
}

/** The Grand Hotel for Retired Pirates: three storeys, a lookout, a roof of pyramids and gangplanks. 154 tiles. */
function pirateHotel(): Project {
  const b = new Builder();
  b.room("blue", 0, 0, 5, 3, 0, [3]);
  b.room("blue", 0, 0, 5, 3, 1);
  b.chunk(5, ["The hotel: squares round a five-by-three space, with a gap at the front for the door.", "Keep going round.", "Close the ground floor.", "Second layer: the square over the door rests on its two neighbours.", "Keep going.", "Keep going.", "Close it."]);
  b.lids("yellow", 0, 0, 5, 3, 2);
  b.chunk(6, ["The first floor: fifteen squares flat on top.", "Keep tiling.", "Finish the floor."]);
  b.room("green", 0, 0, 5, 3, 2);
  b.chunk(6, ["Top-floor walls all the way round.", "Keep going.", "Close them."]);
  b.lids("orange", 0, 0, 5, 3, 3);
  b.chunk(6, ["The roof deck: fifteen squares.", "Keep tiling.", "Finish the deck."]);
  b.tower(["red", "red", "red"], 0, 0, 3);
  b.chunk(4, ["The crow's nest: a ring of four on the back left of the deck.", "Stack another.", "And a third."]);
  b.roof("purple", 0, 0, 6);
  b.step("Its tall pointed roof. Land ahoy!");
  const cells: [number, number][] = [];
  for (let z = 0; z < 3; z++) for (let x = 0; x < 5; x++) if (x || z) cells.push([x, z]);
  cells.forEach(([x, z], i) => {
    if (i % 2) b.roof("red", x, z, 3);
    else b.lowRoof("yellow", x, z, 3);
    b.step(i === 0 ? "Now a pyramid on every other square of the deck: short ones and tall ones, taking turns. Start next to the crow's nest." : "The next square along: the other kind of pyramid.");
  });
  for (const x of [0, 1, 2, 4, 5]) b.wallZ("tri-right", "purple", x, 0, 3);
  b.step("Gangplanks: five small triangles standing out from the front wall, square corner at the bottom, against the wall.");
  return b.build({ id: "pirate-hotel", title: "The Grand Hotel for Retired Pirates", theme: "homes", age: "d", stars: 3, done: "You built the Pirate Hotel! Breakfast is served at six bells. Parrots eat free.", swaps: [TALL_TO_LOW] });
}

export const AGE_D: Project[] = [
  napTemple(),
  pizzaTower(),
  catHotel(),
  evilLair(),
  hamsterStadium(),
  llamaAirport(),
  bridgeToNowhere(),
  spaceElevator(),
  mouseMall(),
  snackCastle(),
  rocketGarage(),
  dinoMuseum(),
  wifiTower(),
  duckSkyscraper(),
  homeworkPyramid(),
  laundryWall(),
  villainShop(),
  moonBase(),
  sandwichTower(),
  hauntedFactory(),
  chaosMansion(),
  sockSkyscraper(),
  pirateHotel(),
];
