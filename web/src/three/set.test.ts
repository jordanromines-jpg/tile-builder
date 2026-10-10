import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type * as THREE from "three";
import { describe, expect, it } from "vitest";
import { drawFullLook } from "../gpu";
import { stage } from "../looks/vinyl/stage";
import { STAGES } from "../looks/stages";
import { currentTier, faster, slower } from "./quality";
import { roomFile } from "./Set";
import { baseOpacity, makeTileMaterials } from "./TileMesh";

const SET = join(__dirname, "../../public/set");

describe("the set (5.4.1)", () => {
  const set = stage.set!;

  it("has every file it names, credited", () => {
    const credits = readFileSync(join(SET, "CREDITS.md"), "utf8");
    for (const f of [`${set.room}_1k.hdr`, `${set.room}_512.hdr`, set.wood.color, set.wood.normal, set.wood.rough, "basis/basis_transcoder.js", "basis/basis_transcoder.wasm"]) {
      expect(existsSync(join(SET, f)), f).toBe(true);
      expect(credits, f).toContain(f.split("/").pop()!.replace(/_(1k|512)\.hdr$/, ""));
    }
  });

  it("stays within its 3 MB budget (the room and the table; the transcoder is code, like the app's own)", () => {
    const bytes = readdirSync(SET)
      .filter((f) => /\.(hdr|ktx2)$/.test(f))
      .reduce((n, f) => n + statSync(join(SET, f)).size, 0);
    expect(bytes).toBeLessThanOrEqual(3_000_000);
  });

  it("lights the room at 1K at high tier and 512 below", () => {
    expect(roomFile(set, "high")).toMatch(/_1k\.hdr$/);
    expect(roomFile(set, "mid")).toMatch(/_512\.hdr$/);
    expect(roomFile(set, "low")).toMatch(/_512\.hdr$/);
  });

  it("is every look's stage until the others go (5.4.3), with no effects at low", () => {
    for (const s of Object.values(STAGES)) {
      expect(s.set).toBe(set);
      expect(s.effects("low", false)).toEqual({});
    }
  });
});

describe("the tile finish by tier (5.4.1)", () => {
  // jsdom has no WebGL, which would give the light tile without a GPU; the full tile is what is under test
  drawFullLook();
  const glass = (m: { glass: THREE.Material }) => m.glass as THREE.MeshPhysicalMaterial;

  it("retunes live tiles when the tier changes, and a disposed tile is let go", () => {
    const start = currentTier();
    for (let i = 0; i < 3; i++) slower();
    const m = makeTileMaterials("blue");
    expect(glass(m).transmission).toBe(0);
    const low = baseOpacity(m.glass);
    faster();
    expect(currentTier()).toBe(start === "low" ? "low" : "mid");
    if (start !== "low") {
      expect(baseOpacity(m.glass)).not.toBe(low);
      expect(glass(m).opacity).toBe(baseOpacity(m.glass));
    }
    for (let i = 0; i < 3; i++) faster();
    if (currentTier() === "high") expect(glass(m).transmission).toBe(1);
    m.glass.dispose();
    for (let i = 0; i < 3; i++) slower();
    // let go: no longer retuned
    if (start === "high") expect(glass(m).transmission).toBe(1);
  });
});
