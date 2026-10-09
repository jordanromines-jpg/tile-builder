/* The design page's Pip truck row (4.0b): the truck turning on the app's own stage, beside a tile on a 30° ramp for
   scale, with fixed views for looking at it and a bounce to see the springs work. */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { S } from "../../strings";
import { Stage } from "../../three/Stage";
import { TileMesh } from "../../three/TileMesh";
import { Truck } from "../../three/truck/Truck";
import { REST_COMPRESS, restPose, TRUCK, type TruckPose } from "../../three/truck/spec";
import { Row } from "./Row";

type View = keyof typeof S.truck.views;
const VIEWS = Object.keys(S.truck.views) as View[];
const TARGET = new THREE.Vector3(0.32, 0.58, 0);
const DIST = 3.05;
/** [azimuth, elevation] of each fixed view; the camera starts at the front three-quarter */
const ANGLES: Record<Exclude<View, "turn">, [number, number]> = {
  front: [0, 0.12],
  side: [-Math.PI / 2, 0.08],
  back: [Math.PI, 0.12],
  top: [0.001, Math.PI / 2 - 0.02],
};
const START: [number, number] = [0.62, 0.3];

declare global {
  interface Window {
    /** what the browser tests (and the pictures of the truck) read and set */
    __truck?: { frames: () => number; look: (az: number, el: number) => void; rate: (radiansPerSecond: number) => void; bounce: () => void };
  }
}

function Camera({ view, rate, look }: { view: View; rate: React.RefObject<number>; look: React.RefObject<(az: number, el: number) => void> }) {
  const cam = useThree((s) => s.camera);
  const angle = useRef<[number, number]>([...START]);
  const turning = useRef(view === "turn");
  useEffect(() => {
    turning.current = view === "turn";
    if (view !== "turn") angle.current = [...ANGLES[view]];
  }, [view]);
  useEffect(() => {
    look.current = (az, el) => {
      turning.current = false;
      angle.current = [az, el];
    };
  }, [look]);
  useFrame((_, dt) => {
    if (turning.current) angle.current[0] += dt * rate.current;
    const [az, el] = angle.current;
    cam.position.set(TARGET.x + DIST * Math.sin(az) * Math.cos(el), TARGET.y + DIST * Math.sin(el), TARGET.z + DIST * Math.cos(az) * Math.cos(el));
    cam.lookAt(TARGET);
  });
  return null;
}

/** A soft shadow under the truck, drawn once as a gradient. */
function Blob() {
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    if (!g) return null;
    const grad = g.createRadialGradient(64, 64, 6, 64, 64, 62);
    grad.addColorStop(0, "rgba(30,15,5,0.55)");
    grad.addColorStop(0.55, "rgba(30,15,5,0.3)");
    grad.addColorStop(1, "rgba(30,15,5,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  if (!map) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} renderOrder={-1}>
      <planeGeometry args={[1.9, 2.3]} />
      <meshBasicMaterial map={map} transparent depthWrite={false} />
    </mesh>
  );
}

/** The springs working: the four corners go up and down out of step, the wheels turn and the front wheels steer. */
function bouncePose(t: number): TruckPose {
  const p = restPose();
  const c = p.wheels.map((_, i) => REST_COMPRESS + 0.34 + 0.3 * Math.sin(t * 7 + i * 1.9));
  p.wheels.forEach((w, i) => {
    w.compress = c[i];
    w.spin = t * 6;
    w.steer = i < 2 ? 0.3 * Math.sin(t * 2.6) : 0;
  });
  const mean = c.reduce((a, b) => a + b, 0) / 4;
  p.pos = [0, -(mean - REST_COMPRESS) * TRUCK.travel, 0];
  return p;
}

export function TruckRow({ paint }: { paint: number }) {
  const [view, setView] = useState<View>("turn");
  const still = useMemo(() => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const rate = useRef(still ? 0 : 0.45);
  const until = useRef(0);
  const reset = useRef(false);
  const look = useRef<(az: number, el: number) => void>(() => {});
  const frames = useRef(0);
  const clock = useRef(0);
  const ramp = useMemo(() => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 3), []);
  useEffect(() => {
    window.__truck = { frames: () => frames.current, look: (az, el) => look.current(az, el), rate: (r) => (rate.current = r), bounce: () => (until.current = clock.current + 2.4) };
    return () => {
      delete window.__truck;
    };
  }, []);
  const drive = (t: number): TruckPose | null => {
    clock.current = t;
    frames.current++;
    if (t < until.current) {
      reset.current = true;
      return bouncePose(t);
    }
    if (reset.current) {
      reset.current = false;
      return restPose();
    }
    return null;
  };
  return (
    <Row title={S.truck.title} note={S.truck.note}>
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label={S.truck.viewGroup} className="flex flex-wrap gap-2">
            {VIEWS.map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className="min-h-11 rounded-md border border-line px-4 aria-pressed:bg-accent aria-pressed:text-accent-ink">
                {S.truck.views[v]}
              </button>
            ))}
          </div>
          {!still && (
            <button type="button" onClick={() => window.__truck?.bounce()} className="min-h-11 rounded-md border border-line px-4">
              {S.truck.bounce}
            </button>
          )}
        </div>
        <div className="h-[460px] w-full overflow-hidden rounded-lg" role="img" aria-label={S.truck.label}>
          <Canvas dpr={[1, 2]} camera={{ fov: 34, near: 0.1, far: 200 }} gl={{ antialias: true }}>
            <Camera view={view} rate={rate} look={look} />
            <Stage paint={paint} radius={1.6} reach={5} />
            <Blob />
            <Truck paint={paint} alive={!still} drive={drive} />
            <TileMesh shape="square" colour="blue" leg={1} position={[0.9, 0, 0.35]} quaternion={ramp} paint={paint} />
          </Canvas>
        </div>
      </div>
    </Row>
  );
}
