/* Every word the app shows or says (the plan's rule 15). Kid words follow PRODUCT.md's voice: plain statements, sentence
   case, short; an exclamation mark only for "You can build it!" and the end of a build. */
export const APP_NAME = "Tile Steps";

export const S = {
  screens: {
    library: "Library",
    build: "Build",
    done: "Well done",
    grownups: "Grown-ups",
    tiles: "Tiles",
    settings: "Settings",
    design: "The design page",
    thumb: "Picture",
  },
  pwa: {
    offlineReady: "Ready to use without Wi-Fi.",
  },
} as const;
