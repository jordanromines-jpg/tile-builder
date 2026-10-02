/* The eight themes on the Library's filter. Every theme appears in every age band, and none is drawn for boys or
   girls (PRODUCT.md, "The same for every child"; child-development.md, section 7). */
export type Theme = "castles" | "homes" | "vehicles" | "space" | "animals" | "gardens" | "bridges" | "patterns";

export const THEMES: Theme[] = ["castles", "homes", "vehicles", "space", "animals", "gardens", "bridges", "patterns"];

export const THEME_LABELS: Record<Theme, string> = {
  castles: "Castles",
  homes: "Homes",
  vehicles: "Things that go",
  space: "Space",
  animals: "Animals",
  gardens: "Gardens",
  bridges: "Towers and bridges",
  patterns: "Patterns",
};
