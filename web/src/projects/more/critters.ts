/* 2.2: animals and gardens, 50 to 175 tiles, written as plans for the layout kit (projects/kit.ts). The big ones use
   nearly every square and triangle in two 100-piece sets. */
import type { Colour } from "../../engine/catalog";
import type { Project } from "../../engine/types";
import { Site } from "../kit";

/** A wide base with a terrace: tall pyramids on its corners and short ones round the edge, leaving the middle free. */
function terrace(s: Site, w: number, d: number, y: number, tall: Colour, low: Colour, skip: (x: number, z: number) => boolean) {
  for (let x = 0; x < w; x++)
    for (let z = 0; z < d; z++) {
      const edge = x === 0 || z === 0 || x === w - 1 || z === d - 1;
      if (!edge || skip(x, z)) continue;
      const corner = (x === 0 || x === w - 1) && (z === 0 || z === d - 1);
      s.roofs(corner ? "a corner of the terrace" : "the edge of the terrace", [[x, z]], y, corner ? "tall" : "low", corner ? tall : low);
    }
}

function giraffeElevator(): Project {
  const s = new Site();
  const base = s.block("the giraffe house", 0, 0, 4, 4, 2, ["yellow", "orange"], { door: true, roof: "yellow" });
  const neck = s.tower("the giraffe elevator", 1, 1, 4, ["yellow", "orange"], { base: base.top, size: 2, cap: "lid", capColour: "orange" });
  s.roofs("the giraffe's head", [[1, 1]], neck.top, "tall", "orange");
  terrace(s, 4, 4, base.top, "red", "green", () => false);
  return s.build({ id: "giraffe-elevator", title: "The Giraffe Elevator", theme: "animals", age: "d", done: "You built the Giraffe Elevator! It only goes up. Giraffes don't like going down." });
}

function penguinParlour(): Project {
  const s = new Site();
  const p = s.block("the ice cream parlour", 0, 0, 4, 3, 2, ["blue", "purple"], { door: true, roof: "yellow" });
  s.roofs("the ice cream scoops", [[0, 0], [1, 1], [2, 2], [3, 0]], p.top, "low", "red");
  s.plaza("the ice rink", 0, 4, 5, 2, "blue");
  return s.build({ id: "penguin-parlour", title: "The Penguin Ice Cream Parlour", theme: "animals", age: "d", done: "You built the Penguin Ice Cream Parlour! Every flavour is fish. Penguins love it." });
}

function goatGym(): Project {
  const s = new Site();
  const steps = [[0, 1], [1, 2], [2, 3], [3, 4]] as const;
  for (const [x, h] of steps) s.tower(`climbing block ${x + 1}`, x * 2, 0, h, ["green", "yellow"], { cap: "lid", capColour: "orange" });
  s.plaza("the gym mat", 0, 2, 8, 2, "purple");
  return s.build({ id: "goat-gym", title: "The Goat Gym", theme: "animals", age: "c", done: "You built the Goat Gym! Goats love climbing. And eating the mats." });
}

function hedgehogHotel(): Project {
  const s = new Site();
  const h = s.block("Hotel Hedgehog", 0, 0, 5, 2, 2, ["orange", "red"], { door: true, roof: "yellow" });
  s.roofs("the prickles", [[0, 0], [1, 1], [2, 0], [3, 1], [4, 0], [2, 1]], h.top, "low", "orange");
  return s.build({ id: "hedgehog-hotel", title: "Hotel Hedgehog (No Hugs)", theme: "animals", age: "d", done: "You built Hotel Hedgehog! No hugs, please. Ouch." });
}

function owlSchool(): Project {
  const s = new Site();
  const sch = s.block("the owl night school", 0, 0, 4, 3, 2, ["purple", "blue"], { door: true, roof: "purple" });
  s.tower("the left ear", 0, 0, 2, ["blue"], { base: sch.top, cap: "tall", capColour: "orange" });
  s.tower("the right ear", 3, 0, 2, ["blue"], { base: sch.top, cap: "tall", capColour: "orange" });
  s.roofs("the beak", [[1, 2]], sch.top, "low", "yellow");
  return s.build({ id: "owl-night-school", title: "The Owl Night School", theme: "animals", age: "d", done: "You built the Owl Night School! Lessons start at midnight. Whoo's late?" });
}

function chickenDisco(): Project {
  const s = new Site();
  const d = s.block("the chicken disco", 0, 0, 4, 4, 1, ["red"], { door: true, roof: "yellow" });
  s.roofs("the disco lights", [[0, 0], [3, 3]], d.top, "tall", "purple");
  s.roofs("the egg lamps", [[3, 0], [0, 3], [1, 1], [2, 2]], d.top, "low", "yellow");
  s.plaza("the dance floor", 5, 0, 2, 4, "purple");
  return s.build({ id: "chicken-disco", title: "The Chicken Disco", theme: "animals", age: "d", done: "You built the Chicken Disco! Everyone is doing the chicken dance. Obviously." });
}

function cowSpa(): Project {
  const s = new Site();
  s.plaza("the mud bath", 0, 3, 4, 3, "orange");
  const spa = s.block("the cow spa", 0, 0, 4, 2, 2, ["green", "blue"], { door: true, roof: "yellow" });
  s.roofs("the towels", [[0, 0], [3, 0]], spa.top, "tall", "purple");
  s.roofs("the cucumber slices", [[1, 1], [2, 1], [1, 0], [2, 0]], spa.top, "low", "green");
  return s.build({ id: "cow-spa", title: "The Cow Spa and Mud Bath", theme: "animals", age: "d", done: "You built the Cow Spa! Moo-ssage at three, mud bath at four." });
}

function crocDentist(): Project {
  const s = new Site();
  s.block("the dentist", 0, 0, 5, 2, 2, ["green", "green"], { door: true, roof: "yellow" });
  s.plaza("the waiting room", 0, 3, 5, 1, "blue");
  return s.build({ id: "croc-dentist", title: "The Crocodile Dentist", theme: "animals", age: "c", done: "You built the Crocodile Dentist! Open wide. Wider. Wider! ...Maybe not that wide." });
}

function slothRacing(): Project {
  const s = new Site();
  s.block("the sloth race track", 0, 0, 6, 4, 2, ["green", "yellow"], { roof: false });
  s.tower("the grandstand", 7, 0, 3, ["yellow", "orange"], { size: 2, cap: "lid", capColour: "blue" });
  s.roofs("the grandstand roof", [[7, 0]], 3, "low", "red");
  return s.build({ id: "sloth-racing", title: "The Sloth Speed Racing Club", theme: "animals", age: "d", done: "You built the Sloth Racing Club! The race started last Tuesday. Nobody has finished yet." });
}

function elephantBungee(): Project {
  const s = new Site();
  const t = s.tower("the bungee tower", 0, 0, 7, ["blue", "purple"], { size: 2, cap: "lid", capColour: "yellow" });
  s.roofs("the jumping platform", [[0, 0]], t.top, "tall", "red");
  s.plaza("the very soft landing", 3, 0, 3, 3, "green");
  return s.build({ id: "elephant-bungee", title: "Elephant Bungee Tower", theme: "animals", age: "d", done: "You built Elephant Bungee Tower! BOING. The elephant loved it. The rope did not." });
}

function frogOpera(): Project {
  const s = new Site();
  const o = s.block("the frog opera house", 0, 0, 5, 3, 2, ["green", "green"], { door: true, roof: "yellow" });
  s.roofs("the opera domes", [[1, 1], [3, 1]], o.top, "tall", "green");
  s.roofs("the lily pads", [[0, 0], [4, 0], [0, 2], [4, 2]], o.top, "low", "green");
  s.plaza("the pond", 0, 4, 5, 2, "blue");
  return s.build({ id: "frog-opera", title: "The Frog Opera House", theme: "animals", age: "d", done: "You built the Frog Opera House! Tonight's song: RIBBIT, in four parts." });
}

function pigPalace(): Project {
  const s = new Site();
  s.plaza("the big muddy puddle", 0, 4, 6, 1, "orange");
  const p = s.block("the pig palace", 0, 0, 6, 3, 2, ["red", "orange"], { door: true, roof: "yellow" });
  s.tower("the snout tower", 2, 1, 2, ["red", "orange"], { base: p.top, size: 2, cap: "lid", capColour: "red" });
  s.roofs("the curly tails", [[0, 0], [5, 0], [0, 2], [5, 2]], p.top, "tall", "red");
  s.roofs("the ears", [[2, 1], [3, 2]], p.top + 2, "low", "orange");
  return s.build({ id: "pig-palace", title: "The Pig Palace of Puddles", theme: "animals", age: "d", done: "You built the Pig Palace of Puddles! The pigs are delighted. Oink." });
}

function rabbitHotel(): Project {
  const s = new Site();
  const h = s.block("the rabbit hole hotel", 0, 0, 3, 3, 3, ["orange", "yellow", "orange"], { door: true, roof: "green" });
  s.roofs("the ears", [[0, 0], [2, 0]], h.top, "tall", "orange");
  s.roofs("the carrots", [[1, 1], [0, 2], [2, 2]], h.top, "low", "orange");
  return s.build({ id: "rabbit-hole-hotel", title: "The Rabbit Hole Hotel", theme: "animals", age: "d", done: "You built the Rabbit Hole Hotel! Check-out time: whenever the carrots run out." });
}

function nutBank(): Project {
  const s = new Site();
  const b = s.block("the squirrel nut bank", 0, 0, 4, 3, 2, ["orange", "orange"], { door: true, roof: "yellow" });
  s.tower("the vault", 1, 1, 2, ["purple"], { base: b.top, size: 2, cap: "lid", capColour: "yellow" });
  s.roofs("the acorn domes", [[0, 0], [3, 0]], b.top, "low", "orange");
  return s.build({ id: "squirrel-nut-bank", title: "Squirrel Nut Bank", theme: "animals", age: "d", done: "You built the Squirrel Nut Bank! Opening hours: autumn only." });
}

function gnomeParliament(): Project {
  const s = new Site();
  const p = s.block("the gnome parliament", 0, 0, 5, 3, 2, ["green", "green"], { door: true, roof: "yellow" });
  s.tower("the big gnome tower", 2, 1, 3, ["red", "blue"], { base: p.top, cap: "tall", capColour: "red" });
  terrace(s, 5, 3, p.top, "red", "blue", (x, z) => x === 2 && z === 1);
  s.plaza("the lawn", 0, 4, 5, 2, "green");
  return s.build({ id: "gnome-parliament", title: "The Gnome Parliament", theme: "gardens", age: "d", done: "You built the Gnome Parliament! Today's debate: should fishing rods be allowed indoors?" });
}

function snailStadium(): Project {
  const s = new Site();
  s.block("the snail stadium", 0, 0, 6, 5, 3, ["green", "yellow", "green"], { roof: false });
  return s.build({ id: "snail-stadium", title: "The Snail Racing Stadium", theme: "gardens", age: "d", done: "You built the Snail Stadium! The race will finish sometime next month." });
}

function wormScraper(): Project {
  const s = new Site();
  const a = s.block("the worm farm", 0, 0, 3, 3, 3, ["orange", "yellow", "orange"], { door: true, floors: "green", roof: "green" });
  s.tower("the worm lookout", 1, 1, 3, ["purple", "orange"], { base: a.top, cap: "low", capColour: "green" });
  s.roofs("the compost heaps", [[0, 0], [2, 0], [0, 2], [2, 2]], a.top, "low", "orange");
  return s.build({ id: "worm-farm-scraper", title: "The Worm Farm Skyscraper", theme: "gardens", age: "d", done: "You built the Worm Farm Skyscraper! Wiggly residents on every floor." });
}

function cabbageGreenhouse(): Project {
  const s = new Site();
  const g = s.block("the greenhouse", 0, 0, 6, 3, 1, ["green"], { door: true, roof: "blue" });
  s.roofs("the glass roof", [[0, 0], [1, 1], [2, 2], [3, 0], [4, 1], [5, 2]], g.top, "low", "blue");
  s.plaza("the grumpy cabbage patch", 0, 4, 6, 2, "green");
  return s.build({ id: "grumpy-cabbages", title: "The Greenhouse of Grumpy Cabbages", theme: "gardens", age: "d", done: "You built the Greenhouse of Grumpy Cabbages! They're grumpy because nobody eats them." });
}

function pumpkinPalace(): Project {
  const s = new Site();
  const p = s.block("the pumpkin palace", 0, 0, 4, 4, 2, ["orange", "orange"], { door: true, roof: "orange" });
  s.tower("the stalk", 1, 1, 2, ["green"], { base: p.top, size: 2, cap: "lid", capColour: "green" });
  terrace(s, 4, 4, p.top, "orange", "yellow", () => false);
  return s.build({ id: "pumpkin-palace", title: "The Pumpkin Palace", theme: "gardens", age: "d", done: "You built the Pumpkin Palace! At midnight it turns into a pumpkin. Wait, it already is one." });
}

function beeHotel(): Project {
  const s = new Site();
  for (const [x, z, n] of [[0, 0, "the honey tower"], [2, 0, "the buzz tower"], [4, 0, "the pollen tower"], [1, 2, "the queen's tower"], [3, 2, "the sting tower"]] as const) {
    s.tower(n, x, z, x % 2 ? 4 : 3, ["yellow", "orange"], { cap: "low", capColour: "yellow" });
  }
  s.plaza("the flower bed", 0, 4, 5, 1, "purple");
  return s.build({ id: "bee-hotel", title: "The Bee Hotel and Buzz Bar", theme: "gardens", age: "d", done: "You built the Bee Hotel! The buzz bar serves honey. Only honey. Bzzz." });
}

export const MORE_CRITTERS: Project[] = [
  giraffeElevator(),
  penguinParlour(),
  goatGym(),
  hedgehogHotel(),
  owlSchool(),
  chickenDisco(),
  cowSpa(),
  crocDentist(),
  slothRacing(),
  elephantBungee(),
  frogOpera(),
  pigPalace(),
  rabbitHotel(),
  nutBank(),
  gnomeParliament(),
  snailStadium(),
  wormScraper(),
  cabbageGreenhouse(),
  pumpkinPalace(),
  beeHotel(),
];
