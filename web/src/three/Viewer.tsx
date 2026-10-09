/* The 3D viewer (sprint 2, changes 2 and 3). The project's age sets how it moves:
     a (3–5)  a still three-quarter view; ◀ ▶ turn it a quarter; it never turns by itself (D10); no dragging
     b (6–8)  ◀ ▶ and one-finger drag to turn
     c (9–10) turn and zoom freely; a slow turn (one in 25 s) until touched, and never under reduced motion
   Each new step eases the view toward the tiles being placed. `sweep` circles the finished model once (the end of a
   build). Performance: pixel ratio at most 2 (1.5 on smaller devices and for builds over BIG_BUILD tiles, 1 without a
   GPU), frames drawn only when something moves; a big build turns once by itself and then rests (2.8.1). */
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { ShapeId } from "../engine/catalog";
import type { Age, Project } from "../engine/types";
import { softwareGL } from "../gpu";
import { atRest, springAt, springFor, springStep } from "../motion/spring";
import { older } from "../ui/kid/AgeContext";
import { useStill } from "../ui/motion";
import { ANY_YAW, cornersOf, easeInOut, fitBox, FOV, lookOf, viewFrom, type Look } from "./camera";
import { BIG_BUILD, frameOf, Model, releaseShared } from "./Model";
import { FrameWatch } from "./FrameWatch";
import { currentTier, faster, slower } from "./quality";
import { Stage } from "./Stage";

export const TURN_MS = 600;
const FOCUS_MS = 700;
// 4.2d: both are critically damped springs, closed form; the turn lands on its quarter when within 0.1° of rest
const TURN = springFor(TURN_MS / 1000, 1, 0.001);
const FOCUS = springFor(FOCUS_MS / 1000, 1, 0.002);
// the circle at the end finishes before the shower does (TileConfetti's 3.6 s)
const SWEEP_MS = 3400;
// one whole turn at autoRotateSpeed 60 / 25 (one turn in 25 s)
const TURN_ONCE_MS = 25_000;

/** What the browser tests read through window.__viewer. */
const stats = { yaw: 0, frames: 0, calls: 0 };

declare global {
  interface Window {
    __viewer?: { yaw: () => number; age: Age; autoRotate: () => boolean; frames: () => number; calls: () => number; shown: () => number };
  }
}

function Turntable({ yaw, still, onRest, children }: { yaw: number; still: boolean; onRest: () => void; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  // a turn is a spring pulling the angle to `to`: let go at `x0` away from it, moving at `v0`; `v` is how fast it goes now
  const turn = useRef({ start: 0, x0: 0, v0: 0, to: 0, v: 0 });
  useEffect(() => {
    if (!g.current) return;
    const t = turn.current;
    // with motion reduced the turn is instant: nothing to ease from
    if (still) {
      t.start = 0;
      t.to = yaw;
      g.current.rotation.y = yaw;
      stats.yaw = yaw;
      onRest();
    } else {
      // a turn that was moving carries its speed into the next, so tapping again feels continuous
      turn.current = { start: performance.now(), x0: g.current.rotation.y - yaw, v0: t.start ? t.v : 0, to: yaw, v: 0 };
    }
    invalidate();
  }, [yaw, still, invalidate, onRest]);
  useFrame(() => {
    if (!g.current) return;
    const t = turn.current;
    if (!t.start) return;
    const st = springAt(TURN, (performance.now() - t.start) / 1000, t.x0, t.v0);
    t.v = st.v;
    if (atRest(st, 0.002, 0.02)) {
      // exactly on its quarter
      t.start = 0;
      g.current.rotation.y = t.to;
      stats.yaw = t.to;
      onRest();
      return;
    }
    g.current.rotation.y = t.to + st.x;
    stats.yaw = g.current.rotation.y;
    invalidate();
  });
  return <group ref={g}>{children}</group>;
}

/** Eases the camera and where it looks (`target`, from `distance`) to each new view, from wherever it is now; `sweep`
    circles the model once and, ended early or not, eases back to the view. It owns the orbit controls' target. */
function CameraRig({ target, distance, focusKey, sweep, still, look }: { target: THREE.Vector3; distance: number; focusKey: number; sweep: boolean; still: boolean; look: Look }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const invalidate = useThree((s) => s.invalidate);
  const anim = useRef({
    start: 0,
    fromT: new THREE.Vector3(),
    fromP: new THREE.Vector3(),
    toT: new THREE.Vector3(),
    toP: new THREE.Vector3(),
    /** where the camera looks now, eased: the start of the next move */
    curT: new THREE.Vector3(),
    sweepStart: 0,
    dirty: true,
  });
  const first = useRef(true);
  const aimKey = `${target.x.toFixed(3)},${target.y.toFixed(3)},${target.z.toFixed(3)}`;

  useEffect(() => {
    const a = anim.current;
    const toP = viewFrom(target, distance, 0, look);
    a.fromT.copy(first.current ? target : a.curT);
    a.fromP.copy(first.current ? toP : camera.position);
    a.toT.copy(target);
    a.toP.copy(toP);
    a.start = first.current || still ? 0 : performance.now();
    a.dirty = true;
    first.current = false;
    invalidate();
    // aimKey and distance stand for the target; focusKey eases again on each step even if the aim is the same
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey, aimKey, distance, still]);

  useEffect(() => {
    const a = anim.current;
    if (sweep && !still) a.sweepStart = performance.now();
    else if (a.sweepStart) {
      // ended early (a tap) or with motion reduced: ease from where the circle got to back to the view
      a.sweepStart = 0;
      a.fromP.copy(camera.position);
      a.fromT.copy(a.curT);
      a.start = still ? 0 : performance.now();
      a.dirty = true;
    }
    invalidate();
  }, [sweep, still, camera, invalidate]);

  useFrame(() => {
    const a = anim.current;
    const secs = a.start ? (performance.now() - a.start) / 1000 : 1e3;
    const k = a.start ? Math.min(1, secs / (FOCUS_MS / 1000)) : 1;
    const e = k >= 1 ? 1 : springStep(FOCUS, secs);
    const t = a.fromT.clone().lerp(a.toT, e);
    let p = a.fromP.clone().lerp(a.toP, e);
    if (a.sweepStart) {
      const s = Math.min(1, (performance.now() - a.sweepStart) / SWEEP_MS);
      p = viewFrom(t, a.toP.distanceTo(a.toT) * (1 - 0.12 * Math.sin(s * Math.PI)), easeInOut(s) * Math.PI * 2, look);
      if (s >= 1) {
        a.sweepStart = 0;
        a.dirty = true;
        p = a.toP.clone();
      } else invalidate();
    }
    a.curT.copy(t);
    if (k < 1 || a.sweepStart || a.dirty) {
      a.dirty = false;
      camera.position.copy(p);
      if (controls) {
        controls.target.copy(t);
        controls.update();
      } else camera.lookAt(t);
      if (k < 1) invalidate();
    } else if (!controls) camera.lookAt(t);
  });
  return null;
}

/** Keeps frames coming while the 9–10 view turns by itself. */
function Spin({ on }: { on: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    if (on) invalidate();
  });
  useEffect(() => {
    if (on) invalidate();
  }, [on, invalidate]);
  return null;
}

function Counter() {
  const gl = useThree((s) => s.gl);
  // three counts per render() and starts again at each one; a frame has more than one (the contact shadow draws the
  // scene too), so count them all and start again once a frame (2.8.1)
  useEffect(() => {
    gl.info.autoReset = false;
    return () => {
      gl.info.autoReset = true;
    };
  }, [gl]);
  useFrame((state) => {
    stats.frames++;
    // every pass of the last frame, for the browser tests
    stats.calls = state.gl.info.render.calls;
    state.gl.info.reset();
  });
  return null;
}

/** Counts changes of the page's light or dark (the iPad's setting, or a grown-up's choice in Settings) and of the
    look (3.0), so the 3D reads its colours again. */
function useGround(): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    const bump = () => setN((x) => x + 1);
    const mq = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;
    mq?.addEventListener("change", bump);
    const mo = typeof MutationObserver === "function" ? new MutationObserver(bump) : null;
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-look"] });
    return () => {
      mq?.removeEventListener("change", bump);
      mo?.disconnect();
    };
  }, []);
  return n;
}

/** The size of the view this canvas gets, for framing. */
function useSize(el: React.RefObject<HTMLDivElement | null>): { w: number; h: number } {
  const [size, setSize] = useState({ w: 1120, h: 800 });
  useEffect(() => {
    if (!el.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.max(1, e.contentRect.width), h: Math.max(1, e.contentRect.height) }));
    ro.observe(el.current);
    return () => ro.disconnect();
  }, [el]);
  return size;
}

/** Shifts the picture up by `y` px, so the model sits in the part of a full-screen stage the panels leave clear. */
function Offset({ y }: { y: number }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (y) camera.setViewOffset(size.width, size.height, 0, y, size.width, size.height);
    else camera.clearViewOffset();
    invalidate();
  }, [camera, y, size.width, size.height, invalidate]);
  return null;
}

/** Reports where the marker is on the screen whenever the view is drawn and it has moved. Mounted after the camera rig,
    so it reads the camera as this frame draws it. */
function TargetWatch({ marker, onTarget }: { marker: React.RefObject<THREE.Object3D | null>; onTarget: (x: number, y: number) => void }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const v = useMemo(() => new THREE.Vector3(), []);
  const last = useRef({ x: NaN, y: NaN });
  useFrame(() => {
    if (!marker.current) return;
    marker.current.getWorldPosition(v).project(camera);
    const x = ((v.x + 1) / 2) * size.width;
    const y = ((1 - v.y) / 2) * size.height;
    if (Math.abs(x - last.current.x) < 0.5 && Math.abs(y - last.current.y) < 0.5) return;
    last.current = { x, y };
    onTarget(x, y);
  });
  return null;
}

export interface ViewerProps {
  project: Project;
  shown: number;
  leg: number;
  instead?: Record<number, ShapeId>;
  current?: number[];
  settled?: number;
  /** quarter turns from the child's side */
  turns?: number;
  /** changes on each new step: the view eases toward the new tiles */
  stepKey?: number;
  /** a line was just spoken: the 9–10 view stops turning by itself */
  hush?: number;
  /** circle the finished model once */
  sweep?: boolean;
  /** px of the view covered by panels at the top and bottom: the model is framed in what is left */
  inset?: { top: number; bottom: number };
  /** let the 9–10 model turn by itself (off behind the rest screen and at the end, so the iPad can rest) */
  spin?: boolean;
  paint?: number;
  /** All steps is open (3.8): steps change at once as the child scrubs, and the view holds on the whole build */
  browse?: boolean;
  /** seconds the new tiles wait before they drop (3.9: while Pip carries them over) */
  hold?: number;
  /** where this step's tiles are on the screen, in px from the view's top left, each time the view moves (3.9) */
  onTarget?: (x: number, y: number) => void;
  /** the model has come to rest: the tiles have landed, or a turn has ended (3.9) */
  onRest?: () => void;
  label: string;
}

export function Viewer({ project, shown, leg, instead, current, settled, turns = 0, stepKey = 0, hush = 0, sweep = false, inset, spin = true, paint = 0, browse = false, hold, onTarget, onRest, label }: ViewerProps) {
  const age = project.age;
  const still = useStill();
  const wrap = useRef<HTMLDivElement>(null);
  const size = useSize(wrap);
  const clear = Math.max(size.h * 0.4, size.h - (inset?.top ?? 0) - (inset?.bottom ?? 0));
  const aspect = Math.max(0.4, size.w / size.h);
  const offsetY = ((inset?.bottom ?? 0) - (inset?.top ?? 0)) / 2;
  const whole = useMemo(() => frameOf(project, leg), [project, leg]);
  const built = useMemo(() => {
    if (browse) return whole;
    const upto = Array.from({ length: Math.max(1, Math.min(shown, project.placed.length)) }, (_, i) => i);
    return frameOf(project, leg, upto);
  }, [project, leg, shown, browse, whole]);
  const focus = useMemo(() => {
    const mid = built.middle.clone().sub(whole.center);
    mid.y = Math.min(built.height * 0.38, 2.4);
    if (browse || !current?.length || shown >= project.placed.length) return mid;
    const step = frameOf(project, leg, current).middle.sub(whole.center);
    return mid.lerp(new THREE.Vector3(step.x, Math.min(step.y, built.height * 0.6), step.z), 0.2);
  }, [project, leg, current, shown, whole, built, browse]);
  // while browsing, the view doesn't ease to each step: it holds on the whole build
  const focusKey = useRef(stepKey);
  if (!browse) focusKey.current = stepKey;
  const [touched, setTouched] = useState(false);
  // bumped when the model comes to rest: the contact shadow is drawn again then
  const [shade, setShade] = useState(0);
  const restOut = useRef(onRest);
  restOut.current = onRest;
  const rest = useCallback(() => {
    setShade((n) => n + 1);
    restOut.current?.();
  }, []);
  // the middle of this step's tiles, where Pip points (3.9)
  const marker = useRef<THREE.Object3D>(null);
  const point = useMemo(() => (current?.length ? frameOf(project, leg, current) : whole).middle, [project, leg, current, whole]);
  const autoRotate = older(age) && spin && !still && !touched && !sweep;
  // the iPad's light or dark can change while a build is open: read the colours again
  const ground = useGround();
  const tint = paint + ground;
  // Turntable turns the model about the middle of its footprint: turn the aim with it, so the built tiles stay in view
  const aim = useMemo(() => focus.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), (turns * Math.PI) / 2), [focus, turns]);
  const look = lookOf(project);
  // frame what is built so far, with room for the next tiles (2.8.1): its box, turned as the model is, fitted by width
  // and by height apart; a view the child can turn is fitted for every way it can face
  const distance = useMemo(() => {
    const room = new THREE.Vector3(0.6, 0.3, 0.6);
    const min = built.min.clone().sub(room).max(whole.min).sub(whole.center);
    const max = built.max.clone().add(room).min(whole.max).sub(whole.center);
    const yaw = (turns * Math.PI) / 2;
    const corners = cornersOf(min, max).map((c) => c.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).sub(aim));
    return Math.max(4, fitBox(corners, aspect, clear / size.h, look, age === "a" ? [0] : ANY_YAW));
  }, [built, whole, turns, aim, aspect, clear, size.h, look, age]);
  const soft = softwareGL();
  const big = project.placed.length > BIG_BUILD;
  // a big build draws a lot a pixel: at most 1.5× (2.8.1), as on smaller devices
  const sharpest = big || (typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4) ? 1.5 : 2;
  // 2.4: if turning the model drops frames, draw fewer pixels (down to the screen's own 1×), and sharpen again when it
  // keeps up (3.1: FrameWatch, which counts only moving frames)
  const [top, setTop] = useState(sharpest);
  const dpr: [number, number] = soft ? [0.75, 0.75] : [1, top];

  useEffect(() => setTouched(false), [project.id]);
  // a big build turns once by itself, then rests, so the iPad doesn't draw it at 60 frames a second until touched
  useEffect(() => {
    if (!autoRotate || !big) return;
    const t = setTimeout(() => setTouched(true), TURN_ONCE_MS);
    return () => clearTimeout(t);
  }, [autoRotate, big]);
  // shared geometry, materials and textures are kept between builds; let them go when the stage closes
  useEffect(() => () => releaseShared(), []);
  useEffect(() => {
    if (hush) setTouched(true);
  }, [hush]);
  useEffect(() => {
    window.__viewer = { yaw: () => stats.yaw, age, autoRotate: () => autoRotate, frames: () => stats.frames, calls: () => stats.calls, shown: () => shown };
  }, [age, autoRotate, shown]);

  const start = viewFrom(aim, distance, 0, look);
  return (
    <div ref={wrap} className="h-full w-full" role="img" aria-label={label} style={{ touchAction: age === "a" ? "pan-y" : "none" }}>
      <Canvas dpr={dpr} frameloop="demand" camera={{ position: start.toArray(), fov: FOV, near: 0.1, far: 200 }} gl={{ antialias: true }}>
        {/* frames dropping: the look's effects go first (3.0), then sharpness; keeping up: sharpness first, then effects */}
        {!soft && (
          <FrameWatch
            onDecline={() => (currentTier() !== "low" ? slower() : setTop((t) => Math.max(1, t - 0.5)))}
            onIncline={() => (top < sharpest ? setTop((t) => Math.min(sharpest, t + 0.5)) : faster())}
          />
        )}
        <Stage paint={tint} radius={whole.size} reach={older(age) ? distance * 1.8 : distance} shade={shade} />
        <Turntable yaw={(turns * Math.PI) / 2} still={still} onRest={rest}>
          <Model project={project} shown={shown} leg={leg} instead={instead} current={current} settled={settled} still={still} browse={browse} paint={tint} hold={hold} onRest={rest} />
          <group position={[-whole.center.x, 0, -whole.center.z]}>
            <object3D ref={marker} position={point} />
          </group>
        </Turntable>
        {age !== "a" && (
          <OrbitControls
            enableZoom={older(age)}
            enablePan={false}
            minDistance={older(age) ? distance * 0.45 : undefined}
            maxDistance={older(age) ? distance * 1.8 : undefined}
            maxPolarAngle={Math.PI * 0.47}
            autoRotate={autoRotate}
            autoRotateSpeed={60 / 25}
            onStart={() => setTouched(true)}
            makeDefault
          />
        )}
        <CameraRig target={aim} distance={distance} focusKey={focusKey.current} sweep={sweep} still={still} look={look} />
        <Offset y={offsetY} />
        {onTarget && <TargetWatch marker={marker} onTarget={onTarget} />}
        <Spin on={autoRotate} />
        <Counter />
      </Canvas>
    </div>
  );
}
