/* Pictures from the 3D (sprint 2, change 8): a tile chip and a project card show the same glossy tiles as the build
   stage, not a flat drawing. One shared offscreen renderer (one WebGL context) draws each picture once, a picture at a
   time so the page stays responsive, and keeps it in memory as an image URL. Without WebGL (old devices, the unit tests)
   nothing is drawn and callers keep their SVG. */
import * as THREE from "three";
import { SHAPES, type Colour, type ShapeId } from "../engine/catalog";
import type { Project } from "../engine/types";
import { isDark } from "../ground";
import { projectGroup } from "./buildScene";
import { fitDistance, viewFrom } from "./camera";
import { frameOf } from "./Model";
import { lightScene } from "./Stage";
import { woodTexture } from "./textures";
import { cssColour, tileColour } from "./tile";
import { makeTileMaterials, tileGroup } from "./TileMesh";

let renderer: THREE.WebGLRenderer | null | undefined;

function getRenderer(): THREE.WebGLRenderer | null {
  if (renderer !== undefined) return renderer;
  renderer = null;
  try {
    if (typeof document === "undefined" || typeof WebGLRenderingContext === "undefined") return null;
    const canvas = document.createElement("canvas");
    if (!canvas.getContext("webgl2") && !canvas.getContext("webgl")) return null;
    const r = new THREE.WebGLRenderer({ canvas: document.createElement("canvas"), antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.toneMapping = THREE.NeutralToneMapping;
    r.setPixelRatio(1);
    // make the shared light once, before the first picture: making it changes the renderer's viewport
    lightScene(new THREE.Scene(), r, null);
    renderer = r;
  } catch {
    renderer = null;
  }
  return renderer;
}

const cache = new Map<string, string>();
const waiting = new Map<string, Set<(url: string | null) => void>>();
const queue: { key: string; draw: (r: THREE.WebGLRenderer) => string }[] = [];
let running = false;

function pump() {
  if (running) return;
  const job = queue.shift();
  if (!job) return;
  running = true;
  const go = () => {
    const r = getRenderer();
    const until = performance.now() + 24;
    for (let j: typeof job | undefined = job; j; j = performance.now() < until ? queue.shift() : undefined) {
      let url: string | null = null;
      try {
        if (r) url = j.draw(r);
      } catch {
        url = null;
      }
      if (url) cache.set(j.key, url);
      waiting.get(j.key)?.forEach((f) => f(url));
      waiting.delete(j.key);
    }
    running = false;
    pump();
  };
  // a few pictures a frame (or when the page is idle), so taps never wait long on drawing
  if (typeof requestIdleCallback === "function") requestIdleCallback(go, { timeout: 120 });
  else setTimeout(go, 16);
}

function request(key: string, draw: (r: THREE.WebGLRenderer) => string, done: (url: string | null) => void): () => void {
  const hit = cache.get(key);
  if (hit) {
    done(hit);
    return () => {};
  }
  let set = waiting.get(key);
  if (!set) {
    set = new Set();
    waiting.set(key, set);
    queue.push({ key, draw });
  }
  set.add(done);
  pump();
  return () => set!.delete(done);
}

function shoot(r: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, w: number, h: number, type: string): string {
  r.setSize(w, h, false);
  r.render(scene, camera);
  return r.domElement.toDataURL(type, 0.86);
}

function dispose(o: THREE.Object3D) {
  o.traverse((m) => {
    if (m instanceof THREE.Mesh && m.material instanceof THREE.Material && m.material.name === "snap") m.material.dispose();
  });
}

/** One tile, standing at a three-quarter angle, on a clear background. */
function drawTile(shape: ShapeId, colour: Colour, leg: number, px: number) {
  return (r: THREE.WebGLRenderer) => {
    const scene = new THREE.Scene();
    lightScene(scene, r, null);
    scene.environmentIntensity = 0.8;
    scene.add(new THREE.HemisphereLight(0xfff4e6, 0x6b5a48, 0.6));
    const key = new THREE.DirectionalLight(0xfff1de, 1.6);
    key.position.set(3, 6, 8);
    scene.add(key);
    const mats = makeTileMaterials(colour);
    mats.glass.opacity = 0.78;
    const tile = tileGroup(shape, leg, mats);
    const pts = SHAPES[shape].points(leg);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    tile.position.set(-cx, -cy, 0);
    const holder = new THREE.Group();
    holder.add(tile);
    holder.rotation.set(-0.32, 0.42, 0);
    scene.add(holder);
    const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
    camera.position.set(0, 0, (size * 0.62) / Math.tan((12 * Math.PI) / 180));
    camera.lookAt(0, 0, 0);
    r.setClearColor(0x000000, 0);
    r.toneMappingExposure = 1;
    const url = shoot(r, scene, camera, px, px, "image/png");
    mats.frame.dispose();
    mats.glass.dispose();
    return url;
  };
}

/** A finished project on the wooden table, from the build stage's three-quarter view. */
function drawProject(project: Project, leg: number, w: number, h: number, dark: boolean) {
  return (r: THREE.WebGLRenderer) => {
    const scene = new THREE.Scene();
    const bg = cssColour("stage", dark ? "#1E2433" : "#F6E7D2");
    lightScene(scene, r, bg);
    scene.add(new THREE.HemisphereLight(0xfff4e6, 0x6b5a48, dark ? 0.35 : 0.5));
    const key = new THREE.DirectionalLight(0xfff1de, dark ? 1.3 : 1.7);
    key.position.set(5, 10, 7);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd8e6ff, 0.55);
    rim.position.set(-6, 5, -5);
    scene.add(rim);
    const wood = woodTexture(dark);
    const table = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ map: wood ?? undefined, color: wood ? 0xffffff : 0xe6c79a, roughness: 0.62, name: "snap" }),
    );
    table.rotation.x = -Math.PI / 2;
    scene.add(table);
    const f = frameOf(project, leg);
    const { group, dispose: free } = projectGroup(project, leg);
    group.position.set(-f.center.x, 0, -f.center.z);
    scene.add(group);
    // a soft shadow under the model
    const blob = shadowBlob();
    if (blob) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(f.size * 1.5, f.size * 1.5), new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false, opacity: dark ? 0.6 : 0.45, name: "snap" }));
      s.rotation.x = -Math.PI / 2;
      s.position.y = 0.004;
      scene.add(s);
    }
    const aspect = w / h;
    const camera = new THREE.PerspectiveCamera(32, aspect, 0.1, 200);
    const target = new THREE.Vector3(0, Math.min(f.height * 0.38, 2.4), 0);
    camera.position.copy(viewFrom(target, fitDistance(f.size, aspect, f.height) * 0.92));
    camera.lookAt(target);
    r.setClearColor(new THREE.Color(bg), 1);
    r.toneMappingExposure = dark ? 0.95 : 1;
    const url = shoot(r, scene, camera, w, h, "image/jpeg");
    free();
    dispose(scene);
    return url;
  };
}

let blobTex: THREE.CanvasTexture | null = null;
function shadowBlob(): THREE.Texture | null {
  if (blobTex) return blobTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  if (!g) return null;
  const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  grad.addColorStop(0, "rgba(42,26,12,0.9)");
  grad.addColorStop(1, "rgba(42,26,12,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  blobTex = new THREE.CanvasTexture(c);
  return blobTex;
}

function tileKey(shape: ShapeId, colour: Colour, px: number, leg: number) {
  return `t:${shape}:${tileColour(colour)}:${shape === "tri-isosceles-tall" ? leg.toFixed(3) : ""}:${px}`;
}

function projectKey(project: Project, w: number) {
  return `p:${project.id}:${isDark() ? "d" : "l"}:${cssColour("stage", "")}:${w}`;
}

/** A tile's picture, `px` square (drawn at twice that for sharp screens): `done` gets its URL, or null without WebGL.
    Returns a cancel. */
export function tileSnapshot(shape: ShapeId, colour: Colour, px: number, leg: number, done: (url: string | null) => void): () => void {
  return request(tileKey(shape, colour, px, leg), drawTile(shape, colour, leg, px * 2), done);
}

/** A finished project's picture, `w` wide and 4:3. */
export function projectSnapshot(project: Project, w: number, leg: number, done: (url: string | null) => void): () => void {
  return request(projectKey(project, w), drawProject(project, leg, w, Math.round((w * 3) / 4), isDark()), done);
}

/** For the unit tests: forget every picture and the renderer. */
export function resetSnapshots() {
  cache.clear();
  renderer = undefined;
}
