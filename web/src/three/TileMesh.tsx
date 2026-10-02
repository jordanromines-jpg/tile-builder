/* One tile in a react-three-fiber scene: the shared geometry for its shape, its own materials so it can fade in. */
import type {} from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import type { Colour, ShapeId } from "../engine/catalog";
import { buildGeometry, tileColour } from "./tile";

export interface TileMeshProps {
  shape: ShapeId;
  colour: Colour;
  leg?: number;
  position?: THREE.Vector3Tuple;
  quaternion?: THREE.Quaternion;
  opacity?: number;
  /** a theme change bumps this so colours are read again */
  paint?: number;
}

export const BASE_OPACITY = { frame: 1, glass: 0.42, ridge: 0.8 };

export function makeTileMaterials(colour: Colour) {
  const col = new THREE.Color(tileColour(colour));
  return {
    frame: new THREE.MeshStandardMaterial({ color: col, roughness: 0.35, transparent: true, opacity: 1 }),
    glass: new THREE.MeshStandardMaterial({ color: col, roughness: 0.1, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false }),
    ridge: new THREE.LineBasicMaterial({ color: col.clone().multiplyScalar(0.75), transparent: true, opacity: 0.8 }),
  };
}

export function TileMesh({ shape, colour, leg, position = [0, 0, 0], quaternion, opacity = 1, paint = 0 }: TileMeshProps) {
  const geo = buildGeometry(shape, leg);
  // paint is a dependency on purpose: a theme change reads the colours again
  const m = useMemo(() => makeTileMaterials(colour), [colour, paint]); // eslint-disable-line react-hooks/exhaustive-deps
  m.frame.opacity = BASE_OPACITY.frame * opacity;
  m.glass.opacity = BASE_OPACITY.glass * opacity;
  m.ridge.opacity = BASE_OPACITY.ridge * opacity;
  const ridge = useMemo(() => {
    const a = new THREE.Line(geo.ridge, m.ridge);
    const b = new THREE.Line(geo.ridge, m.ridge);
    a.position.z = 0.012;
    b.position.z = -0.012;
    return [a, b];
  }, [geo, m]);
  return (
    <group position={position} quaternion={quaternion} visible={opacity > 0.001}>
      <mesh geometry={geo.frame} material={m.frame} castShadow receiveShadow />
      {geo.glass && <mesh geometry={geo.glass} material={m.glass} castShadow />}
      <primitive object={ridge[0]} />
      <primitive object={ridge[1]} />
    </group>
  );
}
