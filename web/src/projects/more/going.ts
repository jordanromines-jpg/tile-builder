/* 2.2: things that go, and space, 50 to 175 tiles, written as plans for the layout kit (projects/kit.ts). */
import type { Project } from "../../engine/types";
import { Site } from "../kit";

/** Adds one short "why" sentence to the first step whose words start with `from` (ages 9+ only, so only called for those). */
function why(p: Project, from: string, text: string): Project {
  const step = p.steps.find((s) => s.say.startsWith(from));
  if (!step) throw new Error(`no step starts with "${from}"`);
  step.say += ` ${text}`;
  return p;
}

function busStation(): Project {
  const s = new Site();
  const st = s.block("the bus station", 0, 0, 6, 2, 2, ["green", "yellow"], { door: true, roof: "blue" });
  s.roofs("the waiting shelters", [[0, 0], [2, 0], [4, 0]], st.top, "low", "orange");
  s.plaza("the bus lane", 0, 3, 6, 2, "purple");
  return s.build({ id: "endless-bus-station", title: "The Bus Station of Endless Waiting", theme: "vehicles", age: "d", done: "You built the Bus Station of Endless Waiting! The bus is coming. Any minute now. Probably." });
}

function lateTrains(): Project {
  const s = new Site();
  const st = s.block("the station", 0, 0, 5, 2, 2, ["red", "orange"], { door: true, roof: "yellow" });
  s.tower("the clock tower", 2, 0, 3, ["blue", "purple"], { base: st.top, cap: "tall", capColour: "red" });
  s.plaza("platform one", 0, 3, 7, 1, "yellow");
  s.plaza("the track", 0, 5, 7, 1, "purple");
  return s.build({ id: "late-train-station", title: "The Train Station for Very Late Trains", theme: "vehicles", age: "d", done: "You built the Station for Very Late Trains! The 8:15 is arriving at... lunchtime." });
}

function squeakyGarage(): Project {
  const s = new Site();
  const g = s.block("the garage", 0, 0, 4, 3, 2, ["blue", "blue"], { door: true, roof: "red" });
  s.roofs("the air vents", [[0, 0], [3, 0]], g.top, "low", "yellow");
  s.plaza("the race track", 0, 4, 6, 1, "purple");
  s.tower("the trophy stand", 5, 1, 3, ["yellow", "orange"], { cap: "tall", capColour: "yellow" });
  return s.build({ id: "squeaky-garage", title: "The Racing Garage of Squeaky Brakes", theme: "vehicles", age: "d", done: "You built the Racing Garage! SQUEEEAK. Someone oil those brakes." });
}

function tractorBarn(): Project {
  const s = new Site();
  const b = s.block("the barn", 0, 0, 4, 3, 3, ["red", "red", "orange"], { door: true, roof: "yellow" });
  s.roofs("the hay bales", [[0, 0], [1, 1], [2, 2], [3, 0]], b.top, "low", "yellow");
  s.tower("the silo", 5, 0, 5, ["blue", "purple"], { cap: "low", capColour: "red" });
  return s.build({ id: "turbo-tractor-barn", title: "Turbo Tractor Barn", theme: "vehicles", age: "d", done: "You built the Turbo Tractor Barn! The tractor goes VROOM. The cows go MOO. Same speed." });
}

function paperPlanes(): Project {
  const s = new Site();
  s.plaza("the runway", 0, 3, 8, 2, "yellow");
  const t = s.block("the terminal", 0, 0, 4, 2, 2, ["blue", "purple"], { door: true, roof: "green" });
  s.tower("the control tower", 3, 0, 3, ["red", "orange"], { base: t.top, cap: "low", capColour: "blue" });
  s.tower("the folding tower", 6, 0, 3, ["green", "yellow"], { cap: "tall", capColour: "purple" });
  return s.build({ id: "paper-plane-airport", title: "The Airport for Paper Planes", theme: "vehicles", age: "d", done: "You built the Paper Plane Airport! Flight 1 takes off when someone throws it." });
}

function dirtyCarWash(): Project {
  const s = new Site();
  s.tower("the left brush", 0, 0, 5, ["blue", "green"], { cap: "lid", capColour: "blue" });
  s.tower("the right brush", 2, 0, 5, ["blue", "green"], { cap: "lid", capColour: "blue" });
  s.deck("the soap bridge", "x", 1, 2, 0, 5, "purple");
  s.plaza("the muddy puddle", 0, 2, 3, 3, "orange");
  return s.build({ id: "dirty-car-wash", title: "The Car Wash That Makes Cars Dirtier", theme: "vehicles", age: "c", done: "You built the car wash! Your car goes in clean and comes out muddy. Brilliant." });
}

function monsterArena(): Project {
  const s = new Site();
  s.block("the arena", 0, 0, 6, 4, 2, ["red", "orange"], { roof: false });
  s.tower("the ramp tower", 2, 1, 2, ["yellow"], { size: 2, cap: "lid", capColour: "red" });
  return s.build({ id: "monster-truck-arena", title: "Monster Truck Ramp Arena", theme: "vehicles", age: "d", done: "You built the Monster Truck Arena! The crowd goes wild. The trucks go higher." });
}

function drySubmarine(): Project {
  const s = new Site();
  s.plaza("the dock", 0, 3, 6, 2, "blue");
  const b = s.block("the submarine base", 0, 0, 5, 2, 2, ["yellow", "yellow"], { door: true, roof: "orange" });
  s.tower("the periscope", 4, 1, 3, ["red"], { base: b.top, cap: "none" });
  s.roofs("the hatches", [[0, 0], [2, 0]], b.top, "low", "green");
  return s.build({ id: "dry-submarine-base", title: "The Submarine Base (Mostly Dry)", theme: "vehicles", age: "d", done: "You built the Submarine Base! It's mostly dry. Don't open that hatch." });
}

function balloonTower(): Project {
  const s = new Site();
  const base = s.block("the launch pad", 0, 0, 3, 3, 1, ["green"], { roof: "yellow" });
  // the launch tower is two squares across for its lowest three layers, then narrows (a stepped tower)
  const wide = s.tower("the launch tower base", 0, 0, 3, ["red", "orange"], { base: base.top, size: 2, cap: "none" });
  const t = s.tower("the launch tower", 0, 0, 3, ["red", "orange"], { base: wide.top, cap: "lid", capColour: "red" });
  s.roofs("the balloon", [[0, 0]], t.top, "tall", "purple");
  s.roofs("the sandbags", [[2, 0], [2, 2], [0, 2]], base.top, "low", "orange");
  return why(s.build({ id: "balloon-launch-tower", title: "The Hot-Air Balloon Launch Tower", theme: "vehicles", age: "d", done: "You built the Balloon Launch Tower! Pop! Oh. Never mind." }), "The launch tower base", "A wide base doesn't tip: two squares across holds a tall tower steady.");
}

function beanRocket(): Project {
  const s = new Site();
  const pad = s.block("the launch pad", 0, 0, 4, 3, 1, ["purple"], { roof: "yellow" });
  // the rocket is two squares across for its lowest four layers, then narrows to a nose; a booster at each front corner joins it
  const wide = s.tower("the bean rocket base", 1, 0, 4, ["red", "orange"], { base: pad.top, size: 2, cap: "none" });
  s.tower("the bean rocket", 1, 0, 3, ["red", "orange"], { base: wide.top, cap: "tall", capColour: "green" });
  for (const [x, z, n] of [[0, 2, "a booster"], [3, 2, "another booster"]] as const) s.tower(n, x, z, 2, ["yellow"], { base: pad.top, cap: "low", capColour: "red" });
  return why(s.build({ id: "bean-rocket", title: "The Rocket Ship Fuelled by Beans", theme: "space", age: "d", done: "You built the Bean Rocket! It runs on beans. You can guess how. TOOT." }), "The bean rocket base", "A wide base doesn't tip: two squares across holds a tall rocket steady.");
}

function seasickFerry(): Project {
  const s = new Site();
  s.plaza("the harbour", 0, 3, 7, 2, "blue");
  const term = s.block("the ferry terminal", 0, 0, 4, 2, 2, ["orange", "red"], { door: true, roof: "yellow" });
  s.roofs("the terminal roof", [[0, 0], [3, 1]], term.top, "tall", "blue");
  s.tower("the harbour light", 6, 0, 4, ["red", "yellow"], { cap: "low", capColour: "red" });
  return s.build({ id: "seasick-ferry", title: "The Ferry Terminal for Seasick Sailors", theme: "vehicles", age: "d", done: "You built the Ferry Terminal! The sailors are green. The sea is wobbly. Bring a bucket." });
}

function snackMissionControl(): Project {
  const s = new Site();
  const mc = s.block("mission control", 0, 0, 5, 3, 2, ["blue", "purple"], { door: true, roof: "yellow" });
  s.tower("the radar", 0, 0, 2, ["green"], { base: mc.top, cap: "low", capColour: "blue" });
  s.tower("the snack silo", 4, 0, 3, ["orange", "red"], { base: mc.top, cap: "tall", capColour: "yellow" });
  s.roofs("the satellite dishes", [[2, 1], [2, 2]], mc.top, "low", "red");
  s.tower("the rocket", 7, 1, 3, ["red", "yellow"], { cap: "tall", capColour: "red" });
  return s.build({ id: "snack-mission-control", title: "Mission Control for Mission Impossible Snacks", theme: "space", age: "d", done: "You built Mission Control! Mission: get the last biscuit. Status: impossible." });
}

function alienBootSale(): Project {
  const s = new Site();
  for (const [x, c, n] of [[0, "green", "the first stall"], [3, "purple", "the second stall"], [6, "blue", "the third stall"]] as const) {
    const st = s.block(n, x, 0, 2, 2, 1, [c], { roof: "yellow" });
    s.roofs(n, [[x, 0], [x + 1, 1]], st.top, "low", "red");
  }
  s.plaza("the car park", 0, 3, 8, 2, "orange");
  return s.build({ id: "alien-boot-sale", title: "The Alien Car Boot Sale", theme: "space", age: "d", done: "You built the Alien Car Boot Sale! For sale: one used flying saucer, slightly dented." });
}

function marsMayhem(): Project {
  const s = new Site();
  const pods = [[0, "the sleeping pod"], [3, "the kitchen pod"], [6, "the loo pod"]] as const;
  for (const [x, n] of pods) {
    const p = s.block(n, x, 0, 2, 2, 2, ["orange", "red"], { roof: "yellow" });
    s.roofs(n, [[x, 0]], p.top, "tall", "blue");
    s.roofs(n, [[x + 1, 1]], p.top, "low", "green");
  }
  s.deck("the left tunnel", "x", 2, 3, 0, 2, "purple");
  s.deck("the right tunnel", "x", 5, 6, 1, 2, "purple");
  return s.build({ id: "mars-mayhem", title: "Mars Base Mild Mayhem", theme: "space", age: "d", done: "You built Mars Base Mild Mayhem! The loo pod is very far from the sleeping pod. Run!" });
}

function burgerStation(): Project {
  const s = new Site();
  const b1 = s.block("the bun", 0, 0, 4, 4, 1, ["orange"], { roof: "green" });
  const b2 = s.block("the burger", 0, 0, 4, 4, 1, ["red"], { base: b1.top, roof: "yellow" });
  s.roofs("the sesame seeds", [[0, 0], [3, 0], [0, 3], [3, 3], [1, 1], [2, 2]], b2.top, "low", "orange");
  s.tower("the drive-thru sign", 5, 0, 4, ["red", "yellow"], { cap: "tall", capColour: "red" });
  s.deck("the order tray", "x", 4, 5, 0, 2, "yellow");
  return why(s.build({ id: "space-burger-station", title: "The Galactic Space Burger Station", theme: "space", age: "d", done: "You built the Space Burger Station! Would you like fries with your asteroid?" }), "The order tray", "A tall thin sign tips, but a tray joins it to the wide burger, so it holds steady.");
}

function cometObservatory(): Project {
  const s = new Site();
  const o = s.block("the observatory", 0, 0, 3, 3, 2, ["purple", "blue"], { door: true, roof: "yellow" });
  const t = s.tower("the telescope", 0, 0, 3, ["blue", "purple"], { base: o.top, size: 2, cap: "lid", capColour: "red" });
  s.roofs("the lens", [[1, 1]], t.top, "tall", "yellow");
  s.roofs("the star charts", [[2, 0], [2, 2], [0, 2]], o.top, "low", "green");
  return s.build({ id: "comet-observatory", title: "The Comet Catcher Observatory", theme: "space", age: "d", done: "You built the Comet Catcher! Caught so far: zero comets, three moths." });
}

function pickleLaunch(): Project {
  const s = new Site();
  s.plaza("the launch pad", 0, 0, 4, 4, "green");
  s.tower("the pickle rocket", 1, 1, 6, ["green", "green"], { size: 2, cap: "lid", capColour: "yellow" });
  s.roofs("the pickle's nose", [[1, 1], [2, 2]], 6, "tall", "green");
  return s.build({ id: "planet-pickle", title: "Planet Pickle Launch Pad", theme: "space", age: "d", done: "You built the Pickle Launch Pad! Destination: Planet Pickle. Snacks: pickles." });
}

function hamsterHabitat(): Project {
  const s = new Site();
  s.tower("the hamster tube", 0, 0, 4, ["yellow", "orange"], { cap: "lid", capColour: "yellow" });
  s.tower("the other tube", 2, 0, 4, ["yellow", "orange"], { cap: "lid", capColour: "yellow" });
  s.deck("the hamster bridge", "x", 1, 2, 0, 4, "blue");
  const home = s.block("the space wheel room", 0, 2, 4, 2, 1, ["purple"], { roof: "blue" });
  s.roofs("the wheel", [[1, 2], [2, 3]], home.top, "low", "red");
  return s.build({ id: "space-hamster-habitat", title: "Space Hamster Habitat", theme: "space", age: "d", done: "You built the Space Hamster Habitat! The hamster runs on its wheel and powers the whole station." });
}

function lunarLaundromat(): Project {
  const s = new Site();
  const l = s.block("the laundromat", 0, 0, 5, 3, 2, ["blue", "blue"], { door: true, floors: "yellow", roof: "purple" });
  s.roofs("the washing machines", [[0, 0], [2, 0], [4, 0]], l.top, "low", "green");
  s.roofs("the drying flags", [[4, 2]], l.top, "tall", "red");
  return s.build({ id: "lunar-laundromat", title: "The Lunar Laundromat", theme: "space", age: "d", done: "You built the Lunar Laundromat! Socks float off in zero gravity. That's where they go." });
}

function ufoCarPark(): Project {
  const s = new Site();
  const c = s.block("the car park", 0, 0, 4, 4, 1, ["purple"], { roof: "blue" });
  const c2 = s.block("the upper deck", 0, 0, 4, 4, 1, ["purple"], { base: c.top, roof: "green" });
  s.roofs("parked UFOs", [[0, 0], [2, 1], [1, 3], [3, 2]], c2.top, "low", "yellow");
  s.roofs("the pay machine", [[3, 0]], c2.top, "tall", "red");
  return s.build({ id: "ufo-car-park", title: "The UFO Car Park", theme: "space", age: "d", done: "You built the UFO Car Park! Parking costs three moon rocks an hour." });
}

export const MORE_GOING: Project[] = [
  busStation(),
  lateTrains(),
  squeakyGarage(),
  tractorBarn(),
  paperPlanes(),
  dirtyCarWash(),
  monsterArena(),
  drySubmarine(),
  balloonTower(),
  beanRocket(),
  seasickFerry(),
  snackMissionControl(),
  alienBootSale(),
  marsMayhem(),
  burgerStation(),
  cometObservatory(),
  pickleLaunch(),
  hamsterHabitat(),
  lunarLaundromat(),
  ufoCarPark(),
];
