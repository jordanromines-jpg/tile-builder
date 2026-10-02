/* The 3D pictures (sprint 2, change 8): every tile chip and project card shows the same glossy tiles as the build
   stage. They are drawn once, ahead of time, from the stage's own 3D code (`npm run pictures`), saved as WebP under
   public/pictures/ and cached for offline use with the rest of the app, so the iPad never spends time drawing them.
   A picture that is missing falls back to the flat drawing. */
import { type Colour, type ShapeId } from "./engine/catalog";
import type { Project } from "./engine/types";

/** The tall triangle's legs that have their own pictures: the Settings choices; a brand's leg uses the nearest. */
export const PICTURE_LEGS = [1.5, 1.867, 2.2];
/** Pictures are square (tiles) or 4:3 (projects), at twice the largest size they are shown. */
export const TILE_PX = 208;
export const PROJECT_W = 640;
export const PROJECT_H = 480;

function nearestLeg(leg: number): number {
  return PICTURE_LEGS.reduce((a, b) => (Math.abs(b - leg) < Math.abs(a - leg) ? b : a));
}

/** A tile picture's file, under pictures/. */
export function tileFile(shape: ShapeId, colour: Colour, leg: number): string {
  return shape === "tri-isosceles-tall" ? `tiles/${shape}-${colour}-${nearestLeg(leg)}.webp` : `tiles/${shape}-${colour}.webp`;
}

/** A project picture's file, under pictures/. */
export function projectFile(id: string): string {
  return `projects/${id}.webp`;
}

export function pictureUrl(file: string): string {
  return `${import.meta.env.BASE_URL}pictures/${file}`;
}

/** A short fingerprint of a project's tiles: the manifest keeps it, and a test fails when a project changed but its
    picture was not drawn again. FNV-1a over the placed tiles, numbers rounded to 6 places (the browser and Node can
    differ in the last digits of a sine). */
export function projectHash(project: Project): string {
  const s = JSON.stringify(project.placed, (_, v) => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : v));
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}
