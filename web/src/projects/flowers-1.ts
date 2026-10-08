/* Wildflowers (2.9), part 1: ten flat flower pictures for 0 to 3, built by a grown-up and shown from above. Kit:
   tots-kit.ts (rows, points, triangle rows). Facts and colours: plans/ flowers research. */
import type { Project } from "../engine/types";
import { EQ_H } from "../engine/catalog";
import { Builder } from "./helpers";
import { points, squareMosaic, tot, triangleMosaic, triangleRows, type Point, type TotMeta } from "./tots-kit";

const LAY = "Lay it flat on the table.";

const g = (s: string) =>
  s
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

const pt = (col: number, row: number, edge: Point["edge"], colour: string, tall = false): Point => ({
  cell: [col, row],
  edge,
  colour,
  ...(tall ? { shape: "tri-isosceles-tall" as const } : {}),
});

/** A square-grid flower, then its triangles, one step for each list. `note` is the colour note, said once. */
function picture(meta: TotMeta, rows: string[], tris: [Point[], string][], note = ""): Project {
  const b = new Builder();
  squareMosaic(b, rows, `${note ? `${note} ` : ""}${LAY}`);
  for (const [pts, say] of tris) points(b, rows.length, pts, say);
  return tot(b, meta);
}

const along = (cols: number[], row: number, edge: Point["edge"], colour: string, tall = false) => cols.map((c) => pt(c, row, edge, colour, tall));
const down = (rows: number[], col: number, edge: Point["edge"], colour: string) => rows.map((r) => pt(col, r, edge, colour));

const sunflower = () =>
  picture(
    { id: "flower-t-kansas-sunflower", title: "Kansas sunflower", theme: "flowers", done: "The sunflower is the state flower of Kansas." },
    g(String.raw`
      Y Y Y Y
      Y P+ - Y
      Y - - Y
      Y Y Y Y
      . G G .
      . G G .`),
    [
      [[...along([0, 1, 2, 3], 0, "top", "Y"), ...down([1, 2], 0, "left", "Y"), ...down([1, 2], 3, "right", "Y")], "Yellow triangles round the top and the sides, pointing out. The sunflower's rays."],
      [[pt(1, 4, "left", "G"), pt(2, 5, "right", "G")], "A green leaf triangle on each side of the stem."],
    ],
    "The sunflower's middle is really brown; we use purple.",
  );

const blackEyedSusan = () =>
  picture(
    { id: "flower-t-kansas-black-eyed-susan", title: "Kansas black-eyed Susan", theme: "flowers", done: "Black-eyed Susan has yellow petals around a dark brown centre." },
    g(String.raw`
      .Y/ Y Y Y Y Y.\
      Y Y Y Y Y Y
      Y Y P P Y Y
      Y Y P P Y Y
      Y Y Y Y Y Y
      .Y\ Y Y Y Y Y./
      . . G G . .
      . . G G . .`),
    [[[pt(2, 6, "left", "G"), pt(3, 7, "right", "G")], "A green leaf triangle on each side of the stem."]],
    "The black-eyed Susan's centre is really dark brown; we use purple.",
  );

const milkweed = () =>
  picture(
    { id: "flower-t-kansas-butterfly-milkweed", title: "Kansas butterfly milkweed", theme: "flowers", done: "Butterfly milkweed has orange flowers that attract butterflies and many other insects." },
    g(String.raw`
      . .O/ O O O O.\ .
      .O/ O Y O Y O O.\
      O O O Y O O O
      O O Y O Y O O
      .O\ O O O O O O./
      . . . G . . .
      . . . G . . .`),
    [[[pt(3, 5, "left", "G"), pt(3, 6, "right", "G")], "Green triangles on the stem for leaves."]],
  );

const indianBlanket = () =>
  picture(
    { id: "flower-t-kansas-indian-blanket", title: "Kansas Indian blanket", theme: "flowers", done: "Indian blanket is the state wildflower of Oklahoma." },
    g(String.raw`
      . R R R .
      R R R R R
      R R P R R
      R R R R R
      . R R R .
      . . G . .
      . . G . .`),
    [
      [[...along([1, 2, 3], 0, "top", "Y"), ...along([1, 3], 4, "bottom", "Y")], "Three yellow triangles on top and two underneath, pointing out."],
      [[...down([1, 2, 3], 0, "left", "Y"), ...down([1, 2, 3], 4, "right", "Y")], "Three yellow triangles on each side, pointing out. Each red petal has yellow tips."],
    ],
    "The Indian blanket's middle is really reddish-brown; we use purple.",
  );

const violet = () =>
  picture(
    { id: "flower-t-chicago-violet", title: "Chicago violet", theme: "flowers", done: "The violet is the state flower of Illinois; schoolchildren voted for it in 1907." },
    g(String.raw`
      . P+ - P+ - .
      . - - - - .
      . B Y Y B .
      . B Y Y B .
      . . P+ - . .
      . . - - . .
      . . G G . .`),
    [[[...down([2, 3], 1, "left", "B"), ...down([2, 3], 4, "right", "B"), pt(2, 6, "left", "G"), pt(3, 6, "right", "G")], "A blue triangle on each side of the middle, pointing out, and a green leaf triangle on each side of the stem."]],
  );

const columbine = () =>
  picture(
    { id: "flower-t-chicago-wild-columbine", title: "Chicago wild columbine", theme: "flowers", done: "Hummingbirds and bumblebees sip nectar from wild columbine." },
    g(String.raw`
      R G R G R
      R R R R R
      R Y Y Y R
      . Y Y Y .`),
    [
      [along([0, 2, 4], 0, "top", "R", true), "Three tall red triangles on top, pointing up. The columbine's spurs."],
      [along([1, 2, 3], 3, "bottom", "Y", true), "Three tall yellow triangles hanging underneath, pointing down."],
    ],
  );

const bluebells = () =>
  picture(
    { id: "flower-t-chicago-virginia-bluebells", title: "Chicago Virginia bluebells", theme: "flowers", done: "Virginia bluebells open pink and turn blue; the leaves fade by mid-summer." },
    g(String.raw`
      . . . G G G . . .
      . G G . B . G G .
      . P P .B/ B B.\ B B .
      .P/ P P.\ . . . .B/ B B.\ `),
    [],
    "The young bluebell is really pink; we use purple.",
  );

/* a lily seen from above: a star of six petals round a middle, drawn in triangles */
function lily(): Project {
  const b = new Builder();
  const rows = triangleRows(4, 8, (x, y) => {
    // two big triangles of side 3, one pointing up and one down, both centred on x = 2, y = 2 rows
    const dx = Math.abs(x - 2);
    const up = y >= EQ_H && y <= 4 * EQ_H - dx * Math.sqrt(3);
    const dn = y <= 3 * EQ_H && y >= dx * Math.sqrt(3);
    return up && dn ? "Y" : up || dn ? "O" : ".";
  });
  triangleMosaic(b, rows, LAY);
  return tot(b, { id: "flower-t-carolina-lily", title: "Carolina lily", theme: "flowers", done: "The Carolina lily is the state wildflower of North Carolina." });
}

const dogwood = () => {
  const b = new Builder();
  squareMosaic(b, g(String.raw`
    G . Y+ - . G
    . . - - . .
    Y+ - G G Y+ -
    - - G G - -
    . . Y+ - . .
    G . - - . G`), "Dogwood flowers are white; we use yellow. The four big squares are the flower's four bracts. " + LAY);
  return tot(b, { id: "flower-t-carolina-dogwood-blossom", title: "North Carolina dogwood blossom", theme: "flowers", done: "The dogwood is the state flower of North Carolina." });
};

const flytrap = () =>
  picture(
    { id: "flower-t-carolina-venus-flytrap", title: "North Carolina Venus flytrap", theme: "flowers", done: "Venus flytraps grow wild only near Wilmington, North Carolina, and a bit of South Carolina." },
    g(String.raw`
      G G G G G G
      G R R R R G
      . . . . . .
      G R R R R G
      G G G G G G
      . . G G . .
      . . G G . .`),
    [
      [[...along([1, 3], 1, "bottom", "G"), ...along([2, 4], 3, "top", "G")], "Four green triangles for teeth, in the gap between the two jaws, pointing in and in between each other."],
    ],
  );

export const FLOWERS_1: Project[] = [sunflower(), blackEyedSusan(), milkweed(), indianBlanket(), violet(), columbine(), bluebells(), dogwood(), lily(), flytrap()];
