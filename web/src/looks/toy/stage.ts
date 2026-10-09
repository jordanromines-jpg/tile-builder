/* Toy studio's stage: a calm light-birch play table (a pale plywood with soft, long, low-contrast grain and a fine
   speckle: no planks, no stripes), a warm key light with a soft cool fill, and ambient occlusion where tiles meet at
   mid and high. By night the same table sits under a warm lamp. */
import * as THREE from "three";
import type { StageLook } from "../stage";
import { cssColour } from "../../three/tile";

const birch = new Map<boolean, THREE.CanvasTexture>();

/** Made once per light/dark and kept: pale birch plywood, drawn on a canvas (no download). */
function birchTexture(dark: boolean): THREE.Texture | null {
  const hit = birch.get(dark);
  if (hit) return hit;
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  if (!g) return null;
  const base = dark ? "#76563c" : "#e9cc9d";
  const grain = dark ? "rgba(40,20,8,0.07)" : "rgba(150,100,50,0.05)";
  const light = dark ? "rgba(255,210,150,0.07)" : "rgba(255,255,255,0.22)";
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 512);
  let seed = 23;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  // broad soft bands of lighter and darker wood, so the surface breathes
  for (let i = 0; i < 0; i++) {
    const y = rnd() * 512;
    const h = 20 + rnd() * 60;
    const grad = g.createLinearGradient(0, y - h, 0, y + h);
    const col = i % 2 ? light : grain;
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.5, col);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, y - h, 512, h * 2);
  }
  // long, faint, wavering grain lines (wrap-safe: the sine repeats over the width)
  g.lineWidth = 1;
  for (let k = 0; k < 40; k++) {
    g.strokeStyle = grain;
    const y0 = rnd() * 512;
    const amp = 1 + rnd() * 4;
    const ph = rnd() * 6.28;
    const cyc = 1 + Math.floor(rnd() * 3);
    g.beginPath();
    for (let x = 0; x <= 512; x += 16) {
      const y = y0 + Math.sin((x / 512) * cyc * 6.283 + ph) * amp;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  // a fine speckle, the plywood's tooth
  for (let i = 0; i < 5200; i++) {
    g.fillStyle = rnd() > 0.5 ? grain : light;
    g.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 1.6, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  birch.set(dark, t);
  return t;
}

export const stage: StageLook = {
  background: (dark) => cssColour("stage", dark ? "#231f2c" : "#f7e9d3"),
  floor: { texture: (dark) => birchTexture(dark), color: (dark) => (dark ? 0x76563c : 0xe9cc9d), roughness: 0.9, repeat: 10 },
  hemisphere: (dark) => ({ sky: dark ? 0xffd9a8 : 0xfff6e8, ground: dark ? 0x3a2c28 : 0xb89a78, intensity: dark ? 0.32 : 0.55 }),
  key: (dark) => ({ position: [-5, 11, 8], intensity: dark ? 1.5 : 1.25, color: dark ? 0xffc27a : 0xffecd0 }),
  fill: (dark) => ({ position: [7, 5, -4], intensity: dark ? 0.3 : 0.5, color: dark ? 0x8fa6ff : 0xdfeaff }),
  environment: 0.6,
  exposure: (dark) => (dark ? 0.98 : 0.96),
  contact: { opacity: (dark) => (dark ? 0.6 : 0.36), color: "#3a2410", blur: 3.2 },
  effects: (tier, dark) => {
    if (tier === "low") return {};
    const ao = { radius: 0.55, intensity: dark ? 2.6 : 2.2, color: dark ? "#120a06" : "#4a2a10" };
    if (tier === "mid") return { ao };
    return {
      ao,
      bloom: { intensity: dark ? 0.28 : 0.12, threshold: dark ? 0.82 : 0.92 },
      vignette: { darkness: dark ? 0.5 : 0.28, offset: 0.35 },
    };
  },
};
