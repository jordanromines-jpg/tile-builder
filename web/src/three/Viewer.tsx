/* The 3D viewer (plan keys 6b, 6c). The project's age sets how it moves:
     a (3–5)  a still view from the child's side; ◀ ▶ turn it a quarter; it never turns by itself (D10); no dragging
     b (6–8)  ◀ ▶ and one-finger drag to turn; back to the child's side on each new step
     c (9–10) turn and zoom freely; a slow turn (one in 25 s) until touched, and never under reduced motion
   Performance: pixel ratio at most 2, frames drawn only when something moves, geometry shared a shape. */
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { ShapeId } from "../engine/catalog";
import type { Age, Project } from "../engine/types";
import { useStill } from "../ui/motion";
import { frameOf, Model } from "./Model";
import { cssColour } from "./tile";

export const TURN_MS = 600;

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
    from.current = { start: performance.now(), from: g.current.rotation.y, to: yaw };
    if (still) g.current.rotation.y = yaw;
    invalidate();
  }, [yaw, still, invalidate]);
  useFrame(() => {
    if (!g.current) return;
    const f = from.current;
    const k = Math.min(1, (performance.now() - f.start) / TURN_MS);
    const e = 1 - Math.pow(1 - k, 3);
    g.current.rotation.y = f.from + (f.to - f.from) * e;
    stats.yaw = g.current.rotation.y;
    if (k < 1) invalidate();
  });
  return <group ref={g}>{children}</group>;
}

function Scene({ paint, radius }: { paint: number; radius: number }) {
  const scene = useThree((s) => s.scene);
  const ground = useMemo(() => new THREE.Color(cssColour("ground", "#9fbcd4")), [paint]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    scene.background = new THREE.Color(cssColour("stage", "#cfe2f1"));
  }, [scene, paint]);
  const s = Math.max(7, radius * 1.2);
  return (
    <>
      <hemisphereLight args={[0xffffff, 0x8899aa, 1.6]} />
      <directionalLight
        position={[6, 12, 7]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-s}
        shadow-camera-right={s}
        shadow-camera-top={s}
        shadow-camera-bottom={-s}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0008}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[Math.max(8, radius * 1.4), 64]} />
        <meshStandardMaterial color={ground} roughness={1} />
      </mesh>
    </>
  );
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

export interface ViewerProps {
  project: Project;
  shown: number;
  leg: number;
  instead?: Record<number, ShapeId>;
  current?: number[];
  settled?: number;
  /** quarter turns from the child's side */
  turns?: number;
  /** changes on each new step: 6–8 goes back to the child's side */
  stepKey?: number;
  /** a line was just spoken: the 9–10 view stops turning by itself */
  hush?: number;
  paint?: number;
  label: string;
}

export function Viewer({ project, shown, leg, instead, current, settled, turns = 0, stepKey = 0, hush = 0, paint = 0, label }: ViewerProps) {
  const age = project.age;
  const still = useStill();
  const frame = useMemo(() => frameOf(project, leg), [project, leg]);
  const d = frame.size * 1.5 + 4.5;
  const target: [number, number, number] = [0, Math.min(frame.height * 0.45, 2.5), 0];
  const camPos: [number, number, number] = [0, target[1] + d * 0.5, d];
  const controls = useRef<OrbitControlsImpl>(null);
  const [touched, setTouched] = useState(false);
  const autoRotate = age === "c" && !still && !touched;

  useEffect(() => setTouched(false), [project.id]);
  useEffect(() => {
    if (hush) setTouched(true);
  }, [hush]);
  useEffect(() => {
    if (age === "b") controls.current?.reset();
  }, [stepKey, age]);
  useEffect(() => {
    window.__viewer = { yaw: () => stats.yaw, age, autoRotate: () => autoRotate, frames: () => stats.frames };
  }, [age, autoRotate]);

  return (
    <div className="h-full w-full" role="img" aria-label={label} style={{ touchAction: age === "a" ? "pan-y" : "none" }}>
      <Canvas shadows dpr={[1, 2]} frameloop="demand" camera={{ position: camPos, fov: 36, near: 0.1, far: 200 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <Scene paint={paint} radius={frame.size} />
        <Turntable yaw={(turns * Math.PI) / 2} still={still}>
          <Model project={project} shown={shown} leg={leg} instead={instead} current={current} settled={settled} still={still} paint={paint} />
        </Turntable>
        {age !== "a" && (
          <OrbitControls
            ref={controls}
            target={target}
            enableZoom={age === "c"}
            enablePan={false}
            minDistance={age === "c" ? Math.max(4, d * 0.4) : undefined}
            maxDistance={age === "c" ? d * 2 : undefined}
            maxPolarAngle={Math.PI * 0.49}
            autoRotate={autoRotate}
            autoRotateSpeed={60 / 25}
            onStart={() => setTouched(true)}
            makeDefault
          />
        )}
        {age === "a" && <AimAt target={target} />}
        <Spin on={autoRotate} />
        <Counter />
      </Canvas>
    </div>
  );
}

/** The fixed 3–5 view looks at the middle of the model. */
function AimAt({ target }: { target: [number, number, number] }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    camera.lookAt(...target);
    invalidate();
  }, [camera, target, invalidate]);
  return null;
}
