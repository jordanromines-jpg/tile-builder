/* The stage (sprint 2, change 2): soft studio light from a room environment (made on the device, no downloads) so the
   plastic shines, a warm key light, a wooden tabletop that fades into the background, and soft contact shadows under
   the model. */
import { ContactShadows } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { isDark } from "../ground";
import { woodTexture } from "./textures";
import { cssColour } from "./tile";

let envCache: { gl: THREE.WebGLRenderer; tex: THREE.Texture } | null = null;

function environment(gl: THREE.WebGLRenderer): THREE.Texture {
  if (envCache?.gl === gl) return envCache.tex;
  const pmrem = new THREE.PMREMGenerator(gl);
  const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  envCache = { gl, tex };
  return tex;
}

/** Light, environment and background for any tile scene (also used by the picture renderer). */
export function lightScene(scene: THREE.Scene, gl: THREE.WebGLRenderer, bg: string | null) {
  scene.environment = environment(gl);
  scene.environmentIntensity = 0.55;
  if (bg) {
    const c = new THREE.Color(bg);
    scene.background = c;
    scene.fog = new THREE.Fog(c, 22, 60);
  }
}

export function Stage({ paint, radius, contact = true }: { paint: number; radius: number; contact?: boolean }) {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const dark = useMemo(() => isDark(), [paint]); // eslint-disable-line react-hooks/exhaustive-deps
  const wood = useMemo(() => woodTexture(dark), [dark]);
  useEffect(() => {
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = dark ? 0.95 : 1.0;
    lightScene(scene, gl, cssColour("stage", dark ? "#1E2433" : "#F6E7D2"));
    invalidate();
  }, [scene, gl, dark, paint, invalidate]);
  const s = Math.max(6, radius * 1.3);
  return (
    <>
      <hemisphereLight args={[0xfff4e6, 0x6b5a48, dark ? 0.35 : 0.5]} />
      <directionalLight position={[5, 10, 7]} intensity={dark ? 1.3 : 1.7} color={0xfff1de} />
      <directionalLight position={[-6, 5, -5]} intensity={0.55} color={0xd8e6ff} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial map={wood ?? undefined} color={wood ? 0xffffff : dark ? 0x4a3122 : 0xe6c79a} roughness={0.62} metalness={0} />
      </mesh>
      {contact && <ContactShadows position={[0, 0.003, 0]} scale={s * 2.2} blur={2.4} far={Math.max(3, radius)} opacity={dark ? 0.55 : 0.42} resolution={512} color="#2a1a0c" />}
    </>
  );
}
