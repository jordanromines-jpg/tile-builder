/* Pip in the build's scene (5.3.3, first part): the light rigged character (design/pip, 5.3.5–5.3.7) stands on the
   table beside the build, on the side nearest the camera and clear of its footprint, about two tiles tall. It breathes
   and blinks; each new step it hops (a crouch, a stretch in the air, a squash on landing) and smiles; at the last step it
   cheers. Motion reduced: no hop, only the smile. Without a GPU the flat Pip of the overlay stays instead. Carrying the
   step's tiles, comfort, sleep and taps come next (5.3.3, second part). */
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";
import { AZIMUTH } from "../camera";

const URL_ = `${import.meta.env.BASE_URL}pip/axolotl.glb`;
/** the character is 1 tall in its file; a small square tile is 1 here: two tiles tall */
const HEIGHT = 2;
const HOP_S = 0.75;

function morphs(root: THREE.Object3D) {
  const out: { mesh: THREE.Mesh; i: number; name: string }[] = [];
  root.traverse((o) => {
    if (o instanceof THREE.Mesh && o.morphTargetDictionary) {
      for (const [name, i] of Object.entries(o.morphTargetDictionary)) out.push({ mesh: o, i, name });
    }
  });
  return out;
}

export function Pip3D({ radius, stepKey, last, still }: { radius: number; stepKey: number; last: boolean; still: boolean }) {
  const gltf = useLoader(GLTFLoader, URL_, (l) => l.setMeshoptDecoder(MeshoptDecoder));
  const scene = useMemo(() => {
    // a skinned clone must be bound to its own bones (a plain clone keeps the original's skeleton)
    const s = cloneSkinned(gltf.scene);
    s.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        // a skinned body's bounds don't follow its bones: never cull it (it is one small character)
        o.frustumCulled = false;
        // a skinned clone needs its own morph weights
        if (o.morphTargetInfluences) o.morphTargetInfluences = o.morphTargetInfluences.slice();
      }
    });
    return s;
  }, [gltf]);
  const keys = useMemo(() => morphs(scene), [scene]);
  const invalidate = useThree((s) => s.invalidate);
  const root = useRef<THREE.Group>(null);
  const hopAt = useRef(-10);
  const cheer = useRef(false);
  useEffect(() => {
    if (stepKey === 0) return;
    hopAt.current = performance.now() / 1000;
    cheer.current = last;
    invalidate();
  }, [stepKey, last, invalidate]);
  // beside the build: front-left of it as the camera sees it, clear of its footprint
  const at = useMemo(() => {
    const a = AZIMUTH - 0.9;
    const d = radius / 2 + 1.3;
    return new THREE.Vector3(Math.sin(a) * d, 0, Math.cos(a) * d);
  }, [radius]);
  const face = AZIMUTH - 0.25;
  const set = (name: string, v: number) => {
    for (const k of keys) if (k.name === name && k.mesh.morphTargetInfluences) k.mesh.morphTargetInfluences[k.i] = v;
  };
  useFrame(({ clock }) => {
    const g = root.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const now = performance.now() / 1000;
    const h = (now - hopAt.current) / HOP_S;
    let y = 0;
    let sq = 1 + 0.015 * Math.sin(t * 2.2);
    let smile = 0;
    if (h >= 0 && h < 1) {
      smile = 1;
      if (!still) {
        if (h < 0.2) sq = 1 - 0.14 * (h / 0.2);
        else if (h < 0.75) {
          const k = (h - 0.2) / 0.55;
          y = (cheer.current ? 0.9 : 0.55) * 4 * k * (1 - k);
          sq = 1.1 - 0.06 * Math.abs(k - 0.5) * 2;
        } else sq = 0.88 + 0.12 * ((h - 0.75) / 0.25);
      }
      invalidate();
    } else if (h >= 1 && h < 3) {
      smile = 1 - (h - 1) / 2;
      invalidate();
    }
    g.position.set(at.x, y, at.z);
    g.scale.set(HEIGHT / Math.sqrt(sq), HEIGHT * sq, HEIGHT / Math.sqrt(sq));
    set("smile", smile);
    set("open", cheer.current && h >= 0 && h < 1.4 ? 0.7 : 0);
    // a blink every four seconds or so
    set("blink", t % 4.2 < 0.14 ? 1 : 0);
  });
  // the breathing and blinks need a frame now and then; the scene otherwise draws on demand
  useEffect(() => {
    const id = window.setInterval(() => invalidate(), 140);
    return () => window.clearInterval(id);
  }, [invalidate]);
  return (
    <group ref={root} rotation={[0, face, 0]}>
      <primitive object={scene} />
    </group>
  );
}
