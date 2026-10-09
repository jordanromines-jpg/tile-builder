/* 2.2: castles and forts, 50 to 175 tiles, written as plans for the layout kit (projects/kit.ts). */
import type { Colour } from "../../engine/catalog";
import type { Project } from "../../engine/types";
import { Site } from "../kit";

type C = Colour;

/** Adds one short "why" sentence to the first step whose words start with `from` (ages 9+ only, so only called for those). */
function why(p: Project, from: string, text: string): Project {
  const step = p.steps.find((s) => s.say.startsWith(from));
  if (!step) throw new Error(`no step starts with "${from}"`);
  step.say += ` ${text}`;
  return p;
}

/** Four corner towers, curtain walls between them, and something in the middle. */
function corners(s: Site, w: number, d: number, h: number, tc: C[], wc: C, cren: C | undefined, cap: "tall" | "low" = "tall", byTower = false) {
  const spots: [number, number, string][] = [[0, 0, "the back left tower"], [w, 0, "the back right tower"], [0, d, "the front left tower"], [w, d, "the front right tower"]];
  // (`byTower`: each tower to its full height before the next, R14)
  spots.forEach(([x, z, n], i) => s.tower(n, x, z, h, tc, { cap, ...(byTower ? { level: (y: number) => -1 + i * 0.1 + y * 0.01 } : {}) }));
  s.wall("the front wall", "x", 1, w, d + 1, 2, wc);
  s.wall("the back wall", "x", 1, w, 0, 2, wc);
  s.wall("the left wall", "z", 1, d, 0, 2, wc);
  s.wall("the right wall", "z", 1, d, w + 1, 2, wc);
}

function sockPalace(): Project {
  const s = new Site();
  const hall = s.block("the great hall", 0, 0, 4, 3, 2, ["purple", "blue"], { door: true, roof: "yellow" });
  s.tower("the left sock tower", 0, 0, 2, ["red", "orange"], { base: hall.top });
  s.tower("the right sock tower", 3, 0, 2, ["red", "orange"], { base: hall.top });
  s.roofs("the hall roof", [[1, 2], [2, 2]], hall.top, "low", "green");
  return s.build({ id: "sock-palace", title: "The Royal Palace of Lost Socks", theme: "castles", age: "d", done: "You built the Royal Palace of Lost Socks! Every sock that ever went missing lives here." });
}

function fortKnock(): Project {
  const s = new Site();
  corners(s, 4, 4, 3, ["blue", "purple"], "red", "yellow");
  s.tower("the keep", 2, 2, 2, ["green"], { cap: "low" });
  return s.build({ id: "fort-knock", title: "Fort Knock-Knock", theme: "castles", age: "d", done: "You built Fort Knock-Knock! Knock knock. Who's there? A very big castle." });
}

function burpFortress(): Project {
  const s = new Site();
  corners(s, 5, 3, 3, ["green", "yellow"], "green", "orange");
  const keep = s.block("the burp chamber", 2, 1, 2, 2, 2, ["orange"], { roof: "red" });
  s.roofs("the burp chamber", [[2, 1], [3, 2]], keep.top, "low", "purple");
  return s.build({ id: "burp-fortress", title: "Baron Von Burp's Fortress", theme: "castles", age: "d", done: "You built Baron Von Burp's Fortress! BRAAAP. Pardon the baron." });
}

function pizzaPrincess(): Project {
  const s = new Site();
  const palace = s.block("the palace", 0, 0, 3, 3, 2, ["orange", "red"], { door: true, roof: "yellow" });
  s.tower("the pepperoni tower", 1, 1, 3, ["red", "yellow"], { base: palace.top });
  s.roofs("the cheesy corners", [[0, 0], [2, 0], [0, 2], [2, 2]], palace.top, "low", "yellow");
  return s.build({ id: "pizza-princess", title: "The Princess Who Prefers Pizza Palace", theme: "castles", age: "d", done: "You built the Pizza Palace! The princess says: extra cheese, please." });
}

function wizardAcademy(): Project {
  const s = new Site();
  const school = s.block("the school", 0, 0, 5, 2, 2, ["purple", "blue"], { door: true, floors: "yellow", roof: "blue" });
  s.tower("the potions tower", 0, 0, 3, ["purple", "green"], { base: school.top });
  s.tower("the spells tower", 4, 0, 4, ["blue", "purple"], { base: school.top });
  s.roofs("the classroom roof", [[2, 1]], school.top, "tall", "yellow");
  return s.build({ id: "wizard-academy", title: "The Wobbly Wizard Academy", theme: "castles", age: "d", done: "You built the Wobbly Wizard Academy! Today's lesson: how to turn homework into a frog." });
}

function knightSchool(): Project {
  const s = new Site();
  corners(s, 3, 3, 2, ["blue", "blue"], "yellow", "red", "low");
  s.plaza("the training yard", 1, 1, 3, 3, "green");
  return s.build({ id: "knight-school", title: "Knight School for Nervous Knights", theme: "castles", age: "c", done: "You built Knight School! Lesson one: it's OK to be scared of dragons." });
}

function moatCastle(): Project {
  const s = new Site();
  s.plaza("the moat", 0, 4, 6, 1, "blue");
  const keep = s.block("the castle", 1, 0, 4, 3, 2, ["yellow", "orange"], { door: true, roof: "orange" });
  s.tower("the cheese tower", 1, 0, 2, ["yellow"], { base: keep.top, cap: "low", capColour: "orange" });
  s.tower("the cracker tower", 4, 0, 2, ["orange"], { base: keep.top, cap: "low", capColour: "yellow" });
  return s.build({ id: "moat-and-cheese", title: "The Moat-and-Cheese Castle", theme: "castles", age: "d", done: "You built the Moat-and-Cheese Castle! The moat is full of melted cheese. Don't fall in. Or do." });
}

function snoreKeep(): Project {
  const s = new Site();
  const keep = s.block("the sleepy keep", 0, 0, 3, 3, 3, ["blue", "purple", "blue"], { roof: "purple" });
  s.roofs("the pillow roofs", [[0, 0], [1, 1], [2, 2], [2, 0]], keep.top, "mix", "yellow");
  return s.build({ id: "snore-keep", title: "Sir Snoresalot's Sleepover Keep", theme: "castles", age: "d", done: "You built the Sleepover Keep! ZZZZ. Sir Snoresalot is already asleep." });
}

function jokeTower(): Project {
  const s = new Site();
  const base = s.block("the joke shop", 0, 0, 3, 3, 1, ["green"], { door: true, roof: "yellow" });
  const mid = s.tower("the tower of terrible jokes", 0, 0, 4, ["orange", "red"], { base: base.top, size: 2, cap: "lid", capColour: "yellow" });
  s.tower("the punchline", 0, 0, 2, ["purple"], { base: mid.top });
  s.roofs("the groan roofs", [[2, 0], [2, 2], [0, 2]], base.top, "low", "blue");
  return s.build({ id: "joke-tower", title: "The Tower of Terrible Jokes", theme: "castles", age: "d", done: "You built the Tower of Terrible Jokes! Why did the tile go to school? To get a little edge-ucation." });
}

function grumpySummer(): Project {
  const s = new Site();
  const house = s.block("the summer house", 0, 0, 4, 2, 2, ["red", "purple"], { door: true, roof: "yellow" });
  s.roofs("the grumpy roof", [[0, 0], [3, 0]], house.top, "tall", "purple");
  s.plaza("the sulking patio", 0, 3, 4, 2, "green");
  s.tower("the sulk tower", 5, 0, 3, ["purple"], { cap: "tall", capColour: "red" });
  return s.build({ id: "grumpy-summer", title: "King Grumpypants' Summer House", theme: "castles", age: "d", done: "You built King Grumpypants' Summer House! He says it's too sunny. He says that about everything." });
}

function hiccupHall(): Project {
  const s = new Site();
  const hall = s.block("the hiccup hall", 0, 0, 5, 3, 2, ["purple", "purple"], { door: true, roof: "green" });
  s.tower("the hic tower", 0, 0, 3, ["green", "purple"], { base: hall.top });
  s.tower("the cup tower", 4, 2, 3, ["green", "purple"], { base: hall.top });
  s.roofs("the spooky roofs", [[2, 1]], hall.top, "tall", "red");
  return s.build({ id: "hiccup-hall", title: "The Haunted Hiccup Hall", theme: "castles", age: "d", done: "You built the Haunted Hiccup Hall! HIC. The ghosts can't stop. HIC." });
}

function wobblebottom(): Project {
  const s = new Site();
  corners(s, 4, 3, 2, ["green", "green"], "yellow", undefined, "low", true);
  s.plaza("the flower beds", 1, 1, 4, 3, "red");
  return s.build({ id: "wobblebottom-fort", title: "Queen Wobblebottom's Garden Fort", theme: "castles", age: "d", done: "You built Queen Wobblebottom's Garden Fort! The queen sits on the flowers. They are fine. Mostly." });
}

function ateItself(): Project {
  const s = new Site();
  const a = s.block("the hungry castle", 0, 0, 4, 4, 1, ["red"], { roof: "orange" });
  const b2 = s.block("its tummy", 0, 0, 3, 3, 1, ["orange"], { base: a.top, roof: "yellow" });
  const c = s.block("its throat", 0, 0, 2, 2, 1, ["yellow"], { base: b2.top, roof: "green" });
  s.tower("its last bite", 0, 0, 1, ["green"], { base: c.top });
  s.roofs("the crumbs", [[3, 0], [3, 3]], a.top, "low", "purple");
  return s.build({ id: "castle-ate-itself", title: "The Castle That Ate Itself", theme: "castles", age: "d", done: "You built the Castle That Ate Itself! Every layer is a little smaller. Nom nom nom." });
}

function dragonLair(): Project {
  const s = new Site();
  const lair = s.block("the lair", 0, 0, 4, 3, 2, ["red", "orange"], { door: true, roof: "orange" });
  s.roofs("the spikes", [[0, 0], [1, 0], [2, 0], [3, 0]], lair.top, "low", "red");
  s.tower("the egg tower", 5, 1, 4, ["green", "yellow"], { cap: "tall", capColour: "green" });
  s.deck("the egg bridge", "x", 4, 5, 1, 2, "yellow");
  return why(s.build({ id: "dragon-lair", title: "The Dragon's Bouncy Lair", theme: "castles", age: "d", done: "You built the Dragon's Bouncy Lair! The dragon bounces when it's happy. The floor does not like it." }), "The egg bridge", "A tall thin tower tips, but a bridge ties it to the wide lair, so it holds steady.");
}

function chessCastle(): Project {
  const s = new Site();
  const c: C[] = ["purple", "yellow"];
  for (const [x, z, n] of [[0, 0, "the back left rook"], [3, 0, "the back right rook"], [0, 3, "the front left rook"], [3, 3, "the front right rook"]] as const) s.tower(n, x, z, 3, c, { cap: "low", capColour: "red" });
  s.plaza("the chessboard", 1, 1, 2, 2, "purple");
  s.plaza("more chessboard", 1, 0, 2, 1, "yellow");
  s.plaza("the last squares", 1, 3, 2, 1, "yellow");
  return s.build({ id: "chess-castle", title: "The Checkerboard Chess Castle", theme: "castles", age: "c", done: "You built the Chess Castle! The rooks are guarding. The knights went for a snack." });
}

function doughnutFort(): Project {
  const s = new Site();
  s.block("the doughnut", 0, 0, 4, 4, 2, ["orange", "orange"], { roof: false });
  s.tower("the jam tower", 1, 1, 3, ["red", "purple"], { size: 2, cap: "lid", capColour: "red" });
  return s.build({ id: "doughnut-fort", title: "The Doughnut Fortress", theme: "castles", age: "d", done: "You built the Doughnut Fortress! It has a hole in the middle, filled with a jam tower." });
}

function gateCastle(): Project {
  const s = new Site();
  // each gate tower stands on a wide 2 × 2 base for its two lowest rings, then narrows (a ziggurat), and the bridge ties the two
  s.tower("the left gate base", 0, -1, 2, ["blue", "purple"], { size: 2, cap: "none" });
  s.tower("the right gate base", 3, -1, 2, ["blue", "purple"], { size: 2, cap: "none" });
  s.tower("the left gate tower", 1, 0, 3, ["blue", "purple"], { base: 2 });
  s.tower("the right gate tower", 3, 0, 3, ["blue", "purple"], { base: 2 });
  s.deck("the gate bridge", "x", 2, 3, 0, 5, "yellow");
  s.wall("the left wall", "x", -3, 0, 1, 2, "blue");
  s.wall("the right wall", "x", 5, 8, 1, 2, "blue");
  return why(s.build({ id: "drawbridge-gate", title: "The Drawbridge That Never Closes", theme: "castles", age: "d", done: "You built the Drawbridge That Never Closes! Anyone can come in. Even the pizza delivery." }), "The left gate base", "A wide base doesn't tip: each tower starts two squares across, then narrows as it rises.");
}

function toiletTowers(): Project {
  const s = new Site();
  for (const [x, n] of [[0, "the first loo tower"], [2, "the second loo tower"], [4, "the third loo tower"], [6, "the fourth loo tower"]] as const) s.tower(n, x, 0, 3 + (x / 2) % 2, ["blue", "green"], { cap: x % 4 ? "low" : "tall" });
  s.plaza("the bath mat", 0, 2, 7, 1, "purple");
  return s.build({ id: "loo-towers", title: "The Four Towers of Flushing", theme: "castles", age: "d", done: "You built the Four Towers of Flushing! Each tower has its own loo. Luxury." });
}

function mirrorPalace(): Project {
  const s = new Site();
  const pal = s.block("the mirror palace", 0, 0, 5, 3, 2, ["blue", "purple"], { door: true, roof: "yellow" });
  s.tower("the left mirror tower", 0, 1, 2, ["purple", "blue"], { base: pal.top });
  s.tower("the right mirror tower", 4, 1, 2, ["purple", "blue"], { base: pal.top });
  s.roofs("the middle", [[2, 1]], pal.top, "tall", "red");
  s.roofs("the left and right", [[1, 1], [3, 1]], pal.top, "low", "yellow");
  return s.build({ id: "mirror-palace", title: "The Mirror Palace (Symmetry Inspector Approved)", theme: "castles", age: "d", done: "You built the Mirror Palace! The left half and the right half are perfect twins. The inspector smiled." });
}

function tinyToenail(): Project {
  const s = new Site();
  const t = s.block("the temple", 0, 0, 3, 3, 1, ["yellow"], { roof: "orange" });
  const t2 = s.block("the inner temple", 0, 0, 2, 2, 1, ["orange"], { base: t.top, roof: "red" });
  s.roofs("the shrine of the tiny toenail", [[0, 0]], t2.top, "tall", "purple");
  s.roofs("the guard pyramids", [[2, 0], [2, 1], [2, 2], [0, 2], [1, 2]], t.top, "low", "green");
  return s.build({ id: "tiny-toenail-temple", title: "The Temple of the Tiny Toenail", theme: "castles", age: "c", done: "You built the Temple of the Tiny Toenail! Inside, on a cushion: one very small toenail. Ew." });
}

export const MORE_CASTLES: Project[] = [
  sockPalace(),
  fortKnock(),
  burpFortress(),
  pizzaPrincess(),
  wizardAcademy(),
  knightSchool(),
  moatCastle(),
  snoreKeep(),
  jokeTower(),
  grumpySummer(),
  hiccupHall(),
  wobblebottom(),
  ateItself(),
  dragonLair(),
  chessCastle(),
  doughnutFort(),
  gateCastle(),
  toiletTowers(),
  mirrorPalace(),
  tinyToenail(),
];
