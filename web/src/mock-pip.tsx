/* MOCK ONLY (not part of the app, not committed): Pip as a 3D character built from real tile meshes, for Jordan to
   look at. Every joint is a magnet hinge: his arms, ears and tail are tiles hinged to his body cube. */
import "./tokens.css";
import "./app.css";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import { DEFAULT_LEG, type Colour, type ShapeId } from "./engine/catalog";
import type { Placed } from "./engine/types";
import { placeTile } from "./three/buildScene";
import { Stage } from "./three/Stage";
import { Truck } from "./three/truck/Truck";
import { Friend } from "./friend/Friend";
import { restPose } from "./three/truck/spec";

const Q = Math.PI / 2;
const INK = "#2a2118";

function tile(p: Placed): THREE.Group {
  const t = placeTile(p, DEFAULT_LEG);
  t.group.position.copy(t.pT);
  t.group.quaternion.copy(t.qT);
  const g = new THREE.Group();
  g.add(t.group);
  return g;
}
/** a part: a tile standing in the XY plane, its base edge from (0,0) along +x, scaled */
function part(shape: ShapeId, colour: Colour, s: number): THREE.Group {
  const g = tile({ shape, colour, pos: [0, 0, 0], rot: [0, 0] });
  g.scale.setScalar(s);
  return g;
}
/** a cube of tiles, `s` on a side, its bottom's middle at the origin */
function cube(colour: Colour, s: number, lid = true): THREE.Group {
  const g = new THREE.Group();
  const walls: Placed[] = [
    { shape: "square", colour, pos: [-0.5, 0, 0.5], rot: [0, 0] },
    { shape: "square", colour, pos: [0.5, 0, 0.5], rot: [0, Q] },
    { shape: "square", colour, pos: [0.5, 0, -0.5], rot: [0, Math.PI] },
    { shape: "square", colour, pos: [-0.5, 0, -0.5], rot: [0, -Q] },
  ];
  if (lid) walls.push({ shape: "square", colour, pos: [-0.5, 1, 0.5], rot: [-Q, 0] });
  for (const w of walls) g.add(tile(w));
  g.scale.setScalar(s);
  return g;
}

type Face = "open" | "happy" | "squint" | "worry";
type Mouth = "smile" | "open" | "o" | "flat";

function disc(r: number, colour: string, opacity = 1) {
  return new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color: colour, transparent: opacity < 1, opacity }));
}
function arc(r: number, tube: number, from: number, len: number, colour = INK) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 24, len), new THREE.MeshBasicMaterial({ color: colour }));
  m.rotation.z = from;
  return m;
}

/** the face: a sticker on Pip's front tile */
function face(eyes: Face, mouth: Mouth, look: [number, number]): THREE.Group {
  const g = new THREE.Group();
  for (const sx of [-1, 1]) {
    const e = new THREE.Group();
    e.position.set(0.2 * sx, 0.6, 0);
    if (eyes === "happy") e.add(arc(0.1, 0.028, 0.15, Math.PI - 0.3));
    else if (eyes === "squint") {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.01), new THREE.MeshBasicMaterial({ color: INK }));
      m.rotation.z = -0.25 * sx;
      e.add(m);
    } else {
      const big = eyes === "worry" ? 0.15 : 0.135;
      e.add(disc(big, "#ffffff"));
      const p = disc(eyes === "worry" ? 0.06 : 0.085, INK);
      p.position.set(look[0] * 0.04, look[1] * 0.04, 0.002);
      e.add(p);
      const h = disc(0.028, "#ffffff");
      h.position.set(look[0] * 0.04 + 0.03, look[1] * 0.04 + 0.035, 0.004);
      e.add(h);
      // brows
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.01), new THREE.MeshBasicMaterial({ color: INK }));
      b.position.set(0, 0.2, 0);
      b.rotation.z = eyes === "worry" ? 0.35 * sx : -0.08 * sx;
      e.add(b);
    }
    g.add(e);
    const c = disc(0.065, "#ff6f7d", 0.55);
    c.position.set(0.34 * sx, 0.4, -0.001);
    g.add(c);
  }
  if (mouth === "smile") {
    const m = arc(0.1, 0.024, Math.PI + 0.35, Math.PI - 0.7);
    m.position.set(0, 0.38, 0);
    g.add(m);
  }
  else if (mouth === "open") {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.11, 32, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: INK }));
    m.position.set(0, 0.36, 0);
    g.add(m);
    const tongue = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: "#ff6f7d" }));
    tongue.position.set(0, 0.29, 0.002);
    g.add(tongue);
  } else if (mouth === "o") {
    const m = disc(0.05, INK);
    m.position.set(0, 0.33, 0);
    g.add(m);
  } else {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.01), new THREE.MeshBasicMaterial({ color: INK }));
    m.position.set(0, 0.36, 0);
    g.add(m);
  }
  g.position.z = 0.012;
  return g;
}

interface Pose {
  /** the body's lift off the ground, squash (y) and stretch, lean (radians about z) */
  lift: number;
  squash: number;
  lean: number;
  /** each arm's swing out from hanging down (radians), left and right */
  arms: [number, number];
  ears: number;
  tail: number;
  eyes: Face;
  mouth: Mouth;
  look?: [number, number];
  carry?: Colour;
  turn?: number;
}

const BODY = 1;
const LEG = 0.26;

function pip(p: Pose): THREE.Group {
  const root = new THREE.Group();
  // feet: little purple cubes; stretched a little in a hop
  for (const sx of [-1, 1]) {
    const f = cube("purple", LEG);
    f.position.set(0.22 * sx, Math.max(0, p.lift - 0.05), 0.04);
    root.add(f);
  }
  const body = new THREE.Group();
  body.position.y = LEG + p.lift;
  body.rotation.z = p.lean;
  body.scale.set(1 / Math.sqrt(p.squash), p.squash, 1 / Math.sqrt(p.squash));
  root.add(body);
  body.add(cube("orange", BODY));
  const f = face(p.eyes, p.mouth, p.look ?? [0, 0]);
  f.position.z = 0.5 + 0.06;
  body.add(f);
  // ears: yellow triangles hinged on the lid's top edge, tipped out
  for (const sx of [-1, 1]) {
    const hinge = new THREE.Group();
    hinge.position.set(0.27 * sx, BODY, 0.12);
    hinge.rotation.z = -p.ears * sx;
    const e = part("tri-equilateral", "yellow", 0.44);
    e.position.x = -0.22;
    hinge.add(e);
    body.add(hinge);
  }
  // arms: little green cubes on a hinge at each side, swinging out and up
  for (const [i, sx] of [[0, -1], [1, 1]] as const) {
    const shoulder = new THREE.Group();
    shoulder.position.set(0.5 * sx, 0.78, 0.12);
    shoulder.rotation.z = p.arms[i] * sx;
    const a = cube("green", 0.27);
    a.position.set(0.15 * sx, -0.36, 0);
    shoulder.add(a);
    body.add(shoulder);
  }
  // tail: a purple corner triangle hinged up the back wall
  const tail = new THREE.Group();
  tail.position.set(0.34, 0.12, -0.52);
  tail.rotation.x = -p.tail;
  const t = part("tri-right", "purple", 0.5);
  t.rotation.y = Q;
  tail.add(t);
  body.add(tail);
  if (p.carry) {
    const c = part("square", p.carry, 1);
    c.rotation.x = -Q;
    c.position.set(-0.5, BODY + 0.34, 0.5);
    body.add(c);
  }
  root.rotation.y = p.turn ?? 0;
  return root;
}

const POSES: Record<string, Pose> = {
  idle: { lift: 0, squash: 1, lean: 0, arms: [0.12, 0.12], ears: 0.18, tail: 0.3, eyes: "open", mouth: "smile", look: [0.3, 0.2] },
  ready: { lift: -0.08, squash: 0.82, lean: 0, arms: [-0.45, -0.45], ears: 0.45, tail: 0.1, eyes: "squint", mouth: "flat" },
  hop: { lift: 0.55, squash: 1.12, lean: 0.06, arms: [2.4, 2.4], ears: -0.05, tail: 0.7, eyes: "open", mouth: "open", look: [0, 1] },
  carry: { lift: 0, squash: 0.96, lean: 0, arms: [2.75, 2.75], ears: 0.95, tail: 0.4, eyes: "open", mouth: "open", look: [0, 1], carry: "blue" },
  cheer: { lift: 0.3, squash: 1.05, lean: -0.08, arms: [2.35, 2.6], ears: 0.05, tail: 0.9, eyes: "happy", mouth: "open" },
  oops: { lift: 0, squash: 0.97, lean: 0.14, arms: [1.2, 0.7], ears: 0.6, tail: 0.05, eyes: "worry", mouth: "o", look: [-0.6, -0.4] },
};

function Pip({ pose, at, turn = 0 }: { pose: Pose; at: [number, number, number]; turn?: number }) {
  const g = useMemo(() => pip({ ...pose, turn }), [pose, turn]);
  return <primitive object={g} position={at} />;
}

function House() {
  const g = useMemo(() => {
    const out = new THREE.Group();
    const ps: Placed[] = [
      { shape: "square", colour: "red", pos: [0, 0, 1], rot: [0, 0] },
      { shape: "square", colour: "red", pos: [1, 0, 1], rot: [0, 0] },
      { shape: "square", colour: "red", pos: [2, 0, 0], rot: [0, -Q] },
      { shape: "square", colour: "red", pos: [0, 0, 0], rot: [0, 0] },
      { shape: "square", colour: "red", pos: [1, 0, 0], rot: [0, 0] },
      { shape: "square", colour: "red", pos: [0, 0, 0], rot: [0, -Q] },
      { shape: "square", colour: "yellow", pos: [0, 1, 1], rot: [0, 0] },
      { shape: "square", colour: "yellow", pos: [0, 1, 0], rot: [0, 0] },
      { shape: "square", colour: "yellow", pos: [0, 1, 0], rot: [0, -Q] },
    ];
    for (const p of ps) out.add(tile(p));
    return out;
  }, []);
  return <primitive object={g} />;
}

const shot = new URLSearchParams(location.search).get("shot") ?? "poses";
const names = ["idle", "ready", "hop", "carry", "cheer", "oops"];

function Scene() {
  if (shot === "turn")
    return (
      <>
        {[0, 0.7, Q, Math.PI].map((t, i) => (
          <Pip key={i} pose={POSES.idle} at={[-3.3 + i * 2.2, 0, 0]} turn={t} />
        ))}
      </>
    );
  if (shot === "context")
    return (
      <>
        <group position={[-1.6, 0, -0.6]}>
          <House />
        </group>
        <Pip pose={POSES.carry} at={[1.6, 0, 0.6]} turn={-0.5} />
        <group position={[2.9, 0, 1.6]} rotation={[0, -2.2, 0]}>
          <Truck pose={restPose()} alive={false} />
        </group>
      </>
    );
  return (
    <>
      {names.map((n, i) => (
        <Pip key={n} pose={POSES[n]} at={[-5.5 + i * 2.2, 0, 0]} />
      ))}
    </>
  );
}

const cams: Record<string, { position: [number, number, number]; fov: number; target: [number, number, number] }> = {
  poses: { position: [0, 3.2, 15], fov: 25, target: [0, 0.8, 0] },
  turn: { position: [0, 2.2, 8], fov: 36, target: [0, 0.8, 0] },
  context: { position: [2.2, 3.4, 7.2], fov: 38, target: [0.4, 0.8, 0] },
};
const cam = cams[shot];

const root = createRoot(document.getElementById("root")!);
if (shot === "current")
  root.render(
    <div style={{ display: "flex", gap: 24, padding: 30, background: "#f6e7d2", height: "100vh", alignItems: "center" }}>
      {(["idle", "hold", "cheer", "comfort", "clap", "point"] as const).map((p) => (
        <div key={p} style={{ textAlign: "center", fontFamily: "Helvetica", fontWeight: 700, color: "#6b5a48", fontSize: 20 }}>
          <Friend pose={p} size={220} />
          {p}
        </div>
      ))}
    </div>,
  );
else root.render(
  <div style={{ width: "100vw", height: "100vh" }}>
    <Canvas dpr={2} camera={{ position: cam.position, fov: cam.fov }} onCreated={({ camera }) => camera.lookAt(...cam.target)} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Stage paint={0} radius={6} reach={12} />
      <Scene />
    </Canvas>
  </div>,
);
