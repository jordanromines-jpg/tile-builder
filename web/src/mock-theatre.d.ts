// The little of Theatre.js's core the mock uses (see mock-theatre.js).
export interface SheetObject<T> {
  readonly value: T;
}
export interface Sheet {
  sequence: { position: number };
  object<T extends Record<string, number>>(key: string, props: T): SheetObject<T>;
}
export interface Project {
  ready: Promise<void>;
  sheet(id: string): Sheet;
}
export function getProject(id: string, config?: { state?: unknown }): Project;
