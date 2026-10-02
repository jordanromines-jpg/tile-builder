/* A project in 3D (plan key 6a): its tiles up to `shown`, each dropping into place one after another (prototype lines
   303–348); this step's tiles glow softly in the accent colour so a child sees where they go. Built imperatively, one
   THREE.Group a tile, so a frame changes transforms and opacity without re-rendering React. */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ShapeId } from "../engine/catalog";
import { asBuilt, rotOf, worldPolygon } from "../engine/geometry";
import type { Project } from "../engine/types";
import { DROP_S, DROP_S_REDUCED, easeOutBack, fade, mulberry, stepProgress } from "./anim";
import { partsOf } from "./parts";
import { BASE_OPACITY, makeTileMaterials } from "./TileMesh";
import { buildGeometry, cssColour, tileQuaternion } from "./tile";

const BLACK = new THREE.Color(0, 0, 0);

interface TileObj {
  group: THREE.Group;
  mats: { frame: THREE.MeshStandardMaterial; glass: THREE.MeshStandardMaterial; ridge: THREE.LineBasicMaterial };
  pT: THREE.Vector3;
  qT: THREE.Quaternion;
  pS: THREE.Vector3;
  qS: THREE.Quaternion;
}

/** The middle of the model's footprint and how big it is, so the camera can frame it. */
export function frameOf(project: Project, leg: number) {
  const pts = project.placed.flatMap((p) => worldPolygon(p, leg));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const zs = pts.map((p) => p[2]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const w = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs));
  const h = Math.max(...ys);
  return { center: new THREE.Vector3(cx, 0, cz), size: Math.max(w, h, 1), height: h };
}

function buildTiles(project: Project, leg: number, instead: Record<number, ShapeId>): TileObj[] {
  const rand = mulberry(7);
  return project.placed.map((raw, i) => {
    const p = asBuilt(raw, instead[i]);
    const colour = p.colour ?? "blue";
    const mats = makeTileMaterials(colour);
    const group = new THREE.Group();
    for (const part of partsOf(raw.shape, raw.role === "roof" ? undefined : instead[i])) {
      const geo = buildGeometry(raw.role === "roof" ? p.shape : part.shape, leg);
      const holder = new THREE.Group();
      holder.position.set(part.at[0], part.at[1], 0);
      if (part.flip) holder.rotation.z = Math.PI;
      const frame = new THREE.Mesh(geo.frame, mats.frame);
      frame.castShadow = true;
      frame.receiveShadow = true;
      holder.add(frame);
      if (geo.glass) {
        const glass = new THREE.Mesh(geo.glass, mats.glass);
        glass.castShadow = true;
        holder.add(glass);
      }
      for (const z of [0.012, -0.012]) {
        const line = new THREE.Line(geo.ridge, mats.ridge);
        line.position.z = z;
        holder.add(line);
      }
      group.add(holder);
    }
    const [rx, ry] = rotOf(p, leg);
    const qT = tileQuaternion(rx, ry);
    const pT = new THREE.Vector3(...p.pos);
    const qS = qT.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((rand() - 0.5) * 1.2, (rand() - 0.5) * 1.6, (rand() - 0.5) * 0.8)));
    const pS = pT.clone().add(new THREE.Vector3((rand() - 0.5) * 2.2, 3.6 + rand() * 1.4, (rand() - 0.5) * 2.2));
    group.visible = false;
    return { group, mats, pT, qT, pS, qS };
  });
}

export interface ModelProps {
  project: Project;
  shown: number;
  leg: number;
  instead?: Record<number, ShapeId>;
  /** tiles before this index are already in place when the model first appears */
  settled?: number;
  /** the tiles of this step glow softly */
  current?: number[];
  still?: boolean;
  /** bumped when the theme changes, to read the colours again */
  paint?: number;
}

export function Model({ project, shown, leg, instead = {}, settled = 0, current = [], still = false, paint = 0 }: ModelProps) {
  const invalidate = useThree((s) => s.invalidate);
  const key = JSON.stringify(instead);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tiles = useMemo(() => buildTiles(project, leg, instead), [project, leg, key, paint]);
  const frame = useMemo(() => frameOf(project, leg), [project, leg]);
  const progress = useRef<number[]>([]);
  const root = useMemo(() => new THREE.Group(), []);
  const accent = useMemo(() => new THREE.Color(cssColour("accent", "#0B6E78")), [paint]); // eslint-disable-line react-hooks/exhaustive-deps
  const glow = useRef(new Set<number>());

  useEffect(() => {
    root.clear();
    tiles.forEach((t) => root.add(t.group));
    progress.current = tiles.map((_, i) => (i < Math.min(settled, shown) ? 1 : 0));
    invalidate();
    return () => {
      tiles.forEach((t) => Object.values(t.mats).forEach((m) => m.dispose()));
    };
    // settled is read only when the tiles are built
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, root, invalidate]);

  useEffect(() => {
    glow.current = new Set(current);
    if (still) progress.current = progress.current.map((_, i) => (i < shown ? 1 : 0));
    invalidate();
  }, [shown, current, still, invalidate]);

  useFrame((state, dt) => {
    const p = progress.current;
    const moving = stepProgress(p, shown, Math.min(dt, 0.05), still ? DROP_S_REDUCED : DROP_S);
    const pulse = still ? 0.3 : 0.25 + 0.2 * Math.sin(state.clock.elapsedTime * Math.PI * 2 * 0.8);
    tiles.forEach((t, i) => {
      const k = p[i] ?? 0;
      t.group.visible = k > 0.001;
      if (!t.group.visible) return;
      const e = easeOutBack(k);
      t.group.position.lerpVectors(t.pS, t.pT, e);
      t.group.quaternion.copy(t.qS).slerp(t.qT, Math.min(1, e));
      const f = fade(k);
      t.mats.frame.opacity = BASE_OPACITY.frame * f;
      t.mats.glass.opacity = BASE_OPACITY.glass * f;
      t.mats.ridge.opacity = BASE_OPACITY.ridge * f;
      const lit = glow.current.has(i) && k >= 1;
      t.mats.frame.emissive.copy(lit ? accent : BLACK);
      t.mats.frame.emissiveIntensity = lit ? pulse : 0;
    });
    if (moving || (glow.current.size && !still)) invalidate();
  });

  return (
    <group position={[-frame.center.x, 0, -frame.center.z]}>
      <primitive object={root} />
    </group>
  );
}
