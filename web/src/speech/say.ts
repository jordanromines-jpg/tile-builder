/* Read-aloud (plan key 2n). Web Speech only: nothing leaves the iPad. iOS speaks only in answer to a tap, so say() is
   only ever called from a tap handler. Each call cancels what is being said, then speaks. */
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

/** The last line said, for a "Hear again" button. */
export function useLastLine(): string {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => last,
    () => last,
  );
}
