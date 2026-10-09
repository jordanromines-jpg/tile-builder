/* The stage (sprint 2, change 2): soft studio light from a room environment (made on the device, no downloads) so the
   plastic shines, a key and a fill light, a table that fades into the background, and soft contact shadows under the
   model. Since 3.0 every one of those comes from the look (looks/<look>/stage.ts), with its effects by quality tier. */
import { ContactShadows } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { lazy, Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { isDark } from "../ground";
import { STAGES } from "../looks/stages";
import { useLook } from "../looks/useLook";
import { useTier } from "./quality";
import { lite } from "./TileMesh";

// the effects library is big: it loads only when a look asks for an effect at this tier (3.0)
const Effects = lazy(() => import("./Effects").then((m) => ({ default: m.Effects })));

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
export function lightScene(scene: THREE.Scene, gl: THREE.WebGLRenderer, bg: string | null, fog = fogFor(22, 0), environmentIntensity = 0.55) {
  // without a GPU the room's reflections cost too much a pixel: plain lights only
  scene.environment = lite() ? null : environment(gl);
  scene.environmentIntensity = environmentIntensity;
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
  const look = STAGES[useLook()];
  const tier = useTier();
  const floor = useMemo(() => look.floor.texture(dark), [look, dark]);
  // a step in reach (half a square) is enough: the fog doesn't move with every eased frame of the camera
  const fog = useMemo(() => fogFor(Math.ceil(reach * 2) / 2, radius), [reach, radius]);
  const fx = useMemo(() => (lite() ? {} : look.effects(tier, dark)), [look, tier, dark]);
  const effectsOn = !!(fx.ao || fx.bloom || fx.vignette);
  useEffect(() => {
    // with effects on, the effects apply the Neutral curve themselves, last (Effects.tsx): never twice
    gl.toneMapping = effectsOn ? THREE.NoToneMapping : THREE.NeutralToneMapping;
    gl.toneMappingExposure = look.exposure(dark);
    lightScene(scene, gl, look.background(dark), fog, look.environment);
    // the far plane past the whole table: nothing is clipped zoomed out
    camera.far = Math.max(200, fog.far + fog.table / 2);
    camera.updateProjectionMatrix();
    invalidate();
  }, [scene, gl, camera, dark, paint, fog, look, effectsOn, invalidate]);
  useEffect(() => {
    // the floor keeps its pattern's size on a bigger table
    if (floor) floor.repeat.set((look.floor.repeat * fog.table) / 80, (look.floor.repeat * fog.table) / 80);
    invalidate();
  }, [floor, look, fog.table, invalidate]);
  useEffect(() => invalidate(), [shade, invalidate]);
  const s = Math.max(6, radius * 1.3);
  const hemi = look.hemisphere(dark);
  const key = look.key(dark);
  const fill = look.fill(dark);
  return (
    <>
      <hemisphereLight args={[hemi.sky, hemi.ground, hemi.intensity + (lite() ? 0.9 : 0)]} />
      <directionalLight position={key.position} intensity={key.intensity} color={key.color} />
      <directionalLight position={fill.position} intensity={fill.intensity} color={fill.color} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[fog.table, fog.table]} />
        <meshStandardMaterial map={floor ?? undefined} color={floor ? 0xffffff : look.floor.color(dark)} roughness={look.floor.roughness} metalness={0} />
      </mesh>
      {/* frames={1}: drei counts its frames afresh each time it renders, so a new `shade` draws the shadow once more */}
      {contact && !lite() && <ContactShadows key="shadow" name={`shade-${shade}`} frames={1} position={[0, 0.003, 0]} scale={s * 2.2} blur={look.contact.blur} far={Math.max(3, radius)} opacity={look.contact.opacity(dark)} resolution={512} color={look.contact.color} />}
      {effectsOn && (
        <Suspense fallback={null}>
          <Effects fx={fx} />
        </Suspense>
      )}
    </>
  );
}
