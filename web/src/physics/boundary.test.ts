/* The physics stays out of the app's code (D9, and D9′ of 5.0): the app plays recordings and uses exact formulas;
   only Make your own simulates, and it does so in a worker (src/physics/worker.ts, started by URL, never imported).
   No app file may import src/physics (or Rapier). */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? (f === "physics" ? [] : files(p)) : /\.(ts|tsx)$/.test(f) && !/\.test\.tsx?$/.test(f) ? [p] : [];
  });
}

it("no app code imports the physics", () => {
  // (a type-only import brings no code)
  const code = (f: string) => readFileSync(f, "utf8").replace(/^import type .*$/gm, "");
  const bad = files(join(__dirname, "..")).filter((f) => /from\s+["'][^"']*(\/physics\/|rapier3d)/.test(code(f)));
  expect(bad).toEqual([]);
});
