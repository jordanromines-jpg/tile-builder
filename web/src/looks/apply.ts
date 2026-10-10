/* Starting the look (3.0, one look since 5.4.3): the attribute on <html> (looks.ts) and the look's sounds, together. */
import { armSound, setVoicing } from "../sound/sound";
import { applyLook } from "./looks";
import { sounds } from "./vinyl/sounds";

/** Before the first paint: the look, its sounds, and sound armed for the first touch. */
export function startLook(): void {
  applyLook();
  setVoicing(sounds);
  armSound();
}
