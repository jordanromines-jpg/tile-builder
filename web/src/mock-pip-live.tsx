/* MOCK ONLY (not part of the app, not committed): Pip's three fresh concepts, live in the app's own 3D stage.
   Each is the GLB the Blender pipeline made (sdf body, rig, face shape keys, baked colour; glTF-Transform), loaded
   through its gltfjsx component. Springs: Wiggle on bone chains (the dino's tail, the snail's feelers and tail,
   the axolotl's tail), three-vrm's spring bones on the axolotl's tile gills. A Theatre.js timeline drives a "hello"
   (anticipate, hop, land, wave, smile, blink). Rendered frame by frame with window.__seek(t). */
import "./tokens.css";
import "./app.css";
import { VRMSpringBoneJoint, VRMSpringBoneManager } from "@pixiv/three-vrm-springbone";
import { Canvas, useThree } from "@react-three/fiber";
import { getProject, type SheetObject as ISheetObject } from "./mock-theatre.js";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import { WiggleBone } from "wiggle/spring";
import { Stage } from "./three/Stage";
import { Model as Axolotl } from "./mock-pip-models/axolotl";
import { Model as Dino } from "./mock-pip-models/dino";
import { Model as Snail } from "./mock-pip-models/snail";

// ---------- the Theatre.js timeline, as its saved-state JSON ----------
type Key = [number, number];
const LENGTH = 3.4;
let kid = 0;
function track(keys: Key[]) {
  return {
    type: "BasicKeyframedTrack",
    __debugName: "",
    keyframes: keys.map(([position, value]) => ({ id: `k${kid++}`, position, connectedRight: true, handles: [0.5, 1, 0.5, 0], type: "bezier", value })),
  };
}
/** the "hello": a breath, a crouch, a hop, a squashy landing, a wave with a tilted head and a smile, a blink */
const HELLO: Record<string, Key[]> = {
  hop: [[0, 0], [0.55, 0], [0.62, 0], [0.86, 0.32], [1.1, 0], [3.4, 0]],
  squash: [[0, 1], [0.3, 1.02], [0.6, 0.84], [0.66, 1.1], [0.86, 1.05], [1.1, 0.86], [1.25, 1.04], [1.4, 1], [3.4, 1]],
  lean: [[0, 0], [0.6, 0.06], [0.86, -0.04], [1.2, 0], [1.5, 0.08], [2.8, 0.08], [3.2, 0], [3.4, 0]],
  wave: [[0, 0], [1.2, 0], [1.45, 1], [1.65, 0.45], [1.85, 1], [2.05, 0.45], [2.25, 1], [2.6, 0], [3.4, 0]],
  smile: [[0, 0], [1.15, 0], [1.3, 1], [2.7, 1], [2.9, 0], [3.4, 0]],
  blink: [[0, 0], [0.25, 0], [0.3, 1], [0.37, 0], [3.0, 0], [3.05, 1], [3.12, 0], [3.4, 0]],
  mouth: [[0, 1], [0.6, 1], [0.7, 0], [2.8, 0], [3.0, 1], [3.4, 1]],
};
const PROPS = Object.keys(HELLO);
const NAMES = ["dino", "snail", "axolotl"] as const;
/** each one starts a little after the last, so they don't move as one */
const OFFSET = { dino: 0, snail: 0.12, axolotl: 0.24 } as const;

function state() {
  const tracksByObject: Record<string, unknown> = {};
  for (const n of NAMES) {
    const trackData: Record<string, unknown> = {};
    const trackIdByPropPath: Record<string, string> = {};
    for (const p of PROPS) {
      const id = `${n}-${p}`;
      trackData[id] = track(HELLO[p].map(([t, v]) => [Math.min(LENGTH, t + (t > 0 ? OFFSET[n] : 0)), v] as Key));
      trackIdByPropPath[JSON.stringify([p])] = id;
    }
    tracksByObject[n] = { trackData, trackIdByPropPath };
  }
  return {
    sheetsById: { hello: { staticOverrides: { byObject: {} }, sequence: { subUnitsPerUnit: 30, length: LENGTH, type: "PositionalSequence", tracksByObject } } },
    definitionVersion: "0.4.0",
    revisionHistory: ["pip-hello-1"],
  };
}

const project = getProject("Pip concepts", { state: state() });
const sheet = project.sheet("hello");
const props = Object.fromEntries(PROPS.map((p) => [p, HELLO[p][0][1]])) as Record<string, number>;
const objects = Object.fromEntries(NAMES.map((n) => [n, sheet.object(n, props)])) as Record<(typeof NAMES)[number], ISheetObject<typeof props>>;

// ---------- one character: its timeline values onto its group, bones and shape keys ----------
interface Rig {
  group: THREE.Group;
  armL?: THREE.Object3D;
  armR?: THREE.Object3D;
  head?: THREE.Object3D;
  restR?: THREE.Euler;
  restHead?: THREE.Euler;
  faces: { mesh: THREE.Mesh; key: string; prop: "blink" | "smile" | "mouth" }[];
  glints: THREE.Object3D[];
  eyes: THREE.Object3D[];
  happy: THREE.Object3D[];
  springs: { update: (dt: number) => void }[];
}

function rigOf(group: THREE.Group, name: (typeof NAMES)[number]): Rig {
  const get = (n: string) => group.getObjectByName(n) ?? undefined;
  const faces: Rig["faces"] = [];
  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.morphTargetDictionary) return;
    for (const [key, prop] of [["blink", "blink"], ["closed", "mouth"]] as const) if (key in m.morphTargetDictionary) faces.push({ mesh: m, key, prop });
  });
  const glints: THREE.Object3D[] = [];
  group.traverse((o) => void (o.name.startsWith("glint") && glints.push(o)));
  const eyes: THREE.Object3D[] = [];
  const happy: THREE.Object3D[] = [];
  group.traverse((o) => void (/^eye[LR]$/.test(o.name) ? eyes.push(o) : /^happy[LR]$/.test(o.name) && happy.push(o)));
  const springs: Rig["springs"] = [];
  const wiggle = (n: string, stiffness: number, damping: number) => {
    const b = get(n) as THREE.Bone | undefined;
    if (b?.parent && (b.parent as THREE.Bone).isBone) springs.push(new WiggleBone(b, { stiffness, damping }));
  };
  if (name === "dino") ["tail2", "tail3"].forEach((n) => wiggle(n, 260, 9));
  if (name === "snail") ["feelerL", "feelerR"].forEach((n) => wiggle(n, 180, 6));
  if (name === "axolotl") {
    wiggle("tail2", 220, 8);
    // the gills: spring bones from three-vrm, each tile hanging off its own little bone
    const manager = new VRMSpringBoneManager();
    group.traverse((o) => {
      if (!(o as THREE.Bone).isBone || !o.name.startsWith("gill")) return;
      const tip = new THREE.Object3D();
      tip.position.set(0, 0.25, 0);
      o.add(tip);
      manager.addJoint(new VRMSpringBoneJoint(o, tip, { stiffness: 1.6, dragForce: 0.35, gravityPower: 0.15, gravityDir: new THREE.Vector3(0, -1, 0), hitRadius: 0.02 }));
    });
    manager.setInitState();
    springs.push({ update: (dt) => manager.update(dt) });
  }
  const armR = get("armR");
  const head = get("head");
  return { group, armL: get("armL"), armR, head, restR: armR?.rotation.clone(), restHead: head?.rotation.clone(), faces, glints, eyes, happy, springs };
}

function apply(r: Rig, v: Record<string, number>, dt: number) {
  r.group.position.y = v.hop;
  const s = v.squash;
  r.group.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
  r.group.rotation.z = v.lean;
  if (r.armR && r.restR) r.armR.rotation.set(r.restR.x, r.restR.y, r.restR.z - 1.6 * v.wave);
  if (r.head && r.restHead) r.head.rotation.set(r.restHead.x, r.restHead.y, r.restHead.z + 0.12 * v.smile);
  for (const f of r.faces) {
    const i = f.mesh.morphTargetDictionary![f.key];
    f.mesh.morphTargetInfluences![i] = v[f.prop];
  }
  // a smile swaps the open eyes for the happy arcs; the catch-lights go with the open eyes
  const glad = v.smile > 0.5;
  for (const e of r.eyes) e.visible = !glad;
  for (const h of r.happy) h.visible = glad;
  for (const g of r.glints) g.visible = v.blink < 0.5;
  r.group.updateMatrixWorld(true);
  for (const sp of r.springs) sp.update(dt);
}

function Scene() {
  const advance = useThree((s) => s.advance);
  const camera = useThree((s) => s.camera);
  const groups = useRef<Partial<Record<(typeof NAMES)[number], THREE.Group>>>({});
  const rigs = useRef<Partial<Record<(typeof NAMES)[number], Rig>>>({});
  const last = useRef(0);
  const ready = useCallback((n: (typeof NAMES)[number]) => () => {
    const g = groups.current[n];
    if (g && !rigs.current[n]) rigs.current[n] = rigOf(g, n);
    if (NAMES.every((k) => rigs.current[k])) {
      window.__seek = (t: number) => {
        const dt = Math.max(1 / 240, Math.min(1 / 15, t - last.current || 1 / 30));
        last.current = t;
        sheet.sequence.position = t % LENGTH;
        for (const k of NAMES) apply(rigs.current[k]!, objects[k].value, dt);
        advance(t * 1000);
      };
      void project.ready.then(() => (window.__ready = true));
    }
  }, [advance]);
  useEffect(() => {
    camera.lookAt(0, 0.55, 0);
    camera.updateMatrixWorld();
  }, [camera]);
  const at = useMemo(() => ({ dino: -1.55, snail: 0, axolotl: 1.55 }), []);
  return (
    <>
      <group ref={(g) => void (g && (groups.current.dino = g))} position={[at.dino, 0, 0]} rotation={[0, 0.35, 0]}>
        <Dino onNodes={ready("dino")} />
      </group>
      <group ref={(g) => void (g && (groups.current.snail = g))} position={[at.snail, 0, 0]} rotation={[0, 0.5, 0]}>
        <Snail onNodes={ready("snail")} />
      </group>
      <group ref={(g) => void (g && (groups.current.axolotl = g))} position={[at.axolotl, 0, 0]} rotation={[0, -0.3, 0]}>
        <Axolotl onNodes={ready("axolotl")} />
      </group>
    </>
  );
}

declare global {
  interface Window {
    __seek?: (t: number) => void;
    __ready?: boolean;
  }
}

createRoot(document.getElementById("root")!).render(
  <div style={{ width: "100vw", height: "100vh" }}>
    <Canvas frameloop="never" dpr={1} shadows camera={{ position: [0, 1.05, 3.55], fov: 40 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Stage paint={0} radius={3} reach={8} />
      <Scene />
    </Canvas>
  </div>,
);
