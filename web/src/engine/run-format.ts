/* A truck run's recording (4.0c), as the build machine writes it (`npm run runs`) and the iPad plays it: the Pip
   truck's pose every frame, each crash tile's pose from when it first moves until it comes to rest, and the run's
   events. Binary, little-endian, version 1:

     header   "TSRN", version u8, fps u8, frames u16, tiles u16, events u16
     truck    10 channels, each `frames` int16 deltas, one channel after another (gzip packs these well):
              x, y, z (1/500 square), quaternion x, y, z, w (1/32767), front steer (1/200 radian),
              then the 4 wheels' squash (0–1 in 1/1000)
     tiles    per tile: placed index u16, first frame u16, frames n u16; then 7 channels of n int16 deltas
              (x, y, z in 1/500 square; quaternion in 1/32767): its body's pose (the tile's middle, turned)
     events   per event: frame u16, kind u8, tile u16, hit u8 (0–255)

   Wheel spin isn't kept: playback turns the wheels by the distance the truck goes. No physics here: the app imports
   this file, and must not import `src/physics` (D9). */

export type V3 = [number, number, number];
export type Quat = [number, number, number, number];

export interface PlayedTruck {
  pos: V3;
  quat: Quat;
  steer: number;
  squash: [number, number, number, number];
}

export interface PlayedTile {
  /** the frame it starts moving; before it, it is where it was built */
  first: number;
  /** its body's pose (the tile's middle and its turn from the start) in each frame from `first`; after them, the last */
  t: V3[];
  q: Quat[];
}

export type RunEventKind = "launch" | "land" | "break" | "end";

export interface PlayedEvent {
  frame: number;
  kind: RunEventKind;
  tile?: number;
  /** a landing's hit, 0–1 */
  hit?: number;
}

export interface Recording {
  fps: number;
  truck: PlayedTruck[];
  tiles: Map<number, PlayedTile>;
  events: PlayedEvent[];
}

const MAGIC = 0x4e525354; // "TSRN"
const VERSION = 1;
const POS = 500;
const ROT = 32767;
const STEER = 200;
const SQUASH = 1000;
const KINDS: RunEventKind[] = ["launch", "land", "break", "end"];

class Writer {
  private bytes: number[] = [];
  u8(v: number) {
    this.bytes.push(v & 0xff);
  }
  u16(v: number) {
    if (v < 0 || v > 0xffff) throw new Error(`a run's recording can't hold ${v}`);
    this.u8(v);
    this.u8(v >> 8);
  }
  u32(v: number) {
    this.u16(v & 0xffff);
    this.u16(v >>> 16);
  }
  /** a channel of values, as int16 steps from one to the next */
  channel(values: number[], scale: number) {
    let last = 0;
    for (const v of values) {
      const q = Math.round(v * scale);
      const d = q - last;
      if (d < -32768 || d > 32767) throw new Error(`a run's recording jumps too far in one frame (${d / scale})`);
      this.u16(d & 0xffff);
      last = q;
    }
  }
  done() {
    return new Uint8Array(this.bytes);
  }
}

class Reader {
  private at = 0;
  constructor(private view: DataView) {}
  u8() {
    return this.view.getUint8(this.at++);
  }
  u16() {
    const v = this.view.getUint16(this.at, true);
    this.at += 2;
    return v;
  }
  u32() {
    const v = this.view.getUint32(this.at, true);
    this.at += 4;
    return v;
  }
  channel(n: number, scale: number): number[] {
    const out: number[] = [];
    let q = 0;
    for (let i = 0; i < n; i++) {
      q += this.view.getInt16(this.at, true);
      this.at += 2;
      out.push(q / scale);
    }
    return out;
  }
}

/** The recording's bytes (before gzip). */
export function encodeRun(r: Recording): Uint8Array {
  const w = new Writer();
  w.u32(MAGIC);
  w.u8(VERSION);
  w.u8(r.fps);
  w.u16(r.truck.length);
  w.u16(r.tiles.size);
  w.u16(r.events.length);
  const T = r.truck;
  for (let k = 0; k < 3; k++) w.channel(T.map((f) => f.pos[k]), POS);
  for (let k = 0; k < 4; k++) w.channel(T.map((f) => f.quat[k]), ROT);
  w.channel(T.map((f) => f.steer), STEER);
  for (let k = 0; k < 4; k++) w.channel(T.map((f) => f.squash[k]), SQUASH);
  for (const [i, tile] of [...r.tiles].sort((a, b) => a[0] - b[0])) {
    w.u16(i);
    w.u16(tile.first);
    w.u16(tile.t.length);
    for (let k = 0; k < 3; k++) w.channel(tile.t.map((p) => p[k]), POS);
    for (let k = 0; k < 4; k++) w.channel(tile.q.map((p) => p[k]), ROT);
  }
  for (const e of r.events) {
    w.u16(e.frame);
    w.u8(KINDS.indexOf(e.kind));
    w.u16(e.tile ?? 0xffff);
    w.u8(Math.round((e.hit ?? 0) * 255));
  }
  return w.done();
}

/** A recording from its bytes (after gzip). */
export function decodeRun(bytes: Uint8Array): Recording {
  const r = new Reader(new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength));
  if (r.u32() !== MAGIC) throw new Error("not a Tile Steps run recording");
  const version = r.u8();
  if (version !== VERSION) throw new Error(`a run recording of version ${version}; this app plays version ${VERSION}`);
  const fps = r.u8();
  const frames = r.u16();
  const tileCount = r.u16();
  const eventCount = r.u16();
  const pos = [0, 1, 2].map(() => r.channel(frames, POS));
  const quat = [0, 1, 2, 3].map(() => r.channel(frames, ROT));
  const steer = r.channel(frames, STEER);
  const squash = [0, 1, 2, 3].map(() => r.channel(frames, SQUASH));
  const truck: PlayedTruck[] = [];
  for (let f = 0; f < frames; f++)
    truck.push({
      pos: [pos[0][f], pos[1][f], pos[2][f]],
      quat: [quat[0][f], quat[1][f], quat[2][f], quat[3][f]],
      steer: steer[f],
      squash: [squash[0][f], squash[1][f], squash[2][f], squash[3][f]],
    });
  const tiles = new Map<number, PlayedTile>();
  for (let k = 0; k < tileCount; k++) {
    const i = r.u16();
    const first = r.u16();
    const n = r.u16();
    const t = [0, 1, 2].map(() => r.channel(n, POS));
    const q = [0, 1, 2, 3].map(() => r.channel(n, ROT));
    tiles.set(i, { first, t: t[0].map((_, j) => [t[0][j], t[1][j], t[2][j]] as V3), q: q[0].map((_, j) => [q[0][j], q[1][j], q[2][j], q[3][j]] as Quat) });
  }
  const events: PlayedEvent[] = [];
  for (let k = 0; k < eventCount; k++) {
    const frame = r.u16();
    const kind = KINDS[r.u8()];
    const tile = r.u16();
    const hit = r.u8() / 255;
    events.push({ frame, kind, ...(tile !== 0xffff ? { tile } : {}), ...(kind === "land" ? { hit } : {}) });
  }
  return { fps, truck, tiles, events };
}
