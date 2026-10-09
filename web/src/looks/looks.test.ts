import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { play, setSoundOn, soundOn, type SoundEvent } from "../sound/sound";
import { currentTier, faster, slower } from "../three/quality";
import { chooseLook, startLook } from "./apply";
import { applyLook, currentLook, LOOKS } from "./looks";
import { DECOR } from "./decorations";
import { STAGES } from "./stages";
import { VOICES } from "./voices";

const EVENTS: SoundEvent[] = ["tap", "snap", "step", "turn", "finish", "nope"];

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.look;
});

describe("looks (3.0)", () => {
  it("starts on the saved look, and choosing one shows it, keeps it and survives a reload", () => {
    startLook();
    expect(document.documentElement.dataset.look).toBe("classic");
    chooseLook("toy");
    expect(document.documentElement.dataset.look).toBe("toy");
    expect(currentLook()).toBe("toy");
    delete document.documentElement.dataset.look;
    applyLook();
    expect(document.documentElement.dataset.look).toBe("toy");
  });

  it("every look has a stage, a voice for every sound and its decorations", () => {
    for (const l of LOOKS) {
      expect(STAGES[l.id].effects("low", false), `${l.id} at low`).toEqual({});
      for (const e of EVENTS) expect(VOICES[l.id][e].length, `${l.id} ${e}`).toBeGreaterThan(0);
      expect(DECOR[l.id]).toBeTypeOf("object");
    }
  });

  it("every look's styles hang off [data-look], so the picker can preview it inside any page", () => {
    for (const l of LOOKS) {
      const css = readFileSync(join(__dirname, l.id, "look.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      // a rule on :root alone would restyle the whole page whichever look is showing
      expect(css, l.id).not.toMatch(/:root\s*\{/);
      const rules = css.match(/[^{}]+\{/g) ?? [];
      const bad = rules.map((r) => r.slice(0, -1).trim()).filter((sel) => sel && !sel.startsWith("@") && !sel.split(",").every((s) => s.includes(`[data-look="${l.id}"]`)));
      expect(bad, l.id).toEqual([]);
    }
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
