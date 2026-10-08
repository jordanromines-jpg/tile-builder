/* Wildflowers (2.9), part 2: ten flat flower pictures for 3 to 5, one tile a step, from a Magna-Tiles 32. Kit:
   tots-kit.ts. Colour notes say once, plainly, when a real colour isn't a tile colour. */
import type { Colour, ShapeId } from "../engine/catalog";
import type { Project } from "../engine/types";
import { Builder } from "./helpers";

type P = [number, number];

/** Lay one flat tile by its base, from a to z (the tile is on the left of a→z), and say what it is. */
function lay(b: Builder, shape: ShapeId, colour: Colour, a: P, z: P, say: string) {
  b.on(shape, colour, a, z);
  b.step(say);
}

/** The finished picture: one star up to 7 tiles, two above. */
function done(b: Builder, id: string, title: string, say: string): Project {
  return b.build({ id: `flower-${id}`, title, theme: "flowers", age: "a", stars: b.placed.length <= 7 ? 1 : 2, flat: true, done: say });
}

const T = "tri-equilateral" as const;
const TALL = "tri-isosceles-tall" as const;
const CORNER = "tri-right" as const;

function sunflower(): Project {
  const b = new Builder();
  lay(b, "square-large", "purple", [1, 1], [3, 1], "Put a big purple square flat on the table. It is the middle of the sunflower. Real sunflower middles are brown; we use purple.");
  lay(b, T, "yellow", [1, 3], [2, 3], "Put a yellow triangle on top, at the left. A petal!");
  lay(b, T, "yellow", [2, 3], [3, 3], "Another yellow triangle on top, at the right.");
  lay(b, T, "yellow", [3, 2], [3, 1], "A yellow triangle on the right side, at the bottom.");
  lay(b, T, "yellow", [3, 3], [3, 2], "A yellow triangle on the right side, at the top.");
  lay(b, T, "yellow", [3, 1], [2, 1], "A yellow triangle at the bottom, on the right.");
  lay(b, T, "yellow", [2, 1], [1, 1], "A yellow triangle at the bottom, on the left.");
  lay(b, T, "yellow", [1, 1], [1, 2], "A yellow triangle on the left side, at the bottom.");
  lay(b, T, "yellow", [1, 2], [1, 3], "The last yellow triangle goes on the left side, at the top.");
  return done(b, "ks-sunflower", "A Kansas sunflower", "You made a sunflower! It is the state flower of Kansas.");
}

function goldenrod(): Project {
  const b = new Builder();
  lay(b, "square", "green", [1, 0], [2, 0], "Put a green square flat on the table. It is the stem.");
  lay(b, "square", "green", [1, 1], [2, 1], "Put another green square on top. The stem grows.");
  lay(b, "square", "yellow", [1, 2], [2, 2], "Put a yellow square on top of the stem. Goldenrod flowers are yellow!");
  lay(b, "square", "yellow", [0, 2], [1, 2], "Put a yellow square on the left.");
  lay(b, "square", "yellow", [2, 2], [3, 2], "Put a yellow square on the right.");
  lay(b, T, "yellow", [0, 3], [1, 3], "Put a yellow triangle on top, at the left.");
  lay(b, T, "yellow", [2, 3], [3, 3], "Put a yellow triangle on top, at the right.");
  lay(b, TALL, "yellow", [1, 3], [2, 3], "Put a tall yellow triangle in the middle. It makes a fluffy top!");
  return done(b, "ks-goldenrod", "A Kansas goldenrod", "You made goldenrod! Bees and bugs carry its pollen, not the wind, so it does not make people sneeze.");
}

function indianBlanket(): Project {
  const b = new Builder();
  lay(b, "square", "purple", [1, 1], [2, 1], "Put a purple square flat on the table. It is the middle. Real ones are brown; we use purple.");
  lay(b, "square", "red", [0, 1], [1, 1], "Put a red square on the left.");
  lay(b, "square", "red", [2, 1], [3, 1], "Put a red square on the right.");
  lay(b, "square", "red", [1, 2], [2, 2], "Put a red square on top.");
  lay(b, "square", "red", [1, 0], [2, 0], "Put a red square at the bottom.");
  lay(b, T, "yellow", [0, 1], [0, 2], "Put a yellow triangle on the left end. Yellow tips!");
  lay(b, T, "yellow", [3, 2], [3, 1], "Put a yellow triangle on the right end.");
  lay(b, T, "yellow", [1, 3], [2, 3], "Put a yellow triangle on the top end.");
  lay(b, T, "yellow", [2, 0], [1, 0], "Put a yellow triangle on the bottom end.");
  return done(b, "ks-indian-blanket", "A Kansas Indian blanket", "You made an Indian blanket! It is the state wildflower of Oklahoma, and it grows in Kansas too.");
}

function violet(): Project {
  const b = new Builder();
  lay(b, "square", "yellow", [1, 1], [2, 1], "Put a yellow square flat on the table. It is the middle of the violet.");
  lay(b, "square", "purple", [0, 1], [1, 1], "Put a purple square on the left. A petal!");
  lay(b, "square", "purple", [2, 1], [3, 1], "Put a purple square on the right.");
  lay(b, "square", "purple", [0, 2], [1, 2], "Put a purple square above the left one.");
  lay(b, "square", "purple", [2, 2], [3, 2], "Put a purple square above the right one.");
  lay(b, "square", "purple", [1, 0], [2, 0], "Put a purple square under the middle. That is five petals.");
  lay(b, CORNER, "green", [1, 0], [1, 1], "Put a small green triangle on the bottom left. A leaf.");
  lay(b, CORNER, "green", [2, 1], [2, 0], "Put a small green triangle on the bottom right. Another leaf.");
  return done(b, "chicago-violet", "A Chicago violet", "You made a violet! It is the state flower of Illinois, and children voted for it in 1907.");
}

function spiderwort(): Project {
  const b = new Builder();
  lay(b, "square", "yellow", [1, 1], [2, 1], "Put a yellow square flat on the table. It is the middle.");
  lay(b, T, "blue", [1, 2], [2, 2], "Put a blue triangle on top. A petal!");
  lay(b, T, "blue", [1, 1], [1, 2], "Put a blue triangle on the left side.");
  lay(b, T, "blue", [2, 2], [2, 1], "Put a blue triangle on the right side. A spiderwort has three petals.");
  lay(b, "square", "green", [1, 0], [2, 0], "Put a green square under the middle. The stem.");
  lay(b, TALL, "green", [1, 0], [1, 1], "Put a tall green triangle on the left of the stem. A long leaf.");
  lay(b, TALL, "green", [2, 1], [2, 0], "Put a tall green triangle on the right of the stem. Another long leaf.");
  return done(b, "chicago-spiderwort", "A Chicago spiderwort", "You made a spiderwort! Each flower opens in the morning and closes in the afternoon.");
}

function shootingStar(): Project {
  const b = new Builder();
  lay(b, TALL, "purple", [0, 1], [1, 1], "Put a tall purple triangle flat on the table, pointing up. A petal!");
  lay(b, TALL, "purple", [1, 1], [2, 1], "Put another tall purple triangle next to it.");
  lay(b, TALL, "purple", [2, 1], [3, 1], "One more tall purple triangle. The petals swoosh up, like a shooting star. Real ones are pink or white; we use purple.");
  lay(b, "square", "yellow", [1, 0], [2, 0], "Put a yellow square under the middle petal.");
  lay(b, T, "yellow", [2, 0], [1, 0], "Put a yellow triangle under that, pointing down. The tail!");
  lay(b, CORNER, "green", [1, 0], [1, 1], "Put a small green triangle at the bottom left. A leaf.");
  lay(b, CORNER, "green", [2, 1], [2, 0], "Put a small green triangle at the bottom right.");
  return done(b, "chicago-shooting-star", "A Chicago shooting star", "You made a shooting star! A bumblebee has to buzz to shake the pollen out of it.");
}

function prairieSmoke(): Project {
  const b = new Builder();
  lay(b, "square", "green", [1, 0], [2, 0], "Put a green square flat on the table. It is the stem.");
  lay(b, "square", "green", [1, 1], [2, 1], "Put another green square on top.");
  lay(b, CORNER, "green", [1, 0], [1, 1], "Put a small green triangle on the left of the stem. A leaf.");
  lay(b, CORNER, "green", [2, 1], [2, 0], "Put a small green triangle on the right of the stem.");
  lay(b, TALL, "purple", [1, 2], [2, 2], "Put a tall purple triangle on top of the stem. A wispy tail! Real ones are pink; we use purple.");
  lay(b, TALL, "purple", [0, 2], [1, 2], "Put another tall purple triangle on the left.");
  lay(b, TALL, "purple", [2, 2], [3, 2], "Put another on the right. Now it looks like smoke.");
  return done(b, "chicago-prairie-smoke", "A Chicago prairie smoke", "You made prairie smoke! It gets its name from the long, feathery tails on its seeds. It grows in northern Illinois.");
}

function dogwood(): Project {
  const b = new Builder();
  lay(b, "square", "green", [1, 1], [2, 1], "Put a green square flat on the table. It is the middle.");
  lay(b, "square", "yellow", [0, 1], [1, 1], "Put a yellow square on the left. Dogwood flowers are white; we use yellow.");
  lay(b, "square", "yellow", [2, 1], [3, 1], "Put a yellow square on the right.");
  lay(b, "square", "yellow", [1, 2], [2, 2], "Put a yellow square on top.");
  lay(b, "square", "yellow", [1, 0], [2, 0], "Put a yellow square at the bottom. Four petals!");
  lay(b, CORNER, "green", [1, 0], [1, 1], "Put a small green triangle at the bottom left. A leaf.");
  lay(b, CORNER, "green", [2, 1], [2, 0], "Put a small green triangle at the bottom right.");
  return done(b, "carolina-dogwood", "A Carolina dogwood", "You made a dogwood! It is the state flower of North Carolina.");
}

function trumpetCreeper(): Project {
  const b = new Builder();
  lay(b, "square", "green", [1, 0], [2, 0], "Put a green square flat on the table. It is the vine.");
  lay(b, "square", "green", [1, -1], [2, -1], "Put another green square under it. The vine grows down.");
  lay(b, TALL, "red", [1, 1], [1, 2], "Put a tall red triangle above the vine, pointing left. The trumpet!");
  lay(b, "square", "red", [1, 1], [2, 1], "Put a red square next to the wide end of the triangle, above the vine.");
  lay(b, "square", "orange", [2, 1], [3, 1], "Put an orange square next to the red one.");
  lay(b, T, "orange", [2, 2], [3, 2], "Put an orange triangle on top. The trumpet opens wide.");
  lay(b, T, "orange", [3, 1], [2, 1], "Put an orange triangle at the bottom. Now it is wide open.");
  return done(b, "carolina-trumpet-creeper", "A Carolina trumpet creeper", "You made a trumpet creeper! Hummingbirds visit its red trumpet flowers.");
}

function flytrap(): Project {
  const b = new Builder();
  lay(b, "square", "red", [1, 1], [2, 1], "Put a red square flat on the table. It is the inside of the trap.");
  lay(b, "square", "green", [0, 1], [1, 1], "Put a green square on the left. One side of the trap.");
  lay(b, "square", "green", [2, 1], [3, 1], "Put a green square on the right. The other side.");
  lay(b, T, "green", [0, 2], [1, 2], "Put a green triangle on top, at the left. A pointy tooth!");
  lay(b, T, "green", [1, 2], [2, 2], "Put a green triangle on top, in the middle.");
  lay(b, T, "green", [2, 2], [3, 2], "Put a green triangle on top, at the right.");
  lay(b, T, "green", [1, 1], [0, 1], "Put a green triangle under the left side. More teeth!");
  lay(b, T, "green", [2, 1], [1, 1], "Put a green triangle under the middle.");
  lay(b, T, "green", [3, 1], [2, 1], "Put a green triangle under the right side. Snap!");
  return done(b, "carolina-venus-flytrap", "A Carolina Venus flytrap", "You made a Venus flytrap! It grows wild only near Wilmington, North Carolina, and a bit of South Carolina.");
}

export const FLOWERS_2: Project[] = [sunflower(), goldenrod(), indianBlanket(), violet(), spiderwort(), shootingStar(), prairieSmoke(), dogwood(), trumpetCreeper(), flytrap()];
