/* The one look's stage (5.4.1): the set. A real playroom (Poly Haven's empty_play_room, CC0) lights the tiles and
   stands out of focus behind; the model stands on a pale maple table (Poly Haven's wood_table_001, lifted to maple);
   a warm key from the side, a soft fill, and two coloured rims from behind. By night the same room, dimmed, under a warm
   lamp. Without a GPU the Stage keeps a plain room in these colours. Found in look development: design/set/. */
import type { StageLook } from "../stage";

export const stage: StageLook = {
  background: (dark) => (dark ? "#231c19" : "#f3e2c6"),
  floor: { texture: () => null, color: (dark) => (dark ? 0x6a4e36 : 0xdcb27a), roughness: 0.8, repeat: 10 },
  hemisphere: (dark) => ({ sky: dark ? 0xffd9a8 : 0xfff6e8, ground: dark ? 0x3a2c28 : 0xb89a78, intensity: dark ? 0.12 : 0.2 }),
  // from the side and above: its glint on the wood falls out of the view, not in front of the build
  key: (dark) => ({ position: [-9, 11, 1], intensity: dark ? 2.0 : 2.2, color: dark ? 0xffe2c4 : 0xffe7cc }),
  fill: (dark) => ({ position: [7, 5, 6], intensity: dark ? 0.2 : 0.35, color: dark ? 0x8fa6ff : 0xdfeaff }),
  environment: 0.6,
  exposure: (dark) => (dark ? 1.0 : 1.1),
  contact: { opacity: (dark) => (dark ? 0.5 : 0.3), color: "#3a2410", blur: 3 },
  effects: (tier, dark) => {
    if (tier === "low") return {};
    return { ao: { radius: 0.5, intensity: dark ? 2.2 : 1.8, color: dark ? "#120a06" : "#4a2a10" } };
  },
  set: {
    room: "empty_play_room",
    turn: 1.57,
    light: (dark) => (dark ? 0.28 : 1.1),
    plate: { light: "plate-light.webp", dark: "plate-dark.webp" },
    // the evening maple is greyed a little: under the warm lamp it would turn orange
    wood: { color: "wood_maple.ktx2", normal: "wood_nor_gl.ktx2", rough: "wood_rough.ktx2", tint: (dark) => (dark ? 0x8a8d96 : 0xffffff) },
    rims: (dark) => [
      { position: [-5.2, 4.4, -5.6], intensity: dark ? 1.2 : 0.9, color: 0xffc88e },
      { position: [5.2, 4.4, -5.6], intensity: dark ? 1.3 : 1.0, color: 0xa8d4ff },
    ],
  },
};
