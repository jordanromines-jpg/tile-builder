/* 2.2: homes and buildings, 50 to 175 tiles, written as plans for the layout kit (projects/kit.ts). */
import type { Project } from "../../engine/types";
import { Site } from "../kit";

function messyHouse(): Project {
  const s = new Site();
  const h = s.block("the messy house", 0, 0, 4, 3, 2, ["orange", "yellow"], { door: true, floors: "green", roof: "red" });
  s.roofs("the roof", [[0, 0], [3, 0]], h.top, "tall", "red");
  s.plaza("the pile of toys", 0, 4, 2, 2, "purple");
  return s.build({ id: "messy-house", title: "The House Where Nobody Tidies", theme: "homes", age: "d", done: "You built the House Where Nobody Tidies! Mind the Lego on the stairs." });
}

function discoBungalow(): Project {
  const s = new Site();
  const b = s.block("the bungalow", 0, 0, 5, 3, 1, ["purple"], { door: true, roof: "yellow" });
  s.roofs("the disco balls", [[0, 0], [2, 1], [4, 2]], b.top, "low", "blue");
  s.roofs("the party hats", [[4, 0], [0, 2]], b.top, "tall", "red");
  s.plaza("the dance floor", 0, 4, 5, 2, "green");
  return s.build({ id: "disco-bungalow", title: "Grandma's Secret Disco Bungalow", theme: "homes", age: "d", done: "You built Grandma's Disco Bungalow! Every night at nine, she boogies." });
}

function treelessTreehouse(): Project {
  const s = new Site();
  const trunk = s.tower("the not-a-tree", 0, 0, 5, ["orange", "orange"], { size: 2, cap: "lid", capColour: "green" });
  const den = s.block("the den", 0, 0, 2, 2, 1, ["green"], { base: trunk.top, door: false, roof: "yellow" });
  s.roofs("the den roof", [[0, 0]], den.top, "tall", "red");
  s.roofs("the den roof", [[1, 1]], den.top, "low", "purple");
  return s.build({ id: "treeless-treehouse", title: "The Treehouse Without a Tree", theme: "homes", age: "d", done: "You built the Treehouse Without a Tree! Nobody knows where the tree went." });
}

function hippoHotel(): Project {
  const s = new Site();
  const h = s.block("the hippo hotel", 0, 0, 5, 3, 3, ["blue", "purple", "blue"], { door: true, roof: "yellow" });
  s.roofs("the roof garden", [[0, 0], [2, 1], [4, 2]], h.top, "tall", "green");
  s.roofs("the sun loungers", [[4, 0], [0, 2], [1, 1], [3, 1]], h.top, "low", "orange");
  return s.build({ id: "hippo-hotel", title: "The Hotel for Hiccupping Hippos", theme: "homes", age: "d", done: "You built the Hippo Hotel! Every room has a bath. Every bath has a hippo. HIC." });
}

function noisyFlats(): Project {
  const s = new Site();
  const a = s.block("the noisy flats", 0, 0, 3, 2, 3, ["red", "orange", "yellow"], { door: true, roof: "red" });
  const b = s.block("the even noisier flats", 4, 0, 3, 2, 4, ["green", "blue", "purple", "green"], { roof: "blue" });
  s.roofs("the drum kit", [[0, 0]], a.top, "tall", "purple");
  s.roofs("the trumpet", [[6, 1]], b.top, "tall", "yellow");
  return s.build({ id: "noisy-flats", title: "The Noisy Neighbours Apartments", theme: "homes", age: "d", done: "You built the Noisy Neighbours! Someone is learning the trumpet. Badly. At midnight." });
}

function bubbleMansion(): Project {
  const s = new Site();
  const m = s.block("the bubble mansion", 0, 0, 4, 4, 2, ["blue", "purple"], { door: true, roof: "yellow" });
  s.roofs("the bubbles", [[0, 0], [1, 1], [2, 2], [3, 3], [3, 0], [0, 3]], m.top, "low", "blue");
  s.tower("the bath tower", 1, 2, 2, ["purple"], { base: m.top, cap: "tall", capColour: "green" });
  return s.build({ id: "bubble-mansion", title: "The Bubble Bath Mansion", theme: "homes", age: "d", done: "You built the Bubble Bath Mansion! Every room has bubbles up to the ceiling. Blub." });
}

function unfinishedExtension(): Project {
  const s = new Site();
  const house = s.block("Uncle Barry's house", 0, 0, 3, 3, 2, ["yellow", "orange"], { door: true, roof: "red" });
  s.block("the extension", 4, 0, 2, 3, 1, ["green"], { roof: false });
  s.roofs("the roof", [[0, 0], [2, 2]], house.top, "tall", "red");
  s.plaza("the pile of bricks", 4, 4, 2, 1, "orange");
  return s.build({ id: "unfinished-extension", title: "Uncle Barry's Unfinished Extension", theme: "homes", age: "c", done: "You built Uncle Barry's Unfinished Extension! He says he'll finish it next weekend. He said that last year." });
}

function overdueLibrary(): Project {
  const s = new Site();
  const lib = s.block("the library", 0, 0, 5, 3, 2, ["blue", "blue"], { door: true, floors: "yellow", roof: "purple" });
  s.roofs("the reading domes", [[1, 1], [3, 1]], lib.top, "low", "green");
  s.standing("the bookends", "x", 0, 5, 3, lib.top, "tri-equilateral", "red", "bookends");
  return s.build({ id: "overdue-library", title: "The Library of Overdue Books", theme: "homes", age: "d", done: "You built the Library of Overdue Books! Some of these books are 300 years late. Shh." });
}

function decisionHall(): Project {
  const s = new Site();
  const hall = s.block("the very small town hall", 0, 0, 3, 2, 2, ["yellow", "orange"], { door: true, roof: "blue" });
  s.tower("the very big clock tower", 1, 0, 5, ["blue", "purple"], { base: hall.top, cap: "tall", capColour: "red" });
  s.plaza("the square", 0, 3, 3, 3, "green");
  s.roofs("the very small dome", [[0, 0]], hall.top, "low", "green");
  return s.build({ id: "big-decisions-hall", title: "The Very Small Town Hall of Very Big Decisions", theme: "homes", age: "d", done: "You built the Town Hall! Today's big decision: should Tuesday be pancake day? Yes." });
}

function pajamaPalace(): Project {
  const s = new Site();
  const p = s.block("the pajama palace", 0, 0, 4, 3, 2, ["purple", "blue"], { door: true, roof: "yellow" });
  s.tower("the pillow tower", 0, 0, 2, ["blue"], { base: p.top, cap: "low", capColour: "purple" });
  s.tower("the slipper tower", 3, 2, 2, ["blue"], { base: p.top, cap: "low", capColour: "purple" });
  s.roofs("the nightcaps", [[1, 1], [2, 1]], p.top, "tall", "red");
  return s.build({ id: "pajama-palace", title: "Pajama Party Palace", theme: "homes", age: "d", done: "You built the Pajama Party Palace! Lights out at... never." });
}

function remoteMuseum(): Project {
  const s = new Site();
  const m = s.block("the museum", 0, 0, 6, 2, 2, ["green", "green"], { door: true, roof: "yellow" });
  s.roofs("the displays", [[0, 0], [2, 1], [4, 0], [3, 1]], m.top, "low", "red");
  s.roofs("the remote control", [[5, 1]], m.top, "tall", "blue");
  return s.build({ id: "remote-museum", title: "The Lost Remote Control Museum", theme: "homes", age: "d", done: "You built the Lost Remote Control Museum! Every remote ever lost is here. Check under the sofa first." });
}

function sockScraper(): Project {
  const s = new Site();
  const a = s.block("the sock drawer", 0, 0, 3, 3, 2, ["red", "orange"], { door: true, roof: "yellow" });
  const b = s.block("the second drawer", 0, 0, 3, 3, 2, ["green", "blue"], { base: a.top, roof: "purple" });
  const c = s.block("the top drawer", 0, 0, 2, 2, 2, ["purple", "red"], { base: b.top, roof: "yellow" });
  s.roofs("the knobs", [[2, 2], [2, 0]], b.top, "low", "orange");
  s.roofs("the very top", [[0, 0]], c.top, "tall", "green");
  return s.build({ id: "sock-drawer-scraper", title: "The Sock Drawer Skyscraper", theme: "homes", age: "d", done: "You built the Sock Drawer Skyscraper! Three drawers, one hundred socks, zero pairs." });
}

function snorkelShack(): Project {
  const s = new Site();
  s.plaza("the sea", 0, 3, 5, 2, "blue");
  const shack = s.block("the snorkel shack", 0, 0, 3, 2, 2, ["yellow", "orange"], { door: true, roof: "green" });
  s.roofs("the shack roof", [[0, 0], [2, 1]], shack.top, "low", "red");
  s.tower("the lifeguard tower", 4, 0, 3, ["red", "yellow"], { cap: "low", capColour: "red" });
  return s.build({ id: "snorkel-shack", title: "The Snorkel Shack", theme: "homes", age: "c", done: "You built the Snorkel Shack! Flippers on, mask on, splash!" });
}

function cottageRow(): Project {
  const s = new Site();
  const cols = [["red", "orange"], ["blue", "purple"], ["green", "yellow"]] as const;
  cols.forEach(([a, b], i) => {
    const c = s.block(`cottage number ${i + 1}`, i * 3, 0, 2, 2, 2, [a, b], { door: true, roof: b });
    s.roofs(`cottage number ${i + 1}`, [[i * 3, 0]], c.top, i === 1 ? "low" : "tall", a);
  });
  s.plaza("the street", 0, 3, 8, 1, "yellow");
  return s.build({ id: "nosy-street", title: "Nosy Neighbours Street", theme: "homes", age: "d", done: "You built Nosy Neighbours Street! Everyone is peeking through the curtains. Wave!" });
}

function bigHouse(): Project {
  const s = new Site();
  const h = s.block("the enormous house", 0, 0, 5, 4, 2, ["orange", "red"], { door: true, roof: "yellow" });
  const up = s.block("the attic", 1, 1, 3, 2, 1, ["purple"], { base: h.top, roof: "blue" });
  s.roofs("the attic roof", [[1, 1], [3, 2]], up.top, "tall", "red");
  s.roofs("the attic roof", [[2, 1], [2, 2]], up.top, "low", "green");
  s.roofs("the corner roofs", [[0, 0], [4, 0], [0, 3], [4, 3]], h.top, "tall", "blue");
  s.standing("the front gutter", "x", 1, 4, 4, h.top, "tri-equilateral", "yellow", "gutter spouts");
  return s.build({ id: "enormous-house", title: "The Enormous House of Mild Chaos", theme: "homes", age: "d", done: "You built the Enormous House! Over a hundred tiles, and someone still can't find their shoes." });
}

function igloo(): Project {
  const s = new Site();
  const i = s.block("the igloo", 0, 0, 3, 3, 1, ["blue"], { door: true, roof: "blue" });
  s.roofs("the snowy top", [[0, 0], [1, 1], [2, 2], [2, 0], [0, 2]], i.top, "low", "blue");
  s.plaza("the ice", 0, 4, 3, 2, "blue");
  s.tower("the snowman", 4, 1, 2, ["yellow"], { cap: "low", capColour: "orange" });
  return s.build({ id: "chilly-igloo", title: "The Igloo with Central Heating", theme: "homes", age: "c", done: "You built the Igloo with Central Heating! It's lovely and warm. Oh no, it's melting." });
}

function bakery(): Project {
  const s = new Site();
  const b = s.block("the bakery", 0, 0, 4, 2, 2, ["orange", "yellow"], { door: true, roof: "red" });
  s.tower("the chimney", 3, 0, 2, ["red"], { base: b.top, cap: "none" });
  s.roofs("the cream puffs", [[0, 0], [1, 1]], b.top, "low", "yellow");
  s.plaza("the cake shelf", 0, 3, 4, 1, "purple");
  return s.build({ id: "upside-down-bakery", title: "The Upside-Down Cake Bakery", theme: "homes", age: "c", done: "You built the Upside-Down Cake Bakery! Every cake is upside down. Nobody knows why. They taste great." });
}

function lighthouseHotel(): Project {
  const s = new Site();
  const hotel = s.block("the hotel", 0, 0, 4, 3, 3, ["yellow", "orange", "yellow"], { door: true, roof: "red" });
  s.tower("the lighthouse", 0, 0, 4, ["red", "yellow"], { base: hotel.top, size: 2, cap: "lid", capColour: "orange" });
  s.roofs("the lamp", [[0, 0]], hotel.top + 4, "tall", "red");
  s.roofs("the beach umbrellas", [[3, 0], [2, 2], [3, 2]], hotel.top, "low", "blue");
  return s.build({ id: "lighthouse-hotel", title: "The Lighthouse Hotel for Lost Ducks", theme: "homes", age: "d", done: "You built the Lighthouse Hotel! Every lost duck finds its way here. Quack quack, check-in please." });
}

function cardboardCastle(): Project {
  const s = new Site();
  const box = s.block("the big box", 0, 0, 4, 4, 2, ["orange", "orange"], { door: true, roof: false });
  s.standing("the flaps", "x", 0, 4, 4, box.top, "tri-isosceles-tall", "yellow", "flaps");
  s.standing("the back flaps", "x", 0, 4, 0, box.top, "tri-equilateral", "orange", "flaps");
  s.tower("the cardboard tube", 5, 0, 4, ["yellow", "orange"], { cap: "low", capColour: "red" });
  return s.build({ id: "box-house", title: "The Cardboard Box House", theme: "homes", age: "c", done: "You built the Cardboard Box House! Better than the toy that came in it." });
}

function schoolOfNoHomework(): Project {
  const s = new Site();
  const sch = s.block("the school", 0, 0, 6, 3, 2, ["red", "yellow"], { door: true, roof: "orange" });
  s.tower("the bell tower", 2, 1, 3, ["blue", "purple"], { base: sch.top, cap: "tall", capColour: "red" });
  s.roofs("the classroom roofs", [[0, 0], [5, 2], [5, 0], [0, 2]], sch.top, "low", "green");
  s.plaza("the playground", 0, 4, 6, 2, "green");
  return s.build({ id: "no-homework-school", title: "The School of No Homework", theme: "homes", age: "d", done: "You built the School of No Homework! Lessons are games. Break time is three hours." });
}

export const MORE_HOMES: Project[] = [
  messyHouse(),
  discoBungalow(),
  treelessTreehouse(),
  hippoHotel(),
  noisyFlats(),
  bubbleMansion(),
  unfinishedExtension(),
  overdueLibrary(),
  decisionHall(),
  pajamaPalace(),
  remoteMuseum(),
  sockScraper(),
  snorkelShack(),
  cottageRow(),
  bigHouse(),
  igloo(),
  bakery(),
  lighthouseHotel(),
  cardboardCastle(),
  schoolOfNoHomework(),
];
