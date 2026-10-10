# The one look: rules from the boards (5.4.0c)

The boards in `boards/` were made with mflux (Z-Image Turbo, on this Mac) from one style prompt: *every button and panel
made of soft satin vinyl toy plastic and translucent glowing magnet-tile glass, a real out-of-focus playroom with a
wooden table behind, warm soft studio light*. They are art direction, never shipped. Their garbled words are the
model's, not ours. These rules are what they agree on. Every screen and part follows them (5.4.2), and the 3D set
(`../convert.py`, the mock stage) is the same room.

| Board | What it settles |
|---|---|
| `library.webp`, `library2.webp` | Shelves of light maple; cards are cream trays standing on them; the room behind, blurred |
| `card.webp` | A card is a thick cream vinyl tray with a raised lip; the picture sits in it; stars and badges are small glossy shapes |
| `buttons.webp`, `ages.webp` | Things to press are chunky, glossy, saturated domes and pills, with one big soft highlight |
| `tray.webp`, `dots.webp` | The build tray is frosted cream with a thick soft lip; keys are squircle keycaps; dots glow from inside |
| `chips.webp` | Tiles on screen are jewel glass in a darker rim of the same colour, glowing a little |
| `settings.webp` | The grown-ups' screens are the same cream vinyl, quieter: small gem dots, pale pills |
| `done.webp` | The finish is a party in tile colours on cream |

## The rules
1. **Two materials only.**
   - **Cream satin vinyl:** everything that *holds* (screens' trays, cards, panels, bars).
   - **Coloured glossy vinyl or tile glass:** everything that is *pressed*, or *is a tile*.

   Nothing flat, no hairline borders.
2. **Holders are trays.**
   - Radius 28–40 px.
   - A raised lip: a light top inner edge, and a soft inner shadow at the bottom of the lip.
   - A warm soft drop shadow, with no hard step.
3. **Things to press are keycaps.**
   - Shapes: squircles, domes, pills.
   - Volume: a highlight ellipse in the top third, a soft core shade along the bottom, a warm ambient shadow under.
   - Pressed: a squash of about 4% that sinks into a tighter shadow, on the press spring, with a soft click.
4. **Tile glass only where tiles are:** chips, step dots, the tile pictures. It is saturated, with a rim of the same
   hue darker, an inner glow, and the tile colours as they are (`--tile-*`).
5. **Colour.**
   - Neutrals: cream (`#fbf3e6` light, evening `#3a2f2c`) and maple.
   - The six tile colours are accents.
   - One action colour, orange (Next, Make your own, the picked thing).
   - No grey, no white panels, no blue-purple gradients.
6. **Light comes from the top left**, warm (the 3D key light's side): highlights at the top left, shadows warm brown
   down and to the right, `rgba(120, 70, 20, …)`.
7. **The room is always there:** the screens sit on the room plate (a warm wall and the maple table's edge), never on a
   flat colour; the evening plate in dark.
8. **Type:**
   - Fredoka (bundled), heavy, for kid words, in warm ink `#2b2016` (evening `#fbf1e4`);
   - no outlines and no glow;
   - one size bigger than feels safe.
9. **Motion:** press squash, a settle on release, cards lift a little on hover and press in on tap; reduced motion has
   none.
10. **Contrast stays:** text is 4.5:1 on its surface (3:1 from 24 px), checked on the plate's lightest and darkest
    parts (5.4.2b).
