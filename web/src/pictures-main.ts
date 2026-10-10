/* The picture maker's page (pictures.html): draws every picture the app shows, for scripts/pictures.mjs to save. Runs
   only in the dev server, never in the app. */
import { COLOURS, SHAPE_IDS } from "./engine/catalog";
import { drawFullLook } from "./gpu";
import { PICTURE_LEGS, PROJECT_H, PROJECT_W, projectFile, projectHash, TILE_PX, tileFile } from "./pictures";
import { PROJECTS } from "./projects";
import { DEFAULT_LEG } from "./engine/catalog";
import { drawProject, drawTile, makeRenderer } from "./three/pictures";
import { pinFinish } from "./three/TileMesh";

drawFullLook();
// one finish for every picture: on a clear background no light comes through the glass (5.4.1)
pinFinish("mid");
const r = makeRenderer();

interface Job {
  file: string;
  draw: () => string;
}

const jobs: Job[] = [];
for (const shape of SHAPE_IDS)
  for (const colour of COLOURS)
    for (const leg of shape === "tri-isosceles-tall" ? PICTURE_LEGS : [DEFAULT_LEG])
      jobs.push({ file: tileFile(shape, colour, leg), draw: () => drawTile(r, shape, colour, leg, TILE_PX) });
for (const p of PROJECTS) jobs.push({ file: projectFile(p.id), draw: () => drawProject(r, p, DEFAULT_LEG, PROJECT_W, PROJECT_H) });

declare global {
  interface Window {
    pictures: { files: () => string[]; draw: (file: string) => string; hashes: () => Record<string, string> };
  }
}

window.pictures = {
  files: () => jobs.map((j) => j.file),
  draw: (file) => jobs.find((j) => j.file === file)!.draw(),
  hashes: () => Object.fromEntries(PROJECTS.map((p) => [p.id, projectHash(p)])),
};
