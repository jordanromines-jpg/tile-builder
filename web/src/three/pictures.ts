/* Draws the 3D pictures (see src/pictures.ts) with the build stage's own tiles, light and camera, on a clear background
   so one picture suits the light and the dark theme. Used only by the picture maker (pictures.html, `npm run
   pictures`), never on the iPad. */
import * as THREE from "three";
import { SHAPES, type Colour, type ShapeId } from "../engine/catalog";
import type { Project } from "../engine/types";
import { projectGroup } from "./buildScene";
import { fitBox, fitDistance, fitTight, lookOf, viewFrom } from "./camera";
import { worldPolygon } from "../engine/geometry";
import { frameOf } from "./Model";
import { lightScene } from "./Stage";
import { makeTileMaterials, tileGroup } from "./TileMesh";

export function makeRenderer(): THREE.WebGLRenderer {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1;
  r.setPixelRatio(1);
  r.setClearColor(0x000000, 0);
  // make the shared light before the first picture: making it changes the renderer's viewport
  lightScene(new THREE.Scene(), r, null);
  return r;
}

function lights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x6b5a48, 0.55));
  const key = new THREE.DirectionalLight(0xfff1de, 1.6);
  key.position.set(5, 10, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd8e6ff, 0.5);
  rim.position.set(-6, 5, -5);
  scene.add(rim);
}

function shoot(r: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, w: number, h: number): string {
  r.setSize(w, h, false);
  r.render(scene, camera);
  return r.domElement.toDataURL("image/png");
}

/** One tile, standing at a three-quarter angle. */
export function drawTile(r: THREE.WebGLRenderer, shape: ShapeId, colour: Colour, leg: number, px: number): string {
  const scene = new THREE.Scene();
  lightScene(scene, r, null);
  scene.environmentIntensity = 0.8;
  lights(scene);
  const mats = makeTileMaterials(colour);
  mats.glass.opacity = 0.78;
  const tile = tileGroup(shape, leg, mats);
  const pts = SHAPES[shape].points(leg);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  tile.position.set(-(Math.min(...xs) + Math.max(...xs)) / 2, -(Math.min(...ys) + Math.max(...ys)) / 2, 0);
  const holder = new THREE.Group();
  holder.add(tile);
  holder.rotation.set(-0.32, 0.42, 0);
  scene.add(holder);
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
  camera.position.set(0, 0, (size * 0.62) / Math.tan((12 * Math.PI) / 180));
  camera.lookAt(0, 0, 0);
  const url = shoot(r, scene, camera, px, px);
  mats.frame.dispose();
  mats.glass.dispose();
  return url;
}

let blob: THREE.CanvasTexture | null = null;
function shadowBlob(): THREE.Texture {
  if (blob) return blob;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 6, 64, 64, 64);
  grad.addColorStop(0, "rgba(42,26,12,0.38)");
  grad.addColorStop(1, "rgba(42,26,12,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  blob = new THREE.CanvasTexture(c);
  return blob;
}

/** A finished project from the build stage's three-quarter view, with a soft shadow under it. */
export function drawProject(r: THREE.WebGLRenderer, project: Project, leg: number, w: number, h: number): string {
  const scene = new THREE.Scene();
  lightScene(scene, r, null);
  lights(scene);
  const f = frameOf(project, leg);
  const { group, dispose } = projectGroup(project, leg);
  group.position.set(-f.center.x, 0, -f.center.z);
  scene.add(group);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowBlob(), transparent: true, depthWrite: false });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(f.size * 1.25, f.size * 1.25), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  scene.add(shadow);
  const aspect = w / h;
  const camera = new THREE.PerspectiveCamera(32, aspect, 0.1, 200);
  const target = new THREE.Vector3(0, Math.min(f.height * 0.38, 2.4), 0);
  const look = lookOf(project);
  // 2.8.1: a tall build's top was cut off. Every tile's corners are checked; only when one falls outside does the camera
  // stand back, to fit them all with a little air, so every other picture stays as it was
  const pts = project.placed.flatMap((t) => worldPolygon(t, leg)).map((v) => new THREE.Vector3(v[0], v[1], v[2]).sub(f.center).sub(target));
  const usual = fitDistance(f.size, aspect, f.height) * 1.08;
  camera.position.copy(viewFrom(target, fitTight(pts, aspect, 1, look) > usual ? fitBox(pts, aspect, 1, look) : usual, 0, look));
  camera.lookAt(target);
  const url = shoot(r, scene, camera, w, h);
  dispose();
  shadowMat.dispose();
  shadow.geometry.dispose();
  return url;
}
