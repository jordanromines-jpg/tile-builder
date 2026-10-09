/* The layout kit (2.2): a project written as a plan of parts (blocks of storeys, towers, curtain walls, bridge decks,
   plazas, pyramid roofs, battlements and flags) instead of tile by tile. The plan is still written by hand (D3); the kit
   places the tiles and writes the steps, building the whole site layer by layer, as the checker's rules ask (R5, R6):
   every ring on the table starts with at least four walls, floors go down after the walls they rest on, a pyramid is
   one step. Units are square edges; x runs right, z towards the child; y is up. */
import { AGE_RULES } from "../engine/ages";
import type { Colour } from "../engine/catalog";
import type { Age, Project } from "../engine/types";
import type { Theme } from "../engine/themes";
import { Builder, TALL_TO_LOW } from "./helpers";

type Say = (k: number, of: number) => string;

interface Group {
  level: number;
  seq: number;
  add: (b: Builder) => number;
  say: Say;
  pyramid?: boolean;
  /** tiles that must go on in the same step, in order: steps are packed from these, never splitting one */
  atoms?: number[];
}

export interface Box {
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  /** the height of the top: where a floor lies and the next part stands */
  top: number;
}

const ORD = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The walls round a w × d room in the Builder's order (front, right side, back, left side), as adders. */
function ringWalls(b: Builder, colour: Colour, x0: number, z0: number, w: number, d: number, y: number) {
  const walls: (() => number)[] = [];
  for (let x = x0; x < x0 + w; x++) walls.push(() => b.wallX("square", colour, x, y, z0 + d));
  for (let z = z0 + d - 1; z >= z0; z--) walls.push(() => b.wallZ("square", colour, x0 + w, y, z));
  for (let x = x0 + w - 1; x >= x0; x--) walls.push(() => b.wallX("square", colour, x, y, z0));
  for (let z = z0; z < z0 + d; z++) walls.push(() => b.wallZ("square", colour, x0, y, z));
  return walls;
}

export class Site {
  private groups: Group[] = [];
  private seq = 0;

  protected push(level: number, add: (b: Builder) => number, say: Say, pyramid = false, atoms?: number[]) {
    this.groups.push({ level, seq: this.seq++, add, say, pyramid, atoms });
  }

  /** A ring of walls at height y; `door` leaves the front-left square out (on the table) or starts the ring beside it. */
  private ring(name: string, colour: Colour, x: number, z: number, w: number, d: number, y: number, door: boolean, base = 0) {
    const n = 2 * (w + d) - (door && y === base ? 1 : 0);
    this.push(
      2 * y,
      (b) => {
        let walls = ringWalls(b, colour, x, z, w, d, y);
        if (door && y === base) walls = walls.slice(1);
        // above a doorway, start with the wall beside it, so the square over the gap has both neighbours
        else if (door) walls = [walls[walls.length - 1], ...walls.slice(0, -1)];
        walls.forEach((f) => f());
        return n;
      },
      (k, of) => {
        const who = cap(name);
        if (y === base) {
          const room = w === 1 && d === 1 ? "a ring of four squares" : `a ring of ${n} squares round a ${w}-by-${d} space`;
          if (of === 1) return `${who}: ${room}${door ? ", with a gap at the front left for the door" : ""}.`;
          if (k === 0) return `${who}: start ${room}${door ? ", with a gap at the front left for the door" : ""}.`;
          return k === of - 1 ? `${who}: close the ring.` : `${who}: keep going round.`;
        }
        if (k === 0) return `${who}, ${ORD[y - base] ?? "next"} layer: stack squares on the top edges${door && y === base + 1 ? ", starting beside the door. The square over the door rests on its two neighbours" : ""}.`;
        return k === of - 1 ? `${who}: close this layer.` : `${who}: keep stacking round.`;
      },
    );
  }

  /** Walls inside a w × d room at height y, on every second grid line, so that every square of the floor or roof above
      rests on two walls (R10): flat tiles side by side fold at their join, so a wide roof needs walls under it. */
  private inner(name: string, colour: Colour, x: number, z: number, w: number, d: number, y: number) {
    const xs: number[] = [];
    const zs: number[] = [];
    if (d >= 2 && w >= 3) for (let i = x + 2; i < x + w; i += 2) xs.push(i);
    if (w >= 2 && d >= 3) for (let j = z + 2; j < z + d; j += 2) zs.push(j);
    const n = (xs.length * d) + (zs.length * w);
    if (!n) return;
    this.push(
      2 * y,
      (b) => {
        for (const i of xs) for (let j = z; j < z + d; j++) b.wallZ("square", colour, i, y, j);
        for (const j of zs) for (let i = x; i < x + w; i++) b.wallX("square", colour, i, y, j);
        return n;
      },
      (k, of) => (k === 0 ? `${cap(name)}: stand squares across the inside, from wall to wall. They hold the roof up.` : `${cap(name)}: ${k === of - 1 ? "finish the inside wall" : "keep going across"}.`),
    );
  }

  /** A wall inside, beside the doorway, for the square over the door to rest on. `deep` runs it from the front wall
      right back to the back wall, tied at both ends: a short one, hinged to the front wall alone, swings like a door
      (R14) once the layers above are held. */
  private porch(name: string, colour: Colour, x: number, z: number, deep = false, d = 1) {
    const n = deep ? d : 1;
    this.push(
      0,
      (b) => {
        for (let k = 0; k < n; k++) b.wallZ("square", colour, x, 0, z - (n - 1) + k);
        return n;
      },
      () =>
        n > 1
          ? `${cap(name)}: stand squares inside, beside the doorway, from the front wall to the back wall. The roof over the door rests on them.`
          : `${cap(name)}: stand a square inside, beside the doorway, from the front wall in. The roof over the door rests on it.`,
    );
  }

  private floor(name: string, colour: Colour, x: number, z: number, w: number, d: number, y: number, what = "a floor") {
    this.push(
      2 * y - 1,
      (b) => {
        b.lids(colour, x, z, w, d, y);
        return w * d;
      },
      (k, of) => {
        if (k === 0) return `${cap(name)}: lay ${what}, squares flat on top, from the back left. Each one rests on two edges.`;
        return k === of - 1 ? `${cap(name)}: finish ${what}.` : `${cap(name)}: keep laying squares flat.`;
      },
    );
  }

  /** A building: `storeys` layers of walls round w × d, colours by layer, a flat roof on top (unless `roof` is false). */
  block(name: string, x: number, z: number, w: number, d: number, storeys: number, colours: Colour[], o: { door?: boolean; roof?: Colour | false; floors?: Colour; base?: number; deepPorch?: boolean } = {}): Box {
    const base = o.base ?? 0;
    const lidded = o.roof !== false || !!o.floors;
    for (let i = 0; i < storeys; i++) {
      this.ring(name, colours[i % colours.length], x, z, w, d, base + i, !!o.door && base === 0, base);
      if (lidded) this.inner(name, colours[i % colours.length], x, z, w, d, base + i);
      // the square over the doorway needs a second wall under it: a short wall beside the door makes a porch
      if (lidded && o.door && base === 0 && i === 0 && w > 1 && d > 1) this.porch(name, colours[0], x + 1, z + d - 1, o.deepPorch, d);
      if (o.floors && i < storeys - 1) this.floor(name, o.floors, x, z, w, d, base + i + 1, `the ${ORD[i + 1]} floor`);
    }
    if (o.roof !== false) this.floor(name, o.roof ?? colours[0], x, z, w, d, base + storeys, "the roof");
    return { name, x, z, w, d, top: base + storeys };
  }

  /** A tower: rings stacked from `base` (on the table, or on a block's flat roof), topped with a pyramid or a lid. */
  tower(name: string, x: number, z: number, storeys: number, colours: Colour[], o: { base?: number; size?: 1 | 2; cap?: "tall" | "low" | "lid" | "none"; capColour?: Colour } = {}): Box {
    const base = o.base ?? 0;
    const s = o.size ?? 1;
    for (let i = 0; i < storeys; i++) this.ring(name, colours[i % colours.length], x, z, s, s, base + i, false, base);
    const top = base + storeys;
    const c = o.capColour ?? "red";
    const kind = o.cap ?? "tall";
    if (s === 2 || kind === "lid") this.floor(name, c, x, z, s, s, top, "the top");
    if (kind === "tall" || kind === "low") this.pyramid(name, x, z, s === 2 ? top : top, kind, c);
    return { name, x, z, w: s, d: s, top };
  }

  /** Four triangles leaning together over the cell (x, z) at height y. */
  pyramid(name: string, x: number, z: number, y: number, kind: "tall" | "low", colour: Colour) {
    this.push(
      2 * y,
      (b) => {
        b.roof(colour, x, z, y, kind === "tall" ? "tri-isosceles-tall" : "tri-equilateral");
        return 4;
      },
      () => `${cap(name)}: lean four ${kind === "tall" ? "tall" : "short"} triangles together on top until their tips meet.`,
      true,
    );
  }

  /** Pyramids over cells of a flat roof at height y, alternating tall and short when `kind` is "mix". */
  roofs(name: string, cells: [number, number][], y: number, kind: "tall" | "low" | "mix", colour: Colour) {
    cells.forEach(([x, z], i) => this.pyramid(name, x, z, y, kind === "mix" ? (i % 2 ? "low" : "tall") : kind, colour));
  }

  /** A straight wall of squares on the table along x (from..to at line z) or z, `height` layers, joined to towers at both ends. */
  wall(name: string, axis: "x" | "z", from: number, to: number, line: number, height: number, colour: Colour, backwards = false) {
    for (let y = 0; y < height; y++)
      this.push(
        2 * y,
        (b) => {
          // `backwards` starts at the far end, so a wall that meets another at its far end starts in the corner (R14)
          for (let k = 0; k < to - from; k++) {
            const t = backwards ? to - 1 - k : from + k;
            axis === "x" ? b.wallX("square", colour, t, y, line) : b.wallZ("square", colour, line, y, t);
          }
          return to - from;
        },
        (k, of) => (y === 0 ? (k === 0 ? `${cap(name)}: stand squares in a line, joined to the towers at each end.` : `${cap(name)}: keep going along.`) : k === 0 ? `${cap(name)}: stack another layer on top.` : `${cap(name)}: keep stacking${of > 1 && k === of - 1 ? " to the end" : ""}.`),
      );
  }

  /** A bridge deck: squares flat across cells between two towers of the same height (y is their top). */
  deck(name: string, axis: "x" | "z", from: number, to: number, line: number, y: number, colour: Colour) {
    this.push(
      2 * y - 1,
      (b) => {
        for (let t = from; t < to; t++) axis === "x" ? b.lid("square", colour, t, y, line) : b.lid("square", colour, line, y, t);
        return to - from;
      },
      () => `${cap(name)}: lay squares flat across the gap, tower to tower. Each one meets a tower or its neighbour. Grown-up, hold the towers.`,
    );
  }

  /** Squares flat across the tops of towers (or walls) at height y: a platform on legs. Returns it as a box to build on. */
  platform(name: string, x: number, z: number, w: number, d: number, y: number, colour: Colour): Box {
    this.floor(name, colour, x, z, w, d, y, "the platform");
    return { name, x, z, w, d, top: y };
  }

  /** A pyramid standing straight on the table (or on a flat roof at height y). */
  tent(name: string, x: number, z: number, kind: "tall" | "low", colour: Colour, y = 0) {
    this.pyramid(name, x, z, y, kind, colour);
  }

  /** Squares flat on the table: a yard, a pond, a runway. */
  plaza(name: string, x: number, z: number, w: number, d: number, colour: Colour) {
    this.push(
      -1,
      (b) => {
        for (let i = x; i < x + w; i++) for (let j = z; j < z + d; j++) b.lid("square", colour, i, 0, j);
        return w * d;
      },
      (k, of) => (k === 0 ? `${cap(name)}: lay squares flat on the table, side by side.` : `${cap(name)}: ${k === of - 1 ? "finish it" : "keep laying squares"}.`),
    );
  }

  build(meta: { id: string; title: string; theme: Theme; age: Age; done: string }): Project {
    const b = new Builder();
    const max = AGE_RULES[meta.age].maxTilesPerStep;
    const order = [...this.groups].sort((p, q) => p.level - q.level || p.seq - q.seq);
    for (const g of order) {
      const n = g.add(b);
      if (g.pyramid) b.step(g.say(0, 1));
      else if (g.atoms) {
        const sizes: number[] = [];
        for (const a of g.atoms) {
          if (sizes.length && sizes[sizes.length - 1] + a <= max) sizes[sizes.length - 1] += a;
          else sizes.push(a);
        }
        b.chunkBy(sizes, sizes.map((_, k) => g.say(k, sizes.length)));
      } else {
        const of = Math.ceil(n / max);
        b.chunk(max, Array.from({ length: of }, (_, k) => g.say(k, of)));
      }
    }
    const tiles = b.placed.length;
    const rule = AGE_RULES[meta.age];
    const third = (rule.maxTiles - rule.minTiles) / 3;
    const stars = (tiles < rule.minTiles + third ? 1 : tiles < rule.minTiles + 2 * third ? 2 : 3) as 1 | 2 | 3;
    const tall = b.placed.some((p) => p.shape === "tri-isosceles-tall");
    return b.build({ ...meta, stars, ...(tall ? { swaps: [TALL_TO_LOW] } : {}) });
  }
}
