/* Make your own's link to the live physics (5.0a): starts the worker (src/physics/worker.ts, by URL, so Rapier is
   only downloaded by this page) and keeps the latest pose of every tile for the 3D view to read each frame. */
import type { Placed } from "../../engine/types";
import type { FromPhysics, ToPhysics } from "../../physics/worker";

export interface TilePose {
  p: [number, number, number];
  q: [number, number, number, number];
}

export class Physics {
  private worker: Worker;
  private waiting = new Map<number, (id: number) => void>();
  private ref = 0;
  /** each tile's latest pose, by its physics id */
  poses = new Map<number, TilePose>();
  /** tiles still in the child's hand */
  held = new Set<number>();
  ready: Promise<void>;
  /** called after every new set of poses */
  onPoses: (() => void) | null = null;

  constructor() {
    this.worker = new Worker(new URL("../../physics/worker.ts", import.meta.url), { type: "module" });
    let done: () => void = () => undefined;
    this.ready = new Promise((r) => (done = r));
    this.worker.onmessage = (e: MessageEvent<FromPhysics>) => {
      const m = e.data;
      if (m.kind === "ready") done();
      else if (m.kind === "added") {
        this.waiting.get(m.ref)?.(m.id);
        this.waiting.delete(m.ref);
      } else if (m.kind === "poses") {
        for (let k = 0; k < m.poses.length; k += 8) {
          const a = m.poses;
          this.poses.set(a[k], { p: [a[k + 1], a[k + 2], a[k + 3]], q: [a[k + 4], a[k + 5], a[k + 6], a[k + 7]] });
        }
        this.held = new Set(m.held);
        this.onPoses?.();
      }
    };
  }

  private send(m: ToPhysics) {
    this.worker.postMessage(m);
  }

  /** Put a tile on: resolves with its physics id. */
  add(tile: Placed): Promise<number> {
    const ref = ++this.ref;
    return new Promise((r) => {
      this.waiting.set(ref, r);
      this.send({ kind: "add", tile, ref });
    });
  }

  remove(id: number) {
    this.poses.delete(id);
    this.send({ kind: "remove", id });
  }

  pause() {
    this.send({ kind: "pause" });
  }

  resume() {
    this.send({ kind: "resume" });
  }

  stop() {
    this.worker.terminate();
  }
}
