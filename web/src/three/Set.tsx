/* The set (5.4.1): a real room lights the tiles, shines in them and stands out of focus behind; the model stands on a
   wooden table with an edge; two coloured lights from behind draw the rims. Everything is bundled in public/set/ and
   kept offline, so nothing is fetched from anywhere else. Without a GPU the Stage keeps its lighter room instead. */
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import type { StageSet, Tier } from "../looks/stage";

const BASE = `${import.meta.env.BASE_URL}set/`;

/** The room's file for this tier: the 1K map at high, 512 below. */
export function roomFile(set: StageSet, tier: Tier): string {
  return `${BASE}${set.room}_${tier === "high" ? "1k" : "512"}.hdr`;
}

const rooms = new Map<string, Promise<THREE.Texture>>();
function loadRoom(gl: THREE.WebGLRenderer, url: string): Promise<THREE.Texture> {
  let p = rooms.get(url);
  if (!p) {
    p = new RGBELoader().loadAsync(url).then((t) => {
      t.mapping = THREE.EquirectangularReflectionMapping;
      const pmrem = new THREE.PMREMGenerator(gl);
      const env = pmrem.fromEquirectangular(t).texture;
      pmrem.dispose();
      t.dispose();
      return env;
    });
    // a failed load (offline before it was ever cached) may work next time
    p.catch(() => rooms.delete(url));
    rooms.set(url, p);
  }
  return p;
}

let ktx: { gl: THREE.WebGLRenderer; loader: KTX2Loader } | null = null;
function ktxLoader(gl: THREE.WebGLRenderer): KTX2Loader {
  if (ktx?.gl !== gl) {
    ktx?.loader.dispose();
    ktx = { gl, loader: new KTX2Loader().setTranscoderPath(`${BASE}basis/`).detectSupport(gl) };
  }
  return ktx.loader;
}

/** The room as light, reflections and the blurred backdrop. Until it has loaded the scene keeps what it had. */
export function useRoom(set: StageSet | undefined, tier: Tier, dark: boolean, onError: (e: unknown) => void) {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!set) return;
    let gone = false;
    loadRoom(gl, roomFile(set, tier)).then((env) => {
      if (gone) return;
      scene.environment = env;
      scene.background = env;
      scene.fog = null;
      scene.environmentIntensity = set.light(dark);
      scene.backgroundIntensity = set.backdrop(dark);
      scene.backgroundBlurriness = set.blur;
      scene.environmentRotation.set(0, set.turn, 0);
      scene.backgroundRotation.set(0, set.turn, 0);
      invalidate();
    }, onError);
    return () => {
      gone = true;
    };
  }, [set, tier, dark, scene, gl, invalidate, onError]);
}

/** The table: a slab of real wood with a rounded edge, its top at y = 0, `size` across. */
export function SetTable({ set, dark, size, onError }: { set: StageSet; dark: boolean; size: number; onError: (e: unknown) => void }) {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const [maps, setMaps] = useState<THREE.Texture[] | null>(null);
  useEffect(() => {
    let gone = false;
    const loader = ktxLoader(gl);
    Promise.all([set.wood.color, set.wood.normal, set.wood.rough].map((f) => loader.loadAsync(`${BASE}${f}`))).then((ts) => {
      if (gone) return ts.forEach((t) => t.dispose());
      for (const t of ts) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = 8;
      }
      ts[0].colorSpace = THREE.SRGBColorSpace;
      setMaps(ts);
      invalidate();
    }, onError);
    return () => {
      gone = true;
    };
  }, [set, gl, invalidate, onError]);
  useEffect(() => () => maps?.forEach((t) => t.dispose()), [maps]);
  // the grain keeps its real size on a bigger table: about a plank's width per two squares
  useEffect(() => {
    maps?.forEach((t) => t.repeat.set(size * 0.28, size * 0.28));
    invalidate();
  }, [maps, size, invalidate]);
  const geometry = useMemo(() => new RoundedBoxGeometry(size, 0.4, size * 0.75, 4, 0.06), [size]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 1, specularIntensity: 0.35 }), []);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    material.map = maps?.[0] ?? null;
    material.normalMap = maps?.[1] ?? null;
    material.normalScale.set(0.5, 0.5);
    material.roughnessMap = maps?.[2] ?? null;
    material.color.set(set.wood.tint(dark));
    material.needsUpdate = true;
    invalidate();
  }, [material, maps, set, dark, invalidate]);
  return <mesh geometry={geometry} material={material} position={[0, -0.202, 0]} receiveShadow />;
}

/** The rims: coloured lights from behind the model. */
export function SetRims({ set, dark, radius }: { set: StageSet; dark: boolean; radius: number }) {
  const k = Math.max(4, radius) / 4;
  return (
    <>
      {set.rims(dark).map((r, i) => (
        <directionalLight key={i} position={[r.position[0] * k, r.position[1] * k, r.position[2] * k]} intensity={r.intensity} color={r.color} />
      ))}
    </>
  );
}
