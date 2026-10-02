// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COLOURS, DEFAULT_LEG, SHAPE_IDS } from "./engine/catalog";
import { PICTURE_LEGS, projectFile, projectHash, tileFile } from "./pictures";
import { PROJECTS } from "./projects";

const dir = new URL("../public/pictures/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("manifest.json", dir), "utf8")) as { files: string[]; projects: Record<string, string> };

describe("the 3D pictures", () => {
  it("exist for every tile in every colour, and every tall-triangle leg", () => {
    for (const shape of SHAPE_IDS)
      for (const colour of COLOURS)
        for (const leg of shape === "tri-isosceles-tall" ? [...PICTURE_LEGS, 1.877] : [DEFAULT_LEG]) {
          expect(existsSync(new URL(tileFile(shape, colour, leg), dir)), tileFile(shape, colour, leg)).toBe(true);
        }
  });

  it("exist for every project and were drawn from its tiles as they are now (else run npm run pictures)", () => {
    for (const p of PROJECTS) {
      expect(existsSync(new URL(projectFile(p.id), dir)), projectFile(p.id)).toBe(true);
      expect(manifest.projects[p.id], `${p.id}: run npm run pictures`).toBe(projectHash(p));
    }
  });

  it("are all listed in the manifest, and nothing else is", () => {
    const expected = [
      ...SHAPE_IDS.flatMap((s) => COLOURS.flatMap((c) => (s === "tri-isosceles-tall" ? PICTURE_LEGS : [DEFAULT_LEG]).map((l) => tileFile(s, c, l)))),
      ...PROJECTS.map((p) => projectFile(p.id)),
    ];
    expect([...manifest.files].sort()).toEqual([...new Set(expected)].sort());
  });
});
