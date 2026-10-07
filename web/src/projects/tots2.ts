/* More projects for 0 to 3 (2.6): animals, food, things that go, and more shapes that stand up. Tokens as in
   tots-kit.ts. */
import type { Colour } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder } from "./helpers";
import { tot, triangleRows } from "./tots-kit";
import { flat, g, tris } from "./tots";

const H = Math.sqrt(3) / 2;

/* ---------- animals ---------- */

const catFace = () =>
  flat(
    { id: "baby-cat-face", title: "An orange cat face", theme: "animals", done: "Meow! An orange cat with green eyes and pointy ears." },
    g(String.raw`
      .O/ O.\ . . . . .O/ O.\
      O O O O O O O O
      O G O O O O G O
      O O O O O O O O
      O O O P P O O O
      .O\ O O O O O O O./
      . .O\ O O O O O./ .`),
  );

const bunny = () =>
  flat(
    { id: "baby-bunny", title: "A purple bunny", theme: "animals", done: "Hop, hop! A bunny with long ears and a red nose." },
    g(String.raw`
      . P . . P .
      . P . . P .
      . P . . P .
      .P/ P P P P P.\
      P B P P B P
      P P R R P P
      .P\ P P P P P./`),
  );

const owl = () =>
  flat(
    { id: "baby-owl", title: "A wide-eyed owl", theme: "animals", done: "Hoo, hoo! An owl with big yellow eyes." },
    g(String.raw`
      O . . . . O
      O O O O O O
      O Y+ - Y+ - O
      O - - - - O
      O O OR\ RO/ O O
      O O O O O O
      .O\ O O O O O./
      . Y . . Y .`),
  );

const penguin = () =>
  flat(
    { id: "baby-penguin", title: "A little penguin", theme: "animals", done: "Waddle, waddle. A blue penguin with a yellow tummy." },
    g(String.raw`
      . .B/ B B B.\ .
      . B P P B .
      . B O O B .
      .B/ B Y Y B B.\
      B B Y Y B B
      B B Y Y B B
      .B\ B Y Y B B./
      . O . . O .`),
  );

const whale = () =>
  flat(
    { id: "baby-whale", title: "A big blue whale", theme: "animals", done: "Splash! A big blue whale blowing water up high." },
    g(String.raw`
      . . . . . B . B .
      . . . . . . B . .
      B . .B/ B B B B B.\ .
      B.\ .B/ B B B B Y B B.\
      .B/ B B B B B B B B
      . .B\ B B B B B B B./
      . . .B\ B B B B B./ .`),
  );

const snail = () =>
  flat(
    { id: "baby-snail", title: "A snail with a swirly shell", theme: "animals", done: "A slow, slow snail, carrying its house." },
    g(`
      . P P P . . . G
      P O O O P . G .
      P O Y O P . G .
      P O O O P G G G
      G G G G G G G .`),
  );

const turtle = () =>
  flat(
    { id: "baby-turtle", title: "A turtle", theme: "animals", done: "A green turtle with a patterned shell, going for a swim." },
    g(String.raw`
      . . . Y Y . . .
      . Y .G/ G G G.\ Y .
      . .G/ G B B G G.\ .
      . G B G G B G .
      . .G\ G B B G G./ .
      . Y .G\ G G G./ Y .`),
  );

const bee = () =>
  flat(
    { id: "baby-bee", title: "A buzzy bee", theme: "animals", done: "Buzz, buzz! A stripy bee with blue wings." },
    g(String.raw`
      . . B B . B B .
      . . B B . B B .
      .Y/ Y P Y P Y Y.\ .
      Y B P Y P Y Y O
      .Y\ Y P Y P Y Y./ .`),
  );

const chick = () =>
  flat(
    { id: "baby-chick", title: "A fluffy chick", theme: "animals", done: "Cheep, cheep! A fluffy yellow chick." },
    g(String.raw`
      . .Y/ Y Y.\ . .
      . Y B Y O .
      .Y/ Y Y Y Y.\ .
      Y Y Y Y Y Y
      Y Y Y Y Y Y
      .Y\ Y Y Y Y Y./
      . O . . O .`),
  );

const frog = () =>
  flat(
    { id: "baby-frog-face", title: "A smiley frog", theme: "animals", done: "Ribbit! A green frog with a big smile." },
    g(String.raw`
      .G/ G.\ . . .G/ G.\
      G B G G B G
      G G G G G G
      .G\ R R R R G./
      . .G\ G G G./ .`),
  );

/* ---------- food ---------- */

const strawberry = () =>
  flat(
    { id: "baby-strawberry", title: "A strawberry", theme: "gardens", done: "A juicy red strawberry with little yellow seeds." },
    g(String.raw`
      . G G G G .
      R Y R R Y R
      R R R Y R R
      .R\ Y R R Y R./
      . .R\ R R R./ .
      . . .R\ R./ . .`),
  );

const iceCream = () =>
  flat(
    { id: "baby-ice-cream", title: "An ice cream cone", theme: "gardens", done: "Yum! A purple ice cream with a cherry on top." },
    g(String.raw`
      . . R . .
      . .P/ P P.\ .
      .P/ P P P P.\
      P P P P P
      .O\ O O O O./
      . .O\ O O./ .
      . . O . .`),
  );

const watermelon = () =>
  flat(
    { id: "baby-watermelon", title: "A slice of watermelon", theme: "gardens", done: "A big slice of watermelon. Spit out the seeds!" },
    g(String.raw`
      R R P R R R R P R R
      G R R R R P R R R G
      .G\ G R R R R R R G G./
      . .G\ G G R R G G G./ .
      . . .G\ G G G G G./ . .`),
  );

const cupcake = () =>
  flat(
    { id: "baby-cupcake", title: "A cupcake", theme: "gardens", done: "A purple cupcake with sprinkles and a cherry. Happy birthday!" },
    g(String.raw`
      . . .R/ R.\ . .
      . .P/ P P P.\ .
      .P/ Y P P Y P.\
      P P P P P P
      O B O B O B
      . O B O B .`),
  );

const lollipop = () =>
  flat(
    { id: "baby-lollipop", title: "A swirly lollipop", theme: "gardens", done: "A big swirly lollipop, red and yellow." },
    g(String.raw`
      .R/ R R R R.\
      R Y Y Y R
      R Y R Y R
      R Y Y R R
      .R\ R R R R./
      . . G . .
      . . G . .`),
  );

/* ---------- things ---------- */

const umbrella = () =>
  flat(
    { id: "baby-umbrella", title: "A stripy umbrella", theme: "patterns", done: "Pitter, patter. A red and yellow umbrella for the rain." },
    g(String.raw`
      . .R/ R Y R R.\ .
      .R/ Y R Y R Y R.\
      R Y R Y R Y R
      . . . B . . .
      . B . B . . .
      . B B B . . .`),
  );

const balloons = () =>
  flat(
    { id: "baby-balloons", title: "Three balloons", theme: "patterns", done: "Red, yellow and blue balloons, floating up to the sky." },
    g(String.raw`
      .R/ R.\ . .Y/ Y.\ . .B/ B.\
      R R . Y Y . B B
      .R\ R./ . .Y\ Y./ . .B\ B./
      . O . . O . O .
      . . O O O O . .`),
  );

const kite = () =>
  flat(
    { id: "baby-kite", title: "A kite", theme: "patterns", done: "Whoosh! A kite flying high, with a tail that flutters." },
    g(String.raw`
      . . .R/ R.\ . .
      . .R/ R Y Y.\ .
      .R/ R R Y Y Y.\
      .B\ B B G G G./
      . .B\ B G G./ .
      . . .B\ G./ . .
      . . . O . .
      . . O . . .
      . . . O . .`),
  );

const crown = () =>
  flat(
    { id: "baby-crown", title: "A golden crown", theme: "castles", done: "A crown for a king or a queen, with three shiny jewels." },
    g(`
      Y . . Y . . Y
      Y Y . Y . Y Y
      Y Y Y Y Y Y Y
      Y R Y B Y G Y
      Y Y Y Y Y Y Y`),
  );

const present = () =>
  flat(
    { id: "baby-present", title: "A present", theme: "patterns", done: "A blue present with a red ribbon. What's inside?" },
    g(`
      . . R . R . .
      . . . R . . .
      B+ - B R B+ - B
      - - B R - - B
      R R R R R R R
      B+ - B R B+ - B
      - - B R - - B`),
  );

const car = () =>
  flat(
    { id: "baby-red-car", title: "A little red car", theme: "vehicles", done: "Beep, beep! A little red car going for a drive." },
    g(String.raw`
      . . . .R/ R R.\ . .
      . . .R/ B R B R.\ .
      R R R R R R R O
      R R R R R R R R
      . P P . . P P .`),
  );

const train = () =>
  flat(
    { id: "baby-train", title: "A choo-choo train", theme: "vehicles", done: "Choo, choo! A train with two carriages, off on an adventure." },
    g(`
      . O . . . . . . . .
      R R B B . Y Y . G G
      R R R R P Y Y P G G
      . B B . . B . . B .`),
  );

const cloud = () =>
  flat(
    { id: "baby-rain-cloud", title: "A rain cloud", theme: "space", done: "A blue cloud, and drip, drip, drop, here comes the rain." },
    g(String.raw`
      . . .B/ B B B.\ . .
      . .B/ B B B B B B.\
      .B/ B B B B B B B.\
      B B B B B B B B
      . . . . . . . .
      . B . . B . . B
      . . . B . . B .`),
  );

const trafficLights = () =>
  flat(
    { id: "baby-traffic-lights", title: "Traffic lights", theme: "vehicles", done: "Red means stop, yellow means wait, green means go!" },
    g(`
      B B B
      B R B
      B B B
      B Y B
      B B B
      B G B
      B B B
      . B .`),
  );

/* ---------- triangle pictures ---------- */

const sunflower = () =>
  tris(
    { id: "baby-sunflower", title: "A big sunflower", theme: "gardens", done: "A sunflower as big as the sun, with an orange middle." },
    triangleRows(4, 7, (x, y) => {
      const dx = x - 2;
      const dy = y - 2 * H;
      const r = Math.abs(dy) <= 2 * H ? Math.abs(dx) + Math.abs(dy) / Math.sqrt(3) : 9;
      return r <= 1 && Math.abs(dy) <= H ? "O" : r <= 2 ? "Y" : ".";
    }),
  );

const rainbowZigzag = () =>
  tris(
    { id: "baby-rainbow-zigzag", title: "A rainbow zigzag", theme: "patterns", done: "Up, down, up, down, all the colours of the rainbow." },
    ["ROYGBPROYGB"],
  );

const waves = () =>
  tris(
    { id: "baby-waves", title: "Blue and green waves", theme: "patterns", done: "Whoosh, whoosh. Waves rolling in to the beach." },
    triangleRows(2, 10, (_x, y) => (y > H ? "B" : "G")),
  );

/** Is (x, y) inside the triangle a, b, c? */
function inTri(x: number, y: number, a: [number, number], b: [number, number], c: [number, number]) {
  const s = (p: [number, number], q: [number, number]) => (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0]);
  const d1 = s(a, b);
  const d2 = s(b, c);
  const d3 = s(c, a);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

const threeStars = () =>
  tris(
    { id: "baby-three-stars", title: "Three stars in a row", theme: "space", done: "One, two, three stars, twinkling all in a row." },
    triangleRows(4, 19, (x, y) => {
      const cols = ["Y", "O", "Y"];
      for (const [i, cx] of [2, 5, 8].entries()) {
        const cy = 2 * H;
        const up = inTri(x, y, [cx - 1.5, cy - H], [cx + 1.5, cy - H], [cx, cy + 2 * H]);
        const down = inTri(x, y, [cx - 1.5, cy + H], [cx + 1.5, cy + H], [cx, cy - 2 * H]);
        if (up || down) return cols[i];
      }
      return ".";
    }),
  );

/* ---------- shapes that stand up ---------- */

function cubeOnCube(): Project {
  const b = new Builder();
  b.lid("square", "red", 0, 0, 0);
  b.step("Lay a red square flat on the table.");
  b.room("red", 0, 0, 1, 1, 0);
  b.step("Stand four red squares up round it.");
  b.lid("square", "red", 0, 1, 0);
  b.step("A red square on top. One cube.");
  b.room("blue", 0, 0, 1, 1, 1);
  b.step("Stand four blue squares up on the edges of the lid.");
  b.lid("square", "blue", 0, 2, 0);
  b.step("A blue square on top. Two cubes, one on the other!");
  return tot(b, { id: "baby-cube-on-cube", title: "A cube on a cube", theme: "patterns", done: "A red cube with a blue cube on top. How tall!" }, false);
}

function threePyramids(): Project {
  const b = new Builder();
  const colours: Colour[] = ["red", "yellow", "blue"];
  colours.forEach((c, i) => {
    b.lid("square", c, i * 2, 0, 0);
    b.step(i ? `A little way along, lay a ${c} square flat.` : `Lay a ${c} square flat on the table.`);
    b.roof(c, i * 2, 0, 0);
    b.step(`Lean four tall ${c} triangles in from its edges until their points meet.`);
  });
  return tot(b, { id: "baby-three-pyramids", title: "Three pyramids", theme: "patterns", done: "Red, yellow, blue. Three pointy pyramids in a row." }, false);
}

function colourStairs(): Project {
  const b = new Builder();
  const colours: Colour[] = ["red", "yellow", "blue"];
  colours.forEach((c, i) => {
    b.lid("square", c, i * 2, 0, 0);
    b.step(i ? `A little way along, lay a ${c} square flat.` : `Lay a ${c} square flat on the table.`);
    for (let h = 0; h <= i; h++) {
      b.room(c, i * 2, 0, 1, 1, h);
      b.step(h === 0 ? `Stand four ${c} squares up round it.` : `Four more ${c} squares on top, one storey higher.`);
    }
    b.lid("square", c, i * 2, i + 1, 0);
    b.step(`A ${c} square on top as a lid.`);
  });
  return tot(b, { id: "baby-colour-stairs", title: "Colour stairs", theme: "patterns", done: "Short, taller, tallest. Red, yellow, blue." }, false);
}

function houseWithGarden(): Project {
  const b = new Builder();
  b.lid("square", "yellow", 1, 0, 1);
  b.step("Lay a yellow square flat on the table.");
  b.room("yellow", 1, 1, 1, 1, 0);
  b.step("Stand four yellow squares round it, the walls.");
  b.roof("red", 1, 1, 1);
  b.step("Lean four tall red triangles in on top until their points meet. The roof.");
  for (let x = 0; x < 3; x++) b.lid("square", "green", x, 0, 0);
  for (let x = 0; x < 3; x++) b.lid("square", "green", x, 0, 2);
  b.lid("square", "green", 0, 0, 1);
  b.lid("square", "green", 2, 0, 1);
  b.step("Lay eight green squares flat all round the house. The garden!");
  return tot(b, { id: "baby-house-and-garden", title: "A house with a garden", theme: "homes", done: "A little house in a green garden. Shall we plant some flowers?" }, false);
}

export const AGE_T2: Project[] = [
  catFace(),
  bunny(),
  owl(),
  penguin(),
  whale(),
  snail(),
  turtle(),
  bee(),
  chick(),
  frog(),
  strawberry(),
  iceCream(),
  watermelon(),
  cupcake(),
  lollipop(),
  umbrella(),
  balloons(),
  kite(),
  crown(),
  present(),
  car(),
  train(),
  cloud(),
  trafficLights(),
  sunflower(),
  rainbowZigzag(),
  waves(),
  threeStars(),
  cubeOnCube(),
  threePyramids(),
  colourStairs(),
  houseWithGarden(),
];
