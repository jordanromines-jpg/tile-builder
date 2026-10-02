/* Textures drawn on the device (no downloads, so the app stays offline): the moulded pattern on a tile's clear face,
   and a wooden tabletop. Each is made once and shared. */
import * as THREE from "three";

let face: THREE.CanvasTexture | null = null;
const woods = new Map<string, THREE.CanvasTexture>();

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  return g ? [c, g] : null;
}

/** The face's moulded texture, as a bump map: fine diagonal ridges in a diamond grid, as on real clear tiles. */
export function faceBump(): THREE.Texture | null {
  if (face) return face;
  const cg = canvas(256, 256);
  if (!cg) return null;
  const [c, g] = cg;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 256, 256);
  g.lineWidth = 5;
  const step = 32;
  for (let i = -256; i < 512; i += step) {
    g.strokeStyle = "#b8b8b8";
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 256, 256);
    g.stroke();
    g.strokeStyle = "#4c4c4c";
    g.beginPath();
    g.moveTo(i + 256, 0);
    g.lineTo(i, 256);
    g.stroke();
  }
  face = new THREE.CanvasTexture(c);
  face.wrapS = face.wrapT = THREE.RepeatWrapping;
  face.repeat.set(3, 3);
  return face;
}

/** A wooden tabletop: warm planks with grain, light maple by day and walnut in the dark theme. */
export function woodTexture(dark: boolean): THREE.Texture | null {
  const key = dark ? "dark" : "light";
  const hit = woods.get(key);
  if (hit) return hit;
  const cg = canvas(1024, 1024);
  if (!cg) return null;
  const [c, g] = cg;
  const base = dark ? ["#4a3122", "#553828", "#4f3424", "#5b3d2b"] : ["#e6c79a", "#ebcfa5", "#e1c092", "#efd6ae"];
  const grain = dark ? "rgba(20,10,4,0.28)" : "rgba(120,80,40,0.16)";
  const plank = 128;
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let y = 0; y < 1024; y += plank) {
    g.fillStyle = base[(y / plank) % base.length];
    g.fillRect(0, y, 1024, plank);
    for (let k = 0; k < 26; k++) {
      g.strokeStyle = grain;
      g.lineWidth = 1 + rnd() * 2.5;
      g.beginPath();
      const yy = y + rnd() * plank;
      g.moveTo(0, yy);
      for (let x = 0; x <= 1024; x += 64) g.lineTo(x, yy + Math.sin(x / (90 + rnd() * 60) + k) * (2 + rnd() * 5));
      g.stroke();
    }
    g.fillStyle = dark ? "rgba(0,0,0,0.35)" : "rgba(90,60,30,0.25)";
    g.fillRect(0, y, 1024, 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(14, 14);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  woods.set(key, t);
  return t;
}
