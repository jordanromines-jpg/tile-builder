/* The finish's falling tiles (4.2c): the fall worked out once by fallSim.ts, played here. Little magnet tiles in the
   tile material, drawn as instances: one mesh a shape and part (frame, clear face, rivets), each tile its own colour.
   Frames are asked for only while something moves; when the last tile lies still the stage stops drawing, and the
   tiles stay where they lie. */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { DEFAULT_LEG, type ShapeId } from "../engine/catalog";
import type { Project } from "../engine/types";
import { FRAME_S, simulate, type FallResult } from "./fallSim";
import { buildField } from "./heightField";
import { lite, makeTileMaterials, rivetMaterial } from "./TileMesh";
import { buildGeometry, tileColour } from "./tile";

interface Batch {
  shape: ShapeId;
  /** the pieces of this shape, as indexes into the result */
  pieces: number[];
  meshes: THREE.InstancedMesh[];
}

const m = new THREE.Matrix4();
const pos = new THREE.Vector3();
const q0 = new THREE.Quaternion();
const q1 = new THREE.Quaternion();
const one = new THREE.Vector3();
const back = new THREE.Matrix4();

/** The fall, worked out for this project (a few milliseconds). */
export function fallFor(project: Project, leg = DEFAULT_LEG): FallResult {
  return simulate(buildField(project, leg));
}

export function FallingTiles({ project, leg = DEFAULT_LEG, paint = 0, onRest }: { project: Project; leg?: number; paint?: number; onRest?: () => void }) {
  const invalidate = useThree((s) => s.invalidate);
  const fall = useMemo(() => fallFor(project, leg), [project, leg]);
  const start = useRef(0);
  const done = useRef(false);
  const rest = useRef(onRest);
  rest.current = onRest;

  const { root, groups, mats } = useMemo(() => {
    const root = new THREE.Group();
    // white plastic: each instance's colour multiplies it
    const base = makeTileMaterials("red");
    base.frame.color.set(0xffffff);
    base.glass.color.set(0xffffff);
    const groups: Batch[] = [];
    for (const shape of new Set(fall.pieces.map((p) => p.shape))) {
      const pieces = fall.pieces.flatMap((p, i) => (p.shape === shape ? [i] : []));
      const geo = buildGeometry(shape, leg);
      const meshes: THREE.InstancedMesh[] = [];
      const parts: [THREE.BufferGeometry, THREE.Material, number][] = [[geo.frame, base.frame, 0]];
      if (geo.glass) parts.push([geo.glass, base.glass, 1]);
      if (!lite()) parts.push([geo.rivets, rivetMaterial(), 0]);
      for (const [g, material, order] of parts) {
        const mesh = new THREE.InstancedMesh(g, material, pieces.length);
        mesh.frustumCulled = false;
        mesh.renderOrder = order;
        if (material !== rivetMaterial()) pieces.forEach((pi, k) => mesh.setColorAt(k, new THREE.Color(tileColour(fall.pieces[pi].colour))));
        root.add(mesh);
        meshes.push(mesh);
      }
      groups.push({ shape, pieces, meshes });
    }
    return { root, groups, mats: base };
    // paint: read the colours again when light or dark or the look changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fall, leg, paint]);

  useEffect(
    () => () => {
      mats.frame.dispose();
      mats.glass.dispose();
      root.children.forEach((c) => (c as THREE.InstancedMesh).dispose());
    },
    [mats, root],
  );

  // a new fall (or colours) starts from the top
  useEffect(() => {
    start.current = 0;
    done.current = false;
    invalidate();
  }, [fall, invalidate]);

  useFrame(() => {
    if (done.current) return;
    const now = performance.now();
    if (!start.current) start.current = now;
    const t = (now - start.current) / 1000;
    const f = Math.min(fall.frames - 1, t / FRAME_S);
    const f0 = Math.floor(f);
    const k = f - f0;
    const f1 = Math.min(fall.frames - 1, f0 + 1);
    for (const g of groups) {
      g.pieces.forEach((pi, n) => {
        const pc = fall.pieces[pi];
        const tr = fall.track[pi];
        if (f0 < fall.first[pi]) m.makeScale(0, 0, 0);
        else {
          const a = f0 * 7;
          const b = f1 * 7;
          pos.set(tr[a] + (tr[b] - tr[a]) * k, tr[a + 1] + (tr[b + 1] - tr[a + 1]) * k, tr[a + 2] + (tr[b + 2] - tr[a + 2]) * k);
          q0.set(tr[a + 3], tr[a + 4], tr[a + 5], tr[a + 6]);
          q1.set(tr[b + 3], tr[b + 4], tr[b + 5], tr[b + 6]);
          m.compose(pos, q0.slerp(q1, k), one.setScalar(pc.scale));
          // the tile turns about its middle: shift its own points so the middle is the origin
          m.multiply(back.makeTranslation(-pc.centre[0], -pc.centre[1], 0));
        }
        for (const mesh of g.meshes) mesh.setMatrixAt(n, m);
      });
      for (const mesh of g.meshes) mesh.instanceMatrix.needsUpdate = true;
    }
    if (f >= fall.frames - 1) {
      done.current = true;
      rest.current?.();
    } else invalidate();
  });

  return <primitive object={root} />;
}
