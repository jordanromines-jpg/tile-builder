/* More projects for 6 to 8 (2.1): silly names, up to three tiles a step, 12 to 40 tiles, from a Magna-Tiles 100. */
import type { Project } from "../engine/types";
import { Builder, TALL_TO_LOW } from "./helpers";

function burpingVolcano(): Project {
  const b = new Builder();
  b.room("orange", 0, 0, 2, 2, 0);
  b.chunk(3, ["Stand three squares in a row along the front and round the corner.", "Three more along the side and the back.", "Close the ring: eight squares."]);
  b.room("red", 0, 0, 2, 2, 1);
  b.chunk(3, ["A second layer: stack squares on the top edges.", "Keep going round.", "Close it."]);
  for (const [x, z] of [[0, 0], [1, 0], [0, 1], [1, 1]] as const) b.lid("square", "yellow", x, 2, z);
  b.chunk(3, ["Lay three squares flat on top.", "One more fills the top."]);
  b.roof("red", 0, 0, 2, "tri-equilateral");
  b.step("Lean four triangles in on the back left of the top. The volcano is about to BURP.");
  return b.build({ id: "burping-volcano", title: "The burping volcano", theme: "gardens", age: "b", stars: 2, done: "You built the burping volcano! BUUURP. Excuse me, volcano." });
}

function hamsterKennel(): Project {
  const b = new Builder();
  b.room("blue", 0, 0, 3, 2, 0, [0]);
  b.chunk(3, ["Leave a gap at the front left for the door. Stand two squares next to it, then one round the corner.", "Three more along the side and the back.", "Close the walls."]);
  b.lids("yellow", 0, 0, 3, 2, 1);
  b.chunk(3, ["Lay three squares flat on top: the roof.", "Three more close the roof."]);
  b.roof("red", 0, 0, 1);
  b.step("Lean four tall triangles together on the left end. A pointy roof.");
  b.roof("red", 2, 1, 1);
  b.step("Another on the right end. A giant hamster needs two.");
  return b.build({ id: "hamster-house", title: "A doghouse for a giant hamster", theme: "animals", age: "b", stars: 2, done: "You built a house for a giant hamster! Where does it keep its giant sunflower seeds?", swaps: [TALL_TO_LOW] });
}

function pickleShip(): Project {
  const b = new Builder();
  for (let x = 0; x < 4; x++) b.wallX("square", "green", x, 0, 1);
  for (let x = 0; x < 4; x++) b.wallX("square", "green", x, 0, 0);
  b.chunk(3, ["Stand three squares in a row: one side of Captain Pickle's ship.", "One more, then start the other side behind it.", "Finish the other side: two parallel rows."]);
  b.wallZ("square", "green", 0, 0, 0);
  b.wallZ("tri-right", "green", 4, 0, 0);
  b.step("Close the back with a square and the front with a small triangle.");
  b.lids("yellow", 0, 0, 4, 1, 1);
  b.chunk(3, ["Lay three squares flat on top: the deck.", "One more."]);
  b.wallX("tri-isosceles-tall", "purple", 1, 1, 1);
  b.wallX("tri-isosceles-tall", "purple", 2, 1, 1);
  b.step("Stand two tall triangles on the deck's front edge: the sails.");
  b.wallX("tri-equilateral", "red", 0, 1, 0);
  b.step("A triangle at the back: the pickle flag.");
  return b.build({ id: "pickle-ship", title: "Captain Pickle's pirate ship", theme: "vehicles", age: "b", stars: 1, done: "You built Captain Pickle's ship! Arrr. It smells a bit of vinegar." });
}

function sockRocket(): Project {
  const b = new Builder();
  for (const c of ["red", "yellow", "red", "yellow"] as const) b.room(c, 0, 0, 1, 1, b.placed.length / 4);
  b.chunk(3, ["Stand three squares in a U.", "Close the ring and start the next one on top.", "Keep stacking.", "Keep stacking.", "Four rings tall: the rocket."]);
  b.stand("tri-right", "blue", [0, 1], [-1, 1]);
  b.stand("tri-right", "blue", [1, 1], [2, 1]);
  b.stand("tri-right", "blue", [1, 0], [2, 0]);
  b.chunk(3, ["Three fins at the bottom corners: small triangles, straight edge against the rocket."]);
  b.stand("tri-right", "blue", [0, 0], [-1, 0]);
  b.step("The fourth fin.");
  b.roof("purple", 0, 0, 4);
  b.step("A tall pointy nose. Phew, what's that smell? Socks!");
  return b.build({ id: "sock-rocket", title: "The rocket that smells like socks", theme: "space", age: "b", stars: 2, done: "You built the sock rocket! Three, two, one... pee-yew!", swaps: [TALL_TO_LOW] });
}

function grandmaBed(): Project {
  const b = new Builder();
  b.on("square", "purple", [0, 0], [1, 0]);
  b.on("square", "purple", [1, 0], [2, 0]);
  b.on("square", "purple", [2, 0], [3, 0]);
  b.step("Lay three squares flat in a row: Grandma's bed.");
  b.on("square", "blue", [0, 1], [1, 1]);
  b.on("square-large", "yellow", [1, 1], [3, 1]);
  b.step("A square at the left end on top: the pillow. A big square next to it: the blanket.");
  b.on("tri-right", "red", [3, 1], [3, 0]);
  b.on("tri-right", "red", [3, 2], [3, 1]);
  b.on("tri-equilateral", "orange", [1.5, 3], [2.5, 3]);
  b.step("Two small triangles at the front: go-faster stripes. And a flag on top.");
  b.on("square", "green", [0, -1], [1, -1]);
  b.on("square", "green", [2, -1], [3, -1]);
  b.step("Two squares underneath: wheels. Vroom!");
  b.on("square", "orange", [-1, 0], [0, 0]);
  b.on("tri-equilateral", "orange", [-1, 1], [0, 1]);
  b.step("A square at the back and a triangle on it: the headboard, with a spoiler.");
  return b.build({ id: "racing-bed", title: "Grandma's racing bed", theme: "vehicles", age: "b", stars: 1, flat: true, done: "You made Grandma's racing bed! She goes really fast in her sleep." });
}

function sneezingDragon(): Project {
  const b = new Builder();
  for (let x = 0; x < 4; x++) b.on("square", "green", [x, 0], [x + 1, 0]);
  b.chunk(3, ["Lay three squares flat in a row: the dragon's body.", "One more makes it long."]);
  b.on("square", "green", [4, 0.5], [5, 0.5]);
  b.on("tri-equilateral", "orange", [5, 1.5], [5, 0.5]);
  b.step("A square at the front, a bit higher: the head. A triangle in front of it: ACHOO! A sneeze of fire.");
  for (let x = 0; x < 3; x++) b.on("tri-equilateral", "red", [x + 0.5, 1], [x + 1.5, 1]);
  b.step("Three triangles along the back: spikes.");
  b.on("tri-right", "green", [0, 0], [0, 1]);
  b.on("tri-right", "green", [1, 0], [0, 0]);
  b.on("tri-right", "green", [4, 0], [3, 0]);
  b.step("Small triangles: a tail at the back and two feet underneath.");
  return b.build({ id: "sneezing-dragon", title: "The sneezing dragon", theme: "animals", age: "b", stars: 1, flat: true, done: "You made the sneezing dragon! Bless you, dragon. Mind the curtains." });
}

function toiletPaperTower(): Project {
  const b = new Builder();
  for (const c of ["blue", "green", "blue", "green", "blue"] as const) b.room(c, 0, 0, 1, 1, b.placed.length / 4);
  b.chunk(3, ["Stand three squares in a U.", "Close the ring, start the next.", "Keep stacking.", "Keep stacking.", "Keep stacking.", "Keep stacking.", "Five rings tall. Wobbly!"]);
  b.lid("square", "yellow", 0, 5, 0);
  b.step("A square flat on the very top.");
  return b.build({ id: "loo-roll-tower", title: "The loo-roll tower", theme: "patterns", age: "b", stars: 1, done: "You built the loo-roll tower! Five rings tall. Do not sneeze near it." });
}

function snackFort(): Project {
  const b = new Builder();
  b.room("orange", 0, 0, 2, 2, 0);
  b.chunk(3, ["Stand three squares along the front and round the corner.", "Three more along the side and the back.", "Close the fort: eight squares."]);
  b.room("orange", 0, 0, 2, 2, 1);
  b.chunk(3, ["Stack a second layer.", "Keep going.", "Close it."]);
  for (let x = 0; x < 2; x++) b.wallX("tri-equilateral", "yellow", x, 2, 2);
  for (let z = 1; z >= 0; z--) b.wallZ("tri-equilateral", "yellow", 2, 2, z);
  for (let x = 1; x >= 0; x--) b.wallX("tri-equilateral", "yellow", x, 2, 0);
  for (let z = 0; z < 2; z++) b.wallZ("tri-equilateral", "yellow", 0, 2, z);
  b.chunk(3, ["Battlements: a triangle on each top edge, starting at the front.", "Keep going round.", "Fill in the last ones. Now hide the snacks inside."]);
  return b.build({ id: "snack-fort", title: "The secret snack fort", theme: "castles", age: "b", stars: 2, done: "You built the secret snack fort! Password: crisps." });
}

function iceCreamTruck(): Project {
  const b = new Builder();
  b.room("blue", 0, 0, 2, 1, 0);
  b.chunk(3, ["Stand two squares in a row and one round the corner.", "Three more close the truck."]);
  b.lids("purple", 0, 0, 2, 1, 1);
  b.step("Lay two squares flat on top: the roof.");
  b.roof("yellow", 1, 0, 1, "tri-equilateral");
  b.step("On the right end, lean four triangles together: a giant ice-cream cone.");
  b.stand("tri-right", "red", [0, 1], [-1, 1]);
  b.stand("tri-right", "red", [0, 0], [-1, 0]);
  b.step("Two small triangles at the back corners: the bumper.");
  return b.build({ id: "ice-cream-truck", title: "The ice-cream truck of doom", theme: "vehicles", age: "b", stars: 1, done: "You built the ice-cream truck of doom! The doom is brain freeze." });
}

export const AGE_B2: Project[] = [burpingVolcano(), hamsterKennel(), pickleShip(), sockRocket(), grandmaBed(), sneezingDragon(), toiletPaperTower(), snackFort(), iceCreamTruck()];
