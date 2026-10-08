/* Starts as a copy of classic's; the toy look's agent makes it its own. */
import type { StageLook } from "../stage";
import { woodTexture } from "../../three/textures";
import { cssColour } from "../../three/tile";

export const stage: StageLook = {
  background: (dark) => cssColour("stage", dark ? "#1E2433" : "#F6E7D2"),
  floor: { texture: (dark) => woodTexture(dark), color: (dark) => (dark ? 0x4a3122 : 0xe6c79a), roughness: 0.62, repeat: 14 },
  hemisphere: (dark) => ({ sky: 0xfff4e6, ground: 0x6b5a48, intensity: dark ? 0.35 : 0.5 }),
  key: (dark) => ({ position: [5, 10, 7], intensity: dark ? 1.3 : 1.7, color: 0xfff1de }),
  fill: () => ({ position: [-6, 5, -5], intensity: 0.55, color: 0xd8e6ff }),
  environment: 0.55,
  exposure: (dark) => (dark ? 0.95 : 1.0),
  contact: { opacity: (dark) => (dark ? 0.55 : 0.42), color: "#2a1a0c", blur: 2.4 },
  effects: () => ({}),
};
