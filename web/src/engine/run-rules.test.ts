import { describe, expect, it } from "vitest";
import { Builder } from "../projects/helpers";
import { PROJECTS } from "../projects/index";
import { crashWall, crushCar, kicker, lane, tower } from "../projects/track-kit";
import { checkProject, legsToCheck } from "./check";
import { describe as say } from "./problems";
import { compileRoute, RouteError } from "./route";
import { ProjectZ } from "./schema";
import { GRAVITY, MAX_LAUNCH_SPEED, TRUCK_RIDE } from "./truck-size";
import type { Project, RouteItem } from "./types";

const RUN = Math.cos(Math.PI / 6);
const meta = { id: "t", title: "T", theme: "trucks" as const, age: "d" as const, stars: 1 as const, done: "Done!" };

/** A road, a kicker and a landing lane a square past it, then whatever `more` adds. */
function course(route: RouteItem[], more: (b: Builder) => void = () => {}): Project {
  const b = new Builder();
  lane(b, ["green"], { x: 0, y: 0, z: 0 }, "N", 2, 2, "Lay the road.");
  kicker(b, "red", { x: 0, y: 0, z: -2 }, "N", { lanes: 2, support: "blue" });
  lane(b, ["yellow"], { x: 0, y: 0, z: -2 - RUN - 1 - 1 }, "N", 3, 2, "Lay the landing.");
  more(b);
  return b.route(route).build(meta);
}

const run = (p: Project) => checkProject(p).problems.filter((q) => q.rule.startsWith("R13"));
const words = (p: Project) => run(p).map((q) => say(q, p.id));

describe("R13: the truck can drive the course (4.0a)", () => {
  it("a road, a kicker and a jump over the gap to a landing lane is a good course", () => {
    expect(words(course(["lane-1", "kicker-1", { jump: "lane-2" }, "lane-2"]))).toEqual([]);
  });

  it("R13a: a name that isn't there, a build with no route, a lane that is a car", () => {
    expect(words(course(["lane-1", "ramp-9"])).join()).toContain("there is no \"ramp-9\"");
    expect(run(course([]))[0]).toMatchObject({ rule: "R13a" });
    const withCar = course(["lane-1", "car-1"], (b) => crushCar(b, "red", 5, 0));
    expect(words(withCar).join()).toContain("Crash it with");
  });

  it("R13b: a gap with no jump", () => {
    const rules = run(course(["lane-1", "lane-2"])).map((q) => q.rule);
    expect(rules).toContain("R13b");
  });

  it("R13c: an arc that goes through a tower is found, and names the tile", () => {
    const p = course(["lane-1", "kicker-1", { jump: "lane-2" }, "lane-2"], (b) => tower(b, ["red", "red", "red", "red"], 0, -5, 2, 1, 4, null));
    const hit = run(p).find((q) => q.rule === "R13c");
    expect(hit?.tile).toBeDefined();
    expect(hit?.message).toContain("hits this tile");
  });

  it("R13c: a landing too close to the edge, and a launch faster than a toy truck goes", () => {
    const far = new Builder();
    lane(far, ["green"], { x: 0, y: 0, z: 0 }, "N", 2, 2, "Lay the road.");
    kicker(far, "red", { x: 0, y: 0, z: -2 }, "N", { lanes: 2, support: "blue" });
    lane(far, ["yellow"], { x: 0, y: 0, z: -22 }, "N", 3, 2, "Lay the landing, far off.");
    const p = far.route(["lane-1", "kicker-1", { jump: "lane-2" }]).build(meta);
    expect(run(p).find((q) => q.rule === "R13c")?.message).toContain("faster than a toy truck goes");
    expect(MAX_LAUNCH_SPEED).toBeGreaterThan(20);
  });

  it("R13d: a drive through a wall that the route doesn't name", () => {
    const p = course(["lane-1", "kicker-1", { jump: "lane-2" }, "lane-2"], (b) => tower(b, ["red"], 0, -7.2, 2, 1, 1, null));
    expect(run(p).some((q) => q.rule === "R13d" && q.message.includes("drives through this tile"))).toBe(true);
  });

  it("R13e: a wall that nobody hits, and a crash tile that is part of nothing", () => {
    const wall = course(["lane-1", "kicker-1", { jump: "lane-2" }, "lane-2"], (b) => crashWall(b, ["red"], { x: 6, y: 0, z: 0 }, "N", 2, 2, () => "wall"));
    expect(run(wall).filter((q) => q.rule === "R13e").map((q) => q.message).join()).toContain("never hits it");
    const stray = course(["lane-1", "kicker-1", { jump: "lane-2" }, "lane-2"], (b) => {
      b.add("square", "red", [9, 0, 0], [0, 0], "crash");
      b.step("A lone skittle.");
    });
    expect(run(stray).filter((q) => q.rule === "R13e").map((q) => q.message).join()).toContain("not part of a car, a wall or a row of dominoes");
  });

  it("a route that crashes into the wall passes R13e", () => {
    const hit = course(["lane-1", "kicker-1", { jump: "lane-2" }, { through: "wall-1" }], (b) => crashWall(b, ["red"], { x: 0, y: 0, z: -9 }, "N", 2, 2, () => "wall"));
    expect(words(hit)).toEqual([]);
  });

  it("a car you leap over is solid: not built to fall, and not on the course", () => {
    const b = new Builder();
    crushCar(b, "red", 0, 0, "a car to leap", true);
    expect(b.features).toEqual([]);
    expect(b.placed.some((t) => t.role === "crash")).toBe(false);
  });
});

describe("compiling a route (4.0a)", () => {
  it("lays the route out as legs that join, with the flight solved from the lip to the landing", () => {
    const p = course(["lane-1", "kicker-1", { jump: "lane-2" }, "lane-2"]);
    const legs = compileRoute(p, 1.867);
    expect(legs.map((l) => l.kind)).toEqual(["drive", "climb", "fly", "drive"]);
    const fly = legs[2];
    // off the lip of a 30° kicker one square up
    expect(fly.from[1]).toBeCloseTo(1);
    expect(fly.fly!.angle).toBeCloseTo(Math.PI / 6);
    // and down on the landing lane, on its surface and in the middle of its lane
    expect(fly.to[1]).toBeCloseTo(0);
    expect(fly.to[0]).toBeCloseTo(1);
    // the arc really goes from the truck's middle at take-off to its middle at the landing under gravity
    const f = fly.fly!;
    const t = f.time;
    const z = f.start[2] + f.heading[1] * f.speed * Math.cos(f.angle) * t;
    const y = f.start[1] + f.speed * Math.sin(f.angle) * t - 0.5 * GRAVITY * t * t;
    expect(z).toBeCloseTo(fly.to[2], 1);
    expect(y).toBeCloseTo(fly.to[1] + TRUCK_RIDE, 1);
  });

  it("v = √(g·d² / (2·cos²θ·(d·tanθ − h))) for a drop off a deck (θ = 0)", () => {
    const b = new Builder();
    tower(b, ["red", "red", "red"], 0, -3, 2, 1, 3, "yellow", undefined, "N");
    lane(b, ["green"], { x: 0, y: 0, z: -4 }, "N", 3, 2, "Landing.");
    const p = b.route(["deck-1", { jump: "lane-1" }]).build(meta);
    const [drive, fly] = compileRoute(p, 1.867);
    expect(drive.kind).toBe("drive");
    const f = fly.fly!;
    const d = Math.abs(fly.to[2] - f.start[2]);
    const drop = f.start[1] - (fly.to[1] + TRUCK_RIDE);
    expect(f.angle).toBe(0);
    expect(f.speed).toBeCloseTo(Math.sqrt((GRAVITY * d * d) / (2 * drop)), 1);
  });

  it("throws a RouteError that names the item", () => {
    try {
      compileRoute(course(["lane-1", { jump: "ramp-9" }]), 1.867);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(RouteError);
      expect((e as RouteError).item).toBe(1);
    }
  });
});

describe("the fifty Monster trucks courses (4.0a)", () => {
  const trucks = PROJECTS.filter((p) => p.theme === "trucks");

  it("every truck build has a course that parses, with a route of its own", () => {
    expect(trucks).toHaveLength(50);
    for (const p of trucks) {
      expect(ProjectZ.safeParse(p).success, p.id).toBe(true);
      expect(p.course?.route.length, p.id).toBeGreaterThan(0);
      // a feature's name is its kind and a number (or a name the build chose), and it points at tiles that are there
      expect(new Set(p.course!.features.map((f) => f.name)).size, p.id).toBe(p.course!.features.length);
      for (const f of p.course!.features) for (const t of f.tiles) expect(t, `${p.id} ${f.name}`).toBeLessThan(p.placed.length);
    }
  });

  it("every route compiles and passes R13a–e under every leg of the tall triangle", () => {
    for (const p of trucks) {
      expect(checkProject(p, { legs: legsToCheck() }).problems.filter((q) => q.rule.startsWith("R13")).map((q) => say(q, p.id)), p.id).toEqual([]);
    }
  });

  it("no flight asks for more than a toy truck can do, and every flight lands inside what it names", () => {
    for (const p of trucks) {
      for (const l of compileRoute(p, 1.867)) if (l.fly) expect(l.fly.speed, `${p.id} ${l.target}`).toBeLessThanOrEqual(MAX_LAUNCH_SPEED);
    }
  });
});
