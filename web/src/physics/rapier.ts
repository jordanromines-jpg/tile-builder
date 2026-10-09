/* Rapier, the deterministic build (D8): the same answers on every machine. Loaded once. */
import RAPIER from "@dimforge/rapier3d-deterministic-compat";

export type Rapier = typeof RAPIER;
let ready: Promise<Rapier> | null = null;

export function rapier(): Promise<Rapier> {
  return (ready ??= RAPIER.init().then(() => RAPIER));
}
