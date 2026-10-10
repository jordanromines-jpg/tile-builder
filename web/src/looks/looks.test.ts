import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { play, setSoundOn, soundOn, type SoundEvent } from "../sound/sound";
import { currentTier, faster, slower } from "../three/quality";
import { startLook } from "./apply";
import { decor } from "./vinyl/decor";
import { sounds } from "./vinyl/sounds";
import { stage } from "./vinyl/stage";

const EVENTS: SoundEvent[] = ["tap", "snap", "step", "turn", "finish", "nope"];

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.look;
});

describe("the one look (5.4.3)", () => {
  it("is set before the first paint, and a choice saved by the four looks of before is cleared", () => {
    localStorage.setItem("tile-builder.look", "toy");
    startLook();
    expect(document.documentElement.dataset.look).toBe("vinyl");
    expect(localStorage.getItem("tile-builder.look")).toBeNull();
  });

  it("has a stage with no effects at low tier, a voice for every sound and its decoration", () => {
    expect(stage.effects("low", false)).toEqual({});
    expect(stage.effects("low", true)).toEqual({});
    for (const e of EVENTS) expect(sounds[e].length, e).toBeGreaterThan(0);
    expect(decor.heading).toBeTypeOf("function");
  });

  it("hangs every style off [data-look], so it can never restyle a page by accident", () => {
    const css = readFileSync(join(__dirname, "vinyl", "look.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css).not.toMatch(/:root\s*\{/);
    const rules = css.match(/[^{}]+\{/g) ?? [];
    const bad = rules.map((r) => r.slice(0, -1).trim()).filter((sel) => sel && !sel.startsWith("@") && !sel.split(",").every((x) => x.includes('[data-look="vinyl"]')));
    expect(bad).toEqual([]);
  });
});

describe("quality tiers (3.0)", () => {
  it("step down when frames drop, never below low, and back up no higher than the device started", () => {
    const start = currentTier();
    for (let i = 0; i < 5; i++) slower();
    expect(currentTier()).toBe("low");
    for (let i = 0; i < 5; i++) faster();
    expect(currentTier()).toBe(start);
  });
});

describe("sound (3.0)", () => {
  it("plays nothing before the first touch, and follows the grown-ups' switch", () => {
    expect(() => play("snap")).not.toThrow();
    setSoundOn(false);
    expect(soundOn()).toBe(false);
    setSoundOn(true);
    expect(soundOn()).toBe(true);
  });
});
