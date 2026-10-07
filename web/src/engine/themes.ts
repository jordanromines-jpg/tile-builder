/* The eight themes on the Library's filter. Every theme appears in every age band, and none is drawn for boys or
   girls (PRODUCT.md, "The same for every child"; child-development.md, section 7). */
export type Theme = "castles" | "homes" | "vehicles" | "space" | "animals" | "gardens" | "bridges" | "patterns" | "trucks";

/** "trucks" (2.7) is the Monster trucks section: arenas, ramps, jumps, drops and crashes for 1:64 trucks. */
export const THEMES: Theme[] = ["castles", "homes", "vehicles", "space", "animals", "gardens", "bridges", "patterns", "trucks"];

export const THEME_LABELS: Record<Theme, string> = {
  castles: "Castles",
  homes: "Homes",
  vehicles: "Things that go",
  space: "Space",
  animals: "Animals",
  gardens: "Gardens",
  bridges: "Towers and bridges",
  patterns: "Patterns",
  trucks: "Monster trucks",
};
