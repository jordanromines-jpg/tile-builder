import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { inventoryFromSet, matchProject } from "../engine/match";
import { SETS } from "../engine/sets";
import { addSet } from "../store/inventory";
import catalog from "./catalog.json";
import { PROJECTS } from "./index";
import { serialize, skeleton, summarize } from "./serialize";

describe("the projects as data (2.4)", () => {
  it("the catalogue and every project's file match the plans as they are now (else run npm run projects)", () => {
    expect(catalog).toEqual(JSON.parse(JSON.stringify(PROJECTS.map(summarize))));
    for (const p of PROJECTS) {
      const saved = JSON.parse(readFileSync(join(process.cwd(), "public", "projects", `${p.id}.json`), "utf8"));
      expect(saved, p.id).toEqual(JSON.parse(JSON.stringify(serialize(p))));
    }
  });

  it("matches a family's tiles the same from the catalogue as from the whole project, for every project and set", () => {
    const invs = SETS.flatMap((s) => {
      const one = inventoryFromSet(s.pieces, s.brand, null);
      return [one, addSet(one, s)];
    });
    for (const p of PROJECTS) {
      const bones = skeleton(summarize(p));
      for (const inv of invs) {
        const a = matchProject(p, inv);
        const b = matchProject(bones, inv);
        const order = (m: typeof a.missing) => [...m].sort((x, y) => x.shape.localeCompare(y.shape));
        expect([b.state, order(b.missing), b.swaps.map((s) => [s.from, s.to, s.tiles.length]), b.note], p.id).toEqual([a.state, order(a.missing), a.swaps.map((s) => [s.from, s.to, s.tiles.length]), a.note]);
      }
    }
  });
});
