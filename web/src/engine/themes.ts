/* The themes on the Library's filter. Every theme appears in every age band, and none is drawn for boys or
   girls (PRODUCT.md, "The same for every child"; child-development.md, section 7). */
export type Theme = "castles" | "homes" | "vehicles" | "space" | "animals" | "gardens" | "bridges" | "patterns" | "trucks" | "flowers";

/** "trucks" (2.7) is the Monster trucks section: arenas, ramps, jumps, drops and crashes for 1:64 trucks. "flowers"
    (2.9) is the Wildflowers section: flowers native to Kansas, Chicago and North Carolina. Each has a shelf of its own
    (SECTIONS). */
export const THEMES: Theme[] = ["castles", "homes", "vehicles", "space", "animals", "gardens", "bridges", "patterns", "trucks", "flowers"];

/** Themes with a shelf of their own on the Library, after the chosen age's shelves, in this order. */
export const SECTIONS: Theme[] = ["trucks", "flowers"];

/** One short word a chip can show under its picture (3.1); the full name is still spoken and read out. */
export const THEME_SHORT: Record<Theme, string> = {
  castles: "Castles",
  homes: "Homes",
  vehicles: "Go!",
  space: "Space",
  animals: "Animals",
  gardens: "Gardens",
  bridges: "Bridges",
  patterns: "Patterns",
  trucks: "Trucks",
  flowers: "Flowers",
};

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
  flowers: "Wildflowers",
};
