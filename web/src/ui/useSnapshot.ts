/* The 3D pictures for tile chips and project cards (sprint 2, change 8), loaded only when first wanted so the Library's
   first paint never waits on three.js. Null until a picture is ready, and always null without WebGL: callers show their
   SVG drawing meanwhile. */
import { useEffect, useState } from "react";
import { DEFAULT_LEG, type Colour, type ShapeId } from "../engine/catalog";
import type { Project } from "../engine/types";
import { isDark } from "../ground";

type Snapshots = typeof import("../three/snapshots");
let loading: Promise<Snapshots> | null = null;
const load = () => (loading ??= import("../three/snapshots"));

/** Whether this browser can draw 3D pictures at all (jsdom and very old devices cannot). */
function canDraw(): boolean {
  return typeof window !== "undefined" && typeof WebGLRenderingContext !== "undefined" && !navigator.userAgent.includes("jsdom");
}

function useSnapshot(key: string, start: (m: Snapshots, done: (url: string | null) => void) => () => void): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!key || !canDraw()) return;
    let live = true;
    let cancel = () => {};
    void load().then((m) => {
      if (live) cancel = start(m, (u) => live && setUrl(u));
    });
    return () => {
      live = false;
      cancel();
    };
    // key names everything the picture depends on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return url;
}

export function useTileSnapshot(shape: ShapeId, colour: Colour | undefined, px: number, leg = DEFAULT_LEG): string | null {
  const key = colour ? `${shape}:${colour}:${px}:${leg}` : "";
  return useSnapshot(key, (m, done) => m.tileSnapshot(shape, colour!, px, leg, done));
}

export function useProjectSnapshot(project: Project, w = 640, leg = DEFAULT_LEG, enabled = true): string | null {
  return useSnapshot(enabled ? `${project.id}:${w}:${leg}:${isDark()}` : "", (m, done) => m.projectSnapshot(project, w, leg, done));
}
