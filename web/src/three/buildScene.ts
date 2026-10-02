/* A project's tiles as plain three.js objects, each at its place (sprint 2, change 8). Shared by the live model
   (Model.tsx, which animates them) and the picture maker (pictures.ts, which draws them once). */
import * as THREE from "three";
import type { ShapeId } from "../engine/catalog";
import { asBuilt, rotOf } from "../engine/geometry";
import type { Placed, Project } from "../engine/types";
import { partsOf } from "./parts";
import { makeTileMaterials, tileGroup, type TileMaterials } from "./TileMesh";
import { tileQuaternion } from "./tile";

export interface PlacedTile {
  /** the tile's meshes, posed by the caller (identity inside) */
  group: THREE.Group;
  mats: TileMaterials;
  /** where it goes */
  pT: THREE.Vector3;
  qT: THREE.Quaternion;
  /** the shapes it is drawn with and where, for an outline of it */
  parts: { shape: ShapeId; at: [number, number]; flip: boolean }[];
}

/** One placed tile's meshes (two halves when a swap stands in for it), not yet posed. */
export function placeTile(raw: Placed, leg: number, instead?: ShapeId): PlacedTile {
  const p = asBuilt(raw, instead);
  const mats = makeTileMaterials(p.colour ?? "blue");
  const group = new THREE.Group();
  const parts: PlacedTile["parts"] = [];
  for (const part of partsOf(raw.shape, raw.role === "roof" ? undefined : instead)) {
    const shape = raw.role === "roof" ? p.shape : part.shape;
    const holder = tileGroup(shape, leg, mats);
    holder.position.set(part.at[0], part.at[1], 0);
    if (part.flip) holder.rotation.z = Math.PI;
    group.add(holder);
    parts.push({ shape, at: [part.at[0], part.at[1]], flip: !!part.flip });
  }
  const [rx, ry] = rotOf(p, leg);
  return { group, mats, pT: new THREE.Vector3(...p.pos), qT: tileQuaternion(rx, ry), parts };
}

/** The whole project (up to `shown` tiles), every tile in place: for a still picture. */
export function projectGroup(project: Project, leg: number, shown = project.placed.length, instead: Record<number, ShapeId> = {}): { group: THREE.Group; dispose: () => void } {
  const group = new THREE.Group();
  const tiles = project.placed.slice(0, shown).map((raw, i) => placeTile(raw, leg, instead[i]));
  for (const t of tiles) {
    t.group.position.copy(t.pT);
    t.group.quaternion.copy(t.qT);
    group.add(t.group);
  }
  return {
    group,
    dispose: () =>
      tiles.forEach((t) => {
        t.mats.frame.dispose();
        t.mats.glass.dispose();
      }),
  };
}
