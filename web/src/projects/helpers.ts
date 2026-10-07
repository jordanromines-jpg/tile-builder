/* Authoring helpers (plan key 4i): a Builder collects tiles and steps so a project reads like building instructions.
   Units are square edges; y is up; the child looks from +z (the front). Walls stand on their base edge. */
import type { Colour, ShapeId } from "../engine/catalog";
import type { Age, Placed, Project, Step, SwapRule } from "../engine/types";
import type { Theme } from "../engine/themes";

const Q = Math.PI / 2;

export interface Meta {
  id: string;
  title: string;
  theme: Theme;
  age: Age;
  stars: 1 | 2 | 3;
  done: string;
  flat?: boolean;
  bigRing?: boolean;
  needs?: { brandExtras?: ShapeId[] };
  swaps?: SwapRule[];
}

export const TALL_TO_LOW: SwapRule = {
  from: "tri-isosceles-tall",
  to: "tri-equilateral",
  perPyramid: true,
  say: "Short on tall triangles? Four short triangles make a lower roof.",
};

export class Builder {
  placed: Placed[] = [];
  steps: Step[] = [];
  private open: number[] = [];

  add(shape: ShapeId, colour: Colour, pos: [number, number, number], rot: [number, number], role?: "roof" | "ramp" | "crash"): number {
    this.placed.push(role ? { shape, colour, pos, rot, role } : { shape, colour, pos, rot });
    this.open.push(this.placed.length - 1);
    return this.placed.length - 1;
  }

  /** A wall running along +x from (x, y, z). */
  wallX(shape: ShapeId, colour: Colour, x: number, y: number, z: number) {
    return this.add(shape, colour, [x, y, z], [0, 0]);
  }

  /** A wall running along +z from (x, y, z). */
  wallZ(shape: ShapeId, colour: Colour, x: number, y: number, z: number) {
    return this.add(shape, colour, [x, y, z], [0, -Q]);
  }

  /** A wall running along −x from (x, y, z): the back of a box seen from the front. */
  wallBack(shape: ShapeId, colour: Colour, x: number, y: number, z: number) {
    return this.add(shape, colour, [x, y, z], [0, Math.PI]);
  }

  /** Four squares round the cell (cx..cx+1, cz..cz+1): front, right, back, left. */
  ring(colour: Colour, cx: number, cz: number, y: number) {
    this.wallX("square", colour, cx, y, cz + 1);
    this.wallZ("square", colour, cx + 1, y, cz);
    this.wallX("square", colour, cx, y, cz);
    this.wallZ("square", colour, cx, y, cz);
  }

  /** A tile lying flat on the table, in picture coordinates: x to the right, y away from the child; turned by `turn`. */
  flat(shape: ShapeId, colour: Colour, x: number, y: number, turn = 0) {
    return this.add(shape, colour, [x, 0, -y], [-Q, turn]);
  }

  /** A flat tile in a picture on the table, laid by its base edge from a to b (picture coordinates: x right, y away
      from the child); the tile lies on the left of a → b. */
  on(shape: ShapeId, colour: Colour, a: [number, number], b: [number, number]) {
    return this.add(shape, colour, [a[0], 0, -a[1]], [-Q, Math.atan2(b[1] - a[1], b[0] - a[0])]);
  }

  /** A standing tile whose base runs from a to b on the floor plan (x, z) at height y. */
  stand(shape: ShapeId, colour: Colour, a: [number, number], b: [number, number], y = 0) {
    return this.add(shape, colour, [a[0], y, a[1]], [0, Math.atan2(-(b[1] - a[1]), b[0] - a[0])]);
  }

  /** The walls round a w × d room from (x0, z0) at height y: front left to right, right side, back, left side.
      `skip` leaves out walls by their index in that order (a doorway). */
  room(colour: Colour, x0: number, z0: number, w: number, d: number, y: number, skip: number[] = [], shape: ShapeId = "square") {
    const walls: (() => number)[] = [];
    for (let x = x0; x < x0 + w; x++) walls.push(() => this.wallX(shape, colour, x, y, z0 + d));
    for (let z = z0 + d - 1; z >= z0; z--) walls.push(() => this.wallZ(shape, colour, x0 + w, y, z));
    for (let x = x0 + w - 1; x >= x0; x--) walls.push(() => this.wallX(shape, colour, x, y, z0));
    for (let z = z0; z < z0 + d; z++) walls.push(() => this.wallZ(shape, colour, x0, y, z));
    return walls.filter((_, i) => !skip.includes(i)).map((f) => f());
  }

  /** Walls inside a w × d room at height y, on every second grid line, so every square of a floor or roof laid on
      top rests on two walls (R10). Returns how many squares it stood. */
  inside(colour: Colour, x0: number, z0: number, w: number, d: number, y: number) {
    let n = 0;
    if (d >= 2 && w >= 3) for (let x = x0 + 2; x < x0 + w; x += 2) for (let z = z0; z < z0 + d; z++, n++) this.wallZ("square", colour, x, y, z);
    if (w >= 2 && d >= 3) for (let z = z0 + 2; z < z0 + d; z += 2) for (let x = x0; x < x0 + w; x++, n++) this.wallX("square", colour, x, y, z);
    return n;
  }

  /** Flat lids over every cell of a w × d room at height y. */
  lids(colour: Colour, x0: number, z0: number, w: number, d: number, y: number) {
    for (let x = x0; x < x0 + w; x++) for (let z = z0; z < z0 + d; z++) this.lid("square", colour, x, y, z);
  }

  /** Close the tiles added since the last step into steps of `size`, each with the next line (the last repeats). */
  chunk(size: number, says: string[]) {
    const open = this.open;
    this.open = [];
    for (let i = 0, k = 0; i < open.length; i += size, k++) {
      this.open = open.slice(i, i + size);
      this.step(says[Math.min(k, says.length - 1)]);
    }
    return this;
  }

  /** Like `chunk`, but in steps of the given sizes, one after another. */
  chunkBy(sizes: number[], says: string[]) {
    const open = this.open;
    this.open = [];
    let i = 0;
    sizes.forEach((n, k) => {
      this.open = open.slice(i, i + n);
      i += n;
      this.step(says[Math.min(k, says.length - 1)]);
    });
    return this;
  }

  /** A flat lid over the cell (cx..cx+1, cz..cz+1) at height y. */
  lid(shape: ShapeId, colour: Colour, cx: number, y: number, cz: number) {
    return this.add(shape, colour, [cx, y, cz + 1], [-Q, 0]);
  }

  /** Four triangles leaning in over the cell (cx..cx+1, cz..cz+1) at height y, until their tips meet. */
  roof(colour: Colour, cx: number, cz: number, y: number, shape: ShapeId = "tri-isosceles-tall") {
    this.add(shape, colour, [cx, y, cz + 1], [0, 0], "roof");
    this.add(shape, colour, [cx + 1, y, cz + 1], [0, Q], "roof");
    this.add(shape, colour, [cx + 1, y, cz], [0, Math.PI], "roof");
    this.add(shape, colour, [cx, y, cz], [0, -Q], "roof");
  }

  lowRoof(colour: Colour, cx: number, cz: number, y: number) {
    this.roof(colour, cx, cz, y, "tri-equilateral");
  }

  /** Rings of walls stacked from height y0, one colour a layer: a tower (1 × 1) or a block of rooms. */
  tower(colours: Colour[], cx: number, cz: number, y0 = 0, w = 1, d = 1) {
    colours.forEach((c, i) => this.room(c, cx, cz, w, d, y0 + i));
    return this;
  }

  /** Standing tiles along the front (z0 + d) and back (z0) top edges of a w × d block at height y: battlements. */
  battlements(shape: ShapeId, colour: Colour, x0: number, z0: number, w: number, d: number, y: number) {
    for (let x = x0; x < x0 + w; x++) this.wallX(shape, colour, x, y, z0 + d);
    for (let x = x0; x < x0 + w; x++) this.wallX(shape, colour, x, y, z0);
    return this;
  }

  /** Close the tiles added since the last step into a step with its spoken line. */
  step(say: string) {
    if (!this.open.length) throw new Error(`step "${say}" has no tiles`);
    this.steps.push({ say, tiles: this.open });
    this.open = [];
    return this;
  }

  build(meta: Meta): Project {
    if (this.open.length) throw new Error(`${meta.id}: tiles added after the last step`);
    return { ...meta, placed: this.placed, steps: this.steps };
  }
}
