// Every project in the app, written by hand (D3). Each passes `npm run check:projects` before it ships.
import type { Project } from "../engine/types";
import { castle } from "./castle";

export const PROJECTS: Project[] = [castle];

export function projectById(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}
