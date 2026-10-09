/* A truck run's recording, fetched the first time a truck build's finish opens (4.0c). Like the pictures, recordings
   aren't in the install: the worker keeps each one the first time it is fetched (vite.config.ts "project-runs"), and
   pwa.ts fetches the rest when the iPad is idle. */
import { decodeRun, type Recording } from "../../engine/run-format";
import keys from "../../projects/runs.json";

const KEYS: Record<string, string> = keys;

/** Whether this build has a recorded run. */
export const hasRun = (id: string) => id in KEYS;

/** A run's file, asked for by its key: a run recorded again is a new address, so a kept old one is never played. */
export const runUrl = (id: string) => `${import.meta.env.BASE_URL}runs/${id}.bin.gz?v=${KEYS[id]}`;

const kept = new Map<string, Promise<Recording>>();

async function gunzip(bytes: ArrayBuffer): Promise<Uint8Array> {
  const head = new Uint8Array(bytes, 0, 2);
  // a server that sends the file as gzip content has unpacked it already (GitHub Pages sends it as it is)
  if (head[0] !== 0x1f || head[1] !== 0x8b) return new Uint8Array(bytes);
  // (iPadOS before 16.4 can't: the finish is then as it was before runs, the tiles circled and showered)
  if (typeof DecompressionStream === "undefined") throw new Error("this iPad can't unpack a run");
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** The run's recording; rejects if it can't be fetched (offline before it was ever kept) or read. */
export function loadRun(id: string): Promise<Recording> {
  let p = kept.get(id);
  if (!p && !hasRun(id)) return Promise.reject(new Error(`${id} has no recorded run`));
  if (!p) {
    p = fetch(runUrl(id))
      .then((r) => {
        if (!r.ok) throw new Error(`the run for ${id} isn't here (${r.status})`);
        return r.arrayBuffer();
      })
      .then(gunzip)
      .then(decodeRun);
    // a failed fetch isn't kept: the next finish tries again
    p.catch(() => kept.delete(id));
    kept.set(id, p);
  }
  return p;
}
