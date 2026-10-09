/* The track kit (2.7): Monster trucks builds for 1:64 trucks (7–8 cm long, about 5 cm wide). One small square is one
   lane, a big square two. Ramps are 30°: a square rises half a square, a big square a whole one, so a run rises one
   square every two square-lengths and sits on a support tower (a ring of walls) at every whole height (R11).

   Directions are as the child sees the table: N away (−z), S towards them (+z), E right (+x), W left (−x). A ramp's
   `at` is the left end of its bottom edge, looking uphill; its lanes go to the right. */
import type { Colour } from "../engine/catalog";
import type { Builder } from "./helpers";

export type Dir = "N" | "E" | "S" | "W";
export interface At {
  x: number;
  y: number;
  z: number;
}

const Q = Math.PI / 2;
const SLOPE = Math.PI / 6;
const RY: Record<Dir, number> = { N: 0, E: -Q, S: Math.PI, W: Q };
/** uphill, as (dx, dz) */
export const UP: Record<Dir, [number, number]> = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
/** to the right looking uphill: a ramp's lanes */
export const RIGHT: Record<Dir, [number, number]> = { N: [1, 0], E: [0, 1], S: [-1, 0], W: [0, -1] };
export const OPPOSITE: Record<Dir, Dir> = { N: "S", S: "N", E: "W", W: "E" };

const r6 = (v: number) => Math.round(v * 1e6) / 1e6;
const move = (p: At, d: [number, number], k: number, dy = 0): At => ({ x: p.x + d[0] * k, y: p.y + dy, z: p.z + d[1] * k });

/** The w × d rectangle (in x and z) that starts at p and runs `along` for `len` and `across` for `wide`. */
function rect(p: At, along: [number, number], len: number, across: [number, number], wide: number) {
  const xs = [p.x, p.x + along[0] * len + across[0] * wide];
  const zs = [p.z, p.z + along[1] * len + across[1] * wide];
  // sizes are whole squares; round away the √3 dust so Builder.room's loops count right
  const r6 = (v: number) => Math.round(v * 1e6) / 1e6;
  return { x0: r6(Math.min(...xs)), z0: r6(Math.min(...zs)), w: Math.round(Math.abs(xs[1] - xs[0])), d: Math.round(Math.abs(zs[1] - zs[0])) };
}

/** A tower of `h` rings of walls on the w × d cell at (x0, z0), colour by ring, with an optional lid of flat squares on
    top (each lid square rests on two walls when the tower is one or two squares across). One step a ring; one for
    the lid. */
export function tower(b: Builder, colours: Colour[], x0: number, z0: number, w: number, d: number, h: number, lid: Colour | null, say?: (ring: number) => string, dir: Dir = "N") {
  for (let r = 0; r < h; r++) {
    b.room(colours[r % colours.length], x0, z0, w, d, r);
    b.step(say?.(r) ?? (r === 0 ? `Stand ${2 * (w + d)} squares in a ring, ${w} by ${d}. A support.` : `Another ring on top: ${r + 1} high.`));
  }
  if (lid) {
    // on a tower two or more each way, a lid square would perch on a corner of the ring (R12b): a wall across the top
    // ring under every join gives each one two opposite edges to rest on
    if (w >= 2 && d >= 2) {
      for (let x = x0 + 1; x < x0 + w; x++) for (let z = z0; z < z0 + d; z++) b.wallZ("square", colours[(h - 1) % colours.length], x, h - 1, z);
      b.step(`Inside the top ring, stand ${(w - 1) * d} more squares across the middle, so the deck has walls to rest on.`);
    }
    const deck = b.placed.length;
    for (let x = 0; x < w; x++) for (let z = 0; z < d; z++) b.lid("square", lid, x0 + x, h, z0 + z);
    b.step(`Lay ${w * d === 1 ? "a square" : `${w * d} squares`} flat on top. A deck to start from.`);
    b.deck(null, b.since(deck), dir);
  }
}

/** A big tower: rings of four big squares (two high each) on the 2 × 2 cell at (x0, z0), then a big square on top as a
    deck. Four rings make the 8-high drop tower. */
export function bigTower(b: Builder, colours: Colour[], x0: number, z0: number, rings: number, deck: Colour, dir: Dir = "N") {
  const Qr = Math.PI / 2;
  for (let r = 0; r < rings; r++) {
    const c = colours[r % colours.length];
    b.wallX("square-large", c, x0, 2 * r, z0 + 2);
    b.wallZ("square-large", c, x0 + 2, 2 * r, z0);
    b.wallX("square-large", c, x0, 2 * r, z0);
    b.wallZ("square-large", c, x0, 2 * r, z0);
    b.step(r === 0 ? "Stand four big squares in a ring. The bottom of the tower." : `Four more big squares on top: ${2 * (r + 1)} squares high.`);
  }
  const lid = b.add("square-large", deck, [x0, 2 * rings, z0 + 2], [-Qr, 0]);
  b.step(`A big square flat on top: the deck, ${2 * rings} squares up. The truck starts here.`);
  b.deck(null, [lid], dir);
}

export interface RampOpts {
  /** 1 lane of squares, or 2: squares side by side, or (big) one big square a row */
  lanes?: 1 | 2;
  big?: boolean;
  /** the colour of the support towers */
  support?: Colour;
  /** put a tower under the top edge too (a kicker or a ramp that ends in the air); false when it runs onto a deck */
  topTower?: boolean;
  say?: string;
  /** what the course calls it: a ramp (default) or a kicker */
  feature?: "ramp" | "kicker";
}

/** A 30° ramp from `at`, rising `rise` squares towards `dir`, with support towers (built first) under every whole
    height. Returns the left end of its top edge. */
export function ramp(b: Builder, colour: Colour, at: At, dir: Dir, rise: number, o: RampOpts = {}): At {
  const lanes = o.big ? 2 : (o.lanes ?? 1);
  const per = o.big ? 1 : 2;
  const run = Math.cos(SLOPE) * (o.big ? 2 : 1);
  const lift = Math.sin(SLOPE) * (o.big ? 2 : 1);
  const up = UP[dir];
  const right = RIGHT[dir];
  // towers under the joins at each whole height, on the uphill side so the ramp passes over them
  const heights: number[] = [];
  // a tower at every whole height: a big square rises a whole one, so every join of a big-square ramp sits on a tower;
  // squares join at half heights too, and those joins get a brace (below) (R11, 2.8)
  for (let h = 1; h <= rise; h++) if (h < rise || (h === rise && o.topTower)) heights.push(h);
  for (const h of heights) {
    const join = move(at, up, (h * per) * run, h);
    // a tower at most four times as high as it is wide (R12): towers over four high are two squares across
    const r = rect(join, up, 1, right, Math.max(lanes, Math.ceil((at.y + h) / 4)));
    const c = o.support ?? "blue";
    for (let k = 0; k < at.y + h; k++) {
      b.room(c, r.x0, r.z0, r.w, r.d, k);
      b.step(k === 0 ? `Stand a ring of ${2 * (r.w + r.d)} squares where the ramp will rest${at.y + h > 1 ? `: the first of ${at.y + h}` : ""}.` : `Another ring on top: ${k + 1} high.`);
    }
  }
  const tiles: number[] = [];
  for (let k = 0; k < rise * per; k++) {
    const base = move(at, up, k * run, k * lift);
    for (let l = 0; l < (o.big ? 1 : lanes); l++) {
      const p = move(base, right, l);
      tiles.push(b.add(o.big ? "square-large" : "square", colour, [p.x, p.y, p.z], [-(Q - SLOPE), RY[dir]], "ramp"));
    }
  }
  b.step(o.say ?? `Lean the ramp up from the bottom, ${o.big ? "big squares" : lanes === 2 ? "two squares side by side" : "one square"} at a time, each resting on the last, up to the top.`);
  // a join in mid-air is a hinge, and a truck folds it: under each one, a brace leans from the face of the tower the
  // pair runs up to, one square below its top, so brace, upper ramp tile and tower wall make a triangle that can't fold
  if (!o.big) {
    const down = RY[OPPOSITE[dir]];
    for (let k = 1; k < rise * per; k += 2) {
      const foot = move(at, up, (k + 1) * run, (k + 1) * lift - 1);
      for (let l = 0; l < lanes; l++) {
        const p = move(foot, right, l + 1);
        b.add("square", colour, [p.x, p.y, p.z], [-(Q - SLOPE), down], "brace");
      }
    }
    b.step(rise === 1 ? "Lock the ramp: lean one more square from the side of the tower up under the middle of the ramp. Now it holds a truck." : "Lock each pair: under every middle join, lean a square up from the side of the tower beyond. Now it holds a truck.");
  }
  const top = move(at, up, rise * per * run, rise);
  // the course: the slope from the middle of the bottom edge to the middle of the top edge
  const mid = (p: At): [number, number, number] => [r6(p.x + (right[0] * lanes) / 2), r6(p.y), r6(p.z + (right[1] * lanes) / 2)];
  b.feature({ kind: o.feature ?? "ramp", dir, tiles, surface: { kind: "slope", from: mid(at), to: mid(top), width: lanes } });
  return top;
}

/** A kicker: a ramp one square high from the table with a tower under its lip, so a truck flies off the end. */
export function kicker(b: Builder, colour: Colour, at: At, dir: Dir, o: RampOpts = {}): At {
  return ramp(b, colour, at, dir, 1, { ...o, topTower: true, feature: "kicker", say: o.say ?? "Lean the kicker up onto the ring. Launch!" });
}

/** A run of flat squares on the table: `len` long towards `dir`, `lanes` wide, from the left corner `at`; one step, or
    with `each` one step a square (for 3 to 5). */
export function lane(b: Builder, colours: Colour[], at: At, dir: Dir, len: number, lanes: 1 | 2, say: string, each = false) {
  const up = UP[dir];
  const right = RIGHT[dir];
  const from = b.placed.length;
  let i = 0;
  for (let k = 0; k < len; k++)
    for (let l = 0; l < lanes; l++) {
      const p = move(move(at, up, k), right, l);
      const r = rect(p, up, 1, right, 1);
      b.lid("square", colours[i++ % colours.length], r.x0, 0, r.z0);
      if (each) b.step(k === 0 && l === 0 ? say : "One more square, flat on the table, next to the last.");
    }
  if (!each) b.step(say);
  b.deck(null, b.since(from), dir, "lane");
}

/** A crush car: a cube of six squares, built to be flattened (role crash). Three steps: the floor, the sides, the roof.
    `solid` is a car to jump over, not to crush: the same cube, not built to fall, and not part of the course (the
    truck has to clear it). */
export function crushCar(b: Builder, colour: Colour, x: number, z: number, name = "a crush car", solid = false) {
  const mark = (from: number) => {
    if (!solid) for (let i = from; i < b.placed.length; i++) b.placed[i].role = "crash";
  };
  let first = b.placed.length;
  const car = first;
  b.lid("square", colour, x, 0, z);
  mark(first);
  b.step(`For ${name}, lay a ${colour} square flat.`);
  first = b.placed.length;
  b.room(colour, x, z, 1, 1, 0);
  mark(first);
  b.step(`Stand four ${colour} squares round it.`);
  first = b.placed.length;
  b.lid("square", colour, x, 1, z);
  mark(first);
  b.step(`A ${colour} square on top. ${solid ? "Ready to leap over!" : "Ready to crush!"}`);
  if (!solid) b.crash("car", car);
}

/** A fence of small squares one high round the w × d floor at (x0, z0), one step a side (front last); `skip` leaves out
    walls by their index round the ring, as Builder.room counts them (front, right, back, left). */
export function fence(b: Builder, colour: Colour, x0: number, z0: number, w: number, d: number, skip: number[] = []) {
  const sides = [w, d, w, d];
  const order = [1, 2, 3, 0];
  const starts = [0, w, w + d, 2 * w + d];
  const all = Array.from({ length: 2 * (w + d) }, (_, i) => i);
  for (const s of order) {
    const keep = Array.from({ length: sides[s] }, (_, i) => starts[s] + i).filter((i) => !skip.includes(i));
    // unbroken runs either side of a gate, eight at a time at most, so every wall stands beside another
    const runs: number[][] = [];
    for (const i of keep) {
      const last = runs.at(-1);
      if (last && last.at(-1) === i - 1) last.push(i);
      else runs.push([i]);
    }
    let first = true;
    for (const run of runs)
      for (let c = 0; c < run.length; c += 8) {
        const part = run.slice(c, c + 8);
        b.room(colour, x0, z0, w, d, 0, all.filter((i) => !part.includes(i)));
        b.step(first ? `Stand squares edge to edge along the ${["front", "right", "back", "left"][s]} of the arena.` : "Carry on along the same side, edge to edge.");
        first = false;
      }
  }
}

/** Dominoes: `n` squares standing on the table one square apart along `dir`, facing it (role crash). */
export function dominoes(b: Builder, colours: Colour[], at: At, dir: Dir, n: number, say: string) {
  const up = UP[dir];
  const from = b.placed.length;
  for (let i = 0; i < n; i++) {
    const p = move(at, up, 2 * i);
    b.add("square", colours[i % colours.length], [p.x, 0, p.z], [0, RY[dir]], "crash");
  }
  b.step(say);
  b.crash("dominoes", from, dir);
}

/** A wall to smash: `len` squares long towards the right of `dir`, `h` high, stacked straight up (role crash), with a
    square turned back at each end of every row. A flat stack of squares is a stack of hinges and folds before a truck
    reaches it; the returns make each row a corner, so it stands until it is hit (R10c, 2.8). */
export function crashWall(b: Builder, colours: Colour[], at: At, dir: Dir, len: number, h: number, say: (row: number) => string, register = true) {
  const right = RIGHT[dir];
  const up = UP[dir];
  const end = move(at, right, len);
  const from = b.placed.length;
  for (let r = 0; r < h; r++) {
    for (let i = 0; i < len; i++) {
      const p = move(at, right, i);
      b.add("square", colours[(r + i) % colours.length], [p.x, r, p.z], [0, RY[dir]], "crash");
    }
    for (const p of [at, end]) {
      const q = move(p, up, 1);
      b.placed[b.stand("square", colours[(r + len) % colours.length], [p.x, p.z], [q.x, q.z], r)].role = "crash";
    }
    b.step(say(r));
  }
  if (register) b.crash("wall", from, dir);
}

/** Arena walls: big squares standing round the w × d (in big squares) floor at (x0, z0), two squares high, braced at
    the corners; one step a side, the front last so a gate there still has a corner on each side. `gaps` leaves out
    walls by their index along a side, for gates. */
export function arenaWall(b: Builder, colour: Colour, x0: number, z0: number, w: number, d: number, gaps: { side: "front" | "right" | "back" | "left"; at: number }[] = []) {
  const skip = (side: string, i: number) => gaps.some((g) => g.side === side && g.at === i);
  const sides: [string, () => void][] = [
    ["right", () => { for (let i = 0; i < d; i++) if (!skip("right", i)) b.wallZ("square-large", colour, x0 + 2 * w, 0, z0 + 2 * i); }],
    ["back", () => { for (let i = 0; i < w; i++) if (!skip("back", i)) b.wallX("square-large", colour, x0 + 2 * i, 0, z0); }],
    ["left", () => { for (let i = 0; i < d; i++) if (!skip("left", i)) b.wallZ("square-large", colour, x0, 0, z0 + 2 * i); }],
    ["front", () => { for (let i = 0; i < w; i++) if (!skip("front", i)) b.wallX("square-large", colour, x0 + 2 * i, 0, z0 + 2 * d); }],
  ];
  // the right and the back go up together, joined at their corner: a long wall alone folds at its joins like a door (R14)
  sides[0][1]();
  sides[1][1]();
  b.step("Stand big squares along the right and the back of the arena, edge to edge, joined at the corner.");
  for (const [side, f] of sides.slice(2)) {
    f();
    b.step(`Stand big squares along the ${side} of the arena, edge to edge.`);
  }
}

/** A two-lane tunnel `len` big squares long towards `dir` from the left corner `at`: big walls each side and big
    squares across the top, in one step a section (the walls stand once the roof joins them). */
export function tunnel(b: Builder, wall: Colour, roof: Colour, at: At, dir: Dir, len: number, roofDir?: Dir) {
  const up = UP[dir];
  const right = RIGHT[dir];
  const from = b.placed.length;
  const tops: number[] = [];
  for (let k = 0; k < len; k++) {
    const p = move(at, up, 2 * k);
    const r = rect(p, up, 2, right, 2);
    if (dir === "N" || dir === "S") {
      b.wallZ("square-large", wall, r.x0, 0, r.z0);
      b.wallZ("square-large", wall, r.x0 + 2, 0, r.z0);
    } else {
      b.wallX("square-large", wall, r.x0, 0, r.z0);
      b.wallX("square-large", wall, r.x0, 0, r.z0 + 2);
    }
    tops.push(b.add("square-large", roof, [r.x0, 2, r.z0 + 2], [-Q, 0]));
    b.step(k === 0 ? "Stand two big squares facing each other, two squares apart, and lay a big square across their tops. A tunnel!" : "The same again, end to end. A longer tunnel.");
  }
  // the floor a truck drives on is the tunnel's footprint at ground height; with `roofDir`, the roof is a deck too
  const tiles = b.since(from);
  const floor = b.flatOver(tiles);
  b.feature({ kind: "tunnel", dir, tiles, surface: floor.kind === "flat" ? { ...floor, y: 0 } : floor });
  if (roofDir) b.deck(null, tops, roofDir);
}
