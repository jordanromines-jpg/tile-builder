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
/** 5.4.8: Pip helps build: it walks over with the step's tile (WALK_S), the tiles leave its hands and snap in while it
    watches (STAY_S), and it walks back (BACK_S). The step's tiles wait WALK_S for it (Viewer passes it as their hold). */
export const WALK_S = 0.85;
const STAY_S = 0.75;
const BACK_S = 0.9;
/** the arms' turn about their own x (radians): up over the head holding the tile, then pushed out as it goes */
const ARM_UP = -2.3;
const ARM_PUSH = -1.3;
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

/** Where Pip stands beside a build of this size (the turntable's space), and how tall it is there. */
export function pipHome(ring: number, cheering = false): THREE.Vector3 {
  // to the build's left as the camera sees it, on the ring round its footprint (5.4.10); on the finish, front-left
  const a = AZIMUTH - (cheering ? 1.0 : 1.35);
  return new THREE.Vector3(Math.sin(a) * ring, 0, Math.cos(a) * ring);
}

/** Along the ring: from a to b, the radius and the angle eased together the short way round, so a walk keeps outside
    the build (both ends are on or outside its ring). */
export function onRing(a: THREE.Vector3, b: THREE.Vector3, f: number, out = new THREE.Vector3()): THREE.Vector3 {
  const ra = Math.hypot(a.x, a.z);
  const rb = Math.hypot(b.x, b.z);
  const aa = Math.atan2(a.x, a.z);
  let da = Math.atan2(b.x, b.z) - aa;
  da = Math.atan2(Math.sin(da), Math.cos(da));
  const r = ra + (rb - ra) * f;
  const g = aa + da * f;
  return out.set(Math.sin(g) * r, 0, Math.cos(g) * r);
}
export function pipTall(radius: number): number {
  return Math.max(0.7, Math.min(HEIGHT, radius * 0.32));
}

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
  /** 5.4.8: where it stands to place this step's tiles (the turntable's space): it walks there with them and back */
  goto?: THREE.Vector3;
  /** 5.4.9: written every frame: where its hands hold the tile (the turntable's space), so the real tiles leave from
      exactly there; NaN unless it is standing at the build (5.4.10: a fast tap's tiles keep their own arc) */
  hands?: THREE.Vector3;
  /** 5.4.10: the ring round the build's footprint it walks on, never across the build */
  ring?: number;
}

export function Pip3D({ radius, stepKey, last, still, falling = false, watch, resting = false, cheering = false, spot, carry, goto, hands, ring }: Pip3DProps) {
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
  // 5.4.9: the arms hold the tile up and let it go; the legs take real steps (three drops the dots from bone names)
  const bones = useMemo(() => {
    const get = (n: string) => scene.getObjectByName(n) ?? scene.getObjectByName(n.replace(".", ""));
    const out: Record<string, { b: THREE.Object3D; rest: THREE.Quaternion }> = {};
    for (const n of ["arm.L", "arm.R", "leg.L", "leg.R", "chest"]) {
      const b = get(n);
      if (b) out[n] = { b, rest: b.quaternion.clone() };
    }
    return out;
  }, [scene]);
  const qx = useMemo(() => new THREE.Quaternion(), []);
  const X = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const pose = (n: string, ax: number) => {
    const j = bones[n];
    if (!j) return;
    j.b.quaternion.copy(j.rest);
    if (ax) j.b.quaternion.multiply(qx.setFromAxisAngle(X, ax));
  };
  const held = useMemo(() => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.1), new THREE.MeshPhysicalMaterial({ roughness: 0.35, clearcoat: 0.5, transparent: true, opacity: 0.9 }));
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
  const prevKey = useRef(stepKey);
  const walkFrom = useRef<THREE.Vector3 | null>(null);
  const homeOnly = useRef(false);
  const pos = useRef<THREE.Vector3 | null>(null);
  useEffect(() => {
    const back = stepKey < prevKey.current;
    prevKey.current = stepKey;
    if (stepKey === 0 && !back) return;
    // from wherever it is now (a fast tap never jumps it home); going back, it only walks home (5.4.10)
    walkFrom.current = pos.current ? pos.current.clone() : null;
    homeOnly.current = back;
    hopAt.current = performance.now() / 1000;
    cheer.current = last && !back;
    if (!still && !back) playTones(HUP, 0.6);
    invalidate();
  }, [stepKey, last, invalidate, still]);
  // beside the build: front-left of it as the camera sees it, clear of its footprint
  const at = useMemo(() => {
    if (spot) return new THREE.Vector3(...spot);
    // the finish: in front of the build, facing the child, so it is never behind the tower it cheers for
    return pipHome(ring ?? radius * 0.8 + 0.6, cheering);
  }, [radius, spot, cheering, ring]);
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
    // helping (5.4.8): out with the tile, the tiles leave its hands, back home; the last step's cheer comes once home
    const walk = (!!goto || homeOnly.current) && !still && !cheering;
    const e = now - hopAt.current;
    const total = homeOnly.current ? BACK_S : WALK_S + STAY_S + BACK_S;
    const helping = walk && e >= 0 && e < total;
    const h = walk ? (cheer.current ? (e - total) / HOP_S : -1) : e / HOP_S;
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
    const watching = !walk && !!watch && h >= -0.1 && h < 2.2 && !falling;
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
    if (!watching && !lean && !resting && !helping) {
      const p = g.parent ? g.parent.worldToLocal(camera.position.clone()) : camera.position;
      const want = Math.atan2(p.x - at.x, p.z - at.z);
      const d = Math.max(-0.8, Math.min(0.8, Math.atan2(Math.sin(want - face), Math.cos(want - face))));
      look.current += (d - look.current) * 0.08;
      if (Math.abs(d - look.current) > 0.01) invalidate();
      turn = face + look.current;
    }
    let px = at.x;
    let pz = at.z;
    if (helping) {
      const start = walkFrom.current ?? at;
      // going back a step: straight home along the ring; forward: out to the step, stay, home
      const out = !homeOnly.current && e < WALK_S;
      const stay = !homeOnly.current && !out && e < WALK_S + STAY_S;
      const backK = homeOnly.current ? e / BACK_S : (e - WALK_S - STAY_S) / BACK_S;
      const there = goto ?? at;
      const legFrom = out ? start : homeOnly.current ? start : there;
      const legTo = out ? there : at;
      const k = out ? ease(e / WALK_S) : stay ? 1 : ease(Math.min(1, backK));
      const p = stay ? there : onRing(legFrom, legTo, k, tmp);
      px = p.x;
      pz = p.z;
      if (!stay) {
        // little steps, a squash at each footfall
        const steps = (out ? e / WALK_S : backK) * 3;
        const bb = Math.abs(Math.sin(Math.PI * steps));
        y = Math.max(y, 0.12 * bb);
        sq = 0.94 + 0.08 * bb;
      }
      // facing where it goes; at the build, the tiles
      const ahead = stay && watch ? watch : onRing(legFrom, legTo, Math.min(1, k + 0.05), new THREE.Vector3());
      if (Math.hypot(ahead.x - px, ahead.z - pz) > 1e-3) turn = Math.atan2(ahead.x - px, ahead.z - pz);
      smile = Math.max(smile, stay ? 1 : 0.5);
      invalidate();
    }
    // arms and legs: up with the tile on the way, a push forward as it goes, down after; steps while walking
    let arm = 0;
    let legs = 0;
    let sway = 0;
    if (helping && !homeOnly.current) {
      if (e < WALK_S) arm = ARM_UP;
      else if (e < WALK_S + 0.25) arm = ARM_UP + (ARM_PUSH - ARM_UP) * ((e - WALK_S) / 0.25);
      else if (e < WALK_S + STAY_S) arm = ARM_PUSH * (1 - (e - WALK_S - 0.25) / (STAY_S - 0.25));
    }
    if (helping) {
      const walking = homeOnly.current || e < WALK_S || e >= WALK_S + STAY_S;
      if (walking) {
        const ph = homeOnly.current ? (e / BACK_S) * 3 : e < WALK_S ? (e / WALK_S) * 3 : ((e - WALK_S - STAY_S) / BACK_S) * 3;
        legs = 0.55 * Math.sin(Math.PI * ph);
        sway = 0.07 * Math.sin(Math.PI * ph);
      }
    }
    pose("arm.L", arm);
    pose("arm.R", arm);
    pose("leg.L", legs);
    pose("leg.R", -legs);
    g.rotation.set(sleep * 0.18, turn, lean * -0.12 + sway);
    // carrying: the step's tile held up over its head until the hop's top, when the real ones fly in
    held.visible = walk ? helping && !homeOnly.current && e < WALK_S + 0.05 && !!carry : !!carry && !still && h >= 0 && h < 0.8 && !cheer.current;
    // along the head bone, past its tip: over the head
    held.position.set(0, 0.42 + (h < 0.2 ? h * 0.5 : 0.1), 0.08);
    if (hands) {
      held.updateWorldMatrix(true, false);
      held.getWorldPosition(hands);
      if (g.parent) g.parent.worldToLocal(hands);
      const standing = helping && !homeOnly.current && e >= WALK_S - 0.08 && e < WALK_S + STAY_S;
      if (!standing) hands.set(NaN, NaN, NaN);
    }
    held.rotation.set(0.3, 0, 0);
    // a real small square's size, whatever Pip's height (the head bone carries Pip's scale)
    held.scale.setScalar(1 / Math.max(0.01, g.scale.x));
    clip.current = helping ? (homeOnly.current ? "return" : e < WALK_S ? "carry" : e < WALK_S + STAY_S ? "place" : "return") : resting ? "sleep" : cheering ? "cheer" : falling ? "comfort" : tp >= 0 && tp < 1 ? "tapped" : h >= 0 && h < 1 ? (cheer.current ? "cheer" : "hop") : "idle";
    smile = Math.max(smile, giggle, lean ? 0.4 : 0);
    g.position.set(px, y, pz);
    (pos.current ??= new THREE.Vector3()).set(px, 0, pz);
    // two tiles tall, a little less beside a small build (the camera frames a small build closely)
    const tall = pipTall(radius);
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
