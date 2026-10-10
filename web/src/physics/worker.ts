/* The live physics' worker (5.0a): Make your own's scene runs here, off the page's thread, so building stays smooth.
   The page sends tiles to put on and take off; 60 times a second the worker steps the world four times (1/240 s)
   and sends every tile's pose back (LiveScene.poses: 8 numbers a tile). The only way the app reaches the physics
   (boundary.test.ts); Rapier is loaded here, so only Make your own downloads it. */
import { DEFAULT_LEG } from "../engine/catalog";
import type { Placed } from "../engine/types";
import { LiveScene } from "./live";
import { rapier } from "./rapier";

export type ToPhysics =
  | { kind: "add"; tile: Placed; ref: number }
  | { kind: "remove"; id: number }
  | { kind: "reset"; tiles: Placed[] }
  | { kind: "pause" }
  | { kind: "resume" };

export type FromPhysics =
  | { kind: "ready" }
  | { kind: "added"; ref: number; id: number }
  | { kind: "reset"; ids: number[] }
  | { kind: "poses"; poses: Float32Array; held: number[] };

const STEPS_A_FRAME = 4;
const post = (m: FromPhysics, transfer: Transferable[] = []) => (self as unknown as Worker).postMessage(m, transfer);

let scene: LiveScene | null = null;
let ids: number[] = [];
let running = true;
const queue: ToPhysics[] = [];

function handle(m: ToPhysics) {
  if (!scene) return;
  if (m.kind === "add") {
    const id = scene.add(m.tile);
    ids.push(id);
    post({ kind: "added", ref: m.ref, id });
  } else if (m.kind === "remove") {
    scene.remove(m.id);
    ids = ids.filter((i) => i !== m.id);
  } else if (m.kind === "reset") {
    scene.free();
    void rapier().then((R) => {
      scene = new LiveScene(R, DEFAULT_LEG);
      ids = m.tiles.map((t) => scene!.add(t));
      post({ kind: "reset", ids });
    });
  } else if (m.kind === "pause") running = false;
  else if (m.kind === "resume") running = true;
}

self.onmessage = (e: MessageEvent<ToPhysics>) => {
  if (scene) handle(e.data);
  else queue.push(e.data);
};

void rapier().then((R) => {
  scene = new LiveScene(R, DEFAULT_LEG);
  post({ kind: "ready" });
  for (const m of queue.splice(0)) handle(m);
  setInterval(() => {
    if (!scene || !running) return;
    scene.step(STEPS_A_FRAME);
    const poses = scene.poses();
    post({ kind: "poses", poses, held: ids.filter((i) => scene!.isHeld(i)) }, [poses.buffer]);
  }, 1000 / 60);
});
