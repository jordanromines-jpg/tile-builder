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
  },
  pwa: {
    offlineReady: "Ready to use without Wi-Fi.",
  },
  kid: {
    back: "Back to the shelf",
    hearAgain: "Hear again",
    next: "Next",
    stepBack: "Back",
    door: "This door is for grown-ups.",
    doorLabel: "Grown-ups",
    turnLeft: "Turn left",
    turnRight: "Turn right",
    mySide: "Back to my side",
    all: "All",
    more: "More",
    ages: { a: "3 to 5", b: "6 to 8", c: "9 to 10" },
    agesShort: { a: "3–5", b: "6–8", c: "9–10" },
    pickAge: "How old is the builder?",
    can: "You can build it!",
    swap: "You can build it with a swap",
    need: (n: number) => `Need ${n} more`,
    needSay: (what: string) => `You need ${what} for this one.`,
    stars: (n: number) => `${n} ${n === 1 ? "star" : "stars"}`,
    step: (i: number, n: number) => `Step ${i} of ${n}`,
    emptyTiles: "A grown-up can add your tiles behind the door.",
    emptyShelf: "No projects here yet. Try another picture.",
    skip: "Tap to go on",
  },
} as const;
