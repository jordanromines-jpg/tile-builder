/* The projects as the app uses them (2.4): the catalogue, bundled (catalog.json: names, ages, stars and tile counts),
   and each project's tiles and steps fetched when it is opened (public/projects/<id>.json, kept offline by the service
   worker). The plans that make them (kit.ts, studio.ts and the files they feed) stay out of the app. */
import { useEffect, useState } from "react";
import { ProjectZ } from "../engine/schema";
import type { Project } from "../engine/types";
import catalog from "./catalog.json";
import { skeleton, type ProjectInfo } from "./serialize";

export const PROJECT_INFO = catalog as ProjectInfo[];

const byId = new Map(PROJECT_INFO.map((p) => [p.id, p]));
export function infoById(id: string): ProjectInfo | undefined {
  return byId.get(id);
}

/** Stand-ins with each project's tiles by shape, for matching against a family's tiles (the Library, the counts). */
export const SKELETONS: Project[] = PROJECT_INFO.map(skeleton);

const loaded = new Map<string, Promise<Project>>();

export function loadProject(id: string): Promise<Project> {
  let p = loaded.get(id);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}projects/${id}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`project ${id}: ${r.status}`);
        return r.json();
      })
      .then((data) => ProjectZ.parse(data) as Project);
    // a failed fetch (offline before it was ever cached) may work next time
    p.catch(() => loaded.delete(id));
    loaded.set(id, p);
  }
  return p;
}

/** The project with this id: undefined while it loads, null when there is no such project (or it cannot be had). */
export function useProject(id: string): Project | null | undefined {
  const [state, setState] = useState<{ id: string; project: Project | null } | null>(null);
  useEffect(() => {
    let live = true;
    if (!byId.has(id)) {
      setState({ id, project: null });
      return;
    }
    loadProject(id).then(
      (project) => live && setState({ id, project }),
      () => live && setState({ id, project: null }),
    );
    return () => {
      live = false;
    };
  }, [id]);
  return state && state.id === id ? state.project : undefined;
}
