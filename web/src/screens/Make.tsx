/* Make your own (5.0b, Jordan: "a real physics builder page … to select tiles and make your own design"): pick a
   tile and a colour from the tray, then tap a glowing edge (or drag the tile onto one), turn it up how you want, and
   put it on. The live physics (physics.ts, a worker) holds it in the hand for a second, then lets go: it stands if
   its magnets and the tiles round it hold it, and falls if not. Tiles are unlimited (M3). */
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COLOURS, DEFAULT_LEG, SHAPE_IDS, type Colour, type ShapeId } from "../engine/catalog";
import { worldPolygon, type V3 } from "../engine/geometry";
import { say } from "../speech/say";
import { S } from "../strings";
import { AgeProvider } from "../ui/kid/AgeContext";
import { KidButton } from "../ui/kid/KidButton";
import { ArrowClockwise, ArrowLeft, ArrowUUpLeft, Check, FlipHorizontal, HandGrabbing, HandTap, Trash, X } from "../ui/icons";
import { TileChip } from "../ui/TileChip";
import { MakeStage, type MadeTile } from "./make/MakeStage";
import { Physics } from "./make/physics";
import { blocked, placeOn, spotsFor, TILTS, type Spot } from "./make/place";

const leg = DEFAULT_LEG;

declare global {
  interface Window {
    __make?: { tiles: number; placed: number; spots: number; high: number; fallen: number; ready: boolean };
    /** the browser tests' finger on a glowing edge: the spot from a to b (as a tap on its bar does) */
    __makePick?: (a: number[], b: number[]) => boolean;
  }
}
/** the shapes in the tray first; the Connetix ones behind More */
const MAIN: ShapeId[] = ["square", "square-large", "tri-equilateral", "tri-right", "tri-isosceles-tall"];
const centroid = (poly: V3[]): V3 => poly.reduce<V3>((s, v) => [s[0] + v[0] / poly.length, s[1] + v[1] / poly.length, s[2] + v[2] / poly.length], [0, 0, 0]);

export function Make() {
  const navigate = useNavigate();
  // the worker is made and stopped by one effect (made in render, a remount stopped it before it was ready)
  const [physics, setPhysics] = useState<Physics | null>(null);
  const [ready, setReady] = useState(false);
  const [tiles, setTiles] = useState<MadeTile[]>([]);
  const [shape, setShape] = useState<ShapeId | null>(null);
  const [colour, setColour] = useState<Colour>("blue");
  const [more, setMore] = useState(false);
  const [mode, setMode] = useState<"tap" | "drag">("tap");
  const [chosen, setChosen] = useState<Spot | null>(null);
  const [tilt, setTilt] = useState(0);
  const [flip, setFlip] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [line, setLine] = useState<string>(S.make.pickShape);
  const [polys, setPolys] = useState<V3[][]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const tilesRef = useRef(tiles);
  tilesRef.current = tiles;
  const fallen = useRef(new Set<number>());
  const cheered = useRef(false);

  useEffect(() => {
    const p = new Physics();
    setPhysics(p);
    void p.ready.then(() => setReady(true));
    return () => {
      p.stop();
      setReady(false);
    };
  }, []);

  // the tiles as they now lie, a few times a second: where the glowing edges are, and what fell
  useEffect(() => {
    if (!physics) return;
    const t = setInterval(() => {
      const now: V3[][] = [];
      let top = 0;
      for (const m of tilesRef.current) {
        const built = worldPolygon(m.placed, leg);
        const at = m.id === null ? undefined : physics.poses.get(m.id);
        if (!at) {
          now.push(built);
          continue;
        }
        const c = centroid(built);
        const [x, y, z, w] = at.q;
        const poly = built.map((v): V3 => {
          const r = [v[0] - c[0], v[1] - c[1], v[2] - c[2]];
          // q · r · q⁻¹
          const c1 = [y * r[2] - z * r[1], z * r[0] - x * r[2], x * r[1] - y * r[0]];
          const c2 = [y * c1[2] - z * c1[1], z * c1[0] - x * c1[2], x * c1[1] - y * c1[0]];
          return [at.p[0] + r[0] + 2 * (w * c1[0] + c2[0]), at.p[1] + r[1] + 2 * (w * c1[1] + c2[1]), at.p[2] + r[2] + 2 * (w * c1[2] + c2[2])];
        });
        now.push(poly);
        top = Math.max(top, ...poly.map((v) => v[1]));
        const moved = Math.hypot(at.p[0] - c[0], at.p[1] - c[1], at.p[2] - c[2]);
        if (m.id !== null && moved > 0.35 && !physics.held.has(m.id) && !fallen.current.has(m.id)) {
          fallen.current.add(m.id);
          setLine(S.make.fell);
          say(S.make.fell);
        }
      }
      if (top >= 3.99 && !cheered.current) {
        cheered.current = true;
        setLine(S.make.tall);
        say(S.make.tall);
      }
      setPolys(now);
    }, 300);
    return () => clearInterval(t);
  }, [physics]);

  const spots = useMemo(() => (shape && ready ? spotsFor(shape, leg, polys) : []), [shape, ready, polys]);
  const ghost = useMemo(() => (chosen && shape ? placeOn(chosen, shape, colour, tilt, flip) : null), [chosen, shape, colour, tilt, flip]);
  const bad = useMemo(() => !!ghost && blocked(ghost, leg, polys), [ghost, polys]);

  const putOn = useCallback(
    (spot: Spot, t = tilt, f = flip) => {
      if (!shape || !physics) return;
      const placed = placeOn(spot, shape, colour, t, f);
      if (blocked(placed, leg, polys)) {
        setLine(S.make.blocked);
        return;
      }
      setTiles((ts) => [...ts, { placed, id: null }]);
      void physics.add(placed).then((id) => setTiles((ts) => ts.map((m) => (m.placed === placed ? { ...m, id } : m))));
      setChosen(null);
      setLine(mode === "tap" ? S.make.tapEdge : S.make.dragIt);
    },
    [shape, colour, tilt, flip, polys, physics, mode],
  );

  const takeOff = (i: number) => {
    const m = tiles[i];
    if (m?.id !== null && m?.id !== undefined) physics?.remove(m.id);
    setTiles((ts) => ts.filter((_, k) => k !== i));
    setSelected(null);
  };

  // drag mode: follow the finger over the stage, put the tile on the nearest edge when it lets go
  const [dragSpot, setDragSpot] = useState<Spot | null>(null);
  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const r = stage.current?.getBoundingClientRect();
      if (r) setDrag({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    const up = () => {
      setDrag(null);
      if (dragSpot) putOn(dragSpot, 0, false);
      setChosen(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag, dragSpot, putOn]);
  useEffect(() => {
    if (drag) setChosen(dragSpot);
  }, [drag, dragSpot]);

  // for the browser tests (as window.__run): what is on the table, how high, what fell
  useEffect(() => {
    window.__make = { tiles: tiles.length, placed: tiles.filter((m) => m.id !== null).length, spots: spots.length, high: Math.max(0, ...polys.flat().map((v) => v[1])), fallen: fallen.current.size, ready };
  }, [tiles, spots, polys, ready]);

  useEffect(() => {
    window.__makePick = (a, b) => {
      const s = spots.find((x) => [0, 1, 2].every((k) => Math.abs(x.a[k] - a[k]) < 0.05 && Math.abs(x.b[k] - b[k]) < 0.05) || [0, 1, 2].every((k) => Math.abs(x.a[k] - b[k]) < 0.05 && Math.abs(x.b[k] - a[k]) < 0.05));
      if (s) setChosen(s);
      return !!s;
    };
  }, [spots]);

  const shapes = more ? SHAPE_IDS : MAIN;
  return (
    <AgeProvider age="b">
      <main className="ts-make kid relative flex h-dvh flex-col overflow-hidden bg-stage" aria-label={S.make.title}>
        <header className="flex items-center gap-3 px-4 pt-3">
          <KidButton label={S.kid.back} showLabel={false} icon={<ArrowLeft size={36} weight="bold" />} onPress={() => void navigate({ to: "/" })} />
          <h1 className="font-display text-[length:var(--fs-kid-label-b)] font-semibold text-ink-1">{S.make.title}</h1>
          <span className="flex-1" />
          <KidButton label={S.make.tapMode} showLabel={false} pressed={mode === "tap"} icon={<HandTap size={36} weight="bold" />} onPress={() => (setMode("tap"), setLine(S.make.tapEdge))} />
          <KidButton label={S.make.dragMode} showLabel={false} pressed={mode === "drag"} icon={<HandGrabbing size={36} weight="bold" />} onPress={() => (setMode("drag"), setChosen(null), setLine(S.make.dragIt))} />
          <KidButton label={S.make.undo} showLabel={false} disabled={!tiles.length} icon={<ArrowUUpLeft size={36} weight="bold" />} onPress={() => takeOff(tiles.length - 1)} />
          <KidButton
            label={S.make.startAgain}
            showLabel={false}
            disabled={!tiles.length}
            icon={<Trash size={36} weight="bold" />}
            onPress={() => {
              for (const m of tiles) if (m.id !== null) physics?.remove(m.id);
              setTiles([]);
              fallen.current.clear();
              cheered.current = false;
            }}
          />
        </header>
        <div ref={stage} className="relative min-h-0 flex-1">
          {physics && <MakeStage
            tiles={tiles}
            physics={physics}
            spots={mode === "tap" || drag ? spots : []}
            chosen={chosen}
            ghost={ghost}
            ghostBad={bad}
            selected={selected}
            drag={drag}
            onSpot={(s) => (setChosen(s), setSelected(null))}
            onTile={(i) => (setSelected(i === selected ? null : i), setChosen(null))}
            onDragSpot={setDragSpot}
            label={`${S.make.title}: ${S.make.tiles(tiles.length)}`}
          />}
          {!ready && <p className="absolute inset-x-0 top-6 text-center font-kid text-ink-2">{S.make.loading}</p>}
        </div>
        <section className="ts-tray soft m-3 flex flex-col gap-3 rounded-lg bg-surface-2 p-3 shadow-xl" aria-label={S.make.pickShape}>
          <p className="font-kid font-bold text-ink-1" aria-live="polite">
            {ghost ? `${bad ? S.make.blocked : S.make.tilt(TILTS[tilt].say)}` : line}
          </p>
          {chosen && mode === "tap" ? (
            <div className="flex flex-wrap items-center gap-3">
              <KidButton label={S.make.turn} icon={<ArrowClockwise size={32} weight="bold" />} onPress={() => setTilt((t) => (t + 1) % TILTS.length)} />
              <KidButton label={S.make.flip} icon={<FlipHorizontal size={32} weight="bold" />} onPress={() => setFlip((f) => !f)} />
              <KidButton label={S.make.putOn} tone="accent" disabled={bad} icon={<Check size={32} weight="bold" />} onPress={() => putOn(chosen)} />
              <KidButton label={S.make.cancel} icon={<X size={32} weight="bold" />} onPress={() => setChosen(null)} />
            </div>
          ) : selected !== null ? (
            <div className="flex items-center gap-3">
              <KidButton label={S.make.takeOff} tone="accent" icon={<Trash size={32} weight="bold" />} onPress={() => takeOff(selected)} />
              <KidButton label={S.make.cancel} icon={<X size={32} weight="bold" />} onPress={() => setSelected(null)} />
            </div>
          ) : (
            <>
              <ul className="flex flex-wrap items-center gap-2" aria-label={S.make.pickShape}>
                {shapes.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      aria-pressed={shape === s}
                      className="press rounded-md p-1 aria-pressed:ring-4 aria-pressed:ring-focus"
                      onClick={() => (setShape(s), setLine(mode === "tap" ? S.make.tapEdge : S.make.dragIt))}
                      onPointerDown={(e) => {
                        if (mode !== "drag") return;
                        setShape(s);
                        const r = stage.current?.getBoundingClientRect();
                        if (r) setDrag({ x: e.clientX - r.left, y: e.clientY - r.top });
                      }}
                    >
                      <TileChip shape={s} colour={colour} size="sm" leg={leg} />
                    </button>
                  </li>
                ))}
                <li>
                  <button type="button" className="press rounded-md px-3 py-2 font-kid font-bold text-ink-2" onClick={() => setMore((m) => !m)}>
                    {more ? S.make.less : S.make.more}
                  </button>
                </li>
              </ul>
              <ul className="flex flex-wrap items-center gap-2" aria-label={S.make.pickColour}>
                {COLOURS.map((c) => (
                  <li key={c}>
                    <button type="button" aria-pressed={colour === c} className="press rounded-md p-1 aria-pressed:ring-4 aria-pressed:ring-focus" onClick={() => setColour(c)}>
                      <TileChip shape="square" colour={c} size="sm" leg={leg} />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
    </AgeProvider>
  );
}
