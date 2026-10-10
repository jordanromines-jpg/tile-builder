/* Make your own's 3D stage (5.0b): the table, every tile where the live physics has it now, the glowing edges a
   picked tile can go on, and the ghost of the tile about to go on. Drawn every frame while the page is open (the
   physics streams poses); each tile is its own group, posed from its body (as a truck run's tiles are). */
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { DEFAULT_LEG } from "../../engine/catalog";
import { worldPolygon, type V3 } from "../../engine/geometry";
import type { Placed } from "../../engine/types";
import { placeTile, type PlacedTile } from "../../three/buildScene";
import { cssColour } from "../../three/tile";
import { Stage } from "../../three/Stage";
import { Truck } from "../../three/truck/Truck";
import { restPose } from "../../three/truck/spec";
import type { Physics } from "./physics";
import type { Spot } from "./place";

export interface MadeTile {
  placed: Placed;
  /** its body in the physics, once it has one */
  id: number | null;
}

export interface MakeStageProps {
  tiles: MadeTile[];
  physics: Physics;
  spots: Spot[];
  chosen: Spot | null;
  ghost: Placed | null;
  ghostBad: boolean;
  selected: number | null;
  /** where a tile is being dragged, in px from the stage's top left (drag mode) */
  drag: { x: number; y: number } | null;
  onSpot: (s: Spot) => void;
  onTile: (index: number) => void;
  onDragSpot: (s: Spot | null) => void;
  label: string;
  /** 5.0d: the Pip truck is on the table */
  driving: boolean;
}

const centroid = (poly: V3[]): V3 => poly.reduce<V3>((s, v) => [s[0] + v[0] / poly.length, s[1] + v[1] / poly.length, s[2] + v[2] / poly.length], [0, 0, 0]);
const dq = new THREE.Quaternion();
const dv = new THREE.Vector3();

function Tiles({ tiles, physics, selected, onTile }: Pick<MakeStageProps, "tiles" | "physics" | "selected" | "onTile">) {
  const cache = useRef(new Map<Placed, { t: PlacedTile; c: V3 }>());
  const made = useMemo(() => {
    const keep = new Map<Placed, { t: PlacedTile; c: V3 }>();
    for (const m of tiles) keep.set(m.placed, cache.current.get(m.placed) ?? { t: placeTile(m.placed, DEFAULT_LEG), c: centroid(worldPolygon(m.placed, DEFAULT_LEG)) });
    for (const [k, v] of cache.current) if (!keep.has(k)) {
      v.t.mats.frame.dispose();
      v.t.mats.glass.dispose();
    }
    cache.current = keep;
    return tiles.map((m) => keep.get(m.placed)!);
  }, [tiles]);
  useFrame(() => {
    tiles.forEach((m, i) => {
      const { t, c } = made[i];
      const at = m.id === null ? undefined : physics.poses.get(m.id);
      t.group.position.copy(t.pT);
      t.group.quaternion.copy(t.qT);
      if (at) {
        dq.set(...at.q);
        dv.set(t.pT.x - c[0], t.pT.y - c[1], t.pT.z - c[2]).applyQuaternion(dq);
        t.group.position.set(dv.x + at.p[0], dv.y + at.p[1], dv.z + at.p[2]);
        t.group.quaternion.premultiply(dq);
      }
      t.mats.frame.emissive.set(selected === i ? cssColour("accent", "#BF5409") : "#000000");
      t.mats.frame.emissiveIntensity = selected === i ? 0.6 : 0;
    });
  });
  return (
    <>
      {made.map(({ t }, i) => (
        <primitive
          key={i}
          object={t.group}
          onClick={(e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            onTile(i);
          }}
        />
      ))}
    </>
  );
}

/** A glowing edge: a bar along it, a little proud of the tiles, easy to tap. The build's own edges glow brighter and
    thicker than the table's grid, which is only where a tile can start. */
function SpotBar({ spot, on, onPick }: { spot: Spot; on: boolean; onPick: () => void }) {
  const { mid, len, yaw, raised } = useMemo(() => {
    const d = [spot.b[0] - spot.a[0], spot.b[2] - spot.a[2]];
    return { mid: [(spot.a[0] + spot.b[0]) / 2, spot.a[1] + 0.04, (spot.a[2] + spot.b[2]) / 2] as V3, len: Math.hypot(d[0], d[1]), yaw: Math.atan2(-d[1], d[0]), raised: spot.a[1] > 0.05 };
  }, [spot]);
  const colour = useMemo(() => cssColour("accent", "#BF5409"), []);
  const thick = on ? 0.2 : raised ? 0.14 : 0.07;
  return (
    <group position={mid} rotation={[0, yaw, 0]}>
      <mesh>
        <boxGeometry args={[len * 0.88, raised || on ? 0.1 : 0.04, thick]} />
        <meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={on || raised ? 1 : 0.3} transparent opacity={on || raised ? 0.95 : 0.4} />
      </mesh>
      {/* the part a finger hits: much bigger than the bar, and unseen */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onPick();
        }}
      >
        <boxGeometry args={[len * 0.9, raised ? 0.45 : 0.12, raised ? 0.45 : 0.3]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Ghost({ tile, bad }: { tile: Placed; bad: boolean }) {
  const t = useMemo(() => placeTile(tile, DEFAULT_LEG), [tile]);
  useEffect(() => {
    for (const m of [t.mats.frame, t.mats.glass]) {
      m.transparent = true;
      m.opacity = 0.45;
      if (bad) m.color.set("#e5322e");
    }
    t.group.position.copy(t.pT);
    t.group.quaternion.copy(t.qT);
    return () => {
      t.mats.frame.dispose();
      t.mats.glass.dispose();
    };
  }, [t, bad]);
  return <primitive object={t.group} />;
}

/** Drag mode: the glowing edge nearest the finger (within 70 px), each frame. */
function DragPick({ spots, drag, onDragSpot }: Pick<MakeStageProps, "spots" | "drag" | "onDragSpot">) {
  const { camera, size } = useThree();
  const last = useRef<Spot | null>(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    let best: Spot | null = null;
    if (drag) {
      let d = 70;
      for (const s of spots) {
        v.set((s.a[0] + s.b[0]) / 2, s.a[1], (s.a[2] + s.b[2]) / 2).project(camera);
        const x = ((v.x + 1) / 2) * size.width;
        const y = ((1 - v.y) / 2) * size.height;
        const e = Math.hypot(x - drag.x, y - drag.y);
        if (e < d) {
          d = e;
          best = s;
        }
      }
    }
    if (best !== last.current) {
      last.current = best;
      onDragSpot(best);
    }
  });
  return null;
}

/** The Pip truck where the physics has it (5.0d); the view's middle follows it. Hidden until it is on the table. */
function DrivenTruck({ physics }: { physics: Physics }) {
  const group = useRef<THREE.Group>(null);
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3; update: () => void } | null;
  const pose = useMemo(() => restPose(), []);
  const aim = useMemo(() => new THREE.Vector3(), []);
  const drive = () => {
    const p = physics.truck;
    if (group.current) group.current.visible = !!p;
    if (!p) return null;
    pose.pos = [p[0], p[1], p[2]];
    pose.quat = [p[3], p[4], p[5], p[6]];
    pose.wheels.forEach((w, k) => {
      w.spin = p[7 + k * 3];
      w.steer = p[8 + k * 3];
      w.compress = p[9 + k * 3];
    });
    if (controls) {
      controls.target.lerp(aim.set(p[0], 0.5, p[2]), 0.04);
      controls.update();
    }
    return pose;
  };
  return (
    <group ref={group} visible={false}>
      <Truck drive={drive} />
    </group>
  );
}

export function MakeStage(p: MakeStageProps) {
  return (
    <div className="h-full w-full" role="img" aria-label={p.label} style={{ touchAction: "none" }}>
      <Canvas dpr={[1, 2]} camera={{ position: [3.2, 3.6, 5.2], fov: 40, near: 0.1, far: 200 }} gl={{ antialias: true }}>
        <Stage paint={0} radius={6} reach={14} />
        <Tiles tiles={p.tiles} physics={p.physics} selected={p.selected} onTile={p.onTile} />
        {p.spots.map((s, i) => (
          <SpotBar key={i} spot={s} on={s === p.chosen} onPick={() => p.onSpot(s)} />
        ))}
        {p.ghost && <Ghost tile={p.ghost} bad={p.ghostBad} />}
        <DragPick spots={p.spots} drag={p.drag} onDragSpot={p.onDragSpot} />
        {p.driving && <DrivenTruck physics={p.physics} />}
        <OrbitControls enablePan={false} minDistance={3} maxDistance={24} maxPolarAngle={Math.PI * 0.47} target={[0, 0.5, 0]} makeDefault />
      </Canvas>
    </div>
  );
}
