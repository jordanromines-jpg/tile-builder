/* MOCK ONLY (not part of the app, not committed): three new Pip concepts for Jordan ("cuter … original and well
   designed"). Soft, round characters, each with one tie to the tiles: A, a fox kit whose ears are tile glass; B, a
   little glow sprite of tile plastic with tile-triangle ears; C, a round chick with a crest of tile triangles. */
import "./tokens.css";
import "./app.css";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import { DEFAULT_LEG, type Colour, type ShapeId } from "./engine/catalog";
import { placeTile } from "./three/buildScene";
import { Stage } from "./three/Stage";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const INK = "#24170f";

type Mood = "happy" | "open" | "wow";

// ---------- materials ----------
const soft = (c: string, sheen = "#ffffff") => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.62, sheen: 0.6, sheenColor: new THREE.Color(sheen), sheenRoughness: 0.5, clearcoat: 0.05 });
const gloss = (c: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
const flat = (c: string, opacity = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
const glow = (c: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.15, transmission: 0.55, thickness: 0.6, transparent: true, opacity: 0.92, emissive: new THREE.Color(c), emissiveIntensity: 0.28, clearcoat: 1, clearcoatRoughness: 0.05, ior: 1.45 });

function blob(r: number, sx: number, sy: number, sz: number, m: THREE.Material, seg = 48) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg / 2), m);
  mesh.scale.set(sx, sy, sz);
  return mesh;
}
function tilePiece(shape: ShapeId, colour: Colour, s: number): THREE.Group {
  const t = placeTile({ shape, colour, pos: [0, 0, 0], rot: [0, 0] }, DEFAULT_LEG);
  t.group.position.copy(t.pT);
  t.group.quaternion.copy(t.qT);
  const g = new THREE.Group();
  g.add(t.group);
  g.scale.setScalar(s);
  return g;
}

/** Puts `obj` on a sphere of radius R (centre at its parent's origin) at face coordinates (x, y), facing out. */
function onSphere(parent: THREE.Object3D, R: number, x: number, y: number, obj: THREE.Object3D, out = 0) {
  const z = Math.sqrt(Math.max(0, R * R - x * x - y * y));
  const n = V(x, y, z).normalize();
  obj.position.copy(n.clone().multiplyScalar(R + out));
  obj.quaternion.setFromUnitVectors(V(0, 0, 1), n);
  parent.add(obj);
  return obj;
}

/** Big glossy eyes with two catch-lights; or happy arcs; `wow` is wider and rounder. */
function eye(r: number, mood: Mood) {
  const g = new THREE.Group();
  if (mood === "happy") {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(r * 0.75, r * 0.2, 12, 32, Math.PI * 0.82), flat(INK));
    arc.rotation.z = Math.PI * 0.09;
    // (on the surface: the open eye sits sunk in, this sits on top)
    arc.position.set(0, -r * 0.25, r * 0.55);
    g.add(arc);
    return g;
  }
  const s = mood === "wow" ? 1.12 : 1;
  // sunk in and flat enough that it never bulges past the head's outline seen from the side
  const ball = blob(r * s, 1, 1.18, 0.4, gloss("#1d120b"));
  g.add(ball);
  // a warm lower glint in the iris, and two catch-lights
  const iris = blob(r * 0.55 * s, 1, 0.75, 0.3, flat("#6b3b1c"));
  iris.position.set(0, -r * 0.5, r * 0.31);
  g.add(iris);
  const big = blob(r * 0.34, 1, 1, 0.4, flat("#ffffff"));
  big.position.set(-r * 0.32, r * 0.42, r * 0.37);
  const small = blob(r * 0.15, 1, 1, 0.4, flat("#ffffff"));
  small.position.set(r * 0.35, -r * 0.15, r * 0.38);
  g.add(big, small);
  return g;
}
function mouth(w: number, mood: Mood) {
  const g = new THREE.Group();
  if (mood === "open" || mood === "happy") {
    const m = new THREE.Mesh(new THREE.CircleGeometry(w * 0.55, 32, Math.PI, Math.PI), flat("#5a1f1a"));
    const tongue = new THREE.Mesh(new THREE.CircleGeometry(w * 0.3, 24, Math.PI, Math.PI), flat("#ff7d86"));
    tongue.position.set(0, -w * 0.22, 0.002);
    g.add(m, tongue);
  } else {
    const m = new THREE.Mesh(new THREE.CircleGeometry(w * 0.26, 32), flat("#5a1f1a"));
    m.scale.y = 1.25;
    g.add(m);
  }
  return g;
}
const cheek = (r: number) => blob(r, 1, 0.65, 0.2, flat("#ff7d8c", 0.5));

// ---------- A: the fox kit ----------
function foxKit(mood: Mood) {
  const root = new THREE.Group();
  const orange = soft("#f2832a", "#ffd3a3");
  const cream = soft("#fff1dc", "#ffffff");
  const brown = soft("#6b3b22");
  // feet and body: a little pear
  for (const sx of [-1, 1]) {
    const f = blob(0.13, 1, 0.6, 1.3, brown);
    f.position.set(0.15 * sx, 0.07, 0.08);
    root.add(f);
  }
  const body = blob(0.34, 1, 1.05, 0.92, orange);
  body.position.y = 0.4;
  root.add(body);
  const belly = blob(0.22, 1, 1.15, 0.6, cream);
  belly.position.set(0, 0.36, 0.2);
  root.add(belly);
  for (const sx of [-1, 1]) {
    const arm = blob(0.09, 1, 1.5, 1, orange);
    arm.position.set(0.3 * sx, 0.42, 0.12);
    arm.rotation.z = 0.5 * sx;
    root.add(arm);
    const paw = blob(0.07, 1, 0.9, 1, brown);
    paw.position.set(0.36 * sx, 0.3, 0.16);
    root.add(paw);
  }
  // tail: a big soft brush round the back, cream-tipped
  const tail = new THREE.Group();
  tail.position.set(0.22, 0.28, -0.3);
  tail.rotation.set(-0.5, 0.6, -0.5);
  const tb = blob(0.2, 1, 1.9, 1, orange);
  tb.position.y = 0.25;
  const tt = blob(0.15, 1, 1.2, 0.95, cream);
  tt.position.y = 0.6;
  tail.add(tb, tt);
  root.add(tail);
  // head: big and round, a cream mask low on the face
  const R = 0.46;
  const head = new THREE.Group();
  head.position.y = 1.0;
  root.add(head);
  head.add(blob(R, 1.08, 0.96, 1, orange));
  const mask = blob(0.17, 1.35, 0.78, 0.62, cream);
  onSphere(head, R * 0.9, 0, -0.2, mask);
  // ears: orange outside, tile glass inside
  for (const sx of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(0.27 * sx, 0.3, -0.02);
    ear.rotation.z = -0.38 * sx;
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.4, 32), orange);
    outer.scale.z = 0.5;
    outer.position.y = 0.16;
    ear.add(outer);
    const inner = tilePiece("tri-equilateral", "yellow", 0.24);
    inner.position.set(-0.12, 0.02, 0.06);
    ear.add(inner);
    head.add(ear);
  }
  for (const sx of [-1, 1]) onSphere(head, R, 0.19 * sx, 0.0, eye(0.125, mood), -0.04);
  const nose = blob(0.04, 1.35, 0.85, 0.8, gloss("#2b1a12"));
  onSphere(head, R, 0, -0.15, nose, 0.05);
  onSphere(head, R, 0, -0.25, mouth(0.08, mood), 0.04);
  for (const sx of [-1, 1]) onSphere(head, R, 0.33 * sx, -0.13, cheek(0.065), 0.004);
  return root;
}

// ---------- B: the glow sprite ----------
function sprite(mood: Mood) {
  const root = new THREE.Group();
  // a gumdrop of orange tile plastic, a light inside, a tile's rim round its middle
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 40; i++) {
    const k = i / 40;
    const y = k * 1.15;
    // a soft gumdrop: a full, round bottom, a little narrower at the top
    const r = 0.54 * Math.pow(Math.sin(Math.PI * k), 0.62) * (1 - 0.18 * k);
    pts.push(new THREE.Vector2(k === 1 ? 0 : r, y));
  }
  pts[0] = new THREE.Vector2(0, 0);
  const shell = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), glow("#ff8a2a"));
  root.add(shell);
  const core = blob(0.22, 1, 1, 1, new THREE.MeshBasicMaterial({ color: "#ffd27a" }));
  core.position.y = 0.42;
  root.add(core);
  // feet nubs and arm nubs
  for (const sx of [-1, 1]) {
    const f = blob(0.1, 1.2, 0.6, 1.2, gloss("#d95f0e"));
    f.position.set(0.18 * sx, 0.04, 0.1);
    root.add(f);
    const a = blob(0.085, 1, 1.25, 1, glow("#ff8a2a"));
    a.position.set(0.5 * sx, 0.42, 0.06);
    a.rotation.z = 0.6 * sx;
    root.add(a);
  }
  // ears: two real tile triangles, tipped out, like a little crown of tiles
  for (const [sx, c] of [[-1, "yellow"], [1, "blue"]] as const) {
    const e = tilePiece("tri-equilateral", c as Colour, 0.36);
    const hold = new THREE.Group();
    hold.position.set(0.16 * sx, 0.98, 0);
    hold.rotation.z = -0.32 * sx;
    e.position.x = -0.18;
    hold.add(e);
    root.add(hold);
  }
  const face = new THREE.Group();
  face.position.y = 0.62;
  root.add(face);
  const R = 0.5;
  for (const sx of [-1, 1]) onSphere(face, R, 0.17 * sx, 0.0, eye(0.12, mood), -0.02);
  onSphere(face, R, 0, -0.17, mouth(0.075, mood), 0.02);
  for (const sx of [-1, 1]) onSphere(face, R, 0.33 * sx, -0.13, cheek(0.06), 0.01);
  return root;
}

// ---------- C: the builder chick ----------
function chick(mood: Mood) {
  const root = new THREE.Group();
  const yellow = soft("#ffcf3a", "#fff3b8");
  for (const sx of [-1, 1]) {
    const f = blob(0.1, 1.3, 0.45, 1.5, gloss("#f07a1e"));
    f.position.set(0.16 * sx, 0.04, 0.12);
    root.add(f);
  }
  const R = 0.56;
  const body = new THREE.Group();
  body.position.y = 0.58;
  root.add(body);
  body.add(blob(R, 1.04, 0.98, 1, yellow));
  const tummy = blob(0.24, 1.15, 0.95, 0.45, soft("#fff2c2"));
  onSphere(body, R * 0.86, 0, -0.32, tummy);
  // wings: soft paddles at the sides
  for (const sx of [-1, 1]) {
    const w = blob(0.17, 0.55, 1.05, 0.95, yellow);
    w.position.set(0.55 * sx, -0.08, 0.02);
    w.rotation.z = 0.35 * sx;
    body.add(w);
  }
  // a crest of three tile triangles: red, blue, green
  ([[-0.15, "red", 0.42], [0, "blue", 0], [0.15, "green", -0.42]] as const).forEach(([x, c, rz]) => {
    const t = tilePiece("tri-equilateral", c as Colour, 0.3);
    const h = new THREE.Group();
    h.position.set(x, R * 0.95, -0.02);
    h.rotation.z = rz;
    t.position.x = -0.15;
    h.add(t);
    body.add(h);
  });
  for (const sx of [-1, 1]) onSphere(body, R, 0.19 * sx, 0.08, eye(0.135, mood), -0.045);
  // the beak: a little orange triangle, a tile's shape
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 3), gloss("#f07a1e"));
  beak.rotation.x = Math.PI / 2;
  const bh = new THREE.Group();
  bh.add(beak);
  onSphere(body, R, 0, -0.04, bh, 0.03);
  if (mood !== "happy") beak.scale.set(1, 1, 1);
  if (mood === "open" || mood === "happy") onSphere(body, R, 0, -0.14, mouth(0.075, mood), 0.004);
  for (const sx of [-1, 1]) onSphere(body, R, 0.37 * sx, -0.06, cheek(0.07), 0.005);
  return root;
}

// ---------- D: the magnet bun ----------
function magnetBun(mood: Mood) {
  const root = new THREE.Group();
  const lilac = soft("#9d6be0", "#e6d4ff");
  for (const sx of [-1, 1]) {
    // feet: two little tile squares' worth, rounded
    const f = blob(0.11, 1.1, 0.5, 1.25, soft("#7442b8"));
    f.position.set(0.17 * sx, 0.05, 0.08);
    root.add(f);
  }
  const R = 0.55;
  const body = new THREE.Group();
  body.position.y = 0.52;
  root.add(body);
  // a soft bun: wider than tall, a flat-ish bottom
  body.add(blob(R, 1.12, 0.9, 1, lilac));
  // the antenna: a red horseshoe magnet with silver tips, on a little stalk
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.16, 16), lilac);
  stalk.position.y = R * 0.9 + 0.06;
  body.add(stalk);
  const mag = new THREE.Group();
  mag.position.y = R * 0.9 + 0.2;
  const shoe = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.045, 16, 40, Math.PI), gloss("#e5322e"));
  mag.add(shoe);
  for (const sx of [-1, 1]) {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.07, 20), gloss("#dfe5ec"));
    tip.position.set(0.11 * sx, -0.03, 0);
    mag.add(tip);
  }
  mag.rotation.z = 0.15;
  body.add(mag);
  // two sparks by it
  for (const [x, y] of [[-0.2, 0.18], [0.24, 0.1]]) {
    const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.03), new THREE.MeshBasicMaterial({ color: "#ffe066" }));
    sp.position.set(x, R * 0.9 + 0.2 + y, 0);
    body.add(sp);
  }
  // little arms
  for (const sx of [-1, 1]) {
    const a = blob(0.1, 0.8, 1.2, 0.9, lilac);
    a.position.set(0.6 * sx, -0.12, 0.08);
    a.rotation.z = 0.5 * sx;
    body.add(a);
  }
  for (const sx of [-1, 1]) onSphere(body, R, 0.2 * sx, 0.02, eye(0.135, mood), -0.045);
  onSphere(body, R, 0, -0.17, mouth(0.08, mood), 0.004);
  for (const sx of [-1, 1]) onSphere(body, R, 0.38 * sx, -0.1, cheek(0.07), 0.005);
  return root;
}

const MAKERS = { a: foxKit, b: sprite, c: chick, d: magnetBun } as const;
const shot = new URLSearchParams(location.search).get("shot") ?? "a";

/** a concept: three-quarter, front, side, back; then two moods */
function Views() {
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const group = useMemo(() => {
    const g = new THREE.Group();
    if (shot === "lineup") {
      (["a", "b", "c", "d"] as const).forEach((k, i) => {
        const c = MAKERS[k]("open");
        c.position.set(-2.7 + i * 1.75, 0, 0);
        c.rotation.y = -0.35;
        g.add(c);
      });
      const cube = tilePiece("square", "blue", 1);
      cube.position.set(3.3, 0, -0.5);
      g.add(cube);
      return g;
    }
    const make = MAKERS[shot as "a"];
    const views: [Mood, number][] = [["open", -0.55], ["open", 0], ["open", -Math.PI / 2], ["happy", -0.25], ["wow", 0.3]];
    views.forEach(([m, turn], i) => {
      const c = make(m);
      c.position.set(-2.9 + i * 1.45, 0, 0);
      c.rotation.y = turn;
      g.add(c);
    });
    return g;
  }, []);
  useEffect(() => {
    camera.lookAt(shot === "lineup" ? 0.3 : 0, 0.6, 0);
    void scene;
    window.__ready = true;
  }, [camera, scene]);
  return <primitive object={group} />;
}

declare global {
  interface Window {
    __ready?: boolean;
  }
}

createRoot(document.getElementById("root")!).render(
  <div style={{ width: "100vw", height: "100vh" }}>
    <Canvas dpr={2} camera={{ position: shot === "lineup" ? [0.3, 1.4, 6.0] : [0, 1.15, 5.4], fov: 32 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <Stage paint={0} radius={4} reach={9} />
      <Views />
    </Canvas>
  </div>,
);
