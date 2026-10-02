import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureSpeech, lastLine, pickVoice, say } from "./say";

const voices = [
  { lang: "fr-FR", name: "Amélie" },
  { lang: "en-GB", name: "Daniel" },
  { lang: "en-US", name: "Samantha" },
] as SpeechSynthesisVoice[];

let calls: string[];

beforeEach(() => {
  calls = [];
  class U {
    text: string;
    lang = "";
    rate = 1;
    voice: SpeechSynthesisVoice | null = null;
    constructor(t: string) {
      this.text = t;
    }
  }
  vi.stubGlobal("SpeechSynthesisUtterance", U);
  vi.stubGlobal("speechSynthesis", {
    cancel: () => calls.push("cancel"),
    speak: (u: U) => calls.push(`speak:${u.text}:${u.voice?.name}:${u.rate}`),
    getVoices: () => voices,
  });
  configureSpeech({ enabled: true, lang: "en-US" });
});

afterEach(() => vi.unstubAllGlobals());

describe("say", () => {
  it("cancels what is being said, then speaks with the matching voice at 0.9", () => {
    say("Put a red square next to the blue one.");
    expect(calls).toEqual(["cancel", "speak:Put a red square next to the blue one.:Samantha:0.9"]);
    expect(lastLine()).toBe("Put a red square next to the blue one.");
  });

  it("falls back to a voice of the same language", () => {
    expect(pickVoice(voices, "en-AU")?.name).toBe("Daniel");
    expect(pickVoice(voices, "de-DE")).toBeNull();
  });

  it("keeps quiet when the voice is off, unless a child asked to hear it again", () => {
    configureSpeech({ enabled: false });
    say("quiet");
    expect(calls).toEqual([]);
    say("again", { force: true });
    expect(calls).toEqual(["cancel", "speak:again:Samantha:0.9"]);
  });
});
