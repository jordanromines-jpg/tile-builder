/* The 3D viewer (sprint 2, changes 2 and 3). The project's age sets how it moves:
     a (3–5)  a still three-quarter view; ◀ ▶ turn it a quarter; it never turns by itself (D10); no dragging
     b (6–8)  ◀ ▶ and one-finger drag to turn
     c (9–10) turn and zoom freely; a slow turn (one in 25 s) until touched, and never under reduced motion
   Each new step eases the view toward the tiles being placed. `sweep` circles the finished model once (the end of a
   build). Performance: pixel ratio at most 2 (1.5 on smaller devices, 1 without a GPU), frames drawn only when something moves. */
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { ShapeId } from "../engine/catalog";
import type { Age, Project } from "../engine/types";
import { softwareGL } from "../gpu";
import { older } from "../ui/kid/AgeContext";
import { useStill } from "../ui/motion";
import { easeInOut, fitDistance, FOV, viewFrom } from "./camera";
import { frameOf, Model, releaseShared } from "./Model";
import { Stage } from "./Stage";

export const TURN_MS = 600;
const FOCUS_MS = 700;
// the circle at the end finishes before the shower does (TileConfetti's 3.6 s)
const SWEEP_MS = 3400;

/** What the browser tests read through window.__viewer. */
const stats = { yaw: 0, frames: 0 };

declare global {
  interface Window {
    __viewer?: { yaw: () => number; age: Age; autoRotate: () => boolean; frames: () => number };
  }
}

function Turntable({ yaw, still, children }: { yaw: number; still: boolean; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const from = useRef({ start: 0, from: 0, to: 0 });
  useEffect(() => {
    if (!g.current) return;
    // with motion reduced the turn is instant: nothing to ease from
    from.current = still ? { start: 0, from: yaw, to: yaw } : { start: performance.now(), from: g.current.rotation.y, to: yaw };
    invalidate();
  }, [yaw, still, invalidate]);
  useFrame(() => {
    if (!g.current) return;
    const f = from.current;
    const k = f.start ? Math.min(1, (performance.now() - f.start) / TURN_MS) : 1;
    g.current.rotation.y = f.from + (f.to - f.from) * (1 - Math.pow(1 - k, 3));
    stats.yaw = g.current.rotation.y;
    if (k < 1) invalidate();
  });
  return <group ref={g}>{children}</group>;
}

/** Eases the camera and where it looks (`target`, from `distance`) to each new view, from wherever it is now; `sweep`
    circles the model once and, ended early or not, eases back to the view. It owns the orbit controls' target. */
function CameraRig({ target, distance, focusKey, sweep, still }: { target: THREE.Vector3; distance: number; focusKey: number; sweep: boolean; still: boolean }) {
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
    const toP = viewFrom(target, distance);
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
    const k = a.start ? Math.min(1, (performance.now() - a.start) / FOCUS_MS) : 1;
    const e = easeInOut(k);
    const t = a.fromT.clone().lerp(a.toT, e);
    let p = a.fromP.clone().lerp(a.toP, e);
    if (a.sweepStart) {
      const s = Math.min(1, (performance.now() - a.sweepStart) / SWEEP_MS);
      p = viewFrom(t, a.toP.distanceTo(a.toT) * (1 - 0.12 * Math.sin(s * Math.PI)), easeInOut(s) * Math.PI * 2);
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
  useFrame(() => {
    stats.frames++;
  });
  return null;
}

/** Counts changes of the page's light or dark (the iPad's setting, or a grown-up's choice in Settings). */
function useGround(): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    const bump = () => setN((x) => x + 1);
    const mq = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;
    mq?.addEventListener("change", bump);
    const mo = typeof MutationObserver === "function" ? new MutationObserver(bump) : null;
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
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
  label: string;
}

export function Viewer({ project, shown, leg, instead, current, settled, turns = 0, stepKey = 0, hush = 0, sweep = false, inset, spin = true, paint = 0, label }: ViewerProps) {
  const age = project.age;
  const still = useStill();
  const wrap = useRef<HTMLDivElement>(null);
  const size = useSize(wrap);
  const clear = Math.max(size.h * 0.4, size.h - (inset?.top ?? 0) - (inset?.bottom ?? 0));
  const aspect = Math.max(0.4, size.w / size.h);
  const offsetY = ((inset?.bottom ?? 0) - (inset?.top ?? 0)) / 2;
  const whole = useMemo(() => frameOf(project, leg), [project, leg]);
  const built = useMemo(() => {
    const upto = Array.from({ length: Math.max(1, Math.min(shown, project.placed.length)) }, (_, i) => i);
    return frameOf(project, leg, upto);
  }, [project, leg, shown]);
  // frame what is built so far (with room for the next tiles), pulling back as the build grows
  const span = Math.max(2.2, built.size * 1.1, Math.min(whole.size, built.size + 1.2));
  const distance = fitDistance(span, aspect, Math.min(span, built.height + 0.6), clear / size.h);
  const focus = useMemo(() => {
    const mid = built.middle.clone().sub(whole.center);
    mid.y = Math.min(built.height * 0.38, 2.4);
    if (!current?.length || shown >= project.placed.length) return mid;
    const step = frameOf(project, leg, current).middle.sub(whole.center);
    return mid.lerp(new THREE.Vector3(step.x, Math.min(step.y, built.height * 0.6), step.z), 0.2);
  }, [project, leg, current, shown, whole, built]);
  const [touched, setTouched] = useState(false);
  const autoRotate = older(age) && spin && !still && !touched && !sweep;
  // the iPad's light or dark can change while a build is open: read the colours again
  const ground = useGround();
  const tint = paint + ground;
  // Turntable turns the model about the middle of its footprint: turn the aim with it, so the built tiles stay in view
  const aim = useMemo(() => focus.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), (turns * Math.PI) / 2), [focus, turns]);
  const dpr: [number, number] = softwareGL() ? [0.75, 0.75] : [1, typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4 ? 1.5 : 2];

  useEffect(() => setTouched(false), [project.id]);
  // shared geometry, materials and textures are kept between builds; let them go when the stage closes
  useEffect(() => () => releaseShared(), []);
  useEffect(() => {
    if (hush) setTouched(true);
  }, [hush]);
  useEffect(() => {
    window.__viewer = { yaw: () => stats.yaw, age, autoRotate: () => autoRotate, frames: () => stats.frames };
  }, [age, autoRotate]);

  const start = viewFrom(aim, distance);
  return (
    <div ref={wrap} className="h-full w-full" role="img" aria-label={label} style={{ touchAction: age === "a" ? "pan-y" : "none" }}>
      <Canvas dpr={dpr} frameloop="demand" camera={{ position: start.toArray(), fov: FOV, near: 0.1, far: 200 }} gl={{ antialias: true }}>
        <Stage paint={tint} radius={whole.size} />
        <Turntable yaw={(turns * Math.PI) / 2} still={still}>
          <Model project={project} shown={shown} leg={leg} instead={instead} current={current} settled={settled} still={still} paint={tint} />
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
        <CameraRig target={aim} distance={distance} focusKey={stepKey} sweep={sweep} still={still} />
        <Offset y={offsetY} />
        <Spin on={autoRotate} />
        <Counter />
      </Canvas>
    </div>
  );
}
