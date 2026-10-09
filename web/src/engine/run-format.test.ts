import { describe, expect, it } from "vitest";
import { decodeRun, encodeRun, type Recording } from "./run-format";

const rec = (): Recording => ({
  fps: 60,
  truck: Array.from({ length: 30 }, (_, f) => ({
    pos: [f * 0.03, 0.2 + Math.sin(f / 5) * 0.1, -f * 0.01] as [number, number, number],
    quat: [0, Math.sin(f / 40), 0, Math.cos(f / 40)] as [number, number, number, number],
    steer: 0.3 * Math.sin(f / 9),
    squash: [0.1, 0.2, 0.3, 0.4] as [number, number, number, number],
  })),
  tiles: new Map([[7, { first: 12, t: [[1, 0.5, 2], [1.1, 0.4, 2], [1.3, 0.04, 2.1]] as [number, number, number][], q: [[0, 0, 0, 1], [0.1, 0, 0, 0.995], [0.7, 0, 0, 0.714]] as [number, number, number, number][] }]]),
  events: [{ frame: 3, kind: "launch" }, { frame: 9, kind: "land", hit: 0.5 }, { frame: 12, kind: "break", tile: 7 }, { frame: 29, kind: "end" }],
});

describe("a run's recording", () => {
  it("comes back as it went in, to within its steps (1/500 square, 1/32767 of a turn)", () => {
    const a = rec();
    const b = decodeRun(encodeRun(a));
    expect(b.fps).toBe(60);
    expect(b.truck).toHaveLength(30);
    b.truck.forEach((f, i) => {
      f.pos.forEach((v, k) => expect(Math.abs(v - a.truck[i].pos[k])).toBeLessThanOrEqual(0.001));
      f.quat.forEach((v, k) => expect(Math.abs(v - a.truck[i].quat[k])).toBeLessThan(1e-4));
      expect(Math.abs(f.steer - a.truck[i].steer)).toBeLessThan(0.003);
      f.squash.forEach((v, k) => expect(Math.abs(v - a.truck[i].squash[k])).toBeLessThan(0.001));
    });
    const tile = b.tiles.get(7)!;
    expect(tile.first).toBe(12);
    expect(tile.t[2][1]).toBeCloseTo(0.04, 3);
    expect(b.events).toEqual([{ frame: 3, kind: "launch" }, { frame: 9, kind: "land", hit: 128 / 255 }, { frame: 12, kind: "break", tile: 7 }, { frame: 29, kind: "end" }]);
  });

  it("refuses what isn't a recording, and a version it doesn't know", () => {
    expect(() => decodeRun(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]))).toThrow(/not a Tile Steps run/);
    const bytes = encodeRun(rec());
    bytes[4] = 9;
    expect(() => decodeRun(bytes)).toThrow(/version 9/);
  });

  it("won't keep a jump too big to step (the encoder says so, it doesn't wrap round)", () => {
    const a = rec();
    a.truck[5].pos = [200, 0, 0];
    expect(() => encodeRun(a)).toThrow(/jumps too far/);
  });
});
