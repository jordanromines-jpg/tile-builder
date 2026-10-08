/* Tile materials (sprint 2, change 1) and one tile in a react-three-fiber scene. The frame is glossy ABS plastic, the face
   clear tinted plastic with a moulded texture, the rivets chrome. Lit by the scene's environment (Stage.tsx). */
import type {} from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import type { Colour, ShapeId } from "../engine/catalog";
import { softwareGL } from "../gpu";
import { faceBump } from "./textures";
import { buildGeometry, releaseGeometry, tileColour } from "./tile";

export const BASE_OPACITY = { frame: 1, glass: 0.62 };

let chrome: THREE.MeshStandardMaterial | null = null;
export function rivetMaterial(): THREE.MeshStandardMaterial {
  chrome ??= new THREE.MeshStandardMaterial({ color: 0xdfe3e8, metalness: 1, roughness: 0.22, envMapIntensity: 1.4 });
  return chrome;
}

export interface TileMaterials {
  frame: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  rivet: THREE.MeshStandardMaterial;
}

export function makeTileMaterials(colour: Colour): TileMaterials {
  const col = new THREE.Color(tileColour(colour));
  // without a GPU: plain lit plastic (the standard shader, no clear coat or moulded texture) and the clear face drawn
  // in one pass, so the stage keeps a usable frame rate
  if (lite()) {
    return {
      frame: new THREE.MeshStandardMaterial({ color: col, roughness: 0.4, transparent: true, opacity: 1 }),
      glass: new THREE.MeshStandardMaterial({ color: col, roughness: 0.3, transparent: true, opacity: BASE_OPACITY.glass, side: THREE.DoubleSide, depthWrite: false, forceSinglePass: true }),
      rivet: rivetMaterial(),
    };
  }
  const bump = faceBump();
  return {
    frame: new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.18, transparent: true, opacity: 1 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: col,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: BASE_OPACITY.glass,
      side: THREE.DoubleSide,
      depthWrite: false,
      // one pass for both sides: three would otherwise draw every clear face twice a frame
      forceSinglePass: true,
      ...(bump ? { bumpMap: bump, bumpScale: 0.9 } : {}),
    }),
    rivet: rivetMaterial(),
  };
}

/** The light version of the 3D, for devices without a GPU. */
export function lite(): boolean {
  return typeof document !== "undefined" && softwareGL();
}

/** One tile's meshes, built imperatively (Model.tsx uses this for every tile it animates). */
export function tileGroup(shape: ShapeId, leg: number, m: TileMaterials, light = false): THREE.Group {
  const geo = buildGeometry(shape, leg, light);
  const g = new THREE.Group();
  const frame = new THREE.Mesh(geo.frame, m.frame);
  frame.castShadow = true;
  frame.receiveShadow = true;
  g.add(frame);
  if (geo.glass) {
    const glass = new THREE.Mesh(geo.glass, m.glass);
    glass.castShadow = true;
    glass.renderOrder = 1;
    g.add(glass);
  }
  // rivets are small: without a GPU they are left out (one draw call a tile saved)
  if (!lite()) g.add(new THREE.Mesh(geo.rivets, m.rivet));
  return g;
}

export interface TileMeshProps {
  shape: ShapeId;
  colour: Colour;
  leg?: number;
  position?: THREE.Vector3Tuple;
  quaternion?: THREE.Quaternion;
  /** a theme change bumps this so colours are read again */
  paint?: number;
}

/** A single still tile, for the design page. */
export function TileMesh({ shape, colour, leg = 1.867, position = [0, 0, 0], quaternion, paint = 0 }: TileMeshProps) {
  // paint is a dependency on purpose: a theme change reads the colours again
  const group = useMemo(() => tileGroup(shape, leg, makeTileMaterials(colour)), [shape, leg, colour, paint]); // eslint-disable-line react-hooks/exhaustive-deps
  return <primitive object={group} position={position} quaternion={quaternion} />;
}

/** Lets the shared tile shapes and the chrome go (see releaseShared in Model.tsx). */
export function releaseTiles() {
  chrome?.dispose();
  chrome = null;
  releaseGeometry();
}
