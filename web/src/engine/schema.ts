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
  role: z.literal("roof").optional(),
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
  })
  .superRefine((p, ctx) => {
    p.steps.forEach((s, i) =>
      s.tiles.forEach((t) => {
        if (t >= p.placed.length) ctx.addIssue({ code: "custom", path: ["steps", i, "tiles"], message: `step ${i + 1} points at tile ${t}, past the last tile` });
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
});

export const ProgressZ = z.object({ projectId: z.string(), step: z.number().int().nonnegative(), updatedAt: z.string() });

export const BackupZ = z.object({
  app: z.literal("tile-steps"),
  version: z.literal(1),
  exportedAt: z.string(),
  settings: SettingsZ,
  inventory: InventoryZ,
  progress: z.array(ProgressZ),
});
