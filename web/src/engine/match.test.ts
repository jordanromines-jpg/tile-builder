import { describe, expect, it } from "vitest";
import { castle } from "../projects/castle";
import { Builder } from "../projects/helpers";
import { canBuildCount, inventoryFromSet, matchProject, needsOf } from "./match";
import { setById } from "./sets";

const inv = (id: string) => {
  const s = setById(id)!;
  return inventoryFromSet(s.pieces, s.brand, null);
};

describe("matching", () => {
  it("counts the castle's needs by shape", () => {
    expect(needsOf(castle)).toEqual({ square: 58, "tri-equilateral": 12, "tri-isosceles-tall": 20 });
  });

  it("the castle with a Magna-Tiles 100: low roofs, corner triangles, and still 3 squares short", () => {
    const m = matchProject(castle, inv("magna-100"));
    expect(m.state).toBe("need");
    expect(m.swaps.map((s) => [s.from, s.to, s.tiles.length])).toEqual([
      ["tri-isosceles-tall", "tri-equilateral", 8],
      ["square", "tri-right", 5],
    ]);
    expect(m.missing).toEqual([{ shape: "square", count: 3 }]);
  });

  it("the castle with two big sets is buildable as it is", () => {
    const a = inv("magna-100");
    const b = inv("picasso-100");
    const both = { ...a, brands: [...a.brands, ...b.brands], counts: Object.fromEntries(Object.keys({ ...a.counts, ...b.counts }).map((k) => [k, { any: (a.counts[k as "square"]?.any ?? 0) + (b.counts[k as "square"]?.any ?? 0) }])) };
    const m = matchProject(castle, both);
    expect(m.state).toBe("can");
    expect(m.note).toBe("best-with-one-brand");
  });

  it("a project with windows is 'need' against Magna-Tiles, with the windows in missing", () => {
    const b = new Builder();
    b.ring("red", 0, 0, 0);
    b.step("ring");
    b.wallX("window", "blue", 0, 1, 1);
    b.step("window");
    const p = b.build({ id: "w", title: "W", theme: "homes", age: "b", stars: 1, done: "Done!", needs: { brandExtras: ["window"] } });
    const m = matchProject(p, inv("magna-100"));
    expect(m.state).toBe("need");
    expect(m.missing).toEqual([{ shape: "window", count: 1 }]);
    expect(matchProject(p, inv("connetix-60")).state).toBe("can");
  });

  it("counts what a family can build", () => {
    expect(canBuildCount([castle], inv("magna-32"))).toBe(0);
  });
});
