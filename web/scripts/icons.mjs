// The app's icons, drawn as SVG from the tile shapes in the accent colour and rasterised with sharp (a dev dependency).
// Run once with `npm run icons`; the PNGs are committed. A house of three tiles: two squares and a triangle roof.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../public/icons/", import.meta.url));
mkdirSync(out, { recursive: true });

const SURFACE = "#FBF8F3";
const ACCENT = "#0B6E78";
const SOFT = "#DCEFF0";
const YELLOW = "#F4C51B";

// one tile: a translucent face and a solid rim, as the 3D tiles look
const tile = (points, fill) =>
  `<polygon points="${points}" fill="${fill}" fill-opacity="0.45" stroke="${fill}" stroke-width="14" stroke-linejoin="round"/>`;

// art on a 512 grid; `inset` scales it into the middle for maskable icons
function svg({ round, inset }) {
  const s = inset ? 0.72 : 0.86;
  const t = (512 - 512 * s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${round ? 112 : 0}" fill="${SURFACE}"/>
  <g transform="translate(${t} ${t}) scale(${s})">
    <rect x="40" y="430" width="432" height="18" rx="9" fill="${SOFT}"/>
    ${tile("96,420 248,420 248,268 96,268", ACCENT)}
    ${tile("264,420 416,420 416,268 264,268", ACCENT)}
    ${tile("88,252 424,252 256,72", YELLOW)}
  </g>
</svg>`;
}

writeFileSync(out + "icon.svg", svg({ round: true, inset: false }));
const square = Buffer.from(svg({ round: false, inset: false }));
const masked = Buffer.from(svg({ round: false, inset: true }));
await sharp(square).resize(192, 192).png().toFile(out + "icon-192.png");
await sharp(square).resize(512, 512).png().toFile(out + "icon-512.png");
await sharp(masked).resize(512, 512).png().toFile(out + "icon-maskable-512.png");
await sharp(square).resize(180, 180).flatten({ background: SURFACE }).png().toFile(out + "apple-touch-icon.png");
console.log("icons written to public/icons/");
