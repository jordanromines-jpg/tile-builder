/* The castle (plan key 4j), from the prototype (docs/prototype/magnet-tile-castle.html, lines 190–211), in steps for
   9–10: one ring, or up to four tiles, a step. Footprint 5 by 5; towers in the corners, the keep in the middle, a gate
   in the front wall. */
import { Builder, TALL_TO_LOW } from "./helpers";

const TOWERS: [number, number, string][] = [
  [0, 4, "front left"],
  [4, 4, "front right"],
  [4, 0, "back right"],
  [0, 0, "back left"],
];

const b = new Builder();
for (const [cx, cz, where] of TOWERS) {
  b.ring("blue", cx, cz, 0);
  b.step(
    where === "front left"
      ? "Make a tower in the front left corner: four squares in a ring, edge to edge. Each one stands on its bottom edge."
      : `Make the same tower ring in the ${where} corner.`,
  );
}
b.wallX("square", "red", 1, 0, 5);
b.wallX("square", "red", 3, 0, 5);
b.step("Join the front towers with a wall. Leave a gap in the middle for the gate.");
for (let z = 1; z <= 3; z++) b.wallZ("square", "red", 5, 0, z);
b.step("Three squares make the right wall, between the two right towers.");
for (let x = 3; x >= 1; x--) b.wallX("square", "red", x, 0, 0);
b.step("Three more squares make the back wall.");
for (let z = 3; z >= 1; z--) b.wallZ("square", "red", 0, 0, z);
b.step("Close the courtyard with the left wall. The walls and towers make one big ring.");
for (const x of [1, 3, 2]) b.wallX("square", "orange", x, 1, 5);
b.step("Build the gatehouse: a square on each side of the gate, then one across the top. It holds by its side edges.");
for (const [cx, cz, where] of TOWERS) {
  b.ring("purple", cx, cz, 1);
  b.step(`Stack a second ring on the ${where} tower. Each square sits on a top edge below.`);
}
const KEEP = ["green", "yellow", "green"] as const;
KEEP.forEach((c, y) => {
  b.ring(c, 2, 2, y);
  b.step(y === 0 ? "In the middle of the courtyard, start the keep: a ring of four squares." : y === 1 ? "Add a second ring to the keep." : "A third ring makes the keep the tallest tower.");
});
for (const x of [1, 2, 3]) b.wallX("tri-equilateral", "yellow", x, 2, 5);
b.step("Battlements: stand an equilateral triangle on top of each gatehouse square.");
for (let z = 1; z <= 3; z++) b.wallZ("tri-equilateral", "yellow", 5, 1, z);
b.step("Three more triangles stand along the right wall.");
for (let x = 3; x >= 1; x--) b.wallX("tri-equilateral", "yellow", x, 1, 0);
b.step("Three triangles along the back wall.");
for (let z = 3; z >= 1; z--) b.wallZ("tri-equilateral", "yellow", 0, 1, z);
b.step("And three along the left wall. Count them: twelve battlements.");
for (const [cx, cz, where] of TOWERS) {
  b.roof("red", cx, cz, 2);
  b.step(`Spire on the ${where} tower: lean four tall triangles in until their vertices meet. Use four of the same kind.`);
}
b.roof("blue", 2, 2, 3);
b.step("Last, the keep's spire: four tall triangles, leaning in, tip to tip.");

export const castle = b.build({
  id: "castle",
  title: "The castle",
  theme: "castles",
  age: "c",
  stars: 3,
  bigRing: true,
  done: "You built the castle! Look how tall the keep is.",
  swaps: [TALL_TO_LOW],
});
