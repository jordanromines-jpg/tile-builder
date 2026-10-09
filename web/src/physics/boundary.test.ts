/* The physics is for the build machine only (D9): the app plays recordings and uses exact formulas, it never
   simulates. No app file may import src/physics (or Rapier). */
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
  const bad = files(join(__dirname, "..")).filter((f) => /from\s+["'][^"']*(\/physics\/|rapier3d)/.test(readFileSync(f, "utf8")));
  expect(bad).toEqual([]);
});
