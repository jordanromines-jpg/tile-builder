/* The door stays open for ten minutes without a tap (plan key 5d), then closes. Kept in memory: a reload closes it. */
export const OPEN_FOR_MS = 10 * 60 * 1000;

let openUntil = 0;
const listeners = new Set<() => void>();

export function isOpen(t = Date.now()): boolean {
  return t < openUntil;
}

export function open(t = Date.now()): void {
  openUntil = t + OPEN_FOR_MS;
  listeners.forEach((l) => l());
}

/** A tap on the grown-ups side keeps the door open. */
export function touch(t = Date.now()): void {
  if (isOpen(t)) openUntil = t + OPEN_FOR_MS;
}

export function close(): void {
  openUntil = 0;
  listeners.forEach((l) => l());
}

export function onChange(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
