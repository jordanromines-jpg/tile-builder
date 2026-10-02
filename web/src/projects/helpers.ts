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

  add(shape: ShapeId, colour: Colour, pos: [number, number, number], rot: [number, number], role?: "roof"): number {
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
