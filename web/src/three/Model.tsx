/* A project in 3D (sprint 2, change 4): its tiles up to `shown`. This step's tiles first appear as a soft pulsing ghost
   exactly where they go, then are tossed in along a ballistic arc (4.2d) and caught by the magnets; tiles from earlier steps
   quieten a little so the new ones read. Built imperatively, one THREE.Group a tile, so a frame changes transforms and
   opacity without re-rendering React. */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Colour, ShapeId } from "../engine/catalog";
import { worldPolygon } from "../engine/geometry";
import type { Project } from "../engine/types";
import { play } from "../sound/sound";
import { ARRIVE, ARRIVE_S, browseProgress, DROP_S, DROP_S_REDUCED, fade, flightAt, type Flight, GHOST_S, GLOW_S, LAND_K, LEAVE_LIFT, LEAVE_S, makeFlight, mulberry, snap, stepProgress } from "./anim";
import { placeTile } from "./buildScene";
import { BASE_OPACITY, makeTileMaterials, releaseTiles, rivetMaterial, type TileMaterials } from "./TileMesh";
import { releaseTextures } from "./textures";
import { buildGeometry, cssColour } from "./tile";

const BLACK = new THREE.Color(0, 0, 0);

interface TileObj {
  colour: Colour;
  group: THREE.Group;
  ghost: THREE.Group;
  mats: TileMaterials;
  pT: THREE.Vector3;
  qT: THREE.Quaternion;
  pS: THREE.Vector3;
  qS: THREE.Quaternion;
  /** the toss from pS to pT: a ballistic arc (4.2d) */
  flight: Flight;
}

/** The middle of the model's footprint and how big it is, so the camera can frame it. */
export function frameOf(project: Project, leg: number, tiles?: number[]) {
  const which = tiles ? tiles.map((t) => project.placed[t]) : project.placed;
  const pts = which.flatMap((p) => worldPolygon(p, leg));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const zs = pts.map((p) => p[2]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const w = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs));
  const h = Math.max(...ys);
  const min = new THREE.Vector3(Math.min(...xs), Math.min(0, ...ys), Math.min(...zs));
  const max = new THREE.Vector3(Math.max(...xs), h, Math.max(...zs));
  return { center: new THREE.Vector3(cx, 0, cz), middle: new THREE.Vector3(cx, cy, cz), size: Math.max(w, h, 1), height: h, min, max };
}

let ghostMat: THREE.MeshBasicMaterial | null = null;

/** Builds bigger than this are drawn with the lighter tile (2.8.1). */
export const BIG_BUILD = 120;

function buildTiles(project: Project, leg: number, instead: Record<number, ShapeId>, accent: THREE.Color): TileObj[] {
  const light = project.placed.length > BIG_BUILD;
  const rand = mulberry(7);
  ghostMat ??= new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true });
  ghostMat.color.copy(accent);
  return project.placed.map((raw, i) => {
    const { group, mats, pT, qT, parts } = placeTile(raw, leg, instead[i], light);
    const ghost = new THREE.Group();
    for (const part of parts) {
      const geo = buildGeometry(part.shape, leg, light);
      const g = new THREE.Mesh(geo.glass ?? geo.frame, ghostMat!);
      g.position.set(part.at[0], part.at[1], 0);
      if (part.flip) g.rotation.z = Math.PI;
      ghost.add(g);
    }
    // start just outside the tile's face and above, a little tilted: it glides in along an arc
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(qT);
    if (n.y < -0.5) n.negate();
    const pS = pT.clone().addScaledVector(n, 0.9 + rand() * 0.3).add(new THREE.Vector3(0, 1.3 + rand() * 0.4, 0));
    const qS = qT.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((rand() - 0.5) * 0.6, (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.4)));
    group.visible = false;
    ghost.position.copy(pT);
    ghost.quaternion.copy(qT);
    ghost.visible = false;
    return { colour: raw.colour ?? "blue", group, ghost, mats, pT, qT, pS, qS, flight: makeFlight(pS.toArray(), pT.toArray()) };
  });
}

/** The tiles that have landed, drawn as one mesh a colour and part (2.4): a 150-tile build is a handful of draw calls
    instead of hundreds. Only this step's tiles, still moving or glowing, are drawn one by one. 2.8.1: the merged tiles
    are kept in chunks of about CHUNK tiles; a full chunk is never merged again, so a step re-merges only the newest,
    open chunk (merging all 200 tiles of a big build every step took 60–75 ms and sent 5–16 MB to the GPU). */
const CHUNK = 32;

interface Chunk {
  from: number;
  to: number;
  meshes: THREE.Mesh[];
}

class Settled {
  readonly group = new THREE.Group();
  count = 0;
  private mats = new Map<Colour, TileMaterials>();
  private chunks: Chunk[] = [];
  glass: THREE.Material[] = [];

  materials(colour: Colour): TileMaterials {
    let m = this.mats.get(colour);
    if (!m) this.mats.set(colour, (m = makeTileMaterials(colour)));
    return m;
  }

  /** Show tiles 0 to n − 1 merged, each where it lands: keep the chunks below n, drop or trim the rest, add the new.
      Tiles in `skip` (a truck run's moving tiles, 4.0c) are left out: they're drawn one by one. */
  skip: ReadonlySet<number> = new Set();
  rebuild(tiles: TileObj[], n: number, root: THREE.Group) {
    while (this.chunks.length && this.chunks.at(-1)!.from >= n) this.drop(this.chunks.pop()!);
    let from = this.chunks.at(-1)?.to ?? 0;
    const last = this.chunks.at(-1);
    // the open chunk (not yet full), or one cut short by going back a step, is merged again with the new tiles
    if (last && (last.to > n || last.to - last.from < CHUNK)) {
      this.drop(this.chunks.pop()!);
      from = last.from;
    }
    root.updateMatrixWorld(true);
    const toRoot = root.matrixWorld.clone().invert();
    for (let a = from; a < n; a += CHUNK) this.chunks.push(this.merge(tiles, a, Math.min(n, a + CHUNK), toRoot));
    this.count = n;
    this.glass = [...new Set(this.chunks.flatMap((c) => c.meshes.filter((m) => m.renderOrder === 1).map((m) => m.material as THREE.Material)))];
  }

  private merge(tiles: TileObj[], from: number, to: number, toRoot: THREE.Matrix4): Chunk {
    const buckets = new Map<string, { geos: THREE.BufferGeometry[]; material: THREE.Material; part: "frame" | "glass" | "rivet" }>();
    for (let i = from; i < to; i++) {
      if (this.skip.has(i)) continue;
      const tile = tiles[i];
      tile.group.position.copy(tile.pT);
      tile.group.quaternion.copy(tile.qT);
      tile.group.updateMatrixWorld(true);
      const shared = this.materials(tile.colour);
      tile.group.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        const part = o.material === tile.mats.frame ? "frame" : o.material === tile.mats.glass ? "glass" : "rivet";
        const key = part === "rivet" ? "rivet" : `${part}:${tile.colour}`;
        let b = buckets.get(key);
        if (!b) buckets.set(key, (b = { geos: [], material: part === "rivet" ? rivetMaterial() : shared[part], part }));
        b.geos.push((o.geometry as THREE.BufferGeometry).clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(toRoot, o.matrixWorld)));
      });
    }
    const meshes: THREE.Mesh[] = [];
    buckets.forEach((b) => {
      const merged = mergeGeometries(b.geos);
      b.geos.forEach((g) => g.dispose());
      if (!merged) return;
      const mesh = new THREE.Mesh(merged, b.material);
      if (b.part === "glass") mesh.renderOrder = 1;
      this.group.add(mesh);
      meshes.push(mesh);
    });
    return { from, to, meshes };
  }

  private drop(c: Chunk) {
    for (const m of c.meshes) {
      m.geometry.dispose();
      this.group.remove(m);
    }
  }

  dispose() {
    this.chunks.forEach((c) => this.drop(c));
    this.chunks = [];
    this.count = 0;
    this.mats.forEach((m) => {
      m.frame.dispose();
      m.glass.dispose();
    });
    this.mats.clear();
  }
}

export interface ModelProps {
  project: Project;
  shown: number;
  leg: number;
  instead?: Record<number, ShapeId>;
  /** tiles before this index are already in place when the model first appears */
  /** seconds the new tiles wait (their ghost showing) before they drop: longer while Pip carries them over (3.9) */
  hold?: number;
  settled?: number;
  /** this step's tiles: ghosted first, then glided in, then softly lit */
  current?: number[];
  still?: boolean;
  /** All steps (3.8): tiles drop in together and lift away as the child scrubs (instant with `still`) */
  browse?: boolean;
  /** bumped when the theme changes, to read the colours again */
  paint?: number;
  /** called when the tiles come to rest (built, or this step's landed): the contact shadow is drawn then (2.8.1) */
  onRest?: () => void;
  /** a truck run (4.0c): these tiles are drawn one by one, each posed every frame by `pose` (its body's middle `p` and
      its turn `q` since it was built, its middle as built `c`); null leaves a tile as built */
  drive?: TileDrive;
}

export interface TileDrive {
  tiles: ReadonlySet<number>;
  pose: (i: number) => { p: readonly number[]; q: readonly number[]; c: readonly number[] } | null;
}

const NOWHERE: ReadonlySet<number> = new Set();
const dq = new THREE.Quaternion();
const dv = new THREE.Vector3();

/** The default for `current`: one array, not a new one a render. A new one each render restarted the step's wait whenever
    the model came to rest (the rest bumps the shadow, which renders again), so the finish never stopped drawing (4.2c). */
const NO_TILES: number[] = [];

export function Model({ project, shown, leg, instead = {}, settled = 0, current = NO_TILES, still = false, browse = false, paint = 0, hold = GHOST_S, onRest, drive }: ModelProps) {
  const invalidate = useThree((s) => s.invalidate);
  const key = JSON.stringify(instead);
  const accent = useMemo(() => new THREE.Color(cssColour("accent", "#BF5409")), [paint]); // eslint-disable-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tiles = useMemo(() => buildTiles(project, leg, instead, accent), [project, leg, key, paint]);
  const frame = useMemo(() => frameOf(project, leg), [project, leg]);
  const progress = useRef<number[]>([]);
  const root = useMemo(() => new THREE.Group(), []);
  const settledMesh = useMemo(() => new Settled(), []);
  const lit = useRef(new Set<number>());
  const since = useRef(0);
  const wasMoving = useRef(true);
  const spot = useMemo(() => [0, 0, 0], []);
  const rest = useRef(onRest);
  rest.current = onRest;

  useEffect(() => {
    root.clear();
    root.add(settledMesh.group);
    settledMesh.rebuild(tiles, 0, root);
    tiles.forEach((t) => {
      root.add(t.group);
      root.add(t.ghost);
    });
    progress.current = tiles.map((_, i) => (i < Math.min(settled, shown) ? 1 : 0));
    invalidate();
    return () => {
      tiles.forEach((t) => {
        t.mats.frame.dispose();
        t.mats.glass.dispose();
      });
      settledMesh.dispose();
    };
    // settled is read only when the tiles are built
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, root, settledMesh, invalidate]);

  // a run's moving tiles leave the merged mesh (and come back to it when the run is gone)
  const runTiles = drive?.tiles ?? NOWHERE;
  useEffect(() => {
    settledMesh.skip = runTiles;
    settledMesh.rebuild(tiles, 0, root);
    invalidate();
  }, [runTiles, settledMesh, tiles, root, invalidate]);

  useEffect(() => {
    lit.current = new Set(current.filter((t) => t < shown));
    since.current = performance.now();
    // a new step: the next frame that finds nothing moving is a rest, even when the tiles appear at once
    wasMoving.current = true;
    if (still) progress.current = progress.current.map((_, i) => (i < shown ? 1 : 0));
    invalidate();
  }, [shown, current, still, invalidate]);
  const calm = still || browse;

  useFrame((state, dt) => {
    const p = progress.current;
    const age = (performance.now() - since.current) / 1000;
    const waiting = !calm && age < hold;
    // the new tiles' glow and the ghost pulse for a few seconds, then hold still, so an open step costs no frames
    const pulsing = !calm && age < GLOW_S;
    const startable = waiting ? Math.min(shown, Math.min(...[...lit.current, shown])) : shown;
    const before = p.filter((k) => k >= LAND_K).length;
    const step = Math.min(dt, 0.05);
    const moving = browse && !still ? browseProgress(p, shown, step, ARRIVE_S, LEAVE_S) : stepProgress(p, shown, step, still ? DROP_S_REDUCED : DROP_S, startable);
    // a tile has touched down: the magnets' click (3.0), once a frame however many land together (not while scrubbing)
    if (!browse && p.filter((k) => k >= LAND_K).length > before && lit.current.size) play("snap");
    const t = state.clock.elapsedTime;
    const pulse = pulsing ? 0.16 + 0.1 * Math.sin(t * Math.PI * 2 * 0.7) : 0.16;
    const quiet = lit.current.size > 0 && shown < tiles.length;
    if (ghostMat) ghostMat.opacity = pulsing ? 0.18 + 0.14 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.1)) : 0.28;
    // the tiles that have landed and are not this step's: merged, and drawn in one go
    let cut = 0;
    while (cut < shown && cut < tiles.length && (p[cut] ?? 0) >= 1 && !lit.current.has(cut)) cut++;
    if (cut !== settledMesh.count) settledMesh.rebuild(tiles, cut, root);
    for (const g of settledMesh.glass) g.opacity = BASE_OPACITY.glass * (quiet ? 0.7 : 1);
    tiles.forEach((tile, i) => {
      if (i < cut) {
        tile.ghost.visible = false;
        tile.group.visible = runTiles.has(i);
        if (!tile.group.visible) return;
        // a run's tile: as built, then where the run has thrown it (turned about its middle, then moved)
        const at = drive?.pose(i);
        tile.group.position.copy(tile.pT);
        tile.group.quaternion.copy(tile.qT);
        if (at) {
          dq.set(at.q[0], at.q[1], at.q[2], at.q[3]);
          dv.set(tile.pT.x - at.c[0], tile.pT.y - at.c[1], tile.pT.z - at.c[2]).applyQuaternion(dq);
          tile.group.position.set(dv.x + at.p[0], dv.y + at.p[1], dv.z + at.p[2]);
          tile.group.quaternion.premultiply(dq);
        }
        tile.mats.frame.opacity = BASE_OPACITY.frame;
        tile.mats.glass.opacity = BASE_OPACITY.glass;
        tile.mats.frame.emissiveIntensity = 0;
        return;
      }
      const k = p[i] ?? 0;
      const mine = lit.current.has(i);
      tile.ghost.visible = mine && k < 1;
      tile.group.visible = k > 0.001;
      if (!tile.group.visible) return;
      let f = fade(k);
      if (browse && !still) {
        // scrubbing: arrive by a short drop with one bounce, leave by lifting and fading
        const leaving = i >= shown;
        tile.group.position.copy(tile.pT);
        tile.group.position.y += leaving ? (1 - k) * LEAVE_LIFT : ARRIVE.at(k * ARRIVE_S).y;
        tile.group.quaternion.copy(tile.qT);
        if (leaving) f = k;
      } else if (still) {
        // motion reduced: a short fade, nearly in place
        const e = snap(k);
        tile.group.position.lerpVectors(tile.pS, tile.pT, e);
        tile.group.quaternion.copy(tile.qS).slerp(tile.qT, Math.min(1, e));
      } else {
        // tossed in: a ballistic arc, turning as it flies, then the magnets' catch
        const turn = flightAt(tile.flight, k, spot);
        tile.group.position.set(spot[0], spot[1], spot[2]);
        tile.group.quaternion.copy(tile.qS).slerp(tile.qT, turn);
      }
      // frames stay transparent (at opacity 1 it looks the same): flipping the flag would need a new shader
      tile.mats.frame.opacity = BASE_OPACITY.frame * f;
      tile.mats.glass.opacity = BASE_OPACITY.glass * f * (quiet && !mine ? 0.7 : 1);
      // the new tiles glow in their own colour (an orange glow would tint a blue tile purple)
      const glow = mine && k >= 1;
      tile.mats.frame.emissive.copy(glow ? tile.mats.frame.color : BLACK);
      tile.mats.frame.emissiveIntensity = glow ? pulse : 0;
    });
    if (wasMoving.current && !moving && !waiting) rest.current?.();
    wasMoving.current = moving || waiting;
    if (moving || waiting || (lit.current.size && pulsing)) invalidate();
  });

  return (
    <group position={[-frame.center.x, 0, -frame.center.z]}>
      <primitive object={root} />
      {shown < tiles.length && <Footprint min={frame.min} max={frame.max} paint={paint} />}
    </group>
  );
}

/** Where the whole build will stand (3.1): a faint dashed outline on the table, so the first steps aren't a lone tile
    on an empty table; it goes when the build is finished. Dashes are thin flat strips (WebGL lines are one pixel wide),
    in the ink colour, which shows on any look's floor in light and dark. */
function Footprint({ min, max, paint }: { min: THREE.Vector3; max: THREE.Vector3; paint: number }) {
  const mesh = useMemo(() => {
    const p = 0.35;
    const y = 0.006;
    const w = 0.08;
    const dash = 0.4;
    const gap = 0.28;
    const corners: [number, number][] = [
      [min.x - p, min.z - p],
      [max.x + p, min.z - p],
      [max.x + p, max.z + p],
      [min.x - p, max.z + p],
    ];
    const parts: THREE.BufferGeometry[] = [];
    corners.forEach(([x0, z0], k) => {
      const [x1, z1] = corners[(k + 1) % 4];
      const len = Math.hypot(x1 - x0, z1 - z0);
      const ux = (x1 - x0) / len;
      const uz = (z1 - z0) / len;
      for (let t = 0; t < len; t += dash + gap) {
        const l = Math.min(dash, len - t);
        const g = new THREE.PlaneGeometry(l, w).rotateX(-Math.PI / 2).rotateY(-Math.atan2(uz, ux));
        g.translate(x0 + ux * (t + l / 2), y, z0 + uz * (t + l / 2));
        parts.push(g);
      }
    });
    const geo = mergeGeometries(parts)!;
    parts.forEach((g) => g.dispose());
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(cssColour("ink-2", "#5a4a3a")), transparent: true, opacity: 0.4, depthWrite: false });
    return new THREE.Mesh(geo, mat);
    // paint: read the ink colour again when light or dark or the look changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, paint]);
  useEffect(
    () => () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    },
    [mesh],
  );
  return <primitive object={mesh} />;
}

/** Lets go of what every stage shares (the tile shapes, the ghost, the chrome and the textures); used again, three makes
    them afresh. Called when a stage closes. */
export function releaseShared() {
  ghostMat?.dispose();
  ghostMat = null;
  releaseTiles();
  releaseTextures();
}
