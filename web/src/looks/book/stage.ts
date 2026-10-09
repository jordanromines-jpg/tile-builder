/* Picture book's stage: the model sits on a sheet of drawing paper (fibres, a faint pencil grid, one square a cell) in
   soft daylight. Mid adds a little ambient occlusion; high adds a soft vignette, like the edge of a page. Low: none. */
import * as THREE from "three";
import type { StageLook } from "../stage";
import { cssColour } from "../../three/tile";
import { softwareGL } from "../../gpu";

const sheets = new Map<string, THREE.CanvasTexture>();

/** A sheet of drawing paper: 4 × 4 squares per tile of the texture (repeat 20 across the 80-square table). */
function paperTexture(dark: boolean): THREE.Texture | null {
  const key = dark ? "dark" : "light";
  const hit = sheets.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const g = c.getContext("2d");
  if (!g) return null;
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  g.fillStyle = dark ? "#2a3454" : "#eee5d4";
  g.fillRect(0, 0, 1024, 1024);
  // grain: tiny specks, light and dark
  for (let i = 0; i < 16000; i++) {
    const light = rnd() < 0.5;
    g.fillStyle = dark ? (light ? "rgba(255,244,222,0.05)" : "rgba(8,12,30,0.10)") : light ? "rgba(255,255,255,0.35)" : "rgba(120,92,60,0.07)";
    const s = 1 + rnd() * 2;
    g.fillRect(rnd() * 1024, rnd() * 1024, s, s);
  }
  // fibres: short curved hairs
  g.lineWidth = 1;
  for (let i = 0; i < 520; i++) {
    g.strokeStyle = dark ? "rgba(255,244,222,0.06)" : "rgba(130,100,70,0.10)";
    const x = rnd() * 1024;
    const y = rnd() * 1024;
    const a = rnd() * Math.PI;
    const len = 10 + rnd() * 26;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (rnd() - 0.5) * 8, y + Math.sin(a) * len * 0.5 + (rnd() - 0.5) * 8, x + Math.cos(a) * len, y + Math.sin(a) * len);
    g.stroke();
  }
  // the pencil grid: a wobbly line every 256 px (every square), pinned at both ends so the tile repeats cleanly
  g.lineCap = "round";
  g.strokeStyle = dark ? "rgba(190,205,255,0.2)" : "rgba(86,96,128,0.26)";
  g.lineWidth = 3;
  for (let k = 0; k <= 4; k++) {
    const p = k * 256;
    for (const vertical of [true, false]) {
      g.beginPath();
      for (let t = 0; t <= 1024; t += 32) {
        const w = t === 0 || t === 1024 ? 0 : Math.sin(t / 61 + k * 2.3 + (vertical ? 0 : 1.7)) * 1.4 + (rnd() - 0.5) * 1.1;
        const x = vertical ? p + w : t;
        const y = vertical ? t : p + w;
        if (t) g.lineTo(x, y);
        else g.moveTo(x, y);
      }
      g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(20, 20);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = softwareGL() ? 1 : 8;
  sheets.set(key, t);
  return t;
}

export const stage: StageLook = {
  background: (dark) => cssColour("stage", dark ? "#1a2240" : "#f3e7d0"),
  floor: { texture: (dark) => paperTexture(dark), color: (dark) => (dark ? 0x262f4d : 0xfbf3e2), roughness: 1, repeat: 20 },
  hemisphere: (dark) => ({ sky: dark ? 0xc9d4ff : 0xfffbf4, ground: dark ? 0x3a3550 : 0xe9dcc4, intensity: dark ? 0.55 : 0.55 }),
  // soft daylight from a window, front left and high; a cool bounce from the other side
  key: (dark) => ({ position: [-6, 11, 8], intensity: dark ? 1.15 : 1.05, color: dark ? 0xffe9cc : 0xfff6ec }),
  fill: (dark) => ({ position: [7, 5, -4], intensity: dark ? 0.45 : 0.5, color: dark ? 0x9fb4ff : 0xdde8ff }),
  environment: 0.6,
  exposure: (dark) => (dark ? 1.0 : 0.98),
  contact: { opacity: (dark) => (dark ? 1 : 0.85), color: "#241a30", blur: 4.5 },
  effects: (tier, dark) => {
    if (tier === "low") return {};
    const ao = { radius: 0.8, intensity: dark ? 2.2 : 1.8, color: dark ? "#0a0f24" : "#4a3a30" };
    return tier === "mid" ? { ao } : { ao, vignette: { darkness: dark ? 0.55 : 0.28, offset: 0.35 } };
  },
};
