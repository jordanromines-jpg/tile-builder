/* A project in 3D (sprint 2, change 4): its tiles up to `shown`. This step's tiles first appear as a soft pulsing ghost
   exactly where they go, then glide in along an arc and settle with a small magnetic snap; tiles from earlier steps
   quieten a little so the new ones read. Built imperatively, one THREE.Group a tile, so a frame changes transforms and
   opacity without re-rendering React. */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ShapeId } from "../engine/catalog";
import { worldPolygon } from "../engine/geometry";
import type { Project } from "../engine/types";
import { DROP_S, DROP_S_REDUCED, fade, GHOST_S, GLOW_S, mulberry, snap, stepProgress } from "./anim";
import { placeTile } from "./buildScene";
import { BASE_OPACITY, releaseTiles, type TileMaterials } from "./TileMesh";
import { releaseTextures } from "./textures";
import { buildGeometry, cssColour } from "./tile";

const BLACK = new THREE.Color(0, 0, 0);

interface TileObj {
  group: THREE.Group;
  ghost: THREE.Group;
  mats: TileMaterials;
  pT: THREE.Vector3;
  qT: THREE.Quaternion;
  pS: THREE.Vector3;
  qS: THREE.Quaternion;
}

/** The middle of the model's footprint and how big it is, so the camera can frame it. */
export function frameOf(project: Project, leg: number, tiles?: number[]) {
  const which = tiles ? tiles.map((t) => project.placed[t]) : project.placed;
  const pts = which.flatMap((p) => worldPolygon(p, leg));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const zs = pts.map((p) => p[2]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const w = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs));
  const h = Math.max(...ys);
  return { center: new THREE.Vector3(cx, 0, cz), middle: new THREE.Vector3(cx, cy, cz), size: Math.max(w, h, 1), height: h };
}

let ghostMat: THREE.MeshBasicMaterial | null = null;

function buildTiles(project: Project, leg: number, instead: Record<number, ShapeId>, accent: THREE.Color): TileObj[] {
  const rand = mulberry(7);
  ghostMat ??= new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true });
  ghostMat.color.copy(accent);
  return project.placed.map((raw, i) => {
    const { group, mats, pT, qT, parts } = placeTile(raw, leg, instead[i]);
    const ghost = new THREE.Group();
    for (const part of parts) {
      const geo = buildGeometry(part.shape, leg);
      const g = new THREE.Mesh(geo.glass ?? geo.frame, ghostMat!);
      g.position.set(part.at[0], part.at[1], 0);
      if (part.flip) g.rotation.z = Math.PI;
      ghost.add(g);
    }
    // start just outside the tile's face and above, a little tilted: it glides in along an arc
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(qT);
    if (n.y < -0.5) n.negate();
    const pS = pT.clone().addScaledVector(n, 0.9 + rand() * 0.3).add(new THREE.Vector3(0, 1.3 + rand() * 0.4, 0));
    const qS = qT.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((rand() - 0.5) * 0.6, (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.4)));
    group.visible = false;
    ghost.position.copy(pT);
    ghost.quaternion.copy(qT);
    ghost.visible = false;
    return { group, ghost, mats, pT, qT, pS, qS };
  });
}

export interface ModelProps {
  project: Project;
  shown: number;
  leg: number;
  instead?: Record<number, ShapeId>;
  /** tiles before this index are already in place when the model first appears */
  settled?: number;
  /** this step's tiles: ghosted first, then glided in, then softly lit */
  current?: number[];
  still?: boolean;
  /** bumped when the theme changes, to read the colours again */
  paint?: number;
}

export function Model({ project, shown, leg, instead = {}, settled = 0, current = [], still = false, paint = 0 }: ModelProps) {
  const invalidate = useThree((s) => s.invalidate);
  const key = JSON.stringify(instead);
  const accent = useMemo(() => new THREE.Color(cssColour("accent", "#BF5409")), [paint]); // eslint-disable-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tiles = useMemo(() => buildTiles(project, leg, instead, accent), [project, leg, key, paint]);
  const frame = useMemo(() => frameOf(project, leg), [project, leg]);
  const progress = useRef<number[]>([]);
  const root = useMemo(() => new THREE.Group(), []);
  const lit = useRef(new Set<number>());
  const since = useRef(0);

  useEffect(() => {
    root.clear();
    tiles.forEach((t) => {
      root.add(t.group);
      root.add(t.ghost);
    });
    progress.current = tiles.map((_, i) => (i < Math.min(settled, shown) ? 1 : 0));
    invalidate();
    return () => {
      tiles.forEach((t) => {
        t.mats.frame.dispose();
        t.mats.glass.dispose();
      });
    };
    // settled is read only when the tiles are built
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, root, invalidate]);

  useEffect(() => {
    lit.current = new Set(current.filter((t) => t < shown));
    since.current = performance.now();
    if (still) progress.current = progress.current.map((_, i) => (i < shown ? 1 : 0));
    invalidate();
  }, [shown, current, still, invalidate]);

  useFrame((state, dt) => {
    const p = progress.current;
    const age = (performance.now() - since.current) / 1000;
    const waiting = !still && age < GHOST_S;
    // the new tiles' glow and the ghost pulse for a few seconds, then hold still, so an open step costs no frames
    const pulsing = !still && age < GLOW_S;
    const startable = waiting ? Math.min(shown, Math.min(...[...lit.current, shown])) : shown;
    const moving = stepProgress(p, shown, Math.min(dt, 0.05), still ? DROP_S_REDUCED : DROP_S, startable);
    const t = state.clock.elapsedTime;
    const pulse = pulsing ? 0.16 + 0.1 * Math.sin(t * Math.PI * 2 * 0.7) : 0.16;
    const quiet = lit.current.size > 0 && shown < tiles.length;
    if (ghostMat) ghostMat.opacity = pulsing ? 0.18 + 0.14 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.1)) : 0.28;
    tiles.forEach((tile, i) => {
      const k = p[i] ?? 0;
      const mine = lit.current.has(i);
      tile.ghost.visible = mine && k < 1;
      tile.group.visible = k > 0.001;
      if (!tile.group.visible) return;
      const e = snap(k);
      tile.group.position.lerpVectors(tile.pS, tile.pT, e);
      // a little lift along the way: an arc, not a straight line
      tile.group.position.y += Math.sin(Math.min(1, k) * Math.PI) * 0.35;
      tile.group.quaternion.copy(tile.qS).slerp(tile.qT, Math.min(1, e));
      const f = fade(k);
      // frames stay transparent (at opacity 1 it looks the same): flipping the flag would need a new shader
      tile.mats.frame.opacity = BASE_OPACITY.frame * f;
      tile.mats.glass.opacity = BASE_OPACITY.glass * f * (quiet && !mine ? 0.7 : 1);
      // the new tiles glow in their own colour (an orange glow would tint a blue tile purple)
      const glow = mine && k >= 1;
      tile.mats.frame.emissive.copy(glow ? tile.mats.frame.color : BLACK);
      tile.mats.frame.emissiveIntensity = glow ? pulse : 0;
    });
    if (moving || waiting || (lit.current.size && pulsing)) invalidate();
  });

  return (
    <group position={[-frame.center.x, 0, -frame.center.z]}>
      <primitive object={root} />
    </group>
  );
}

/** Lets go of what every stage shares (the tile shapes, the ghost, the chrome and the textures); used again, three makes
    them afresh. Called when a stage closes. */
export function releaseShared() {
  ghostMat?.dispose();
  ghostMat = null;
  releaseTiles();
  releaseTextures();
}
