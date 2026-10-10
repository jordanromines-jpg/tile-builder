/* MOCK ONLY (not part of the app, not committed): Pip's animated test for Jordan. Pip, made of tiles, carries a blue
   square over to a little build in two hops, sets it on top, and cheers. Rendered frame by frame (window.__seek). */
import "./tokens.css";
import "./app.css";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import { DEFAULT_LEG, type Colour, type ShapeId } from "./engine/catalog";
import type { Placed } from "./engine/types";
import { placeTile } from "./three/buildScene";
import { Stage } from "./three/Stage";

const Q = Math.PI / 2;
const INK = "#2a2118";
const SCALE = 0.8;

function tile(p: Placed): THREE.Group {
  const t = placeTile(p, DEFAULT_LEG);
  t.group.position.copy(t.pT);
  t.group.quaternion.copy(t.qT);
  const g = new THREE.Group();
  g.add(t.group);
  return g;
}
function part(shape: ShapeId, colour: Colour, s: number): THREE.Group {
  const g = tile({ shape, colour, pos: [0, 0, 0], rot: [0, 0] });
  g.scale.setScalar(s);
  return g;
}
function cube(colour: Colour, s: number): THREE.Group {
  const g = new THREE.Group();
  const walls: Placed[] = [
    { shape: "square", colour, pos: [-0.5, 0, 0.5], rot: [0, 0] },
    { shape: "square", colour, pos: [0.5, 0, 0.5], rot: [0, Q] },
    { shape: "square", colour, pos: [0.5, 0, -0.5], rot: [0, Math.PI] },
    { shape: "square", colour, pos: [-0.5, 0, -0.5], rot: [0, -Q] },
    { shape: "square", colour, pos: [-0.5, 1, 0.5], rot: [-Q, 0] },
  ];
  for (const w of walls) g.add(tile(w));
  g.scale.setScalar(s);
  return g;
}
const basic = (c: string, opacity = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: opacity < 1, opacity });
const disc = (r: number, c: string, opacity = 1) => new THREE.Mesh(new THREE.CircleGeometry(r, 32), basic(c, opacity));
function arc(r: number, tube: number, from: number, len: number) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 24, len), basic(INK));
  m.rotation.z = from;
  return m;
}

/** Pip's rig: every part made once; `pose` moves them. */
function makePip() {
  const root = new THREE.Group();
  root.scale.setScalar(SCALE);
  const feet = [-1, 1].map((sx) => {
    const f = cube("purple", 0.26);
    f.position.set(0.22 * sx, 0, 0.04);
    root.add(f);
    return f;
  });
  const hips = new THREE.Group();
  root.add(hips);
  const body = new THREE.Group();
  hips.add(body);
  const shell = cube("orange", 1);
  body.add(shell);
  // face
  const face = new THREE.Group();
  face.position.z = 0.572;
  body.add(face);
  const pupils: THREE.Group[] = [];
  const open = new THREE.Group();
  const happy = new THREE.Group();
  const shut = new THREE.Group();
  const brows: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) {
    const e = new THREE.Group();
    e.position.set(0.2 * sx, 0.6, 0);
    e.add(disc(0.135, "#ffffff"));
    const p = new THREE.Group();
    p.add(disc(0.082, INK));
    const h = disc(0.028, "#ffffff");
    h.position.set(0.03, 0.035, 0.002);
    p.add(h);
    p.position.z = 0.002;
    e.add(p);
    pupils.push(p);
    open.add(e);
    const hp = arc(0.1, 0.028, 0.15, Math.PI - 0.3);
    hp.position.set(0.2 * sx, 0.58, 0);
    happy.add(hp);
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.045, 0.01), basic(INK));
    s.position.set(0.2 * sx, 0.6, 0);
    shut.add(s);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.01), basic(INK));
    b.position.set(0.2 * sx, 0.8, 0);
    face.add(b);
    brows.push(b);
    const c = disc(0.065, "#ff6f7d", 0.55);
    c.position.set(0.34 * sx, 0.4, -0.001);
    face.add(c);
  }
  face.add(open, happy, shut);
  const smile = arc(0.1, 0.024, Math.PI + 0.35, Math.PI - 0.7);
  smile.position.set(0, 0.38, 0);
  const grin = new THREE.Group();
  const gm = new THREE.Mesh(new THREE.CircleGeometry(0.115, 32, Math.PI, Math.PI), basic(INK));
  gm.position.set(0, 0.37, 0);
  const tongue = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24, Math.PI, Math.PI), basic("#ff6f7d"));
  tongue.position.set(0, 0.3, 0.002);
  grin.add(gm, tongue);
  const oh = disc(0.05, INK);
  oh.position.set(0, 0.34, 0);
  face.add(smile, grin, oh);
  const ears = [-1, 1].map((sx) => {
    const hinge = new THREE.Group();
    hinge.position.set(0.27 * sx, 1, 0.12);
    const e = part("tri-equilateral", "yellow", 0.44);
    e.position.x = -0.22;
    hinge.add(e);
    body.add(hinge);
    return hinge;
  });
  const shoulders = [-1, 1].map((sx) => {
    const s = new THREE.Group();
    s.position.set(0.5 * sx, 0.78, 0.12);
    const a = cube("green", 0.27);
    a.position.set(0.15 * sx, -0.36, 0);
    s.add(a);
    body.add(s);
    return s;
  });
  const tail = new THREE.Group();
  tail.position.set(0.34, 0.12, -0.52);
  const t = part("tri-right", "purple", 0.5);
  t.rotation.y = Q;
  tail.add(t);
  body.add(tail);
  // where a carried tile's middle sits: on his raised hands, over his head
  const carry = new THREE.Object3D();
  carry.position.set(0, 1.42, 0);
  body.add(carry);
  return { root, feet, hips, body, pupils, open, happy, shut, brows, smile, grin, oh, ears, shoulders, tail, carry };
}
type Rig = ReturnType<typeof makePip>;

// ---------- the timeline ----------
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const io = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const out = (k: number) => 1 - Math.pow(1 - k, 3);
const back = (k: number) => 1 + 2.4 * Math.pow(k - 1, 3) + 1.4 * Math.pow(k - 1, 2);

/** the hops: take-off, landing, from x, to x, height */
const HOPS = [
  { a: 1.0, b: 1.42, from: 2.35, to: 1.4, h: 0.42 },
  { a: 1.78, b: 2.2, from: 1.4, to: 0.45, h: 0.42 },
];
const CHEER = { a: 4.42, b: 5.02, h: 0.8 };
export const LENGTH = 6.6;

/** What the timeline wants at time t (before the springs): */
function want(t: number) {
  let x = HOPS[0].from;
  let lift = 0;
  let air = false;
  for (const h of HOPS) {
    if (t >= h.b) x = h.to;
    else if (t >= h.a) {
      const u = seg(t, h.a, h.b);
      x = lerp(h.from, h.to, u);
      lift = 4 * h.h * u * (1 - u);
      air = true;
    }
  }
  if (t >= CHEER.a && t < CHEER.b) {
    const u = seg(t, CHEER.a, CHEER.b);
    lift = 4 * CHEER.h * u * (1 - u);
    air = true;
  }
  // squash: a crouch before each take-off, a stretch in the air, a squash on landing
  let squash = 1;
  for (const h of [...HOPS, CHEER]) {
    const crouch = h === CHEER ? 0.34 : 0.2;
    if (t > h.a - crouch && t < h.a) squash = lerp(1, h === CHEER ? 0.74 : 0.8, io(seg(t, h.a - crouch, h.a)));
    if (t >= h.b && t < h.b + 0.07) squash = h === CHEER ? 0.76 : 0.82;
  }
  if (air) squash = 1.14;
  // which way he faces: toward the build, a little toward us; then to us for the cheer
  const turn = lerp(lerp(-0.9, -1.0, io(seg(t, 2.25, 2.6))), 0.15, io(seg(t, 3.95, 4.3)));
  // the arms (swing out/up, and forward): holding the tile up; reaching it over; down; up for the cheer
  let arms = 2.75;
  let reach = 0;
  // the toss: a wind-up (the arms go back), a quick swing forward as the tile leaves, the arms left out after it
  const wind = seg(t, 2.5, 2.8);
  arms = lerp(arms, 2.95, io(wind));
  reach = lerp(0, 0.5, io(wind));
  const toss = seg(t, 2.8, 2.95);
  arms = lerp(arms, 1.8, out(toss));
  reach = lerp(reach, -1.4, out(toss));
  const after = seg(t, 3.5, 3.85);
  arms = lerp(arms, 0.15, io(after));
  reach = lerp(reach, 0, io(after));
  if (t > 4.08) arms = lerp(0.15, -0.5, io(seg(t, 4.08, 4.42)));
  if (t > 4.42) arms = lerp(-0.5, 2.5, out(seg(t, 4.42, 4.6)));
  // after the cheer's landing: two pumps
  if (t > 5.1) arms = 2.5 - 0.5 * Math.max(0, Math.sin(seg(t, 5.1, 6.0) * Math.PI * 4)) - 1.8 * io(seg(t, 6.0, 6.5));
  const lean = air ? -0.1 * (t < 3 ? 1 : 0) : 0;
  return { x, lift, squash, turn, arms, reach, lean, air };
}

/** A damped spring followed from 0 to t in small steps: the part lags and overshoots what it is told. */
function follow(t: number, target: (t: number) => number, k: number, d: number) {
  let v = 0;
  let x = target(0);
  const dt = 1 / 240;
  for (let s = 0; s < t; s += dt) {
    const a = k * (target(s) - x) - d * v;
    v += a * dt;
    x += v * dt;
  }
  return x;
}

/** Pip and the tile at time t. */
function pose(rig: Rig, t: number, held: THREE.Group, target: THREE.Vector3) {
  const w = want(t);
  // the body's height follows lift; its squash and the arms go through springs (they settle with a wobble)
  const squash = follow(t, (s) => want(s).squash, 900, 22);
  const arms = follow(t, (s) => want(s).arms, 260, 20);
  const reach = follow(t, (s) => want(s).reach, 260, 20);
  // ears and tail are pushed by how fast the body goes up and down
  const vy = (s: number) => (want(s + 0.01).lift - want(s).lift) / 0.01;
  const ear = follow(t, (s) => -0.12 * vy(s), 300, 9);
  const tailK = follow(t, (s) => 0.25 * vy(s), 200, 8);
  rig.root.position.set(w.x, 0, 0.35);
  rig.root.rotation.y = w.turn;
  for (const f of rig.feet) f.position.y = Math.max(0, w.lift - 0.06);
  rig.hips.position.y = 0.26 + w.lift;
  rig.body.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
  rig.body.rotation.z = w.lean;
  rig.shoulders.forEach((s, i) => {
    const sx = i ? 1 : -1;
    s.rotation.set(reach, 0, arms * sx);
  });
  rig.ears.forEach((e, i) => (e.rotation.z = -(0.18 + ear + (squash < 0.9 ? 0.35 : 0)) * (i ? 1 : -1)));
  rig.tail.rotation.x = -(0.35 + tailK + 0.2 * Math.sin(t * 5));
  // the face
  const blink = [0.55, 2.62, 6.3].some((b) => t > b && t < b + 0.12);
  const glad = t > 3.62;
  const crouching = squash < 0.86;
  rig.open.visible = !glad && !blink && !(crouching && t > 4);
  rig.happy.visible = glad && !(crouching && t > 4 && t < 4.42);
  rig.shut.visible = !rig.open.visible && !rig.happy.visible;
  const lookUp = t > 2.3 && t < 3.6 ? 1 : 0;
  rig.pupils.forEach((p) => p.position.set(t < 3.6 ? -0.035 : 0, lookUp * 0.035, 0.002));
  rig.brows.forEach((b, i) => (b.rotation.z = (t > 3.3 && t < 3.6 ? 0.3 : -0.08) * (i ? 1 : -1)));
  rig.grin.visible = w.air || t > 4.42;
  rig.oh.visible = !rig.grin.visible && t > 3.3 && t < 3.62;
  rig.smile.visible = !rig.grin.visible && !rig.oh.visible;
  // the tile: on his hands until he passes it over; then along an arc onto the build, where it snaps down
  rig.root.updateMatrixWorld(true);
  const onHands = new THREE.Vector3();
  rig.carry.getWorldPosition(onHands);
  const k = seg(t, 2.86, 3.3);
  if (k <= 0) {
    held.position.copy(onHands);
    held.rotation.set(0, 0, 0);
  } else {
    const from = startOfPass(rig, held, target);
    // (thrown: fast off the hands, easing into its landing)
    const u = out(k);
    held.position.lerpVectors(from, target, u);
    // over, not through: up a little on the way, then a little drop and a bounce as the magnets catch it
    held.position.y += Math.sin(u * Math.PI) * 0.45;
    const snap = seg(t, 3.3, 3.52);
    if (snap > 0) held.position.y = target.y + 0.05 * (1 - back(snap));
    held.rotation.set(0, 0, 0);
  }
}
let passFrom: THREE.Vector3 | null = null;
function startOfPass(rig: Rig, held: THREE.Group, target: THREE.Vector3) {
  if (!passFrom) {
    pose(rig, 2.86, held, target);
    passFrom = held.position.clone();
  }
  return passFrom;
}

function Scene() {
  const advance = useThree((s) => s.advance);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const { rig, held, target } = useMemo(() => {
    const rig = makePip();
    const held = tile({ shape: "square", colour: "blue", pos: [-0.5, 0, 0.5], rot: [-Q, 0] });
    const target = new THREE.Vector3(-1, 1, 0);
    return { rig, held, target };
  }, []);
  const build = useMemo(() => {
    const g = new THREE.Group();
    const ps: Placed[] = [
      { shape: "square", colour: "red", pos: [-1.5, 0, 0.5], rot: [0, 0] },
      { shape: "square", colour: "red", pos: [-0.5, 0, 0.5], rot: [0, Q] },
      { shape: "square", colour: "red", pos: [-0.5, 0, -0.5], rot: [0, Math.PI] },
      { shape: "square", colour: "red", pos: [-1.5, 0, -0.5], rot: [0, -Q] },
    ];
    for (const p of ps) g.add(tile(p));
    return g;
  }, []);
  useEffect(() => {
    camera.lookAt(0.45, 0.7, 0);
    window.__seek = (t: number) => {
      pose(rig, t, held, target);
      advance(t * 1000);
    };
    window.__ready = true;
  }, [rig, held, target, advance, camera, scene]);
  return (
    <>
      <primitive object={build} />
      <primitive object={rig.root} />
      <primitive object={held} />
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
    <Canvas frameloop="never" dpr={1} camera={{ position: [0.6, 1.75, 4.5], fov: 40 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Stage paint={0} radius={5} reach={10} />
      <Scene />
    </Canvas>
  </div>,
);
