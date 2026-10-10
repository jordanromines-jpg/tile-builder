/* Make your own keeps what is built (5.0c): the tiles that stand are saved as a design a moment after every change
   (a tile that fell is left out: it lies wherever it landed). A design opened again (/make?d=my-…) puts its tiles
   back on, in the order they went on, and the physics holds each a moment, as when it was built. */
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { newDesignId } from "../../engine/design";
import { db, deleteDesign, getDesign, saveDesign } from "../../store/db";
import { S } from "../../strings";
import type { MadeTile } from "./MakeStage";
import type { Physics } from "./physics";

const SAVE_MS = 800;

/** The design's id once there is one (null until the first tile goes on), whether its tiles are back on, and `save`
    (now; resolves with the id, or null when nothing stands). */
export function useDesign(opened: string | undefined, physics: Physics | null, ready: boolean, tiles: MadeTile[], setTiles: Dispatch<SetStateAction<MadeTile[]>>, fallen: Set<number>, falls: number) {
  const [id, setId] = useState<string | null>(opened ?? null);
  const [loaded, setLoaded] = useState(!opened);
  const name = useRef<string | null>(null);

  // open: the saved tiles go back on
  useEffect(() => {
    if (!opened || !physics || !ready) return;
    let live = true;
    void getDesign(opened).then((d) => {
      if (!live) return;
      if (d) {
        name.current = d.name;
        const back = d.placed.map((placed) => ({ placed, id: null }));
        setTiles(back);
        back.forEach((m) => void physics.add(m.placed).then((pid) => live && setTiles((ts) => ts.map((t) => (t.placed === m.placed ? { ...t, id: pid } : t)))));
      }
      setLoaded(true);
    });
    return () => {
      live = false;
    };
  }, [opened, physics, ready, setTiles]);

  // save: a moment after the last change, or now (before the steps open)
  // (the id in a ref too: two saves close together must not make two designs)
  const latest = useRef(tiles);
  latest.current = tiles;
  const idRef = useRef<string | null>(opened ?? null);
  const save = useCallback(async (): Promise<string | null> => {
    const was = idRef.current;
    const placed = latest.current.filter((m) => m.id === null || !fallen.has(m.id)).map((m) => m.placed);
    if (!placed.length) {
      if (was) await deleteDesign(was);
      return null;
    }
    const at = was ?? newDesignId();
    idRef.current = at;
    name.current ??= S.make.name((await db.designs.count()) + 1);
    await saveDesign({ id: at, name: name.current, placed, updated: new Date().toISOString() });
    if (!was) setId(at);
    return at;
  }, [fallen]);
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => void save().catch((err: unknown) => console.error("could not save the design", err)), SAVE_MS);
    return () => clearTimeout(t);
  }, [tiles, falls, loaded, save]);

  return { id, loaded, save };
}
