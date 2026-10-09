/* Pip helps (3.9, Jordan: "animate this guy and make him help with builds"). Guide owns Pip in build mode. Each step
   with Next, he picks up the step's tiles, hops over to where they go on the model, tosses them in as the 3D tiles
   drop, claps when they land (or cheers when a layer is done), and hops back to his place on the step panel. A jump
   (Back, a dot, All steps) sends him over to point; while All steps is open he looks along; when it falls down he
   comforts; on the rest screen he sleeps, and waves when the child comes back. A step's tip shows in a bubble by him.
   With motion reduced he stays in his place and points. Decoration: the screen says everything in words. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { StepTile } from "../screens/build/stepTiles";
import { useStill } from "../ui/motion";
import { TilePicture } from "../ui/TileChip";
import type { FriendPose } from "./Friend";
import { hopAt, SQUASH_MS, squashKeyframes, tossKeyframes } from "./hop";
import { guideTimes, type Pace } from "./pace";
import { Pip } from "./Pip";

const SIZE = 88;
const POINT_MS = 1600;
const OPEN_MS = 2000;
const WAVE_MS = 1200;
const TIP_MS = 5000;
/** how long to wait for the new tiles to come into sight as the view eases round to them */
const SIGHT_MS = 500;
/** if the tiles never report landing (a turn, a slow frame), carry on after this */
const LAND_WAIT_MS = 2200;

interface P {
  x: number;
  y: number;
}

/** Where this step's tiles are on the screen, from the 3D view, without re-rendering anything. */
export class TargetBus {
  at: P | null = null;
  private fns = new Set<() => void>();
  set = (x: number, y: number) => {
    this.at = { x, y };
    this.fns.forEach((f) => f());
  };
  listen(f: () => void) {
    this.fns.add(f);
    return () => void this.fns.delete(f);
  }
}

export type Arrival = { kind: "next" | "jump" | "open"; n: number };

export interface GuideProps {
  arrival: Arrival;
  tiles: StepTile[];
  leg: number;
  tip: string | null;
  bus: TargetBus;
  /** the step panel: Pip's place is on its top edge, above Next */
  panel: RefObject<HTMLElement | null>;
  /** px covered by the top bar: Pip never goes above it */
  top: number;
  landed: number;
  finishesLayer: boolean;
  tray: boolean;
  gaze: -1 | 0 | 1;
  falling: boolean;
  resting: boolean;
  /** Watch it build at Fast (4.1): a shorter hop and hold; the Viewer's `hold` must be `guideTimes(pace).hold` */
  pace?: Pace;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
/** Two frames: long enough for the 3D view to draw the new step and say where its tiles are. */
const frames = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

export function Guide({ arrival, tiles, leg, tip, bus, panel, top, landed, finishesLayer, tray, gaze, falling, resting, pace = "normal" }: GuideProps) {
  const still = useStill();
  const timesRef = useRef(guideTimes(pace));
  timesRef.current = guideTimes(pace);
  const layer = useRef<HTMLDivElement>(null);
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const heldEl = useRef<HTMLDivElement>(null);
  const [pose, setPose] = useState<FriendPose>("point");
  const [flip, setFlip] = useState(true);
  const [held, setHeld] = useState<StepTile[] | null>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [home, setHome] = useState<P>({ x: 0, y: 0 });
  // the latest place, for a trip that began before the panel changed size
  const homeRef = useRef(home);
  homeRef.current = home;
  const pos = useRef<P | null>(null);
  const phase = useRef<"home" | "away" | "there">("home");
  const run = useRef(0);
  const anims = useRef<Animation[]>([]);
  /** squashes: cancelled with the rest, but never committed (they would leave him squashed) */
  const fx = useRef<Animation[]>([]);
  const awaitLand = useRef<(() => void) | null>(null);
  /** the frame of the hop in the air, and how to end it */
  const raf = useRef(0);
  const hopDone = useRef<(() => void) | null>(null);

  // Pip's place: the panel's top edge, above Next, read again whenever the panel changes size
  useLayoutEffect(() => {
    const read = () => {
      const p = panel.current?.getBoundingClientRect();
      const box = layer.current?.getBoundingClientRect();
      if (!p || !box) return;
      setHome({ x: p.right - box.left - 40 - SIZE, y: p.top - box.top - 76 });
    };
    read();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(read);
    if (panel.current) ro?.observe(panel.current);
    if (layer.current) ro?.observe(layer.current);
    return () => ro?.disconnect();
  }, [panel]);

  const place = useCallback((p: P) => {
    pos.current = p;
    if (outer.current) outer.current.style.translate = `${p.x}px ${p.y}px`;
  }, []);

  // at home, he follows his place as the panel grows and shrinks
  useLayoutEffect(() => {
    if (phase.current === "home") place(home);
  }, [home, place]);

  /** Beside the step's tiles, facing them, inside the clear part of the screen; null when they can't be seen. */
  const spot = useCallback((): { p: P; flip: boolean } | null => {
    const t = bus.at;
    const w = layer.current?.clientWidth ?? 0;
    const home = homeRef.current;
    if (!t || !w || t.y < top || t.y > home.y + SIZE || t.x < 0 || t.x > w) return null;
    const right = t.x < w * 0.3;
    // never behind the turn buttons down the right edge
    const x = Math.min(w - SIZE - 104, Math.max(8, right ? t.x + 56 : t.x - 56 - SIZE));
    const y = Math.min(home.y, Math.max(top, t.y - SIZE + 24));
    return { p: { x, y }, flip: !right };
  }, [bus, top]);

  // while he stands by the tiles, he moves with them as the model turns or the view eases
  useEffect(
    () =>
      bus.listen(() => {
        if (phase.current !== "there") return;
        const s = spot();
        if (s) place(s.p);
      }),
    [bus, spot, place],
  );

  const stopAll = useCallback(() => {
    for (const a of anims.current) {
      try {
        a.commitStyles();
      } catch {
        // an element no longer shown: nothing to keep
      }
      a.cancel();
    }
    anims.current = [];
    for (const a of fx.current) a.cancel();
    fx.current = [];
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    hopDone.current?.();
    hopDone.current = null;
    awaitLand.current = null;
  }, []);

  /** A hop along a ballistic arc (4.2d) to where `aim` says, asked again every frame: the view may still be easing
      round to the tiles, so he lands where they are, not where they were. He squashes as he lands and springs back.
      Resolves when he lands, when a new trip starts, or at once with motion reduced. */
  const hop = useCallback(
    (aim: () => P, ms: number) => {
      const id = run.current;
      if (still || !outer.current || !inner.current) {
        place(aim());
        return Promise.resolve();
      }
      const from = pos.current ?? aim();
      const squash = inner.current;
      return new Promise<void>((resolve) => {
        const done = () => {
          hopDone.current = null;
          resolve();
        };
        hopDone.current = done;
        const t0 = performance.now();
        const frame = (now: number) => {
          if (run.current !== id) return done();
          const t = now - t0;
          place(hopAt(from, aim(), ms, t));
          if (t < ms) {
            raf.current = requestAnimationFrame(frame);
            return;
          }
          raf.current = 0;
          if (squash.isConnected) fx.current.push(squash.animate(squashKeyframes(), { duration: SQUASH_MS, easing: "linear" }));
          done();
        };
        raf.current = requestAnimationFrame(frame);
      });
    },
    [place, still],
  );

  /** At the tiles: from now on he moves with them; the view may have eased on while he hopped, so catch up. */
  const arrive = useCallback(() => {
    phase.current = "there";
    const s = spot();
    if (s) place(s.p);
  }, [spot, place]);

  const goHome = useCallback(
    async (id: number) => {
      phase.current = "away";
      await hop(() => homeRef.current, timesRef.current.homeMs);
      if (run.current !== id) return;
      phase.current = "home";
      place(homeRef.current);
      setFlip(true);
      setPose("idle");
      if (tip) setTipOpen(true);
    },
    [hop, place, tip],
  );

  // each new step
  useEffect(() => {
    const id = ++run.current;
    const live = () => run.current === id;
    stopAll();
    // he stops following the last step's tiles: he hops to the new ones from where he stands
    if (phase.current === "there") phase.current = "away";
    setTipOpen(false);
    setHeld(null);
    void (async () => {
      // the view eases round to the new tiles: give them a moment to come into sight
      let s = null;
      for (const end = performance.now() + SIGHT_MS; live() && !s && performance.now() < end; ) {
        await frames();
        s = spot();
      }
      if (!live()) return;
      // motion reduced, or the tiles out of sight: he points from his place
      if (still || !s || arrival.kind === "open") {
        if (phase.current !== "home") {
          phase.current = "home";
          place(homeRef.current);
        }
        setFlip(true);
        setPose("point");
        if (tip) setTipOpen(true);
        await wait(OPEN_MS);
        if (live()) setPose("idle");
        return;
      }
      const t = timesRef.current;
      setFlip(s.flip);
      phase.current = "away";
      const last = s.p;
      const aim = () => spot()?.p ?? last;
      if (arrival.kind === "jump") {
        setPose("point");
        await hop(aim, t.hopMs);
        if (!live()) return;
        arrive();
        await wait(POINT_MS);
        if (live()) await goHome(id);
        return;
      }
      // Next: he carries the step's tiles over, tosses them in as they drop, and claps when they land
      setHeld(tiles);
      setPose("hold");
      await hop(aim, t.hopMs);
      if (!live()) return;
      arrive();
      await wait(t.hold * 1000 - t.hopMs);
      if (!live()) return;
      const at = bus.at;
      const h = heldEl.current?.getBoundingClientRect();
      const box = layer.current?.getBoundingClientRect();
      if (at && h && box && heldEl.current) {
        const dx = at.x - (h.left - box.left + h.width / 2);
        const dy = at.y - (h.top - box.top + h.height / 2);
        const a = heldEl.current.animate(tossKeyframes(dx, dy, t.tossMs), { duration: t.tossMs, easing: "linear", fill: "forwards" });
        anims.current.push(a);
      }
      setPose("point");
      await wait(t.tossMs);
      if (!live()) return;
      setHeld(null);
      await Promise.race([new Promise<void>((r) => (awaitLand.current = r)), wait(LAND_WAIT_MS)]);
      awaitLand.current = null;
      if (!live()) return;
      setPose(finishesLayer ? "cheer" : "clap");
      await wait(t.cheerMs);
      if (live()) await goHome(id);
    })();
    // a new arrival starts over; the rest is read when it is needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrival.n]);

  useEffect(() => awaitLand.current?.(), [landed]);

  // gone from the screen: nothing more moves
  useEffect(
    () => () => {
      run.current++;
      stopAll();
    },
    [stopAll],
  );

  // All steps, a fall and a rest call him home to look, comfort or sleep
  const away = tray || falling || resting;
  useEffect(() => {
    if (!away) return;
    run.current++;
    stopAll();
    setHeld(null);
    setTipOpen(false);
    phase.current = "home";
    place(homeRef.current);
    setFlip(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [away]);
  const woke = useRef(false);
  useEffect(() => {
    if (resting) {
      woke.current = true;
      return;
    }
    if (!woke.current) return;
    woke.current = false;
    setPose("wave");
    const t = setTimeout(() => setPose("idle"), WAVE_MS);
    return () => clearTimeout(t);
  }, [resting]);

  useEffect(() => {
    if (!tipOpen) return;
    const t = setTimeout(() => setTipOpen(false), TIP_MS);
    return () => clearTimeout(t);
  }, [tipOpen]);

  const shown: FriendPose = resting ? "sleep" : falling ? "comfort" : tray ? "look" : pose;
  const extra = held && held.length > 3 ? held.slice(3).reduce((n, t) => n + t.count, 0) : 0;
  return (
    <div ref={layer} className="ts-guide pointer-events-none absolute inset-0 z-40 overflow-hidden">
      <div ref={outer} className="absolute left-0 top-0" style={{ width: SIZE, height: SIZE }}>
        <div ref={inner} className="relative h-full w-full" style={{ transformOrigin: "50% 100%" }}>
          {held && (
            <div ref={heldEl} className="absolute -top-7 left-1/2 flex -translate-x-1/2 items-end gap-0.5">
              {held.slice(0, 3).map((t) => (
                <TilePicture key={`${t.shape}-${t.colour}-${t.instead}`} shape={t.shape} colour={t.colour} leg={leg} px={28} />
              ))}
              {extra > 0 && <span className="font-display text-[15px] font-bold text-ink-1">+{extra}</span>}
            </div>
          )}
          <Pip pose={shown} size={SIZE} flip={flip} alive={!resting} gaze={tray ? gaze : 0} />
        </div>
      </div>
      {tipOpen && tip && (
        <div
          role="note"
          aria-live="polite"
          className="ts-bubble soft pointer-events-auto absolute max-w-[280px] rounded-[22px] bg-surface-2 px-4 py-3 text-left font-kid text-[length:var(--fs-kid-label-c)] font-bold leading-snug text-ink-1"
          style={{ right: `calc(100% - ${home.x + SIZE}px)`, bottom: `calc(100% - ${home.y - 4}px)` }}
          onClick={() => setTipOpen(false)}
        >
          {tip}
        </div>
      )}
    </div>
  );
}
