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
      . . .B/ B B B B B.\ .
      . .B/ B B B B Y B B.\
      .B/ B B B B B B B B
      .B\ B B B B B B B B./
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

/* ---------- things ---------- */

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
  frog(),
  strawberry(),
  iceCream(),
  balloons(),
  kite(),
  present(),
  car(),
  sunflower(),
  cubeOnCube(),
  threePyramids(),
  colourStairs(),
  houseWithGarden(),
];
