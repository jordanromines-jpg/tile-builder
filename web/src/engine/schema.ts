/* The shapes of the app's data (plan key 4c), checked with zod: a project, an inventory, a backup. A project is
   written by hand as data (D3); the checker (check.ts) proves it can be built. */
import { z } from "zod";
import { BRAND_IDS, COLOURS, SHAPE_IDS } from "./catalog";
import { THEMES } from "./themes";

export const ShapeIdZ = z.enum(SHAPE_IDS as [string, ...string[]]);
export const ColourZ = z.enum(COLOURS as [string, ...string[]]);
export const BrandIdZ = z.enum(BRAND_IDS as [string, ...string[]]);
export const AgeZ = z.enum(["t", "a", "b", "c", "d"]);
export type Age = z.infer<typeof AgeZ>;

const Vec3 = z.tuple([z.number(), z.number(), z.number()]);

export const PlacedZ = z.object({
  shape: ShapeIdZ,
  colour: ColourZ.optional(),
  /** where the tile's base corner (0,0) is */
  pos: Vec3,
  /** [tilt about the base edge, turn about the vertical]; a roof's tilt is worked out from the triangle's legs */
  rot: z.tuple([z.number(), z.number()]),
  /** roof: leans into a pyramid; ramp (2.7): leans from a base edge up to a support, for trucks to drive on; crash
      (2.7): built to be knocked over by a truck */
  role: z.enum(["roof", "ramp", "crash", "brace"]).optional(),
});

export const StepZ = z.object({
  say: z.string().min(1),
  tiles: z.array(z.number().int().nonnegative()).min(1),
});

export const SwapRuleZ = z.object({
  from: ShapeIdZ,
  to: ShapeIdZ,
  perPyramid: z.boolean().optional(),
  say: z.string(),
});

/* A Monster trucks course (4.0a): the pieces a truck drives or crashes (features), and the route it takes. R13
   (run-rules.ts) proves the route; route.ts compiles it into legs for the truck runs. */
const Dir = z.enum(["N", "E", "S", "W"]);
const Pt2 = z.tuple([z.number(), z.number()]);

/** Where a truck drives: flat ground at height y inside a polygon (x, z), or a slope from one point to another (the
    middle of the bottom edge to the middle of the top edge), as wide as its tiles. */
export const SurfaceZ = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("flat"), y: z.number(), poly: z.array(Pt2).min(3) }),
  z.object({ kind: z.literal("slope"), from: Vec3, to: Vec3, width: z.number().positive() }),
]);

export const FEATURE_KINDS = ["lane", "ramp", "kicker", "deck", "tunnel", "car", "wall", "dominoes"] as const;

export const FeatureZ = z.object({
  /** numbered by kind: lane-1, ramp-2, car-1 */
  name: z.string().min(1),
  kind: z.enum(FEATURE_KINDS),
  /** to drive on (lane, ramp, kicker, deck, tunnel floor) or to land on (a crush car's roof) */
  surface: SurfaceZ.optional(),
  /** uphill for a ramp, along the road for a lane, the way a wall or a row of dominoes faces */
  dir: Dir,
  /** the tiles that make it: what the route may touch */
  tiles: z.array(z.number().int().nonnegative()),
});

/** "name": drive it (up a ramp, along a lane); {down}: drive it the other way; {jump}: fly to land on it; {through}: crash
    into it; {to}: drive straight to a point; {place}: the child puts the truck on a deck, starting a new run */
export const RouteItemZ = z.union([z.string(), z.object({ down: z.string() }), z.object({ jump: z.string() }), z.object({ through: z.string() }), z.object({ to: Vec3 }), z.object({ place: z.string() })]);

export const CourseZ = z.object({
  features: z.array(FeatureZ),
  route: z.array(RouteItemZ),
  /** the truck's colour for this course, when it is not the default (a tile colour) */
  truck: ColourZ.optional(),
  /** the truck is pushed round this course at the steady speeds of 4.0, not the faster ones of 4.4.1 (a crowded
      course, where faster runs come apart) */
  steady: z.boolean().optional(),
});

export const ProjectZ = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    theme: z.enum(THEMES as [string, ...string[]]),
    age: AgeZ,
    stars: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    flat: z.boolean().optional(),
    /** a closed ring of more than six tiles: mixed brands may not meet exactly */
    bigRing: z.boolean().optional(),
    done: z.string().min(1),
    needs: z.object({ brandExtras: z.array(ShapeIdZ).optional() }).optional(),
    placed: z.array(PlacedZ).min(1),
    steps: z.array(StepZ).min(1),
    swaps: z.array(SwapRuleZ).optional(),
    course: CourseZ.optional(),
  })
  .superRefine((p, ctx) => {
    p.steps.forEach((s, i) =>
      s.tiles.forEach((t) => {
        if (t >= p.placed.length) ctx.addIssue({ code: "custom", path: ["steps", i, "tiles"], message: `step ${i + 1} points at tile ${t}, past the last tile` });
      }),
    );
    p.course?.features.forEach((f, i) =>
      f.tiles.forEach((t) => {
        if (t >= p.placed.length) ctx.addIssue({ code: "custom", path: ["course", "features", i, "tiles"], message: `${f.name} points at tile ${t}, past the last tile` });
      }),
    );
  });

const CountZ = z.object({ any: z.number().int().nonnegative(), byColour: z.partialRecord(ColourZ, z.number().int().nonnegative()).optional() });

export const InventoryZ = z.object({
  brands: z.array(BrandIdZ),
  tallLeg: z.number().positive().nullable(),
  counts: z.partialRecord(ShapeIdZ, CountZ),
});

export const SettingsZ = z.object({
  age: AgeZ.nullable(),
  voice: z.boolean(),
  soundEffects: z.boolean(),
  lang: z.string(),
  theme: z.enum(["system", "light", "dark"]),
  firstRunSeen: z.boolean(),
  homeScreenCardSeen: z.boolean(),
  persisted: z.boolean().nullable(),
  lastBackup: z.string().nullable(),
  /** how fast Watch it build plays (4.1); an older backup has none */
  watchSpeed: z.enum(["slow", "medium", "fast"]).default("medium"),
});

export const ProgressZ = z.object({ projectId: z.string(), step: z.number().int().nonnegative(), updatedAt: z.string() });

/** A child's own design from Make your own (5.0c). */
export const DesignZ = z.object({
  id: z.string().regex(/^my-[a-z0-9]+$/),
  name: z.string().min(1),
  placed: z.array(PlacedZ),
  updated: z.string(),
});

export const BackupZ = z.object({
  app: z.literal("tile-steps"),
  version: z.literal(1),
  exportedAt: z.string(),
  settings: SettingsZ,
  inventory: InventoryZ,
  progress: z.array(ProgressZ),
  /** 5.0c; a backup from before has none */
  designs: z.array(DesignZ).optional(),
});
