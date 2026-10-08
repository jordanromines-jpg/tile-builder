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
import { lite } from "./TileMesh";

let envCache: { gl: THREE.WebGLRenderer; tex: THREE.Texture } | null = null;

function environment(gl: THREE.WebGLRenderer): THREE.Texture {
  if (envCache?.gl === gl) return envCache.tex;
  const pmrem = new THREE.PMREMGenerator(gl);
  const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  envCache = { gl, tex };
  return tex;
}

/** Where the fog starts and is whole, and how big the table is, for a model `radius` across seen from as far as
    `reach` (2.8.1): the fog begins past the model's far side, so the whole model is always clear, and the table runs
    on into the full fog, so its edge never shows. A fixed fog (22 to 60) blanked builds the camera stands back from. */
export function fogFor(reach: number, radius: number) {
  const near = reach + radius;
  const far = near + Math.max(30, radius * 2);
  return { near, far, table: 2 * (far + radius) };
}

/** Light, environment and background for any tile scene (also used by the picture renderer). */
export function lightScene(scene: THREE.Scene, gl: THREE.WebGLRenderer, bg: string | null, fog = fogFor(22, 0)) {
  // without a GPU the room's reflections cost too much a pixel: plain lights only
  scene.environment = lite() ? null : environment(gl);
  scene.environmentIntensity = 0.55;
  if (bg) {
    const c = new THREE.Color(bg);
    scene.background = c;
    scene.fog = new THREE.Fog(c, fog.near, fog.far);
  }
}

/** `reach`: the furthest the camera can stand from the model; `shade` changes when the model comes to rest, and the
    contact shadow is drawn again then, not on every frame (2.8.1). */
export function Stage({ paint, radius, reach, shade = 0, contact = true }: { paint: number; radius: number; reach: number; shade?: number; contact?: boolean }) {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  const dark = useMemo(() => isDark(), [paint]); // eslint-disable-line react-hooks/exhaustive-deps
  const wood = useMemo(() => woodTexture(dark), [dark]);
  // a step in reach (half a square) is enough: the fog doesn't move with every eased frame of the camera
  const fog = useMemo(() => fogFor(Math.ceil(reach * 2) / 2, radius), [reach, radius]);
  useEffect(() => {
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = dark ? 0.95 : 1.0;
    lightScene(scene, gl, cssColour("stage", dark ? "#1E2433" : "#F6E7D2"), fog);
    // the far plane past the whole table: nothing is clipped zoomed out
    camera.far = Math.max(200, fog.far + fog.table / 2);
    camera.updateProjectionMatrix();
    invalidate();
  }, [scene, gl, camera, dark, paint, fog, invalidate]);
  useEffect(() => {
    // the wood keeps its grain size on a bigger table
    if (wood) wood.repeat.set((14 * fog.table) / 80, (14 * fog.table) / 80);
    invalidate();
  }, [wood, fog.table, invalidate]);
  useEffect(() => invalidate(), [shade, invalidate]);
  const s = Math.max(6, radius * 1.3);
  return (
    <>
      <hemisphereLight args={[0xfff4e6, 0x6b5a48, (dark ? 0.35 : 0.5) + (lite() ? 0.9 : 0)]} />
      <directionalLight position={[5, 10, 7]} intensity={dark ? 1.3 : 1.7} color={0xfff1de} />
      <directionalLight position={[-6, 5, -5]} intensity={0.55} color={0xd8e6ff} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[fog.table, fog.table]} />
        <meshStandardMaterial map={wood ?? undefined} color={wood ? 0xffffff : dark ? 0x4a3122 : 0xe6c79a} roughness={0.62} metalness={0} />
      </mesh>
      {/* frames={1}: drei counts its frames afresh each time it renders, so a new `shade` draws the shadow once more */}
      {contact && !lite() && <ContactShadows key="shadow" name={`shade-${shade}`} frames={1} position={[0, 0.003, 0]} scale={s * 2.2} blur={2.4} far={Math.max(3, radius)} opacity={dark ? 0.55 : 0.42} resolution={512} color="#2a1a0c" />}
    </>
  );
}
