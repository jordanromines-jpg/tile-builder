/* 0 to 3, the big squares and the triangles (2.6): pictures where a big square is a whole head, a body, a window on
   the world, and triangles laid against the edges make roofs, rays, petals, fins and spikes; and big-square shapes that
   stand up. Tokens as in tots-kit.ts; `points` adds the triangles. */
import type { Project } from "../engine/types";
import { Builder } from "./helpers";
import { bigCells, bigCube, bigTunnel, points, squareMosaic, tot, type Point, type TotMeta } from "./tots-kit";

const LAY = "Lay it flat on the table.";

/** A square-grid picture, then its triangles, one step for each list. */
function picture(meta: TotMeta, rows: string[], tris: [Point[], string][], opening = LAY): Project {
  const b = new Builder();
  squareMosaic(b, rows, opening);
  for (const [pts, say] of tris) points(b, rows.length, pts, say);
  return tot(b, meta);
}

const pt = (col: number, row: number, edge: Point["edge"], colour: string, tall = false): Point => ({
  cell: [col, row],
  edge,
  colour,
  ...(tall ? { shape: "tri-isosceles-tall" as const } : {}),
});

const robot = () =>
  picture(
    { id: "baby-big-robot", title: "A big-block robot", theme: "space", done: "Beep boop! A robot with a big blue head and a red body." },
    [". . B+ - . .", ". . - - . .", "O R+ - R+ - O", "O - - - - O", ". G . . G .", ". G . . G ."],
    [
      [[pt(2, 0, "top", "P"), pt(3, 0, "top", "P")], "Two purple triangles on top of the head, pointing up. Its antennas."],
      [[pt(0, 3, "left", "O"), pt(5, 3, "right", "O")], "An orange triangle on the end of each arm, pointing out. Its hands."],
    ],
  );

const zigzagHouse = () =>
  picture(
    { id: "baby-zigzag-roof-house", title: "A house with a zigzag roof", theme: "homes", done: "A yellow house with a pointy red roof, a blue window and an orange door." },
    ["Y+ - Y+ -", "- - - -", "Y B O Y", "Y Y O Y", "G G G G"],
    [[[0, 1, 2, 3].map((c) => pt(c, 0, "top", "R", true)), "Four tall red triangles along the top, pointing up. A zigzag roof!"]],
  );

function bigAndLittleCube(): Project {
  const b = new Builder();
  bigCube(b, "blue", 0, 0, ["Lay a big blue square flat on the table.", "Stand four big blue squares up round its edges, a big box.", "A big blue square on top. A big cube!"]);
  b.lid("square", "yellow", 3, 0, 1);
  b.step("Next to it, lay a little yellow square flat.");
  b.room("yellow", 3, 1, 1, 1, 0);
  b.step("Stand four little yellow squares round it.");
  b.lid("square", "yellow", 3, 1, 1);
  b.step("A little yellow square on top. A little cube!");
  return tot(b, { id: "baby-big-and-little-cube", title: "A big cube and a little cube", theme: "patterns", done: "A big blue cube and a little yellow cube. Big, and little!" }, false);
}

function carTunnel(): Project {
  const b = new Builder();
  for (let x = -2; x < 4; x++) b.lid("square", x % 2 ? "green" : "yellow", x, 0, 0);
  b.step("Lay a row of six squares flat on the table, yellow and green in turn. One lane of the road.");
  for (let x = -2; x < 4; x++) b.lid("square", x % 2 ? "yellow" : "green", x, 0, 1);
  b.step("Lay a second row of six right behind it, green and yellow in turn. Two lanes!");
  bigTunnel(b, "red", "purple", 0, 0, "Stand two big red squares up along the road, one each side, over the middle, and lay a big purple square across their tops. A tunnel!");
  return tot(b, { id: "baby-car-tunnel", title: "A tunnel for a toy car", theme: "vehicles", done: "Vroom! A road with a big tunnel. Drive a little car through." }, false);
}

const quiltWithBunting = () =>
  picture(
    { id: "baby-bunting-quilt", title: "A quilt with bunting", theme: "patterns", done: "Four big squares of colour, a stripy border, and flags all along the top and bottom." },
    ["P O P O P O", "O R+ - Y+ - P", "P - - - - O", "O B+ - G+ - P", "P - - - - O", "O P O P O P"],
    [
      [[0, 1, 2, 3, 4, 5].map((c) => pt(c, 0, "top", c % 2 ? "G" : "B")), "Six triangles along the top edge, pointing up, blue and green in turn. Bunting!"],
      [[0, 1, 2, 3, 4, 5].map((c) => pt(c, 5, "bottom", c % 2 ? "B" : "G")), "Six more along the bottom edge, pointing down, green and blue in turn."],
    ],
  );

const bigSun = () =>
  picture(
    { id: "baby-big-sun", title: "A big sun with rays", theme: "space", done: "A big yellow sun with orange and red rays all round. Good morning!" },
    bigCells(["Y Y", "Y Y"]),
    [
      [[...[0, 1, 2, 3].map((c) => pt(c, 0, "top", c % 2 ? "R" : "O")), ...[0, 1, 2, 3].map((r) => pt(3, r, "right", r % 2 ? "R" : "O"))], "Triangles all along the top and down the right side, pointing out, orange and red in turn. Rays!"],
      [[...[0, 1, 2, 3].map((c) => pt(c, 3, "bottom", c % 2 ? "O" : "R")), ...[0, 1, 2, 3].map((r) => pt(0, r, "left", r % 2 ? "O" : "R"))], "The same along the bottom and up the left side. The sun is shining!"],
    ],
  );

const bigFish = () =>
  picture(
    { id: "baby-big-fish", title: "A big-square fish", theme: "animals", done: "A big blue fish with an orange tail and purple fins, swimming along." },
    ["B+ - B P", "- - B B"],
    [
      [[pt(0, 0, "left", "O", true), pt(0, 1, "left", "O", true)], "Two tall orange triangles at the left end, pointing out. Its tail."],
      [[pt(1, 0, "top", "P"), pt(2, 0, "top", "P"), pt(1, 1, "bottom", "P"), pt(3, 0, "right", "Y"), pt(3, 1, "right", "Y")], "Purple triangles on top and underneath for fins, and two yellow ones at the front for its mouth."],
    ],
  );

const bigTrain = () =>
  picture(
    { id: "baby-big-train", title: "A big-block train", theme: "vehicles", done: "Choo, choo! A red engine pulling a green and a blue carriage." },
    ["R R R+ - . G+ - . B+ -", "R R - - P - - P - -", ". O . O . O O . O O"],
    [[[pt(3, 0, "top", "O", true), pt(0, 0, "top", "Y")], "A tall orange triangle on top of the engine, pointing up, its funnel; and a yellow one on the cab."]],
  );

const rocket = () =>
  picture(
    { id: "baby-big-rocket", title: "A space rocket with tall fins", theme: "space", done: "Three, two, one, blast off! A purple rocket with tall orange fins." },
    ["P P", "B B", "P+ -", "- -"],
    [
      [[pt(0, 0, "top", "R", true), pt(1, 0, "top", "R", true)], "Two tall red triangles on top, pointing up. The nose."],
      [[pt(0, 3, "left", "O", true), pt(1, 3, "right", "O", true), pt(0, 2, "left", "O"), pt(1, 2, "right", "O")], "Tall orange triangles at the bottom corners and short ones above them, pointing out. Fins!"],
      [[pt(0, 3, "bottom", "Y"), pt(1, 3, "bottom", "Y")], "Two yellow triangles underneath, pointing down. Whoosh, the flames!"],
    ],
  );

const hedgehog = () =>
  picture(
    { id: "baby-hedgehog", title: "A spiky hedgehog", theme: "animals", done: "A little orange hedgehog with purple spikes. Snuffle, snuffle." },
    ["O+ - O+ - .", "- - - - Y"],
    [
      [[0, 1, 2, 3].map((c) => pt(c, 0, "top", "P", true)), "Four tall purple triangles along the top, pointing up. Spikes!"],
      [[pt(0, 0, "left", "P", true), pt(0, 1, "left", "P", true), pt(4, 1, "right", "P"), pt(1, 1, "bottom", "Y"), pt(2, 1, "bottom", "Y")], "Two more spikes at the back, a purple nose on its face, and two yellow feet underneath."],
    ],
  );

const pointyCrown = () =>
  picture(
    { id: "baby-pointy-crown", title: "A pointy crown", theme: "castles", done: "A golden crown with jewels and points. Who will wear it?" },
    ["Y R Y B Y G", "Y+ - Y+ - Y+ -", "- - - - - -"],
    [[[0, 1, 2, 3, 4, 5].map((c) => pt(c, 0, "top", "Y", c % 2 === 0)), "Six yellow triangles along the top, pointing up, tall and short in turn. The points!"]],
  );

const petalFlower = () =>
  picture(
    { id: "baby-petal-flower", title: "A flower with petals", theme: "gardens", done: "A yellow flower with red petals all round, on a green stem with leaves." },
    ["Y+ -", "- -", ". G", ". G"],
    [
      [[pt(0, 0, "top", "R"), pt(1, 0, "top", "R"), pt(0, 0, "left", "R"), pt(0, 1, "left", "R"), pt(1, 0, "right", "R"), pt(1, 1, "right", "R"), pt(0, 1, "bottom", "R")], "Seven red triangles round the big square, pointing out. The petals!"],
      [[pt(1, 3, "left", "G", true), pt(1, 2, "right", "G", true)], "A tall green triangle on each side of the stem. Leaves."],
    ],
  );

export const AGE_T_BIG: Project[] = [
  robot(),
  zigzagHouse(),
  bigAndLittleCube(),
  carTunnel(),
  quiltWithBunting(),
  bigSun(),
  bigFish(),
  bigTrain(),
  rocket(),
  hedgehog(),
  pointyCrown(),
  petalFlower(),
];
