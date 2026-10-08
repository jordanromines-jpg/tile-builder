/* Wildflowers (2.9), part 3: ages 6 to 8. Standing flowers: a pot or a wide base, a stem of rings, a closed head.
   Rings go three squares a step (the age's limit). */
import type { Colour } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder } from "./helpers";

type C = Colour;

/** A ring of walls round a w × d cell at height y (with a wall across a 2-cell row), in steps of three. */
function ring(b: Builder, c: C, x0: number, z0: number, w: number, d: number, y: number, says: string[]) {
  b.room(c, x0, z0, w, d, y);
  for (let x = x0 + 1; x < x0 + w; x++) for (let z = z0; z < z0 + d; z++) b.wallZ("square", c, x, y, z);
  b.chunk(3, says);
}

/** A little pot (or bog): rings, a wall across when 2 × 2, then the lid of squares. */
function pot(b: Builder, c: C, lid: C, w: number, d: number, h: number, what: string) {
  for (let r = 0; r < h; r++) {
    b.room(c, 0, 0, w, d, r);
    b.chunk(3, [r === 0 ? `Stand squares in a ring, ${w} by ${d}: the ${what}.` : `A second ring on top of the ${what}.`, "Keep going round the ring.", "Close the ring."]);
  }
  if (w >= 2 && d >= 2) {
    for (let x = 1; x < w; x++) for (let z = 0; z < d; z++) b.wallZ("square", c, x, h - 1, z);
    b.step("Inside the top ring, stand two squares across the middle. They hold up the lid.");
  }
  b.lids(lid, 0, 0, w, d, h);
  b.chunk(3, ["Lay squares flat on top: the soil.", "The last square of soil."]);
}

/** Stars by size within 6–8 (12 to 40 tiles): thirds. */
const starsFor = (n: number): 1 | 2 | 3 => (n < 12 + 28 / 3 ? 1 : n < 12 + 56 / 3 ? 2 : 3);

const GREEN: C = "green";

/** `n` green rings on the cell (x, z) from height y. */
function stem(b: Builder, c: C, x: number, z: number, y: number, n: number, first = "Stand three green squares in a ring: the stem starts.") {
  for (let r = 0; r < n; r++) ring(b, c, x, z, 1, 1, y + r, [r === 0 ? first : "Another ring on top: the stem grows taller.", "Keep going round the ring.", "Close the ring."]);
}

function finish(b: Builder, id: string, title: string, done: string): Project {
  const n = b.placed.length;
  return b.build({ id, title, theme: "flowers", age: "b", stars: starsFor(n), done });
}

function coneflower(): Project {
  const b = new Builder();
  pot(b, "blue", "orange", 2, 2, 1, "pot");
  stem(b, GREEN, 0, 0, 1, 2);
  ring(b, "purple", 0, 0, 1, 1, 3, ["Purple petals are pink on a real coneflower. Pink tiles do not exist, so we use purple: a ring.", "Keep going round the ring.", "Close the ring."]);
  b.roof("red", 0, 0, 4);
  b.step("Lean four tall triangles in on top, tips together: the spiky cone in the middle.");
  return finish(b, "flower-kansas-coneflower-pot", "Kansas purple coneflower in a pot", "You built a purple coneflower! Echinacea comes from the Greek word for hedgehog, because of its spiny cone.");
}

function blazingStar(): Project {
  const b = new Builder();
  pot(b, "orange", "yellow", 2, 2, 1, "pot");
  stem(b, GREEN, 0, 0, 1, 1);
  for (let r = 0; r < 2; r++) ring(b, "purple", 0, 0, 1, 1, 2 + r, [r === 0 ? "Purple squares in a ring: the flower spike starts here." : "Another purple ring: the spike gets taller.", "Keep going round the ring.", "Close the ring."]);
  b.roof("purple", 0, 0, 4);
  b.step("Lean four tall triangles in on top: the tip of the spike.");
  return finish(b, "flower-kansas-blazing-star-spike", "Kansas blazing star spike", "You built a dotted blazing star! Its taproot goes about 15 feet deep, so it survives dry summers.");
}

function pairTower(b: Builder, base: C, mid: C, rings: [C, number][], headC: C, shape: "tall" | "low", firstSay: string) {
  let y = 0;
  for (const [c, n] of rings) {
    for (let r = 0; r < n; r++, y++) ring(b, c, 0, 0, 2, 1, y, [y === 0 ? firstSay : "Another row of squares on top: the stems grow.", "Keep going round the row.", "Close the row."]);
  }
  void base; void mid;
  for (const x of [0, 1]) {
    if (shape === "tall") b.roof(headC, x, 0, y);
    else b.lowRoof(headC, x, 0, y);
    b.step(x === 0 ? "Lean four triangles in on the left stem, tips together: a flower." : "Four more on the right stem: the second flower.");
  }
}

function milkweed(): Project {
  const b = new Builder();
  pot(b, "yellow", "blue", 3, 1, 1, "long pot");
  stem(b, GREEN, 0, 0, 1, 2, "Stand three green squares in a ring at the left end: the first stem.");
  b.lowRoof("orange", 0, 0, 3);
  b.step("Four short triangles on top: a round cluster of small orange flowers.");
  stem(b, GREEN, 2, 0, 1, 3, "Now a taller stem at the right end. Stand three green squares in a ring.");
  b.lowRoof("orange", 2, 0, 4);
  b.step("Four short triangles on top: the second cluster, higher up. Milkweed is a bushy plant with many stems.");
  return finish(b, "flower-kansas-butterfly-milkweed", "Kansas butterfly milkweed plant", "You built butterfly milkweed! Its orange flowers attract butterflies and lots of other insects.");
}

function bergamot(): Project {
  const b = new Builder();
  pot(b, "yellow", "blue", 2, 2, 1, "pot");
  stem(b, GREEN, 0, 0, 1, 3);
  ring(b, "purple", 0, 0, 1, 1, 4, ["A purple ring: the neck of the flower.", "Keep going round the ring.", "Close the ring."]);
  b.lowRoof("purple", 0, 0, 5);
  b.step("Four short triangles on top: the round, tufty flower. Real bergamot is pale pink-purple; we use purple.");
  return finish(b, "flower-chicago-wild-bergamot", "Chicago wild bergamot", "You built wild bergamot! Its tube-shaped flowers are visited by bees and butterflies.");
}

function spiderwort(): Project {
  const b = new Builder();
  pot(b, "red", "yellow", 2, 1, 2, "tall pot");
  stem(b, GREEN, 0, 0, 2, 2);
  ring(b, "blue", 0, 0, 1, 1, 4, ["A blue ring: the flower's neck.", "Keep going round the ring.", "Close the ring."]);
  b.lowRoof("blue", 0, 0, 5);
  b.step("Four short triangles on top: a spiderwort flower, blue-violet like the real ones.");
  return finish(b, "flower-chicago-spiderwort-vase", "Chicago spiderwort in a tall pot", "You built a spiderwort! Each flower opens in the morning and usually closes by afternoon.");
}

function violet(): Project {
  const b = new Builder();
  pot(b, "orange", "yellow", 2, 2, 1, "little pot");
  stem(b, GREEN, 0, 0, 1, 1);
  b.lowRoof("purple", 0, 0, 2);
  b.step("Four short triangles on top: a violet. The real violet is blue-purple, a good match.");
  return finish(b, "flower-chicago-violet-little-pot", "Chicago violet in a little pot", "You built a violet! It is the state flower of Illinois. Schoolchildren voted for it in 1907.");
}

function cardinal(): Project {
  const b = new Builder();
  pairTower(b, GREEN, GREEN, [[GREEN, 1], ["red", 2]], "red", "tall", "Stand squares in a row, two stems side by side with a wall between: the stems.");
  return finish(b, "flower-carolina-cardinal-flower", "Carolina cardinal flower spikes", "You built cardinal flowers! Hummingbirds visit their bright red flowers.");
}

function turksCap(): Project {
  const b = new Builder();
  pot(b, "red", "blue", 2, 2, 1, "pot");
  stem(b, GREEN, 0, 0, 1, 2);
  ring(b, "purple", 0, 0, 1, 1, 3, ["A purple ring for the spots the real lily has.", "Keep going round the ring.", "Close the ring."]);
  b.roof("orange", 0, 0, 4);
  b.step("Lean four tall triangles in on top: the lily bud. Its real petals curl back.");
  return finish(b, "flower-carolina-turks-cap-lily", "North Carolina Turk's cap lily", "You built a Turk's cap lily! Its petals curl back, and butterflies and hummingbirds visit it.");
}

function joePye(): Project {
  const b = new Builder();
  pot(b, "blue", "orange", 2, 2, 1, "pot");
  stem(b, GREEN, 0, 0, 1, 3);
  ring(b, "purple", 0, 0, 1, 1, 4, ["A purple ring: the flower cluster starts. Real Joe-Pye weed is pinkish purple; we use purple.", "Keep going round the ring.", "Close the ring."]);
  b.lowRoof("purple", 0, 0, 5);
  b.step("Four short triangles on top: the fluffy flower head.");
  return finish(b, "flower-carolina-joe-pye-weed", "North Carolina Joe-Pye weed", "You built Joe-Pye weed! It was picked as North Carolina's Wildflower of the Year in 2017.");
}

function flytrap(): Project {
  const b = new Builder();
  pot(b, "blue", "green", 2, 2, 1, "bog pot");
  ring(b, GREEN, 0, 1, 1, 1, 1, ["A green ring at the front left: a trap.", "Keep going round the ring.", "Close the ring."]);
  b.lowRoof(GREEN, 0, 1, 2);
  b.step("Four short triangles on top: the trap, ready to snap.");
  for (let r = 0; r < 3; r++) ring(b, GREEN, 1, 0, 1, 1, 1 + r, [r === 0 ? "Now a tall green ring at the back right: the flower stalk." : "Another ring on the stalk.", "Keep going round the ring.", "Close the ring."]);
  b.lowRoof("yellow", 1, 0, 4);
  b.step("Four short triangles on top: the flower. Venus flytrap flowers are white; we use yellow.");
  return finish(b, "flower-carolina-venus-flytrap-bog", "North Carolina Venus flytrap in a bog", "You built a Venus flytrap! It grows wild only near Wilmington, North Carolina, and a bit of South Carolina.");
}

export const FLOWERS_3: Project[] = [coneflower(), blazingStar(), milkweed(), bergamot(), spiderwort(), violet(), cardinal(), turksCap(), joePye(), flytrap()];
