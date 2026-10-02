/* Read-aloud (plan key 2n). Web Speech only: nothing leaves the iPad. Off by default since 2.0: say() is silent unless a
   grown-up turned the voice on in Settings, or `force` is passed (a child tapped Hear again). With the voice on, a
   step's line and the end's line are also said when they appear (iOS may hold those back until the first tap). Each
   call cancels what is being said, then speaks. */
import { useSyncExternalStore } from "react";

export interface SayOptions {
  lang?: string;
  rate?: number;
}

let enabled = false;
let lang = "en-US";
let last = "";
const listeners = new Set<() => void>();

function synth(): SpeechSynthesis | null {
  return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
}

/** The first voice on the device for the language; null leaves it to the system. */
export function pickVoice(voices: SpeechSynthesisVoice[], want: string): SpeechSynthesisVoice | null {
  const exact = voices.find((v) => v.lang === want);
  if (exact) return exact;
  const base = want.split("-")[0];
  return voices.find((v) => v.lang.split(/[-_]/)[0] === base) ?? null;
}

export function configureSpeech(opts: { enabled?: boolean; lang?: string }): void {
  if (opts.enabled !== undefined) enabled = opts.enabled;
  if (opts.lang) lang = opts.lang;
  listeners.forEach((l) => l());
}

export function speechEnabled(): boolean {
  return enabled;
}

/** Say a line. `force` speaks even when the grown-up turned the voice off (a child tapped "Hear again"). */
export function say(text: string, opts: SayOptions & { force?: boolean } = {}): void {
  last = text;
  listeners.forEach((l) => l());
  const s = synth();
  if (!s || (!enabled && !opts.force) || !text) return;
  s.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const want = opts.lang ?? lang;
  u.lang = want;
  u.rate = opts.rate ?? 0.9;
  const v = pickVoice(s.getVoices(), want);
  if (v) u.voice = v;
  s.speak(u);
}

export function stop(): void {
  synth()?.cancel();
}

export function lastLine(): string {
  return last;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

/** The last line said, for a "Hear again" button. */
export function useLastLine(): string {
  return useSyncExternalStore(subscribe, () => last, () => last);
}

/** Whether the voice is on: a tile chip only becomes a "say my name" button when it is. */
export function useVoiceOn(): boolean {
  return useSyncExternalStore(subscribe, () => enabled, () => enabled);
}
