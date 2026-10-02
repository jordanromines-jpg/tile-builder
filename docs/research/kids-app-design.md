# Designing Tile Builder for kids 3–10: products, evidence and design-system starting points

Research notes, 2 Oct 2026. This feeds the design-system pass in phase 0 of [PLAN.md](../../PLAN.md). It builds on
[kids-and-ipad.md](kids-and-ipad.md) (touch, storage, privacy) and does not repeat it.

Every recommendation is tagged:

- **E** = evidence-based. The source number follows it.
- **J** = our judgement. Test it with kids before treating it as settled.
- **Unconfirmed** = we saw the claim but could not check it in this session.

## How this was researched, and its limits

- **Web search.** About 35 searches. This environment's proxy blocks most result pages, so many claims come from the
  search engine's summary of a page, not from reading the page. The Sources list marks each source as *read*,
  *search summary* or *exists, not read*. The session's search budget ran out before every gap was closed. The gaps
  are listed in each section.
- **Read directly.** Apple developer pages (Kids apps, App Store Review Guidelines, Human Interface Guidelines). W3C
  WCAG "Understanding" pages, MDN pages and MDN browser-compat data (from their GitHub sources). The three.js source.
  The Phosphor README. The `google/fonts` repository (metadata, descriptions and the font files themselves).
- **Our own checks.**
  - We rendered 23 font and stylistic-set combinations from the `google/fonts` files to see which have a single-storey
    *a* and *g*, and whether *I*, *l* and *1* look different. We measured each font's x-height.
  - We simulated colour-vision deficiency on two candidate tile palettes (Machado 2009 model, via the `colorspacious`
    Python package [57]) and computed WCAG contrast ratios.
- **Local design database.** `ui-ux-pro-max` (`search.py`) with `--domain typography`, `color`, `style`, `ux`,
  `product` and `--design-system`. Results are marked **[DB]**. They are generic suggestions, not research.

---

## 1. Reference products

### Toca Boca

- "Kids first". They "respect kids as people — not just little versions of people" [1].
- Almost no text, so non-readers can play. No rules [2].
- Kids should get lost in play "without any adults directing them" [1].
- Kids do not use the adult pattern "tap to select, tap again to use". They pick up an object and act at once
  [1][3] (search summary; we could not confirm which page says this).
- The in-app store sits behind a parental gate: hold a button or enter a birth year [4] (review site).
- **Talk/case study:** Joan Ganz Cooney Center podcast with Toca Boca [1].
- **Learn:** worlds that work with no text. Direct actions, no select-then-confirm. Gate only the grown-up things.

### Sago Mini

- Open-ended play. No instructions, no rules, no stressful time limits [5].
- Design goal: a child opens the app and starts alone. "Parents hand over the device and the kids take it from
  there" [6] (search summary of an interview).
- Themes come from kids' real lives: a road trip, the grocery store [6].
- Weekly playtests with kids and parents [5][6] (search summary).
- Parent area: a Parents icon at the top left. Settings and store sit behind a simple maths problem or a "hold for
  3 seconds" prompt. Parents can hide the news button and turn off camera access [7] (review site).
- **Learn:** hand-over-and-go. Everyday themes (our houses, vehicles, gardens fit this). Playtest weekly.

### Khan Academy Kids (built by the Duck Duck Moose team)

- Made with Stanford's Graduate School of Education. Aligned to the Head Start Early Learning Outcomes Framework.
  Several years of prototyping and play-testing before the 2018 launch [8][9].
- Audio instructions and read-aloud let pre-readers and early readers use the same screens [10] (search summary).
- Parents can switch skills on and off [10] (review site).
- **Learn:** every instruction is spoken. One screen serves readers and pre-readers.

### PBS KIDS Games

- Producers must check the UI for accessibility: screen-reader labels for navigation, text-to-speech, and text
  contrast. Digital colour must meet WCAG 2 AA [11][12] (search summary).
- PBS KIDS built Universal Design for Learning standards with CAST and trains producers in them [11][13].
- Games aim to be usable "with little or no assistance". They avoid long text and need little or no formal
  instruction [11].
- A PBS KIDS brand style guide (v1.4, PDF) is public [14]. This environment could not open it.
- **Learn:** accessibility is a production requirement, not a polish step.

### LEGO DUPLO World (StoryToys) and LEGO Builder

- DUPLO World: open-ended. No instructions or time limits. A parent can set a bedtime timer that freezes the app at
  the chosen time. A Parent Center explains what each activity teaches [15][16].
- LEGO Builder: the set in 3D. Zoom and rotate. Step-by-step building [17][18].
- LEGO Builder "Build Together": builders split tasks, join with a PIN and take turns on steps [17].
- Some App Store reviewers say LEGO Builder has unlabelled buttons for screen readers [18] (search summary).
- LEGO Audio & Braille Building Instructions turn each building step into text. A synthetic voice reads it. The text
  is generated from LEGO's own model files [19][20].
- **Learn:** LEGO Builder is the closest product to our Build mode. LEGO's audio instructions show that spoken steps can
  be generated from model data. Our projects are data too, so each step's read-aloud text can be generated and checked
  in CI. Turn-taking for siblings is a later idea.

### Lingokids

- Parent area: progress towards goals, up to four child profiles, weekly progress reports and advice [21][22] (review
  sites).
- Big buttons and clear icons for independent use [22].
- **Learn:** one profile per child is normal. We should not copy progress reports (see section 7).

### Duolingo ABC

- For ages 3–8. Built by learning scientists, literacy specialists, engineers, illustrators and parents [23][24].
- The team ran playtesting and co-design sessions with preschoolers [23].
- We found no public design-system material. The Duolingo blog has an engineering post on the Android build [25].
- **Learn:** co-design sessions with preschoolers are worth copying.

### Endless Alphabet (Originator)

- "No high scores, failures, limits or stress" [26].
- Letters talk. Short monster animations act out each word's meaning [26].
- **Learn:** no fail states. Delight comes from short animations that carry meaning.

### Pok Pok (Pok Pok Playroom)

- Winner of a 2021 Apple Design Award [27][28] (category "Delight and Fun" per search summary).
- Apple's "Behind the Design" case study [29] (read):
  - The palette was limited to three colours: red, yellow and blue.
  - Sounds were made to be calm, "something that could be heard a number of times without becoming fatiguing".
  - "Parents shouldn't need to mute the app in a restaurant." No jingles that get stuck in your head.
  - Sounds are recorded from real objects. Sound follows meaning: "the color blue is always a C", and circles are a
    single sine wave.
  - Art is hand-drawn and hand-animated. "Everything could jitter a little bit", which made it easier to make.
- No rules, language, menus or levels. No timers, points or scores. People in the app represent many races, cultures,
  genders, family types, body types and abilities [30] (review site, search summary).
- Described as Montessori-inspired [30]. Sketch published a case study [31] (exists, not read).
- **Learn:** calm is a feature. Fixed sound-to-meaning mapping. Gender-neutral by default. A small palette.

### Montessori apps

- **Gap.** We did not research dedicated Montessori apps before the search budget ran out. The only evidence we have is
  Pok Pok's "Montessori-inspired" open-ended, self-guided play [30]. Next pass: look at Montessori preschool apps
  (for example from Edoki Academy, unconfirmed) for real-object imagery and self-correcting tasks.

### What the products share

| Pattern | Seen in | Use for Tile Builder |
|---|---|---|
| No text, or every word spoken | Toca Boca, Pok Pok, Khan Kids, PBS KIDS | Kid side works with sound off and no reading (E [2][10][11][30]) |
| No fail states, scores or timers | Sago, Endless Alphabet, Pok Pok, DUPLO World | Already in PLAN.md (E [5][16][26][30]) |
| Gate only grown-up areas | Toca, Sago, Apple Kids Category | Gate the parent side only (E [4][7][40]) |
| Parent area explains, not pressures | DUPLO World, Sago | Explain what kids can build; no reports (J, from [7][16]) |
| 3D step-by-step with rotate | LEGO Builder | Our Build mode, with buttons instead of pinch for young kids (E [17][39]) |
| Calm, consistent sound | Pok Pok | Sound rules below (E [29]) |
| Weekly playtests with kids | Sago, Duolingo ABC, Khan Kids | Phase 4 testing plan (E [5][8][23]) |

**Public talks, case studies and design documents found:** Apple's "Behind the Design: Pok Pok Playroom" [29]; the
Cooney Center's Toca Boca podcast [1]; Sesame Workshop's tablet best practices [39]; the PBS KIDS style guide [14] and
PBS producer guidelines for children's content [80]; the BBC's CBeebies Playtime UX write-up [78]; LEGO's audio and
braille instructions story [19]; the GIANT Room's Duolingo ABC playtest report [23]. LEGO, Toca Boca and Sago Mini
publish no design system that we could find.

---

## 2. Navigation and wayfinding for pre-readers

### Evidence

**Icons by age**

- Preschoolers recognised most icons designed to be clearly visible and to look like the thing they stand for [32].
- An eye-tracking study with 50 preschoolers found icons that are close in meaning ("semantic distance") and single
  icons are easier. Distant metaphors and combined icons get easier with age [33].
- Children aged 4–8 understood a tested set of app-category icons [34]. A search summary adds that 5-year-olds matched
  icons to categories over 80% of the time and 6–8-year-olds over 90%. **Unconfirmed** which paper reports this.

**Informal symbols**

- Progress bars and cartoon-hand demonstrations were "entirely inaccessible" to children under 3. Children aged 3–5
  needed specific design choices to understand them. Decorating these symbols can also hurt understanding [35].

**Prompts**

- In a survey of apps, 50% used audio instructions, 41% made the item pulse or change, 19% used text and 14% used a
  cartoon hand [36].
- An adult showing the child worked best. Children 3 and older could also follow the in-app cues [36].
- In a study of 2–4-year-olds, most 2- and 3-year-olds could not follow any prompting technique, but 57% could tap an
  intended place [37] (search summary).
- Audio prompts work better with visual support, because children may not attend to audio alone [36][38] (search
  summary).

**Edges and accidental touches**

- Preschoolers rest their wrists along the bottom edge of a tablet. Hot spots along edges trigger by accident. Keep hot
  spots out of swipe areas [39].
- Give instructions up front. Use time-outs to hint at what to do next [39].

**Platform**

- Apple: for apps "intended for pre-literate children, consider using a voiceover prompt" to tell kids to fetch a
  parent [40].
- Apple Assistive Access guidance: break multistep workflows up so people "focus on a single interaction per screen"
  [41].
- Apple: offer a Back button even when a swipe also works. Avoid gestures that conflict with system gestures [42].
- A Home Screen web app in `standalone` mode has no browser URL bar or browser navigation [43]. So the app must draw its
  own Back and Home.
- iPadOS has Guided Access, which parents can use to restrict a device to one app [44] (Apple developer docs; whether it
  works with Home Screen web apps is **unconfirmed**).
- Apple: restore the previous state when an app restarts [45].
- Manipulative designs in preschool apps include "navigation constraints" (in 46% of apps) and "attractive lures"
  (45%) [46].

**Choices per screen.** We found no study that sets a number for this age group. See the judgement below.

### Recommendations

| Topic | Recommendation | Tag |
|---|---|---|
| Labels | Every kid control is a picture. Tapping it also speaks its name ("Library!"). Spoken help always comes with a visual cue | E [36][40] |
| Icons | Concrete objects close in meaning (a house for Home, a camera for "I built it!"). One idea per icon, no combined icons | E [32][33] |
| Choices | 3–5: at most 4–6 big choices on a screen. 6–10: a scrolling gallery with 6–12 cards in view | J |
| One thing per screen | Build mode shows one step at a time with one big Next | E [41] |
| Fixed places | Home top-left, Hear-again top-right, Next bottom-right but lifted off the edge. Same place on every screen | J; edge rule E [39] |
| Edges | No kid target within 32 px of the bottom edge or inside the iPad's safe-area insets | E [39]; value J |
| Leaving is harmless | Leaving Build mode saves the step. Coming back resumes. No "Are you sure?" dialogs for kids | E [45]; J |
| Progress | No progress bar for 3–5. Show the model growing, plus a row of step dots that fill | E [35]; J |
| Hints | After about 10 s with no tap, pulse Next once and repeat the step aloud once | E [39]; timing J |
| "Not yet" | Never a padlock. The card stays tappable and shows the model. The badge shows the missing tiles as pictures ("Need 2 more ▲"). The voice offers a swap or another project | E [46] (avoid lures and constraints); J |
| Parent door | A small grown-ups button. If a kid taps it, the voice says "This part is for grown-ups" | E [40] |

---

## 3. Typography for kids and early readers

### Evidence

**Letterforms**

- Walker and Reynolds listened to 24 six-year-olds read. Children read Century (serif) and Gill Sans (sans) equally
  well. Special "infant characters" (single-storey *a* and *g*) were "not always as legible as they are asserted to
  be" [47].
- So single-storey forms are a familiarity choice. They match the letters kids learn to write. They are not a proven
  legibility gain. **E** [47].

**Size**

- Hughes and Wilkins: children aged 5–7 read more slowly and made more errors as text got smaller. In reading schemes
  the x-height fell from about 4 mm (books for 5-year-olds) to about 2 mm (11-year-olds). Larger text and spacing would
  help some children and disadvantage none [48].
- A PLOS ONE study of 2nd and 5th graders is titled "Bigger is not always better" [49]. We could not read the details.
  Do not assume ever-larger text keeps helping older readers.
- Apple: iPadOS default text is 17 pt, minimum 11 pt. Thin weights need larger sizes. Let people enlarge text,
  ideally to 200% [41].

**"Dyslexia fonts"**

- The Dyslexie font did not help children with or without dyslexia [50].
- OpenDyslexic: a 2017 study (Wery and Diliberto) is often cited as finding no gain in reading rate or accuracy.
  **Unconfirmed** in this session.
- Lexend's creator says its spacing reduces visual stress and improves reading [51]. We found no independent study.
  **Unconfirmed.**

**Candidate fonts.** All are on Google Fonts. Licences are from `google/fonts` metadata [51]. The glyph columns are from
our own renders of the font files.

| Family | Made for | Default *a* / *g* | *I l 1* distinct? | Weights / axes | Licence |
|---|---|---|---|---|---|
| Andika | "Literacy use… the needs of beginning readers"; letters "not readily confused" (SIL) [51] | single / single | yes | Regular, Bold + italics (2022 update added weights; check @fontsource) | OFL |
| ABeeZee | "A children's learning font" [51] | single / single | yes (tailed *l*) | Regular + Italic only | OFL |
| Lexend | Reduce visual stress (creator's claim) [51] | single / single (ss01 gives two-storey *a*) | yes (serifed *I*) | wght 100–900 | OFL |
| Atkinson Hyperlegible Next | Low-vision legibility; unambiguous forms (Braille Institute) [51] | two-storey / single | yes; *q* has a tail | wght 200–800 | OFL |
| Playpen Sans | Handwriting-education research (TypeTogether); 7 shuffled alternates per letter; for children's books [51] | single (ss01 two-storey) / single | not checked | wght 100–800 | OFL |
| Edu SA Beginner | Sloped print taught in South Australian years 1–2 [51] | single / single | sloped | wght 400–700 | OFL |
| Ysabeau Infant | Infant variant of Ysabeau [51] | single / single | yes | wght; small x-height (0.42 em) | OFL |
| Fredoka | "Big, round, bold… for any headline" [51] | single / single | yes (tailed *l*) | wght 300–700, wdth 75–125 | OFL |
| Grandstander | Display face, 9 weights [51] | two-storey (ss01 single) / single | yes | wght 100–900 + italics | OFL |
| Baloo 2 | Display face [51] | two-storey / single | no (*I* = *l*) | wght 400–800 | OFL |
| Nunito | Rounded sans [51] | two-storey (ss01 single) / single | no (*I* = *l*) | wght 200–1000 | OFL |
| Quicksand | Rounded display sans [51] | single (ss01 two-storey) / single | no | wght 300–700 | OFL |
| Comic Neue | Comic Sans reworked [51] | single / single | not checked | 300, 400, 700 + italics | OFL |
| Sniglet, Mali, Sour Gummy | Rounded display / handwriting | single / single | not checked | various | OFL |
| DynaPuff, Varela Round | Rounded display | two-storey / single | not checked | various | OFL |

Measured x-height (fraction of font size): Andika 0.51, Lexend 0.53, Atkinson Next 0.50, ABeeZee 0.52, Fredoka 0.50,
Nunito 0.48, Baloo 2 0.46, Grandstander 0.53, Playpen Sans 0.54, Quicksand 0.50, Comic Neue 0.49, Ysabeau Infant 0.42.

**Local design database pairings [DB]:** Baloo 2 + Comic Neue ("Kids/Education"); Fredoka + Nunito ("Playful
Creative"); Varela Round + Nunito Sans ("Soft Rounded"); Nunito 800–900 + DM Sans ("Claymorphism Mobile");
Atkinson Hyperlegible alone ("Accessibility First"); Lexend + Source Sans 3. The database's `--design-system` run
picked Baloo 2 + Comic Neue. Our renders show Baloo 2 cannot tell *I* from *l*, so it suits headings only.

### From x-height to CSS pixels (estimate)

- Assume an 11-inch iPad at about 132 CSS px per inch (264 ppi at 2× scale). **Unconfirmed** device figure. That is
  about 5.2 CSS px per mm.
- 4 mm x-height ≈ 21 px. With a 0.5 em x-height that is a **~40 px** font size.
- 3 mm ≈ 16 px x-height → **~32 px**. 2 mm ≈ 10.5 px → **~21 px**.
- An iPad mini packs more pixels per inch, so the same CSS size is physically smaller. Check sizes on a mini.

### Recommendations

| Topic | Recommendation | Tag |
|---|---|---|
| Kid words | Test **Andika** first, against **ABeeZee** and **Lexend**. All have single-storey *a* and *g* and a distinct *I*/*l* | E [47][51] + our renders; choice J |
| Display | Test **Fredoka** first (single-storey *a*/*g*, width axis for squeezing titles), against **Grandstander ss01** and **Baloo 2** | E renders, [DB]; choice J |
| Parent side | Test **Atkinson Hyperlegible Next**: clear numerals for counts, eight weights | E [51]; choice J |
| Infant forms | Use single-storey *a*/*g* on the kid side because they match what kids write, not because they read faster | E [47]; J |
| Dyslexia fonts | Do not adopt OpenDyslexic or Dyslexie as a fix | E [50]; OpenDyslexic unconfirmed |
| Kid text size | 3–5: 40 px. 6–8: 32 px. 9–10: 26 px. Most kid words are also spoken | E [48] + estimate above |
| Parent text | Body 17 px, never below 13 px | E [41]; 13 px floor J |
| Weight | Kid text weight 500 or more. No thin weights | E [41] |
| Spacing | Line height 1.4 for kid text, 1.5 for parent text. Slightly open letter spacing (+0.01 em) for kid words | E [48] (spacing helps); values J |
| Scaling | Respect browser text zoom up to 200% on the parent side | E [41] |
| Offline size | Subset fonts to Latin through @fontsource. The full Andika TTF is about 670 KB | J; size measured |

---

## 4. Colour

### Evidence

**Palettes in good kids' apps**

- Pok Pok limited itself to red, yellow and blue [29]. Calm came from restraint, not from pastel or neon.
- The local database's "Kids Learning" palette is blue #2563EB, amber #F59E0B and pink #EC4899 on #EFF6FF. It lists
  "muted colours" and "low energy" as things to avoid [DB]. That conflicts with the calm approach in [29]. Treat it as
  one option, not a rule.

**Colour-vision deficiency**

- Commonly cited: about 1 in 12 boys (8%) and about 1 in 200 girls (0.5%) have a colour-vision deficiency.
  **Unconfirmed**: we could not open a primary source in this session. Confirm before quoting outside the team.
- Apple: people with colour blindness struggle with red–green and blue–orange pairs. Add shapes or icons as well as
  colour [41]. Do not rely on colour alone [52].
- WCAG 1.4.1: colour must not be the only way to convey information [53].
- MDN: pure red and green are risky. A reddish-orange and a bluish-green are easier to tell apart [56].

**Our simulation of the six tile colours** (full-severity CVD, Machado 2009 model via `colorspacious` [57]; distance is
CAM02-UCS ΔE, higher means easier to tell apart)

- Naive palette: red #E53935, orange #FB8C00, yellow #FDD835, green #43A047, blue #1E88E5, purple #8E24AA.
- Tuned palette (lightness spread out): red #D62839, orange #F28C28, yellow #FFD23F, green #2E9E5B, blue #2F6FDB,
  purple #6B3FA0.

| Vision | Closest pairs, naive | Closest pairs, tuned |
|---|---|---|
| Typical | orange–yellow 23, red–orange 27 | orange–yellow 22, blue–purple 24 |
| Deutan (red–green, most common) | **red–green 6**, blue–purple 15, orange–yellow 15 | **red–green 9**, blue–purple 11, orange–yellow 16 |
| Protan (red–green) | **orange–green 8**, red–green 20 | **orange–green 12**, blue–purple 16 |
| Tritan (blue–yellow, rare) | **green–blue 10**, red–orange 17 | **green–blue 12**, red–orange 20 |

What this shows:

- Tuning the hues helps a little. It does not fix red–green or blue–purple.
- The on-screen colours must match the plastic tiles in a child's hand, so we cannot move hues far anyway.
- So every tile colour needs a second cue. **E** (simulation, [41][53]).

**Contrast**

- WCAG: text needs 4.5:1, or 3:1 for large text [54]. Controls and meaningful graphics need 3:1 against neighbours [55].
- Apple uses the same AA values [41].
- Tuned tile colours against a warm off-white (#FBF8F3): red 4.7, orange 2.3, yellow 1.4, green 3.2, blue 4.5,
  purple 7.0. Against dark ink (#1F2430): yellow 10.8 but purple 2.1.
- No single background gives 3:1 for all six. A dark rim around every tile swatch fixes it: ink on off-white is 14.7:1.
  **E** (computed; [55]).

**Gender coding**

- Pok Pok represents many genders and family types [30]. PLAN.md already rules out "boys'" and "girls'" sections.
- A Crossplay article discusses Toca Boca and gender norms [58] (exists, not read).
- We found no study in this session on pink/blue coding for this age group. Avoiding it is **J**, in line with PLAN.md.

**Light and dark**

- Apple: supply light and dark variants and an increased-contrast option for every custom colour. Test in bright and
  dim light [52].

### Recommendations

| Topic | Recommendation | Tag |
|---|---|---|
| Tile colours | Six fixed tokens tuned for lightness spread. Each has a colour, a pattern and a spoken name | E simulation, [41][53]; values J |
| Second cue | Patterns in swatches and tile pictures: red dots, orange diagonal stripes, yellow plain, green waves, blue horizontal stripes, purple stars. Red/green and blue/purple get the most different patterns | E (need), J (which patterns); test with kids |
| Colour is a preference | Matching never fails on colour alone (already in PLAN.md). The voice says the colour name on tap | E [53]; J |
| Swatch rim | A 3 px ink rim on every tile swatch. It is also the tile's frame in our visual language | E computed, [55] |
| UI chrome | Neutral warm surfaces and ink. One accent chosen in the brand pass. Tile colours are kept for tile meaning | E [29] (restraint); J |
| Status | "You can build it" = a check-mark shape + voice. Never green alone. Avoid red/green as good/bad | E [41][56] |
| Contrast | Text ≥ 4.5:1 (kid words aim for 7:1). UI parts and meaningful graphics ≥ 3:1 | E [54][55]; 7:1 J |
| Gender | No pink-for-girls / blue-for-boys coding anywhere. Avatars, themes and stickers mixed for everyone | J; PLAN.md |
| Dark mode | Light by default. Follow the system dark setting. Supply dark and high-contrast variants of every token | E [52] |

---

## 5. Touch, motion and sound

### Evidence

**Target size**

- NN/g: about 2 × 2 cm for young children, against 1 × 1 cm for adults [59].
- Apple: iPadOS default control 44 × 44 pt, minimum 28 × 28 pt. About 12 pt of padding around controls with a visible
  shape, and about 24 pt around those without [41].
- WCAG 2.5.8 (AA) needs 24 × 24 CSS px [60]. WCAG 2.5.5 (AAA) needs 44 × 44 CSS px [61].
- The TIDRC framework (57 research-based recommendations for ages 2–11) says to make the active area bigger than the
  icon so slightly-off touches still count [38].
- At about 132 CSS px per inch (estimate above), 2 cm is about **104 CSS px**. kids-and-ipad.md set 80 px for 3–5,
  which is about 1.5 cm. See the token table.

**Gestures**

- Tap is the most intuitive gesture. Swiping works when the swipe direction is shown. Kids lift fingers while tracing,
  so allow partial completion. Pinching and flicking are hard [39].
- In a study of 2–4-year-olds, all 3-year-olds could tap, drag, slide and drag-and-drop. Many 2-year-olds struggled with
  free rotate, drag-and-drop, pinch and spread [37] (search summary).
- Another study advises avoiding flick, drag-and-drop, rotate, pinch and spread for children under 4 [62] (search
  summary).
- Apple: use the simplest gesture, avoid multi-finger gestures, and offer an on-screen button for anything a gesture
  does [41].

**Feedback**

- Sesame Workshop: feedback should be encouraging and build step by step. Pair sound effects with a visual payoff [39].
- Apple: give feedback in several ways (colour, text, sound) so it reaches people with sound off [63].

**Motion**

- Apple: motion should be purposeful, optional and brief. Avoid motion on frequent interactions. Let people cancel it
  [64].
- Apple, with Reduce Motion on: cut automatic and repeating animation, including zooming and scaling. Tighten springs.
  Replace sliding with fades [41].
- WCAG 2.3.3: motion triggered by interaction can cause dizziness and nausea, so let users turn it off [65]. WCAG
  2.3.1: avoid content that flashes more than three times a second [66].
- CSS `prefers-reduced-motion: reduce` reports the system setting [67].
- The local database advises animating 1–2 key elements per view at most [DB].

**Sound**

- Apple: in silent mode people expect only sound they start themselves (like media) to play. The system volume governs
  everything. Pick an audio category that fits: "ambient" respects the silent switch and mixes with other audio [68].
- Browsers generally block audio started by code before the user has interacted with the page [69].
- The Audio Session API lets a page choose "ambient" or "playback". An `AudioContext` defaults to "ambient", an
  `<audio>` element to "playback". Safari has supported it since 16.4 [70].
- Speech synthesis (`speechSynthesis.speak()`) has been in Safari since version 7 [71].
- Pok Pok: calm, real-object sounds that do not tire, no jingles, consistent sound-to-meaning mapping [29].
- PLAN.md Q3 already defaults sound effects to off.

### Recommendations

| Topic | Recommendation | Tag |
|---|---|---|
| Core input | Every kid action is a single tap. Drag-to-turn the 3D model is an extra for 6+ only. No pinch, flick, rotate or multi-finger anywhere a 3–5-year-old needs | E [37][39][41][62] |
| Hit area | Invisible hit area 12 px larger than the visible button on all sides | E [38]; value J |
| Tap feedback | Pressed state within one frame. A soft sound if effects are on. A spoken name for navigation | E [39][63]; J |
| Celebration | At the end of a build: under 1.5 s, one moving element, no flashing, tap to skip, then a calm "I built it!" button | E [64][66], [DB]; values J |
| Auto-turn | The model turns slowly (one turn in about 25 s). It stops when touched, when a step is spoken, and under Reduce Motion | E [41]; speed J |
| Reduced motion | Fades instead of slides. No auto-turn, no confetti. The celebration becomes a still sticker | E [41][65][67] |
| Voice | Read-aloud is content. It starts only from a tap (Next, Hear again). One voice, a calm rate, one step at a time | E [69][71]; rate J |
| Effects | Off by default. When on: play through Web Audio set to "ambient", so they respect silent mode and mix | E [68][70]; PLAN.md Q3 |
| Sound design | Short, soft, real-object sounds. No music loops. One sound per meaning. Each tile colour can have its own note | E [29] |
| Never sound-only | Every sound has a visual partner. The app works fully on mute | E [41][63] |
| Voice over effects | Effects pause while the voice speaks | J |

---

## 6. Parental gates and parent areas

### Evidence

- Apple defines parental gates as "adult-level tasks" that stop kids buying things or following links out without a
  parent knowing. For pre-literate children, "consider using a voiceover prompt" so kids know to fetch a parent [40].
- App Store guideline 1.3: Kids Category apps "must not include links out of the app, purchasing opportunities, or
  other distractions to kids unless reserved for a designated area behind a parental gate". No third-party analytics or
  advertising [72].
- Guideline 5.1.4: a parental gate is "not the same as securing parental consent" to collect data. Ask for birth dates
  only to comply with the law [72].
- Kids Category age bands are 5 and under, 6–8 and 9–11 [40]. Our 3–5, 6–8 and 9–10 bands line up.
- Gates seen in products: hold a button (Toca Boca [4]); "hold for 3 seconds" or a simple maths problem (Sago Mini
  [7]); type a birth year (Toca Boca [4]). All from review sites.
- **Gap:** we found no study of how well these gates work against older children.
- Parent areas seen: DUPLO World explains what each activity teaches and has a bedtime timer [16]. Sago Mini has
  language, a news toggle and camera permission [7]. Lingokids shows progress, profiles and weekly reports [21][22].
  Khan Kids lets parents switch skills on and off [10].

### Recommendations

| Topic | Recommendation | Tag |
|---|---|---|
| What the gate protects | Our parent side has no purchases or links. The gate stops accidental edits, not fraud. Keep it light | J; [40][72] |
| Gate pattern | Keep PLAN.md's "hold 3 s, then answer a sum", but write the sum in words with two-digit numbers ("forty-two plus seven"). A 7-year-old can do 4 + 3; reading number words is harder | J |
| No birth year | Do not use a birth-year gate. It asks for personal data | E [72] (5.1.4) |
| Voice prompt | When a kid taps the grown-ups door, the voice says it is for grown-ups | E [40] |
| Parent home | Shows: inventory summary and "projects you can build now"; kid profiles; voice and sound switches; storage status (`persist()` result); last backup date with a Save button; a tip on Guided Access | J; storage from kids-and-ipad.md |
| Explain, don't score | Show which projects each kid built (their photos), never time played, streaks or grades | E [46][74]; J |
| Optional stop time | Consider a DUPLO-style "time for bed" setting that ends play gently with a goodbye screen | E [16] (pattern); J |

---

## 7. Rewards: stickers and albums without dark patterns

### Evidence

- Manipulative design appeared in 80% of 133 apps used by 3–5-year-olds. Types: parasocial pressure (a character
  urges the child, about 19–25% of apps with characters), time pressure (11–17%), navigation constraints (37–46%) and
  attractive lures (45%) [46].
- An earlier study found advertising in 100% of free and 88% of paid young children's apps, and frequent, irrelevant
  rewards [73].
- The UK Children's Code (standard 13) names nudges to avoid: in-game currency that hides cost, time-limited rewards,
  and loss aversion. It encourages nudges towards wellbeing, such as break reminders [74].
- Preschoolers who expected a reward for drawing later drew less in free play. Children given no reward or an
  unexpected reward did not show this drop [75].
- Endless Alphabet and Pok Pok have no scores, failures or levels [26][30].

### Recommendations

| Topic | Recommendation | Tag |
|---|---|---|
| What a sticker is | A keepsake of a real build, added to the kid's photo. It is not a currency and is never spent, lost or traded | E [74]; J |
| Surprise, not payment | Don't promise stickers before a build ("build this to get a sticker!"). Reveal the sticker after "I built it!" | E [75] |
| Album | The album is the kid's own photos with their stickers. No empty "collect them all" slots, no totals, no rarity | E [46] (lures); J |
| No pressure | No streaks, timers, daily goals, notifications or characters who are sad when you leave | E [46][74]; PLAN.md |
| Celebrate the child | The voice praises effort and the thing built ("You built a tall tower!"), not points | J |
| Siblings | No comparison between profiles | J |

---

## 8. Illustration and 3D style

### Evidence

- The local database recommends claymorphism for kids' learning apps: soft 3D, radii 16–24 px, 3–4 px borders, double
  shadows, a soft 200 ms press [DB].
- Pok Pok chose hand-drawn, slightly imperfect art with a small palette [29].
- Decorating symbols can make them harder for preschoolers to understand [35].
- LEGO Builder shows the real bricks in 3D, so the screen matches the box [17].
- three.js `MeshPhysicalMaterial` has physically based transmission "for thin, transparent surfaces like glass", plus
  iridescence. It costs more per pixel than other materials and works best with an environment map [76].
- Apple's current design language lets glass take on colour "like colored or stained glass" [52].

### Options

| Style | Good for us | Risk | Tag |
|---|---|---|---|
| Flat | Fast. Clear icons. Easy to theme | Can feel generic. Does not show what tiles are like | J |
| Claymorphic UI | Friendly and tactile. The database's default for kids' apps | Soft shadows lower contrast. Fights with glass-like tiles | [DB]; J |
| Toy-like 3D | Matches the real toy, like LEGO Builder | Costs GPU time on older iPads | E [17][76]; J |

### Recommendations: make "light through coloured glass" our signature

| Topic | Recommendation | Tag |
|---|---|---|
| The tiles | Translucent coloured panes with a bright rim (the tile frame) and coloured light where they overlap or cast shadows on a pale "table" | J |
| Thumbnails | Render card pictures at build time with full physical transmission and an environment map. PLAN.md already pre-renders thumbnails | E [76] (quality vs cost); J |
| Live 3D | Use a cheaper material on the iPad (opacity plus a rim highlight). Offer the full glass material only if the frame rate holds | E [76]; J |
| UI shapes | Cards and buttons look like tiles: squares and triangles with a 3 px ink rim. The rim also fixes contrast | E [55] computed; J |
| Restraint | Glass belongs to the tiles. The UI chrome stays mostly flat and opaque, with no blur behind text | E [55]; J |
| Icons and art | Simple, concrete, lightly decorated drawings. No busy texture inside icons | E [35] |
| Mascot | Not needed. If one is added, it never pleads or guilt-trips | E [46] |

---

## 9. Design systems for children's products

| Source | What exists | What to borrow | Tag |
|---|---|---|---|
| PBS KIDS | Brand style guide v1.4 [14]; producer guidelines for children's content [80]; accessibility and UDL requirements [11][12][13] | Accessibility as a sign-off gate. WCAG AA colour. Screen-reader labels and text-to-speech. Little or no formal instruction | E (requirements), PDFs not read |
| BBC GEL / CBeebies | GEL is the BBC's shared design framework [77]. The CBeebies Playtime app was held to five principles: immersive, playful, personal, tactile, safe [78]. BBC research with children on touch devices [79] | Use the five principles as review questions for every kid screen | E [78]; slides not read |
| LEGO | No public kids' design guidelines found. LEGO Builder [17] and Audio & Braille instructions [19] are public | Step-by-step 3D. Spoken steps generated from model data | E |
| Apple | Kids Category rules [40][72]; HIG accessibility, motion, audio [41][64][68] | Gate rules. 44 pt minimum. Reduce Motion behaviour. Audio categories | E |
| Sesame Workshop | Best practices for preschool tablet design, based on 50+ studies [39] | Gestures, edges, prompts, encouraging feedback | E |
| TIDRC | 57 research-based touch recommendations for ages 2–11, grouped by developmental stage [38] | Use as a test checklist, split by our age bands | E |
| UK Children's Code | 15 standards, including nudge techniques [74] | Treat as our "no dark patterns" checklist | E |

**Gap:** we found no public token-level design system (colour, type and spacing values) from any children's brand.
The PBS KIDS style guide is the most likely, and it should be read when a network allows.

---

## Recommendations for our design system

### Tokens

**Type families to test**

| Role | First choice | Test against | Tag |
|---|---|---|---|
| Display (titles, big numbers) | Fredoka | Grandstander (ss01), Baloo 2 | E renders, [DB]; J |
| Kid words (labels, steps) | Andika | ABeeZee, Lexend | E [47][51], renders; J |
| Parent UI | Atkinson Hyperlegible Next | Lexend | E [51]; J |

**Type scale** (CSS px; kid sizes by age band 3–5 / 6–8 / 9–10)

| Token | Size | Line height | Weight | Tag |
|---|---|---|---|---|
| `kid-display` | 56 / 48 / 40 | 1.1 | 600 | J |
| `kid-label` | 40 / 32 / 26 | 1.25 | 500–600 | E [48] + estimate |
| `kid-count` (×4 on tile chips) | 40 / 36 / 32 | 1 | 700 | J |
| `parent-title` | 28 | 1.25 | 700 | J |
| `parent-heading` | 22 | 1.3 | 600 | J |
| `parent-body` | 17 | 1.5 | 400 | E [41] |
| `parent-small` | 13 (floor) | 1.4 | 500 | J |

**Touch targets and spacing**

| Token | Value | Tag |
|---|---|---|
| `target-kid-primary` (Next, I built it!) | 104 px (≈ 2 cm on an 11-inch iPad) | E [59] + estimate |
| `target-kid` 3–5 / 6–8 / 9–10 | 88 / 80 / 64 px | J (raises kids-and-ipad.md's 80 px for 3–5) |
| `target-parent` | 44 px minimum | E [41][61] |
| `hit-slop-kid` | 12 px beyond the visible edge | E [38]; value J |
| `gap-kid` | 24 px minimum between kid targets | E [41] (~24 pt for unbordered elements) |
| `gap-parent` | 12 px | E [41] |
| `edge-safe-kid` | 32 px plus the safe-area inset | E [39]; value J |
| Spacing scale | 4, 8, 12, 16, 24, 32, 48, 64, 96 | J; [DB] "spacious" density |

**Shape**

| Token | Value | Tag |
|---|---|---|
| `radius-tile` | 6 px (close to a real tile corner) | J |
| `radius-sm` / `md` / `lg` / `full` | 12 / 20 / 32 px / 9999 | [DB] 16–24 px; J |
| `rim` | 3 px ink | E [55] computed; [DB] 3–4 px |
| Elevation | 3 levels, soft two-layer shadows; never the only edge of a control | E [55]; J |

**Colour**

| Token group | Content | Tag |
|---|---|---|
| `surface-*` | Warm off-white "table" (#FBF8F3 to start) and 2 tints | J |
| `ink-*` | #1F2430 to start (14.7:1 on the surface) | E computed |
| `tile-{red,orange,yellow,green,blue,purple}` | Tuned hues from section 4, each with `-pattern` and a spoken `-name` | E simulation; J |
| `accent` | One colour chosen in the brand pass; 3:1 to the surface, 4.5:1 to its label | E [54][55] |
| `status-*` | Always paired with an icon shape; never red/green alone | E [41][56] |
| Modes | Light, dark and increased-contrast values for every token | E [52] |

**Motion**

| Token | Value | Tag |
|---|---|---|
| `dur-press` | 80–120 ms | J |
| `dur-ui` | 200–300 ms | J; [DB] soft press 200 ms |
| `dur-celebrate` | ≤ 1500 ms, skippable | E [64]; value J |
| `spring-gentle` | Low bounce; becomes no bounce under Reduce Motion | E [41] |
| `turn-speed` | One full turn in about 25 s; off under Reduce Motion | E [41]; value J |
| `max-moving` | 1–2 animated elements per view | [DB]; E [64] |

### Components

**Kid side**

- `ProfilePicker`: big avatar cards for "Who's playing".
- `KidButton`: big, picture-first, speaks its name on tap. Primary and secondary sizes.
- `NavBar` (kid): Home, Hear again, and the grown-ups door. Fixed places.
- `SpeakButton`: speaker icon that repeats the current words.
- `ThemeShelf` and `ProjectCard`: picture, 1–3 stars, badge.
- `BuildBadge`: "You can build it" (check shape) or "Need N more" (pictures of the missing tiles).
- `PictureFilter`: picture chips for themes and age bands.
- `StepPanel`: tiles for this step as `TileChip`s, the step text (read aloud), Next.
- `TileChip`: tile shape, colour, pattern, rim and count.
- `StepDots`: countable step dots instead of a progress bar.
- `TurnControls`: ◀ ▶ buttons for the 3D model.
- `SwapCard`: "Use short triangles instead", with pictures.
- `Celebration`: short, skippable, reduced-motion aware.
- `CameraCapture` and `PhotoGrid` (My Builds).
- `Sticker` and `StickerReveal`.
- `EmptyState`: picture plus spoken line.
- `GrownUpsDoor`: small button with a voice prompt.

**Parent side**

- `GateDialog`: hold, then the number-words sum.
- `Stepper`: − and + with a count.
- `InventoryGrid`, `SetPresetPicker`.
- `ProfileEditor`: name, avatar picker, age band.
- `SettingsList` with `Switch` (voice, sound effects, brand and tall-triangle size).
- `BackupCard`: save, load, last backup date.
- `StorageStatus`: the `persist()` result in plain words.
- `ConfirmDialog` and `Toast` (Radix).
- `TallTriangleMatcher`: "lay it next to two squares" picture choice (from tiles.md).

### Iconography

- Phosphor, which has six weights: thin, light, regular, bold, fill and duotone [81]. **E**
- Kid side: fill or bold weight, drawn 48–64 px inside large targets. **J**
- Parent side: regular weight at 24 px, always with a visible text label. **E** [41]; size **J**
- Kid icons are concrete objects with close meanings, one idea each. **E** [32][33]
- Every kid icon speaks its name on tap. **E** [36][40]
- Draw our own icons for tile shapes, swaps and "need more", in Phosphor's stroke style. **J**
- No hamburger, "more" dots or gear icons on the kid side. **J**, supported by [35]
- No emoji as icons. **[DB]**

### Motion and sound rules

1. Motion explains something (a tile snapping on, the model growing). Nothing moves just to decorate. **E** [64]
2. Every animation can be interrupted by a tap. **E** [64]
3. Under Reduce Motion: fades only, no auto-turn, no confetti, springs without bounce. **E** [41][67]
4. Nothing flashes. **E** [66]
5. The voice starts only from a tap and reads one step at a time. **E** [69]
6. Sound effects are off by default. When on, they are soft, short and "ambient", and they respect silent mode. **E**
   [29][68][70]
7. Every sound has a visual partner. The app works fully on mute. **E** [41][63]
8. One sound per meaning, never changed. **E** [29]

### Five things to avoid

1. **Streaks, timers, scores, "come back" nudges and characters who plead.** **E** [46][74]
2. **Colour as the only signal**, for tile colours or for the "can build" badge. **E** [41][53], our simulation
3. **Gestures beyond tap on any path a 3–5-year-old needs** (pinch, flick, rotate, drag-and-drop), and targets along the
   bottom edge. **E** [37][39][62]
4. **Abstract symbols with no voice**: progress bars, cartoon-hand tutorials, hamburger menus. **E** [35][36]
5. **Overstimulating celebrations**: loud jingles, flashing, confetti storms, long unskippable animations. **E** [29][64][66]

### Tests to run before locking tokens

- Read-aloud and word tests with 5–7-year-olds: Andika against ABeeZee and Lexend at `kid-label` sizes. **J**
- Target-size taps with a 3- or 4-year-old at 80, 88 and 104 px, on an 11-inch iPad and an iPad mini. **J**
- Can kids name the six tile colours on screen with and without patterns? Include at least one colour-blind child or
  a CVD simulation check in CI. **J**
- The gate: can a 9- or 10-year-old open it? **J**
- Frame rate of the live 3D material on the oldest supported iPad. **E** [76]; **J**

---

## Sources

Status: *read* = opened and read in this session. *Search summary* = known only from the search engine's summary.
*Exists, not read* = the page exists but this environment could not open it.

1. [Podcast transcript: The App Fairy talks to Toca Boca (Joan Ganz Cooney Center)](https://joanganzcooneycenter.org/2018/09/14/podcast-transcript-the-app-fairy-talks-to-toca-boca/) (search summary)
2. [Free play and creativity with the apps from Toca Boca (Elternguide.online)](https://www.elternguide.online/en/free-play-and-creativity-with-the-apps-from-toca-boca/) (search summary)
3. [The definitive guide to building apps for children (Viblo)](https://viblo.asia/p/the-definitive-guide-to-building-apps-for-children-WEMkBVWnkQK) (search summary)
4. [Toca Boca Jr guide (Screenwise)](https://screenwiseapp.com/guides/toca-boca-jr-app) (search summary; secondary)
5. [Sago Mini letter to parents](https://sagomini.com/article/sago-mini-letter-to-parents/) (search summary)
6. [Making games for young children is a challenge all its own (Crossplay)](https://www.crossplay.news/p/making-games-for-young-children-is) (search summary)
7. [Sago Mini and the Piknik bundle: a parent's guide (Screenwise)](https://screenwiseapp.com/guides/sago-mini-apps-for-toddlers) (search summary; secondary)
8. [Khan Academy adds apps for young children (Khan Academy blog)](https://blog.khanacademy.org/khan-academy-adds-apps-for-young-children/) (search summary)
9. [Khan gets into kids (Kidscreen)](https://kidscreen.com/2018/11/08/khan-gets-into-kids/) (search summary)
10. [Khan Academy Kids review (Modulo)](https://joinmodulo.com/products/khan-academy-kids) (search summary; secondary)
11. [Accessibility and inclusion: PBS KIDS, a model for all media (Ability Magazine)](https://abilitymagazine.com/accessibility-and-inclusion-pbs-kids-a-role-model-for-all-media/) (search summary)
12. [PBS Kids focus is on content accessibility for all (Parenting Special Needs)](https://www.parentingspecialneeds.org/article/pbs-kids-focus-is-on-content-accessibility-for-all/) (search summary)
13. [For PBS Kids, accessibility and representation are top of mind (Forbes)](https://www.forbes.com/sites/stevenaquino/2020/05/20/for-pbs-kids-accessibility-and-representation-are-top-of-mind/) (search summary)
14. [PBS KIDS Style Guide v1.4 (PDF)](https://pbs-kids-brand.pbskids.org/downloads/pbs-kids-style-guide.pdf) (exists, not read)
15. [LEGO DUPLO World (StoryToys)](https://storytoys.com/apps/lego-duplo-world/) (search summary)
16. [LEGO DUPLO World review (Common Sense Media)](https://www.commonsensemedia.org/app-reviews/lego-duplo-world) (search summary)
17. [LEGO Builder app help (LEGO)](https://www.lego.com/en-us/service/help-topics/article/lego-builder-app-3d-building-instructions) (search summary)
18. [LEGO Builder: 3D Instructions (App Store)](https://apps.apple.com/us/app/lego-builder-3d-instructions/id1486159728) (search summary)
19. [Audio & Braille Instructions (LEGO)](https://www.lego.com/en-us/aboutus/discover/stories/audio-braille-instructions) (search summary)
20. [LEGO is piloting audio and braille building instructions (TechCrunch)](https://techcrunch.com/2019/08/28/lego-is-piloting-audio-and-braille-building-instructions/) (search summary)
21. [6 reasons the Lingokids app is a parent's dream (Tinybeans)](https://tinybeans.com/lingokids-app-best-features/) (search summary; secondary)
22. [Lingokids review (ling-app.com)](https://ling-app.com/blog/lingokids-review/) (search summary; secondary)
23. [Duolingo ABC playtesting and prototyping series (The GIANT Room)](https://www.thegiantroom.com/blog/05/31/2023/report-duolingoabc-playtesting-session) (search summary)
24. [Strengthen early literacy skills with Duolingo ABC (SmartBrief)](https://www.smartbrief.com/original/strengthen-early-literacy-skills-with-duolingo-abc) (search summary)
25. [A good read: building Duolingo ABC for Android (Duolingo blog)](https://blog.duolingo.com/a-good-read-building-duolingo-abc-for-android/) (exists, not read)
26. [Endless Alphabet (Originator)](https://www.originatorkids.com/endless-alphabet/) (search summary)
27. [Apple announces winners of the 2021 Apple Design Awards (Apple Newsroom)](https://www.apple.com/newsroom/2021/06/apple-announces-winners-of-the-2021-apple-design-awards/) (search summary)
28. [Pok Pok Playroom is a 2021 Apple Design Award winner (Pok Pok blog)](https://blog.playpokpok.com/pok-pok-playroom-is-a-202-1-apple-design-award-winner-cf07e4b1f450) (search summary)
29. [Behind the Design: Pok Pok Playroom (Apple Developer)](https://developer.apple.com/news/?id=5bcex7xf) (read)
30. [Pok Pok Playroom app review (Cubby)](https://www.cubbyathome.com/pok-pok-playroom-kids-app-review-80027995) (search summary)
31. [Reimagining digital play: Pok Pok (Sketch blog)](https://www.sketch.com/blog/pok-pok/) (exists, not read)
32. [Icon design principles for preschoolers (Procedia, ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S1877042812050045) (search summary)
33. [The effect of icon semantic distance on preschool children's information search: an eye-tracking study (ACM)](https://dl.acm.org/doi/10.1145/3627673.3680001) (search summary)
34. [Icons for kids: can young children understand graphical representations of app store categories? (Graphics Interface 2016)](http://graphicsinterface.org/proceedings/gi2016/gi2016-20/) (search summary)
35. [Hidden symbols: how informal symbolism in digital interfaces disrupts usability for preschoolers (Hiniker et al., IJHCS 2016)](https://www.sciencedirect.com/science/article/abs/pii/S1071581916000380) and [project page (UW CHILL lab)](https://depts.washington.edu/chilllab/research/childrens-understanding-of-symbolism-in-user-interfaces/) (search summary)
36. [Touchscreen prompts for preschoolers (Hiniker et al.)](http://faculty.washington.edu/alexisr/TouchscreenPrompts.pdf) (search summary)
37. [Ability of children to perform touchscreen gestures and follow prompting techniques when using mobile apps (Clinical and Experimental Pediatrics, 2020)](https://www.e-cep.org/journal/view.php?number=20125553621) (search summary)
38. [A framework of touchscreen interaction design recommendations for children (TIDRC), IDC 2019](https://dl.acm.org/doi/10.1145/3311927.3323149) and [project page](https://init.cise.ufl.edu/projects-gallery/tidrc/) (search summary)
39. [Best practices: designing touch tablet experiences for preschoolers (Sesame Workshop, 2012)](https://joanganzcooneycenter.org/wp-content/uploads/2020/02/SesameWorkshop-2012.pdf) (search summary)
40. [Kids apps on the App Store (Apple Developer)](https://developer.apple.com/app-store/kids-apps/) (read)
41. [Human Interface Guidelines: Accessibility (Apple)](https://developer.apple.com/design/human-interface-guidelines/accessibility) (read)
42. [Human Interface Guidelines: Gestures (Apple)](https://developer.apple.com/design/human-interface-guidelines/gestures) (read)
43. [Web app manifest: display (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display) (read, via mdn/content on GitHub)
44. [UIGuidedAccessRestrictionDelegate (Apple Developer)](https://developer.apple.com/documentation/uikit/uiguidedaccessrestrictiondelegate) (read)
45. [Human Interface Guidelines: Launching (Apple)](https://developer.apple.com/design/human-interface-guidelines/launching) (read)
46. [Prevalence and characteristics of manipulative design in mobile applications used by children (Radesky et al., JAMA Network Open, 2022)](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2793493) (search summary)
47. [Serifs, sans serifs and infant characters in children's reading books (Walker and Reynolds, Information Design Journal)](https://benjamins.com/catalog/idj.11.2.04wal) (search summary)
48. [Typography in children's reading schemes may be suboptimal: evidence from measures of reading rate (Hughes and Wilkins, 2000)](https://eric.ed.gov/?id=EJ624606) (search summary)
49. [The effect of font size on reading comprehension on second and fifth grade children: bigger is not always better (PLOS ONE)](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0074061) (exists, not read)
50. [Dyslexie font does not benefit reading in children with or without dyslexia (Kuster et al., Annals of Dyslexia, 2018)](https://link.springer.com/article/10.1007/s11881-017-0154-6) (search summary)
51. [google/fonts repository, `ofl/<family>` folders: METADATA.pb, DESCRIPTION and ARTICLE files, and the font files we rendered](https://github.com/google/fonts/tree/main/ofl) (read; renders are ours)
52. [Human Interface Guidelines: Color (Apple)](https://developer.apple.com/design/human-interface-guidelines/color) (read)
53. [Understanding SC 1.4.1 Use of Color (W3C)](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) (read, via w3c/wcag on GitHub)
54. [Understanding SC 1.4.3 Contrast (Minimum) (W3C)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) (read, via w3c/wcag on GitHub)
55. [Understanding SC 1.4.11 Non-text Contrast (W3C)](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) (read, via w3c/wcag on GitHub)
56. [Use of color (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Use_of_color) (read, via mdn/content on GitHub)
57. [colorspacious: CVD simulation with the Machado et al. 2009 model](https://github.com/njsmith/colorspacious) (tool used for our simulation)
58. [Toca Boca, gender norms, and the rise of the digital dollhouse (Crossplay)](https://www.crossplay.news/p/toca-boca-gender-norms-and-the-rise) (exists, not read)
59. [Design for kids based on their stage of physical development (NN/g)](https://www.nngroup.com/articles/children-ux-physical-development/) (search summary)
60. [Understanding SC 2.5.8 Target Size (Minimum) (W3C)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (read, via w3c/wcag on GitHub)
61. [Understanding SC 2.5.5 Target Size (Enhanced) (W3C)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) (read, via w3c/wcag on GitHub)
62. [Selection of touch gestures for children's applications: repeated experiment to increase reliability (Aziz et al., IJACSA)](https://thesai.org/Publications/ViewPaper?Volume=5&Issue=4&Code=IJACSA&SerialNo=15) (search summary)
63. [Human Interface Guidelines: Feedback (Apple)](https://developer.apple.com/design/human-interface-guidelines/feedback) (read)
64. [Human Interface Guidelines: Motion (Apple)](https://developer.apple.com/design/human-interface-guidelines/motion) (read)
65. [Understanding SC 2.3.3 Animation from Interactions (W3C)](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (read, via w3c/wcag on GitHub)
66. [Understanding SC 2.3.1 Three Flashes or Below Threshold (W3C)](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) (read, via w3c/wcag on GitHub)
67. [prefers-reduced-motion (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) (read, via mdn/content on GitHub)
68. [Human Interface Guidelines: Playing audio (Apple)](https://developer.apple.com/design/human-interface-guidelines/playing-audio) (read)
69. [Autoplay guide for media and Web Audio APIs (MDN)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) (read, via mdn/content on GitHub)
70. [Audio Session API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Audio_Session_API) and [browser-compat data: Safari 16.4](https://github.com/mdn/browser-compat-data/blob/main/api/AudioSession.json) (read)
71. [SpeechSynthesis (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) and [browser-compat data: Safari 7](https://github.com/mdn/browser-compat-data/blob/main/api/SpeechSynthesis.json) (read)
72. [App Store Review Guidelines 1.3 and 5.1.4 (Apple)](https://developer.apple.com/app-store/review/guidelines/) (read)
73. [Advertising in young children's apps: a content analysis (Meyer et al., 2019)](https://www.semanticscholar.org/paper/Advertising-in-Young-Children's-Apps:-A-Content-Meyer-Adkins/df95a376effc65cdc579a0c93d48465bd20855cf) (search summary)
74. [Children's code standard 13: nudge techniques (UK ICO)](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/13-nudge-techniques/) (search summary)
75. [Undermining children's intrinsic interest with extrinsic reward (Lepper, Greene and Nisbett, 1973)](https://www.semanticscholar.org/paper/Undermining-children's-intrinsic-interest-with-A-of-Lepper-Greene/abbcacaa273b8fea38d142e795e968051fa368ea) (search summary)
76. [three.js MeshPhysicalMaterial source and docs](https://github.com/mrdoob/three.js/blob/dev/src/materials/MeshPhysicalMaterial.js) (read)
77. [BBC GEL design system (designsystems.surf)](https://designsystems.surf/design-systems/bbc) (search summary)
78. [User experience and design in the CBeebies Playtime app (BBC blog, mirrored on Goodreads)](https://www.goodreads.com/author_blog_posts/4841664-user-experience-and-design-in-the-cbeebies-playtime-app) (search summary)
79. [Research with children: case study and design recommendations (BBC, slides)](https://www.slideshare.net/slideshow/research-with-childrencasestudy/10183336) (exists, not read)
80. [PBS producer guidelines for children's content, 2007 (PDF)](https://www.wjct.org/wp-content/uploads/2014/01/pbs_producer_guidelines_children.pdf) (exists, not read)
81. [@phosphor-icons/react README](https://github.com/phosphor-icons/react) (read)

[DB] = local design database `ui-ux-pro-max` at `/home/user/web-agent/.claude/skills/ui-ux-pro-max` (queried with
`--domain typography`, `color`, `style`, `ux`, `product`, and `--design-system`).
