/* A look's 3D stage (3.0): what surrounds the model. The tiles themselves are the toy and stay the same in every look
   (tile.ts, TileMesh.tsx); a look sets the floor, the light, the fog's colour, the soft shadow and the effects. Every
   value can differ in light and dark (`dark`). Effects cost the iPad's GPU, so they come by quality tier
   (three/quality.ts): `low` must look good with none. */
import type * as THREE from "three";

export type Tier = "low" | "mid" | "high";

export interface StageLight {
  position: [number, number, number];
  intensity: number;
  color: number;
}

export interface StageEffects {
  /** ambient occlusion: darkening where tiles meet and touch the floor (N8AO) */
  ao?: { radius: number; intensity: number; color?: string };
  /** a soft glow on the brightest highlights */
  bloom?: { intensity: number; threshold: number };
  /** a gentle darkening at the edges of the view */
  vignette?: { darkness: number; offset: number };
}

export interface StageLook {
  /** the colour behind and around the 3D (and of the fog), a CSS colour; read when the look or light/dark changes */
  background: (dark: boolean) => string;
  /** the table: a texture made on the device (or null for a plain colour), its colour and how rough it is. The
      texture repeats `repeat` times across 80 squares of table; the Stage scales that to the table's size. */
  floor: { texture: (dark: boolean) => THREE.Texture | null; color: (dark: boolean) => number; roughness: number; repeat: number };
  /** sky and ground colours of the soft all-round light, and its strength */
  hemisphere: (dark: boolean) => { sky: number; ground: number; intensity: number };
  /** the main light and a fill from the other side */
  key: (dark: boolean) => StageLight;
  fill: (dark: boolean) => StageLight;
  /** the room's reflections in the glossy tiles */
  environment: number;
  exposure: (dark: boolean) => number;
  /** the soft shadow under the model */
  contact: { opacity: (dark: boolean) => number; color: string; blur: number };
  /** effects by quality tier; `low` should be none */
  effects: (tier: Tier, dark: boolean) => StageEffects;
  /** 5.4: a real set in place of the room made on the device, the flat background and the floor that fades into fog
      (without a GPU the Stage keeps those) */
  set?: StageSet;
}

/** The set (5.4.1): a real room, photographed (a CC0 HDRI in public/set/), lights the tiles, shines in them and stands
    out of focus behind; the model stands on a wooden table with an edge. */
export interface StageSet {
  /** the room's file stem in public/set/: `<room>_1k.hdr` at high tier, `<room>_512.hdr` below */
  room: string;
  /** the room's turn about the vertical, radians: what stands behind the build */
  turn: number;
  /** how strongly the room lights the tiles, and how bright it is behind them */
  light: (dark: boolean) => number;
  backdrop: (dark: boolean) => number;
  /** how far out of focus the room is (0 sharp, 1 a blur) */
  blur: number;
  /** the table's maps in public/set/ (KTX2) and a tint over the colour map */
  wood: { color: string; normal: string; rough: string; tint: (dark: boolean) => number };
  /** coloured lights from behind, for the rims (the key and fill are the look's own) */
  rims: (dark: boolean) => StageLight[];
}
