/* The design page's 3D row: one tile of each shape, each colour in turn, turning slowly (still under reduced motion). */
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { COLOURS, SHAPE_IDS } from "../../engine/catalog";
import { TileMesh } from "../../three/TileMesh";

function Turning({ children, x }: { children: ReactNode; x: number }) {
  const g = useRef<THREE.Group>(null);
  const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  useFrame((_, dt) => {
    if (g.current && !still) g.current.rotation.y += dt * 0.5;
  });
  return (
    <group ref={g} position={[x, 0, 0]} rotation={[0, 0.5, 0]}>
      <group position={[-0.5, -0.6, 0]}>{children}</group>
    </group>
  );
}

export function TileTurntable({ paint }: { paint: number }) {
  return (
    <div className="h-48 w-full overflow-hidden rounded-lg" style={{ background: "var(--stage)" }} role="img" aria-label="One tile of each shape, turning">
      <Canvas camera={{ position: [0, 0.8, 6], fov: 36 }} dpr={[1, 2]}>
        <hemisphereLight args={[0xffffff, 0x8899aa, 1.1]} />
        <directionalLight position={[6, 12, 7]} intensity={0.9} />
        {SHAPE_IDS.map((s, i) => (
          <Turning key={s} x={(i - (SHAPE_IDS.length - 1) / 2) * 1.9}>
            <group scale={s === "square-large" || s === "rect-2x1" ? 0.6 : 1}>
              <TileMesh shape={s} colour={COLOURS[i % COLOURS.length]} paint={paint} />
            </group>
          </Turning>
        ))}
      </Canvas>
    </div>
  );
}
