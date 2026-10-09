/* Clean studio (3.4): a seamless sweep. The floor is a plain colour that the fog fades into the background, so floor and
   wall meet with no horizon; one soft, large key from above-front; a clean contact shadow. Ambient occlusion at mid and
   high; a touch of bloom only on glossy highlights at high. Low: no effects, and it still reads as a clean sweep. */
import type { StageLook } from "../stage";

export const stage: StageLook = {
  background: (dark) => (dark ? "#242426" : "#F3F2EF"),
  floor: { texture: () => null, color: (dark) => (dark ? 0x0e0e0f : 0xc7c5c1), roughness: 0.95, repeat: 1 },
  hemisphere: (dark) => ({ sky: dark ? 0xdfe3ff : 0xffffff, ground: dark ? 0x3a3a3e : 0xe6e3de, intensity: dark ? 0.55 : 0.75 }),
  key: (dark) => ({ position: [3, 12, 8], intensity: dark ? 1.5 : 1.35, color: dark ? 0xf4f1ff : 0xfffaf2 }),
  fill: (dark) => ({ position: [-7, 6, -4], intensity: dark ? 0.35 : 0.4, color: dark ? 0xb9c4ff : 0xeef3ff }),
  environment: 0.6,
  exposure: () => 1.0,
  contact: { opacity: (dark) => (dark ? 0.85 : 0.62), color: "#14121a", blur: 2.2 },
  effects: (tier, dark) => {
    if (tier === "low") return {};
    const ao = { radius: 0.7, intensity: dark ? 2.2 : 2.6, color: dark ? "#000000" : "#2a2622" };
    if (tier === "mid") return { ao };
    // a white sweep would haze under bloom: in light only the AO; in dark a touch of glow on the glossy rims
    return dark ? { ao, bloom: { intensity: 0.2, threshold: 0.9 }, vignette: { darkness: 0.28, offset: 0.35 } } : { ao };
  },
};
