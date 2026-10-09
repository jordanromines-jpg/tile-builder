// The engine's types, inferred from the schema (plan key 4c).
import type { z } from "zod";
import type { BackupZ, CourseZ, FeatureZ, InventoryZ, PlacedZ, ProgressZ, ProjectZ, RouteItemZ, SettingsZ, StepZ, SurfaceZ, SwapRuleZ } from "./schema";
import type { BrandId, Colour, ShapeId } from "./catalog";
import type { Theme } from "./themes";

type Fix<T> = Omit<T, "shape" | "colour"> & { shape: ShapeId; colour?: Colour };
export type Placed = Fix<z.infer<typeof PlacedZ>>;
export type Step = z.infer<typeof StepZ>;
export type SwapRule = Omit<z.infer<typeof SwapRuleZ>, "from" | "to"> & { from: ShapeId; to: ShapeId };
export type Surface = z.infer<typeof SurfaceZ>;
export type Feature = z.infer<typeof FeatureZ>;
export type RouteItem = z.infer<typeof RouteItemZ>;
export type Course = Omit<z.infer<typeof CourseZ>, "truck"> & { truck?: Colour };
export type Project = Omit<z.infer<typeof ProjectZ>, "placed" | "theme" | "swaps" | "needs" | "course"> & {
  course?: Course;
  theme: Theme;
  placed: Placed[];
  swaps?: SwapRule[];
  needs?: { brandExtras?: ShapeId[] };
};
export interface ShapeCount {
  any: number;
  byColour?: Partial<Record<Colour, number>>;
}
export type Inventory = Omit<z.infer<typeof InventoryZ>, "brands" | "counts"> & { brands: BrandId[]; counts: Partial<Record<ShapeId, ShapeCount>> };
export type Settings = z.infer<typeof SettingsZ>;
export type Progress = z.infer<typeof ProgressZ>;
export type Backup = Omit<z.infer<typeof BackupZ>, "inventory"> & { inventory: Inventory };
export type { Age } from "./schema";
