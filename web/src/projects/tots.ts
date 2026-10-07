/* Projects for 0 to 3 (2.5): mosaics in bright colours and simple shapes, for a grown-up to build and a baby to look
   at. Most lie flat on the table, a row at a time; a few stand up as a cube, a pyramid, a tower or a little house.
   The bigger pictures take two 100-piece sets. Cells and their tokens are explained in tots-kit.ts. */
import type { Colour } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder } from "./helpers";
import { squareMosaic, tot, triangleMosaic, triangleRows, type TotMeta } from "./tots-kit";

export const g = (s: string) =>
  s
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

const LAY = "Lay it flat on the table.";

export function flat(meta: TotMeta, rows: string[], opening = LAY): Project {
  const b = new Builder();
  squareMosaic(b, rows, opening);
  return tot(b, meta);
}

export function tris(meta: TotMeta, rows: string[], opening = LAY): Project {
  const b = new Builder();
  triangleMosaic(b, rows, opening);
  return tot(b, meta);
}

/* ---------- square pictures ---------- */

const rainbowStripes = () =>
  flat(
    { id: "baby-rainbow-stripes", title: "Rainbow stripes", theme: "patterns", done: "A rainbow to look at. Red, orange, yellow, green, blue, purple!" },
    g(`
      R R R R R R
      O O O O O O
      Y Y Y Y Y Y
      G G G G G G
      B B B B B B
      P P P P P P`),
  );

const checks = () =>
  flat(
    { id: "baby-checks", title: "Blue and yellow checks", theme: "patterns", done: "Blue, yellow, blue, yellow. Point to every blue one!" },
    g(`
      B Y B Y B Y
      Y B Y B Y B
      B Y B Y B Y
      Y B Y B Y B
      B Y B Y B Y
      Y B Y B Y B`),
  );

const squaresInSquares = () =>
  flat(
    { id: "baby-squares-in-squares", title: "Squares inside squares", theme: "patterns", done: "Red, orange, yellow, and a big green square in the middle." },
    g(`
      R R R R R R R R
      R O O O O O O R
      R O Y Y Y Y O R
      R O Y G+ - Y O R
      R O Y - - Y O R
      R O Y Y Y Y O R
      R O O O O O O R
      R R R R R R R R`),
  );

const littleHeart = () =>
  flat(
    { id: "baby-little-heart", title: "A little red heart", theme: "patterns", done: "A little heart, made with love." },
    g(String.raw`
      .R/ R R.\ .R/ R R.\
      R R R R R R
      .R\ R R R R R./
      . .R\ R R R./ .
      . . .R\ R./ . .`),
  );

const bigHeart = () =>
  flat(
    { id: "baby-big-heart", title: "A big heart", theme: "patterns", done: "A big red heart with a pink-purple middle, as big as a hug." },
    g(String.raw`
      . .R/ R R R.\ . . .R/ R R R.\ .
      .R/ R R R R R.\ .R/ R R R R R.\
      R R R P P R R P P R R R
      R R P P P P P P P P R R
      .R\ R P P P P P P P P R R./
      . .R\ R P P P P P P R R./ .
      . . .R\ R P P P P R R./ . .
      . . . .R\ R P P R R./ . . .
      . . . . .R\ R R R./ . . . .
      . . . . . .R\ R./ . . . . .`),
  );

const sunshine = () =>
  flat(
    { id: "baby-sunshine", title: "Sunshine", theme: "space", done: "Hello, sun! Warm and yellow, with orange rays." },
    g(`
      O . . . O . . . O
      . O . Y Y Y . O .
      . . Y Y Y Y Y . .
      . Y Y Y Y Y Y Y .
      O Y Y Y Y Y Y Y O
      . Y Y Y Y Y Y Y .
      . . Y Y Y Y Y . .
      . O . Y Y Y . O .
      O . . . O . . . O`),
  );

const happyFace = () =>
  flat(
    { id: "baby-happy-face", title: "A happy face", theme: "patterns", done: "A happy face smiling back. Can you smile too?" },
    g(String.raw`
      . .Y/ Y Y Y Y Y.\ .
      .Y/ Y Y Y Y Y Y Y.\
      Y Y B Y Y B Y Y
      Y Y B Y+ - B Y Y
      Y Y Y - - Y Y Y
      Y R Y Y Y Y R Y
      .Y\ Y R R R R Y Y./
      . .Y\ Y Y Y Y Y./ .`),
  );

const flower = () =>
  flat(
    { id: "baby-flower", title: "A red flower", theme: "gardens", done: "A red flower with a sunny middle. Sniff, sniff!" },
    g(String.raw`
      . . . R . . .
      . . R R R . .
      . R R Y R R .
      R R Y Y Y R R
      . R R Y R R .
      . . R R R . .
      . . . G . . .
      . .G/ G G . . .
      . . . G G G.\ .`),
  );

const fish = () =>
  flat(
    { id: "baby-fish", title: "A blue fish", theme: "animals", done: "Blub, blub. A blue fish with an orange tail." },
    g(String.raw`
      O . . .B/ B B B.\ . .
      O O .B/ B B B B B.\ .
      . O B B B B P B B
      O O .B\ B B B B B./ .
      O . . .B\ B B B./ . .`),
  );

const butterfly = () =>
  flat(
    { id: "baby-butterfly", title: "A butterfly", theme: "animals", done: "Flap, flap! A purple and blue butterfly." },
    g(`
      P P P . . . P P P
      P Y P P G P P Y P
      P P P P G P P P P
      . . . P G P . . .
      . B B B G B B B .
      . B Y B . B Y B .
      . B B . . . B B .`),
  );

const ladybird = () =>
  flat(
    { id: "baby-ladybird", title: "A spotty ladybird", theme: "animals", done: "A red ladybird with purple spots. Count the spots!" },
    g(String.raw`
      . . .P/ P P.\ . .
      . .R/ R P R R.\ .
      R P R P R P R
      R R R P R R R
      R P R P R P R
      .R\ R R P R R R./
      . .R\ R P R R./ .`),
  );

const apple = () =>
  flat(
    { id: "baby-apple", title: "A shiny apple", theme: "gardens", done: "A red apple with a green leaf. Crunch!" },
    g(String.raw`
      . . . O .G/ . .
      . .R/ R R R R.\ .
      .R/ R R R R R R.\
      R R Y R R R R
      R R R R R R R
      .R\ R R R R R R./
      . .R\ R R R R./ .`),
  );

const duck = () =>
  flat(
    { id: "baby-duck", title: "A little yellow duck", theme: "animals", done: "Quack! A little yellow duck on the blue water." },
    g(String.raw`
      . .Y/ Y Y.\ . . . .
      O Y B Y . . . .
      . .Y\ Y Y . . .Y/ Y.\
      . .Y/ Y Y Y Y Y Y
      . Y Y Y Y Y Y Y./
      . .Y\ Y Y Y Y Y./ .
      B B B B B B B B`),
  );

const house = () =>
  flat(
    { id: "baby-house", title: "A house picture", theme: "homes", done: "A house with a red roof, two windows and a door. Knock, knock!" },
    g(String.raw`
      . . .R/ R.\ . .
      . .R/ R R R.\ .
      .R/ R R R R R.\
      Y B Y Y B Y
      Y Y O Y Y Y
      Y Y O Y Y Y
      G G G G G G`),
  );

const tree = () =>
  flat(
    { id: "baby-tree", title: "A green tree", theme: "gardens", done: "A tall green tree. Birds live up there!" },
    g(String.raw`
      . . .G/ G.\ . .
      . .G/ G G G.\ .
      .G/ G G G G G.\
      G G G G G G
      . . O O . .
      . . O O . .`),
  );

const moon = () =>
  flat(
    { id: "baby-moon-and-stars", title: "The moon and stars", theme: "space", done: "Goodnight, moon. Goodnight, stars." },
    g(String.raw`
      . .Y/ Y Y Y.\ . . .
      .Y/ Y Y./ . . . O .
      Y Y . . . . . .
      Y Y . . . O . .
      .Y\ Y Y.\ . . . . .
      . .Y\ Y Y Y./ . . O`),
  );

const rocket = () =>
  flat(
    { id: "baby-rocket", title: "A purple rocket", theme: "space", done: "Three, two, one, whoosh! Up to the moon." },
    g(String.raw`
      . .R/ R.\ .
      . P P .
      . B B .
      . P P .
      . P P .
      .R/ P P R.\
      R P P R
      . O O .
      . .Y\ Y./ .`),
  );

const boat = () =>
  flat(
    { id: "baby-sailing-boat", title: "A boat with a yellow sail", theme: "vehicles", done: "A little boat with a yellow sail, bobbing on the sea." },
    g(String.raw`
      . . O Y.\ . . .
      . . O Y Y.\ . .
      . . O Y Y Y.\ .
      .R\ R R R R R R./
      B B B B B B B`),
  );

const quilt = () =>
  flat(
    { id: "baby-big-square-quilt", title: "A big-square quilt", theme: "patterns", done: "Big squares and little squares, all the colours." },
    g(`
      R+ - O Y G+ -
      - - B P - -
      Y O R G O Y
      G B P B R O
      B+ - Y O P+ -
      - - G R - -`),
  );

const rainbowArch = () =>
  flat(
    { id: "baby-rainbow-arch", title: "A rainbow arch", theme: "patterns", done: "A rainbow after the rain. Red, orange, yellow, green, blue." },
    g(`
      . . R R R R R R R R . .
      . R O O O O O O O O R .
      R O Y Y Y Y Y Y Y Y O R
      R O Y G G G G G G Y O R
      R O Y G B . . B G Y O R
      R O Y G B . . B G Y O R`),
  );

const diagonalRainbow = () =>
  flat(
    { id: "baby-rainbow-quilt", title: "A rainbow quilt", theme: "patterns", done: "Stripes of every colour, slanting across. A quilt to lie on and look at." },
    Array.from({ length: 10 }, (_, r) =>
      Array.from({ length: 10 }, (_, c) => "ROYGBP"[(r + c) % 6]).join(" "),
    ),
  );

/** The picnic blanket: a 10 × 10 check with triangle bunting all round it, points out. */
function picnicBlanket(): Project {
  const b = new Builder();
  squareMosaic(
    b,
    Array.from({ length: 10 }, (_, r) => Array.from({ length: 10 }, (_, c) => ((r + c) % 2 ? "Y" : "R")).join(" ")),
    "Lay it flat on the table, a big check, red and yellow.",
  );
  const bunt: Colour[] = ["blue", "green", "purple", "orange"];
  const side = (say: string, edge: (i: number) => [[number, number], [number, number]]) => {
    for (let i = 0; i < 10; i++) {
      const [a, z] = edge(i);
      b.on("tri-equilateral", bunt[i % 4], a, z);
    }
    b.step(say);
  };
  const turn = "blue, green, purple, orange, and round again";
  side(`Triangles all along the top edge, points out, left to right: ${turn}.`, (i) => [[i, 10], [i + 1, 10]]);
  side(`The same down the right edge, top to bottom: ${turn}.`, (i) => [[10, 10 - i], [10, 9 - i]]);
  side(`The same along the bottom edge, right to left: ${turn}.`, (i) => [[10 - i, 0], [9 - i, 0]]);
  side(`And up the left edge, bottom to top: ${turn}. The blanket is ready.`, (i) => [[0, i], [0, i + 1]]);
  return tot(b, { id: "baby-picnic-blanket", title: "The picnic blanket", theme: "patterns", done: "A picnic blanket with flags all round. Time for a teddy bears' picnic!" });
}

/* ---------- triangle pictures ---------- */

const H = Math.sqrt(3) / 2;

const colourWheel = () =>
  tris(
    { id: "baby-colour-wheel", title: "A colour wheel", theme: "patterns", done: "Round and round the colours go: red, orange, yellow, green, blue, purple." },
    triangleRows(4, 7, (x, y) => {
      const dx = x - 2;
      const dy = y - 2 * H;
      // inside the hexagon of side 2 round (2, 2h)
      if (Math.abs(dy) > 2 * H || Math.abs(dx) + Math.abs(dy) / Math.sqrt(3) > 2) return ".";
      const sector = Math.floor(((Math.atan2(dy, dx) + 2 * Math.PI) % (2 * Math.PI)) / (Math.PI / 3));
      return "ROYGBP"[sector];
    }),
  );

const twinkleStar = () =>
  tris(
    { id: "baby-twinkle-star", title: "A twinkly star", theme: "space", done: "Twinkle, twinkle, little star. A yellow star with orange points." },
    g(`
      ...O
      .OYYYO
      .OYYYO
      ...O`),
  );

const rainbowTriangle = () =>
  tris(
    { id: "baby-rainbow-triangle", title: "A rainbow triangle", theme: "patterns", done: "A big triangle made of little triangles, red at the top." },
    g(`
      ...R
      ..OOO
      .YYYYY
      GGGGGGG`),
  );

const triangleQuilt = () =>
  tris(
    { id: "baby-triangle-zigzag", title: "A triangle zigzag", theme: "patterns", done: "Up and down, up and down. A zigzag of colours." },
    triangleRows(4, 9, (x, y) => "BGYO"[Math.floor(y / H)] ?? "."),
  );

const shinyDiamond = () =>
  tris(
    { id: "baby-shiny-diamond", title: "A shiny diamond", theme: "patterns", done: "A sparkly purple diamond with a blue heart." },
    triangleRows(8, 10, (x, y) => {
      // two triangles of side 4, point down below and point up above, with a blue one of side 2 inside
      const d = Math.abs(x - 3) / 2 + Math.abs(y - 4 * H) / (4 * H);
      return d > 1 ? "." : d < 0.5 ? "B" : "P";
    }),
  );

const honeyFlowers = () =>
  tris(
    { id: "baby-honey-flowers", title: "Three honey flowers", theme: "gardens", done: "Three yellow flowers, side by side, for the bees." },
    triangleRows(2, 13, (x, y) => {
      // round lattice points two apart, so the flowers touch
      for (const cx of [1.5, 3.5, 5.5]) {
        const dx = x - cx;
        const dy = y - H;
        if (Math.abs(dy) <= H && Math.abs(dx) + Math.abs(dy) / Math.sqrt(3) <= 1) return dy > 0 ? "Y" : "O";
      }
      return ".";
    }),
  );

/* ---------- shapes that stand up ---------- */

function shapeFriends(): Project {
  const b = new Builder();
  b.lid("square", "red", 0, 0, 0);
  b.step("Lay a red square flat on the table.");
  b.room("red", 0, 0, 1, 1, 0);
  b.step("Stand four red squares up round its edges, a box.");
  b.lid("square", "red", 0, 1, 0);
  b.step("Put a red square on top as a lid. A cube!");
  b.lid("square", "blue", 2, 0, 0);
  b.step("A little way along, lay a blue square flat.");
  b.roof("yellow", 2, 0, 0);
  b.step("Lean four tall yellow triangles in from its edges until their points meet. A pyramid!");
  return tot(b, { id: "baby-shape-friends", title: "A cube and a pyramid", theme: "patterns", done: "A red cube and a yellow pyramid, side by side. Square, and pointy." }, false);
}

function threeCubes(): Project {
  const b = new Builder();
  const colours: Colour[] = ["red", "yellow", "blue"];
  colours.forEach((c, i) => {
    b.lid("square", c, i * 2, 0, 0);
    b.step(i ? `A little way along, lay a ${c} square flat.` : `Lay a ${c} square flat on the table.`);
    b.room(c, i * 2, 0, 1, 1, 0);
    b.step(`Stand four ${c} squares up round its edges.`);
    b.lid("square", c, i * 2, 1, 0);
    b.step(`A ${c} square on top. A ${c} cube!`);
  });
  return tot(b, { id: "baby-three-cubes", title: "Three colour cubes", theme: "patterns", done: "Red, yellow, blue. Three cubes in a row." }, false);
}

function rainbowTower(): Project {
  const b = new Builder();
  b.lid("square", "purple", 0, 0, 0);
  b.step("Lay a purple square flat on the table.");
  const colours: Colour[] = ["red", "orange", "yellow", "green", "blue", "purple"];
  colours.forEach((c, i) => {
    b.room(c, 0, 0, 1, 1, i);
    b.step(i === 0 ? "Stand four red squares round it, a box." : `Four ${c} squares on top, standing on the box below.`);
  });
  b.lowRoof("red", 0, 0, 6);
  b.step("Lean four red triangles together on top until their points meet. A rainbow tower!");
  return tot(b, { id: "baby-rainbow-tower", title: "A rainbow tower", theme: "patterns", done: "A tall rainbow tower. Look up, up, up!" }, false);
}

function littleHouse(): Project {
  const b = new Builder();
  b.lid("square", "yellow", 0, 0, 0);
  b.step("Lay a yellow square flat on the table.");
  b.room("yellow", 0, 0, 1, 1, 0);
  b.step("Stand four yellow squares round it, the walls.");
  b.roof("red", 0, 0, 1);
  b.step("Lean four tall red triangles in on top until their points meet. The roof.");
  return tot(b, { id: "baby-little-house", title: "A yellow house with a pointy roof", theme: "homes", done: "A little yellow house with a pointy red roof. Who lives here?" }, false);
}

export const AGE_T: Project[] = [
  rainbowStripes(),
  checks(),
  squaresInSquares(),
  littleHeart(),
  bigHeart(),
  sunshine(),
  happyFace(),
  flower(),
  fish(),
  butterfly(),
  ladybird(),
  apple(),
  duck(),
  house(),
  tree(),
  moon(),
  rocket(),
  boat(),
  quilt(),
  rainbowArch(),
  diagonalRainbow(),
  picnicBlanket(),
  colourWheel(),
  twinkleStar(),
  rainbowTriangle(),
  triangleQuilt(),
  shinyDiamond(),
  honeyFlowers(),
  shapeFriends(),
  threeCubes(),
  rainbowTower(),
  littleHouse(),
];
