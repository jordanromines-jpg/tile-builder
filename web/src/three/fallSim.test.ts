import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { DEFAULT_LEG } from "../engine/catalog";
import { PROJECTS } from "../projects";
import { castle } from "../projects/castle";
import { CONFETTI_MS, PIECES, simulate, supportsOf, tiltOf } from "./fallSim";
import { buildField, heightAt } from "./heightField";
import { TH } from "./tile";

const ids = ["fish", "box", "castle", "pitched-house", "flower", "truck-ultimate-arena"];
const projects = ids.map((id) => PROJECTS.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);

describe("the height field", () => {
  it("is the table outside the build and the tiles' tops over it", () => {
    const f = buildField(castle, DEFAULT_LEG);
    expect(heightAt(f, f.min[0] - 2, f.min[1] - 2)).toBe(0);
    expect(f.top).toBeGreaterThan(2);
    expect(f.h.some((h) => Math.abs(h - f.top) < 1e-6)).toBe(true);
  });
  it("puts a flat build's top at its tiles' top face", () => {
    const f = buildField(PROJECTS.find((p) => p.id === "box")!, DEFAULT_LEG);
    expect(f.top).toBeGreaterThan(TH / 2 - 1e-6);
  });
});

describe("the finish's falling tiles", () => {
  it("found every project it is tested on", () => {
    expect(projects).toHaveLength(ids.length);
  });
  for (const project of projects) {
    describe(project.id, () => {
      const field = buildField(project, DEFAULT_LEG);
      const sim = simulate(field);
      it("has every piece at rest before the celebration ends", () => {
        expect(sim.settled).toBe(true);
        expect(sim.pieces).toHaveLength(PIECES);
        expect(sim.duration * 1000).toBeLessThanOrEqual(CONFETTI_MS);
      });
      it("ends each piece lying flat on a surface, never inside one", () => {
        sim.pieces.forEach((pc, i) => {
          const r = sim.rest[i];
          const half = (TH * pc.scale) / 2;
          const last = sim.track[i].subarray((sim.frames - 1) * 7);
          const q = new THREE.Quaternion(last[3], last[4], last[5], last[6]);
          expect(tiltOf(q)).toBeLessThan(1e-3);
          expect(last[1]).toBeCloseTo(r.y, 4);
          // its underside is on the surface it rests on, and clear of the build's own surface under all of its footprint
          expect(r.y - half).toBeCloseTo(r.floor, 4);
          expect(r.y - half).toBeGreaterThanOrEqual(supportsOf(field, r.x, r.z, pc.radius) - 1e-4);
          expect(r.y - half).toBeGreaterThanOrEqual(-1e-6);
        });
      });
      it("is the same every time", () => {
        const again = simulate(field);
        expect(again.track.map((t) => Array.from(t))).toEqual(sim.track.map((t) => Array.from(t)));
      });
      it("never has a piece below the table on the way", () => {
        sim.pieces.forEach((pc, i) => {
          const half = (TH * pc.scale) / 2;
          for (let f = sim.first[i]; f < sim.frames; f++) expect(sim.track[i][f * 7 + 1] - half).toBeGreaterThanOrEqual(-1e-4);
        });
      });
    });
  }
  it("ends in time, every piece at rest on a surface, for every project", () => {
    for (const project of PROJECTS) {
      const field = buildField(project, DEFAULT_LEG);
      const sim = simulate(field);
      expect(sim.settled, project.id).toBe(true);
      expect(sim.duration * 1000, project.id).toBeLessThanOrEqual(CONFETTI_MS);
      sim.pieces.forEach((pc, i) => {
        const r = sim.rest[i];
        const half = (TH * pc.scale) / 2;
        // never inside the build's own surface, and lying on what it rests on
        expect(r.y - half, project.id).toBeGreaterThanOrEqual(supportsOf(field, r.x, r.z, pc.radius) - 1e-4);
        expect(r.y - half, project.id).toBeCloseTo(r.floor, 4);
      });
    }
  });
  it("lands some on the build and some on the table", () => {
    const on = new Set(simulate(buildField(castle, DEFAULT_LEG)).rest.map((r) => r.on));
    expect(on.has("build")).toBe(true);
    expect(on.has("table")).toBe(true);
  });
});
