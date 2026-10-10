/* Look development for 5.4.0 (mock, untracked): real projects drawn with the app's own tile code on today's Toy studio
   stage or on the new set (a real room as light and as a blurred backdrop, a wooden table with an edge, a warm key and
   two coloured rims), with the tile finish by tier. scripts drive it through window.__shot. */
import * as THREE from "three";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { DEFAULT_LEG } from "./engine/catalog";
import { worldPolygon } from "./engine/geometry";
import type { Project } from "./engine/types";
import { drawFullLook } from "./gpu";
import { loadProject } from "./projects/load";
import { projectGroup } from "./three/buildScene";
import { fitBox, fitDistance, fitTight, lookOf, viewFrom } from "./three/camera";
import { frameOf } from "./three/Model";
import type { TileMaterials } from "./three/TileMesh";

drawFullLook();
type Tier = "low" | "mid" | "high";
export interface Shot {
  project: string;
  stage: "today" | "new";
  room: string;
  dark: boolean;
  tier: Tier;
  /** the room's turn about the vertical, radians: what is behind the build */
  turn?: number;
  /** the table: walnut (Poly Haven's own) or maple (the same wood lifted, as the boards' shelves) */
  wood?: "walnut" | "maple";
  w?: number;
  h?: number;
}

/** each room's best turn (from a sweep of four): something warm and calm behind the build */
const TURNS: Record<string, number> = { brown_photostudio_02: 0, empty_play_room: 1.57, lebombo: 3.14, photo_studio_loft_hall: 1.57 };
const BASE = `${import.meta.env.BASE_URL}mock-set/`;
const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
r.setPixelRatio(1);
r.shadowMap.enabled = true;
r.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(r.domElement);
const pmrem = new THREE.PMREMGenerator(r);
const ktx = new KTX2Loader().setTranscoderPath(`${BASE}basis/`).detectSupport(r);
const rooms = new Map<string, Promise<THREE.Texture>>();
function room(name: string, tier: Tier): Promise<THREE.Texture> {
  const key = `${name}_${tier === "high" ? "1k" : "512"}`;
  let p = rooms.get(key);
  if (!p) {
    p = new RGBELoader().loadAsync(`${BASE}${key}.hdr`).then((t) => {
      t.mapping = THREE.EquirectangularReflectionMapping;
      const env = pmrem.fromEquirectangular(t).texture;
      t.dispose();
      return env;
    });
    rooms.set(key, p);
  }
  return p;
}
const woodMaps = new Map<string, Promise<THREE.Texture[]>>();
function wood(kind: "walnut" | "maple"): Promise<THREE.Texture[]> {
  const hit = woodMaps.get(kind);
  if (hit) return hit;
  const p = Promise.all([kind === "maple" ? "diff_light" : "diff", "nor_gl", "rough"].map((n) => ktx.loadAsync(`${BASE}wood_${n}.ktx2`))).then((ts) => {
    for (const t of ts) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
    }
    ts[0].colorSpace = THREE.SRGBColorSpace;
    return ts;
  });
  woodMaps.set(kind, p);
  return p;
}

/** The new tile finish (5.4.0e): a satin vinyl frame; glass that light comes through (high), or a warm fake (mid). */
export function finish(m: TileMaterials, tier: Tier) {
  if (tier === "low") return;
  const f = m.frame as THREE.MeshPhysicalMaterial;
  f.roughness = 0.42;
  f.clearcoat = 0.4;
  f.clearcoatRoughness = 0.15;
  f.sheen = 0.12;
  f.sheenRoughness = 0.5;
  f.sheenColor = f.color.clone();
  const g = m.glass as THREE.MeshPhysicalMaterial;
  if (tier === "high") {
    g.transparent = false;
    g.opacity = 1;
    g.depthWrite = true;
    g.transmission = 1;
    g.thickness = 0.1;
    g.ior = 1.45;
    g.roughness = 0.22;
    g.attenuationColor = g.color.clone();
    g.attenuationDistance = 0.45;
    g.color = g.color.clone().lerp(new THREE.Color(1, 1, 1), 0.2);
    // a little of its own colour, as light caught inside the plastic glows in the hero renders
    g.emissive = g.attenuationColor.clone().multiplyScalar(0.1);
  } else {
    g.opacity = 0.7;
    g.emissive = g.color.clone().multiplyScalar(0.12);
    g.sheen = 0.3;
    g.sheenColor = g.color.clone();
  }
  f.needsUpdate = g.needsUpdate = true;
}

async function newStage(scene: THREE.Scene, s: Shot, size: number) {
  const env = await room(s.room, s.tier);
  scene.environment = env;
  scene.background = env;
  // dark is the same room in the evening: the room dim, a warm lamp on the table
  scene.environmentIntensity = s.dark ? 0.28 : 1.1;
  scene.backgroundIntensity = s.dark ? 0.1 : 0.95;
  scene.backgroundBlurriness = 0.5;
  scene.environmentRotation.y = scene.backgroundRotation.y = s.turn ?? TURNS[s.room] ?? 0;
  const [diff, nor, rough] = await wood(s.wood ?? "walnut");
  // the grain keeps its real size: about a plank's width per two squares
  for (const t of [diff, nor, rough]) t.repeat.set(size * 0.9, size * 0.9);
  const top = new RoundedBoxGeometry(size * 3.2, 0.4, size * 2.4, 4, 0.06);
  const table = new THREE.Mesh(
    top,
    new THREE.MeshPhysicalMaterial({ map: diff, normalMap: nor, normalScale: new THREE.Vector2(0.5, 0.5), roughnessMap: rough, roughness: 1, specularIntensity: 0.35, color: s.dark ? 0xd8b896 : 0xffffff }),
  );
  table.position.y = -0.2;
  table.receiveShadow = true;
  scene.add(table);
  const key = new THREE.DirectionalLight(s.dark ? 0xffc27a : 0xffe7cc, s.dark ? 2.6 : 2.2);
  // from the side and above: its glint on the wood falls out of the view, not in front of the build
  key.position.set(-size * 1.8, size * 2.2, size * 0.2);
  if (s.tier === "high") {
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 6;
    key.shadow.bias = -0.0004;
    const c = key.shadow.camera;
    c.left = c.bottom = -size * 1.5;
    c.right = c.top = size * 1.5;
    c.far = size * 8;
  }
  scene.add(key);
  for (const [x, col, i] of [[-1, 0xffc88e, 0.9], [1, 0xa8d4ff, 1.0]] as const) {
    const rim = new THREE.DirectionalLight(col, (s.dark ? 1.3 : 1) * i);
    rim.position.set(x * size * 1.3, size * 1.1, -size * 1.4);
    scene.add(rim);
  }
  // Neutral keeps the tiles' colours clean (AgX greyed them)
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = s.dark ? 1.0 : 1.1;
}

function todayStage(_scene: THREE.Scene, _s: Shot, _size: number) {
  throw new Error("today's Toy studio stage is gone from this branch (5.4.3); its frames are in design/set/out");
}

async function shot(s: Shot): Promise<{ url: string; ms: number }> {
  const w = s.w ?? 1280;
  const h = s.h ?? 800;
  // "none": the room and the table alone, for the 2D screens' plate
  const project: Project = s.project === "none" ? { ...(await loadProject("pitched-house")), placed: [] } : await loadProject(s.project);
  const scene = new THREE.Scene();
  const f = s.project === "none" ? { center: new THREE.Vector3(), size: 3, height: 1 } : frameOf(project, DEFAULT_LEG);
  const { group, dispose } = projectGroup(project, DEFAULT_LEG);
  group.position.set(-f.center.x, 0, -f.center.z);
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) o.castShadow = o.receiveShadow = true;
  });
  if (s.stage === "new") {
    const seen = new Set<THREE.Material>();
    group.traverse((o) => {
      if (!(o instanceof THREE.Group)) return;
      const [frame, glass] = o.children.filter((c): c is THREE.Mesh => c instanceof THREE.Mesh);
      if (frame && glass && !seen.has(frame.material as THREE.Material)) {
        seen.add(frame.material as THREE.Material);
        finish({ frame: frame.material, glass: glass.material } as TileMaterials, s.tier);
      }
    });
  }
  scene.add(group);
  if (s.stage === "new") await newStage(scene, s, Math.max(f.size, 3));
  else todayStage(scene, s, Math.max(f.size, 3));
  const aspect = w / h;
  const camera = new THREE.PerspectiveCamera(32, aspect, 0.1, 400);
  const target = new THREE.Vector3(0, Math.min(f.height * 0.38, 2.4), 0);
  const look = lookOf(project);
  const pts = project.placed.flatMap((t) => worldPolygon(t, DEFAULT_LEG)).map((v) => new THREE.Vector3(v[0], v[1], v[2]).sub(f.center).sub(target));
  const usual = fitDistance(f.size, aspect, f.height) * 1.25;
  camera.position.copy(viewFrom(target, fitTight(pts, aspect, 1, look) > usual ? fitBox(pts, aspect, 1, look) * 1.15 : usual, 0, look));
  camera.lookAt(target);
  if (s.project === "none") {
    // the plate: level with the table, so the wall fills the screen and the table is a strip along the bottom
    camera.position.set(0, 0.55, 5.2);
    camera.lookAt(0, 1.1, -4);
  }
  r.setSize(w, h, false);
  r.render(scene, camera); // warm-up: shaders compile, transmission target made
  const t0 = performance.now();
  for (let i = 0; i < 10; i++) r.render(scene, camera);
  r.getContext().finish();
  const ms = (performance.now() - t0) / 10;
  const url = r.domElement.toDataURL("image/png");
  dispose();
  return { url, ms };
}

declare global {
  interface Window {
    __shot: (s: Shot) => Promise<{ url: string; ms: number }>;
  }
}
window.__shot = shot;
