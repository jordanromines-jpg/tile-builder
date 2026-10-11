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
import { playTones } from "../../sound/sound";
import { AZIMUTH } from "../camera";
import { tileColour } from "../tile";
import type { Colour } from "../../engine/catalog";

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

declare global {
  interface Window {
    /** for the browser tests: what Pip is doing and where it stands (5.3.3) */
    __pip?: { clip: () => string; at: () => [number, number, number]; holding: () => boolean };
  }
}

/** a soft "hup" as it springs up (synthesised; silent when sound is off) */
const HUP = [{ wave: "sine" as const, freq: 420, to: 640, dur: 0.12, gain: 0.18, attack: 0.01 }];

export interface Pip3DProps {
  radius: number;
  stepKey: number;
  last: boolean;
  still: boolean;
  falling?: boolean;
  /** where this step's tiles land (the turntable's space): it turns to watch them as they come */
  watch?: THREE.Vector3;
  /** the rest screen is up: it sleeps (eyes shut, head down, slow breaths), and wakes when it goes */
  resting?: boolean;
  /** the finish: it cheers again and again */
  cheering?: boolean;
  /** where it stands, the turntable's space, if not beside the build (Make your own: at the table's front-left) */
  spot?: [number, number, number];
  /** this step's tile colour: it lifts a little tile of it over its head as the step's tiles come (5.3.8) */
  carry?: Colour;
}

export function Pip3D({ radius, stepKey, last, still, falling = false, watch, resting = false, cheering = false, spot, carry }: Pip3DProps) {
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
  const held = useMemo(() => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.05), new THREE.MeshPhysicalMaterial({ roughness: 0.35, clearcoat: 0.5, transparent: true, opacity: 0.9 }));
    m.castShadow = true;
    m.visible = false;
    return m;
  }, []);
  useEffect(() => () => {
    held.geometry.dispose();
    (held.material as THREE.Material).dispose();
  }, [held]);
  useEffect(() => {
    if (carry) (held.material as THREE.MeshPhysicalMaterial).color.set(tileColour(carry));
  }, [carry, held]);
  const camera = useThree((s) => s.camera);
  // the held tile rides on the head bone (a skinned body is drawn where its bones are, not where its file says)
  useEffect(() => {
    const head = scene.getObjectByName("head");
    (head ?? scene).add(held);
    return () => {
      held.removeFromParent();
    };
  }, [scene, held]);
  const invalidate = useThree((s) => s.invalidate);
  const root = useRef<THREE.Group>(null);
  const hopAt = useRef(-10);
  const cheer = useRef(false);
  const tapAt = useRef(-10);
  const clip = useRef("idle");
  const look = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    if (stepKey === 0) return;
    hopAt.current = performance.now() / 1000;
    cheer.current = last;
    if (!still) playTones(HUP, 0.6);
    invalidate();
  }, [stepKey, last, invalidate]);
  // beside the build: front-left of it as the camera sees it, clear of its footprint
  const at = useMemo(() => {
    if (spot) return new THREE.Vector3(...spot);
    // the finish: in front of the build, facing the child, so it is never behind the tower it cheers for
    if (cheering) {
      const c = AZIMUTH - 0.45;
      const e = radius / 2 + 1.2;
      return new THREE.Vector3(Math.sin(c) * e, 0, Math.cos(c) * e);
    }
    // to the build's left as the camera sees it (not between the camera and the build), just clear of it
    const a = AZIMUTH - 1.35;
    // clear of a square build's corner too (a corner reaches out half the diagonal, about 0.71 of the width)
    const d = radius * 0.72 + Math.min(0.5, radius * 0.12);
    return new THREE.Vector3(Math.sin(a) * d, 0, Math.cos(a) * d);
  }, [radius, spot, cheering]);
  const face = AZIMUTH - 0.25;
  useEffect(() => {
    window.__pip = { clip: () => clip.current, at: () => [at.x, at.y, at.z], holding: () => held.visible };
    return () => {
      delete window.__pip;
    };
  }, [at, held]);
  const set = (name: string, v: number) => {
    for (const k of keys) if (k.name === name && k.mesh.morphTargetInfluences) k.mesh.morphTargetInfluences[k.i] = v;
  };
  useFrame(({ clock }) => {
    const g = root.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const now = performance.now() / 1000;
    // the finish: a cheer hop every two seconds or so
    if (cheering && now - hopAt.current > 2.2) {
      hopAt.current = now;
      cheer.current = true;
      if (!still) playTones(HUP, 0.5);
    }
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
    // a tap: a little jump and a giggle
    const tp = (now - tapAt.current) / 0.6;
    let giggle = 0;
    if (tp >= 0 && tp < 1) {
      giggle = 1;
      if (!still) {
        y = Math.max(y, 0.35 * Math.sin(Math.PI * tp));
        sq *= 1 + 0.08 * Math.sin(Math.PI * 2 * tp);
      }
      invalidate();
    }
    // it fell: it turns to the build and leans in, kindly
    // (on the finish "falling" is the celebration's tiles, not a build down: it cheers)
    const lean = falling && !cheering ? 1 : 0;
    // while a step's tiles fly in it turns to watch them land, then back to the child
    let turn = face + lean * 0.7;
    const watching = !!watch && h >= -0.1 && h < 2.2 && !falling;
    if (watching && watch) {
      const w = Math.atan2(watch.x - at.x, watch.z - at.z);
      const k = h < 0.2 ? h / 0.2 : h > 1.8 ? (2.2 - h) / 0.4 : 1;
      turn = face + (w - face) * 0.6 * Math.max(0, Math.min(1, k));
      invalidate();
    }
    // asleep: head down, slow deep breaths
    const sleep = resting ? 1 : 0;
    if (resting) sq = 1 + 0.035 * Math.sin(t * 1.1);
    // at rest it looks at the child (the camera), easing round, never past a quarter turn
    if (!watching && !lean && !resting) {
      const p = g.parent ? g.parent.worldToLocal(camera.position.clone()) : camera.position;
      const want = Math.atan2(p.x - at.x, p.z - at.z);
      const d = Math.max(-0.8, Math.min(0.8, Math.atan2(Math.sin(want - face), Math.cos(want - face))));
      look.current += (d - look.current) * 0.08;
      if (Math.abs(d - look.current) > 0.01) invalidate();
      turn = face + look.current;
    }
    g.rotation.set(sleep * 0.18, turn, lean * -0.12);
    // carrying: the step's tile held up over its head until the hop's top, when the real ones fly in
    held.visible = !!carry && !still && h >= 0 && h < 0.8 && !cheer.current;
    // along the head bone, past its tip: over the head
    held.position.set(0, 0.42 + (h < 0.2 ? h * 0.5 : 0.1), 0.08);
    held.rotation.set(0.3, 0, 0);
    clip.current = resting ? "sleep" : cheering ? "cheer" : falling ? "comfort" : tp >= 0 && tp < 1 ? "tapped" : h >= 0 && h < 1 ? (cheer.current ? "cheer" : "hop") : "idle";
    smile = Math.max(smile, giggle, lean ? 0.4 : 0);
    g.position.set(at.x, y, at.z);
    // two tiles tall, a little less beside a small build (the camera frames a small build closely)
    const tall = Math.max(0.7, Math.min(HEIGHT, radius * 0.32));
    g.scale.set(tall / Math.sqrt(sq), tall * sq, tall / Math.sqrt(sq));
    // when the view is close in (a small build's first steps), Pip would loom over the screen's corner: it steps out
    const wp = g.getWorldPosition(tmp);
    g.visible = camera.position.distanceTo(wp) > tall * 5;
    set("smile", smile);
    set("open", (cheer.current && h >= 0 && h < 1.4) || giggle ? 0.7 : 0);
    // a blink every four seconds or so
    set("blink", resting || t % 4.2 < 0.14 ? 1 : 0);
  });
  // the breathing and blinks need a frame now and then; the scene otherwise draws on demand
  useEffect(() => {
    const id = window.setInterval(() => invalidate(), 140);
    return () => window.clearInterval(id);
  }, [invalidate]);
  return (
    <group
      ref={root}
      rotation={[0, face, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        tapAt.current = performance.now() / 1000;
        invalidate();
      }}
    >
      <primitive object={scene} />
    </group>
  );
}
