import { describe, expect, it } from "vitest";
import { setById } from "../engine/sets";
import { EMPTY_INVENTORY } from "./db";
import { applySet, effectiveLeg, setColourCount, setCount, toggleBrand } from "./inventory";

describe("changing the tiles", () => {
  it("a preset replaces the counts and brings its brand's tall triangle", () => {
    const inv = applySet(EMPTY_INVENTORY, setById("magna-100")!);
    expect(inv.counts.square?.any).toBe(50);
    expect(inv.brands).toEqual(["magna"]);
    expect(effectiveLeg(inv)).toBe(1.877);
  });

  it("a colour count never exceeds the shape's count", () => {
    let inv = setCount(EMPTY_INVENTORY, "square", 5);
    inv = setColourCount(inv, "square", "red", 3);
    inv = setColourCount(inv, "square", "blue", 9);
    expect(inv.counts.square?.byColour).toEqual({ red: 3, blue: 2 });
    inv = setCount(inv, "square", 4);
    expect(inv.counts.square?.byColour).toEqual({ red: 3, blue: 1 });
  });

  it("brands toggle; with no known brand the leg is PicassoTiles'", () => {
    const inv = toggleBrand(toggleBrand(EMPTY_INVENTORY, "generic"), "connetix");
    expect(inv.brands).toEqual(["generic", "connetix"]);
    expect(effectiveLeg(inv)).toBe(1.867);
  });
});

describe("two sets", () => {
  it("adds a second set's pieces to the counts and joins the brands", async () => {
    const { addSet, applySet } = await import("./inventory");
    const { setById } = await import("../engine/sets");
    const one = applySet({ brands: [], tallLeg: null, counts: {} }, setById("magna-100")!);
    const both = addSet(one, setById("picasso-100")!);
    expect(both.counts.square?.any).toBe(50 + 46);
    expect(Object.values(both.counts).reduce((n, c) => n + (c?.any ?? 0), 0)).toBe(200);
    expect(both.brands).toEqual(["magna", "picasso"]);
  });
});
