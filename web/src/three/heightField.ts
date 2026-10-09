/* The finished build's top surface (4.2c), sampled once on a 0.25-square grid from the tiles' world polygons: for each
   cell, how high the highest tile above it reaches. The table is y = 0. The falling tiles (fallSim.ts) bounce and come
   to rest on this; a tile's top face is half its thickness above its middle plane. A cell counts as covered by a tile
   when the cell's middle is within half a cell of the tile's footprint, so thin walls and steep roofs are not missed. */
import { worldPolygon, type V3 } from "../engine/geometry";
import type { Project } from "../engine/types";
import { TH } from "./tile";

export const CELL = 0.25;
const NEAR = CELL / 2 + 1e-9;

export interface HeightField {
  /** the world x and z of cell (0, 0)'s middle, and the grid's size in cells */
  x0: number;
  z0: number;
  nx: number;
  nz: number;
  /** cell heights, row by row in z; 0 is the table */
  h: Float32Array;
  /** the highest cell */
  top: number;
  /** the extent of the build */
  min: [number, number];
  max: [number, number];
}

/** How far (x, z) is from the polygon seen from above, and the polygon's height there: the plane's height over an inner
    point, or the height along the nearest edges for a point just outside (or a vertical tile, which has no inner points).
    Distance is Infinity when the polygon is not within half a cell. */
function topAt(poly: V3[], x: number, z: number): number {
  const n = poly.length;
  let best = -Infinity;
  let pos = 0;
  let neg = 0;
  for (let i = 0; i < n; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % n];
    const dx = b[0] - a[0];
    const dz = b[2] - a[2];
    const side = dx * (z - a[2]) - dz * (x - a[0]);
    if (side > 1e-9) pos++;
    else if (side < -1e-9) neg++;
    const l2 = dx * dx + dz * dz;
    const t = l2 < 1e-12 ? 0 : Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[2]) * dz) / l2));
    if (Math.hypot(a[0] + dx * t - x, a[2] + dz * t - z) <= NEAR) best = Math.max(best, a[1] + (b[1] - a[1]) * t);
  }
  if (pos === 0 || neg === 0) best = Math.max(best, planeHeight(poly, x, z));
  return best;
}

/** The height of the polygon's plane over (x, z), clamped to the polygon's own heights; −Infinity for a vertical one. */
function planeHeight(poly: V3[], x: number, z: number): number {
  const [p0, p1, p2] = poly;
  const ux = p1[0] - p0[0];
  const uy = p1[1] - p0[1];
  const uz = p1[2] - p0[2];
  const vx = p2[0] - p0[0];
  const vy = p2[1] - p0[1];
  const vz = p2[2] - p0[2];
  // normal = u × v; y = p0.y − (nx·dx + nz·dz) / ny
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  if (Math.abs(ny) < 1e-6) return -Infinity;
  const y = p0[1] - (nx * (x - p0[0]) + nz * (z - p0[2])) / ny;
  const ys = poly.map((p) => p[1]);
  return Math.max(Math.min(...ys), Math.min(Math.max(...ys), y));
}

export function buildField(project: Project, leg: number, margin = 3): HeightField {
  const polys = project.placed.map((p) => worldPolygon(p, leg));
  const xs = polys.flatMap((q) => q.map((p) => p[0]));
  const zs = polys.flatMap((q) => q.map((p) => p[2]));
  const min: [number, number] = [Math.min(...xs), Math.min(...zs)];
  const max: [number, number] = [Math.max(...xs), Math.max(...zs)];
  const x0 = Math.floor((min[0] - margin) / CELL) * CELL + CELL / 2;
  const z0 = Math.floor((min[1] - margin) / CELL) * CELL + CELL / 2;
  const nx = Math.ceil((max[0] + margin - x0) / CELL) + 1;
  const nz = Math.ceil((max[1] + margin - z0) / CELL) + 1;
  const h = new Float32Array(nx * nz);
  let top = 0;
  for (const poly of polys) {
    const bx = poly.map((p) => p[0]);
    const bz = poly.map((p) => p[2]);
    const i0 = Math.max(0, Math.floor((Math.min(...bx) - CELL - x0) / CELL));
    const i1 = Math.min(nx - 1, Math.ceil((Math.max(...bx) + CELL - x0) / CELL));
    const j0 = Math.max(0, Math.floor((Math.min(...bz) - CELL - z0) / CELL));
    const j1 = Math.min(nz - 1, Math.ceil((Math.max(...bz) + CELL - z0) / CELL));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const y = topAt(poly, x0 + i * CELL, z0 + j * CELL);
        if (y === -Infinity) continue;
        const t = Math.max(0, y) + TH / 2;
        if (t > h[j * nx + i]) h[j * nx + i] = t;
        if (t > top) top = t;
      }
    }
  }
  return { x0, z0, nx, nz, h, top, min, max };
}

/** The surface height under (x, z): the cell it falls in; the table (0) outside the grid. */
export function heightAt(f: HeightField, x: number, z: number): number {
  const i = Math.round((x - f.x0) / CELL);
  const j = Math.round((z - f.z0) / CELL);
  return i < 0 || j < 0 || i >= f.nx || j >= f.nz ? 0 : f.h[j * f.nx + i];
}

/** Raises the cells within `r` of (x, z) to at least `top` (a tile come to rest is part of the surface). */
export function stamp(f: HeightField, x: number, z: number, r: number, top: number) {
  const i0 = Math.max(0, Math.floor((x - r - f.x0) / CELL));
  const i1 = Math.min(f.nx - 1, Math.ceil((x + r - f.x0) / CELL));
  const j0 = Math.max(0, Math.floor((z - r - f.z0) / CELL));
  const j1 = Math.min(f.nz - 1, Math.ceil((z + r - f.z0) / CELL));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (Math.hypot(f.x0 + i * CELL - x, f.z0 + j * CELL - z) <= r && f.h[j * f.nx + i] < top) f.h[j * f.nx + i] = top;
}

export function cloneField(f: HeightField): HeightField {
  return { ...f, h: f.h.slice() };
}
