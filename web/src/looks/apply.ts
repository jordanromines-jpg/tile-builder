/* Starting and changing the look (3.0): the attribute on <html> (looks.ts) and the look's sounds, together. */
import { armSound, play, setVoicing } from "../sound/sound";
import { applyLook, currentLook, setLook, type LookId } from "./looks";
import { VOICES } from "./voices";

/** Before the first paint: the saved look, its sounds, and sound armed for the first touch. */
export function startLook(): void {
  setVoicing(VOICES[applyLook(currentLook())]);
  armSound();
}

/** A family picked a look: show it, keep it, and answer in its own voice. */
export function chooseLook(look: LookId): void {
  setLook(look);
  setVoicing(VOICES[look]);
  play("tap");
}
