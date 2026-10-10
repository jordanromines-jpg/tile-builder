# The set: one look's room, table and tiles (5.4)

Plan: `plans/2026-10-10-pip-redesign.md` (addendum, PRs 5.4.0–5.4.3). This folder holds what makes the set's assets
and how the look was found. The app's code for it lands in 5.4.1 and 5.4.2.

## Assets (`convert.py`, 5.4.0a–b)
- **Sources**, all CC0 from Poly Haven:
  - rooms: `empty_play_room`, `lebombo`, `photo_studio_loft_hall` (1K `.hdr`, downloaded with Jordan's yes, G-S0) and
    `brown_photostudio_02` (2K, already here);
  - wood: `wood_table_001` (2K colour, normal, roughness).
- **Out**, per room: `<room>_1k.hdr` (high tier) and `<room>_512.hdr` (mid).
- **Wood:** `wood_diff.ktx2` (walnut, as Poly Haven made it) and `wood_diff_light.ktx2` (a pale honey maple, its
  lightness kept under one warm tint), plus `wood_nor_gl.ktx2` and `wood_rough.ktx2` (512).
- **Formats:** KTX2 by `basisu` 2.50 (Homebrew `basis_universal`, Apache-2.0): colour ETC1S; normal UASTC; roughness
  linear ETC1S; the last two with RDO at quality 60. All have mipmaps.
- **Budget:** each room is 2.5–2.7 MB with the wood, within 3 MB.
- Two traps, fixed in the script:
  - setting an image's colour space in Blender reloads it, which undoes a scale;
  - `save_render` puts pixels through the view transform, so `image.save` is used instead.

```
blender -b -P convert.py -- <out_dir> <wood_dir> <room.hdr> [...]
```

## How the look was found (5.4.0c–g)
- **The 2D direction:** mflux boards, distilled into rules in `boards.md` (the boards are in `boards/`).
- **The 3D set:** a mock page, drawn by the app's own tile code (`web/mock-set.html`, untracked).
  - It has today's Toy studio stage and the new one: the room as light and reflections (PMREM) and as a blurred
    backdrop (`backgroundBlurriness` 0.5), a finite maple table, a warm key from the side with a soft shadow (high tier
    only), and two coloured rims.
  - **The tile finish by tier:**
    - high: satin frame (roughness 0.42, clearcoat 0.4), and glass that light comes through (transmission,
      attenuation in the tile's colour, a little glow);
    - mid: tinted glass with a little emissive and sheen, no shadows;
    - low: as today.
- **Picked:** `empty_play_room`, turned 90°, with the maple table. Calm and warm behind a child's build, and the tiles
  stand out on it. Walnut was richer but darker than the boards' playroom. The evening version is the same room dimmed
  under a warm lamp.
- **Frame cost** on this Mac (M3 Ultra, 1280×800, mean of 10 frames per shot): today 0.43 ms; new high 1.62 ms mean
  (2.47 ms worst, the transmission pass); mid 0.37 ms; low 0.35 ms. An iPad is several times slower. High stays for
  iPads that start high, and `FrameWatch` steps down when frames drop.
- **The G-S1 sheets:** sent to Jordan on 10 Oct.
  - (a) three builds: today, walnut, maple, evening;
  - (b) the four rooms, the three tiers, and the Blender hero render as the bar;
  - (c) the 2D mock (the draft stylesheet injected over the app): today against new, Library and Build, light and dark.
- **Still weak:**
  - the evening maple is too orange (calmed in 5.4.1d);
  - the 2D mock is close to Toy studio, and its real step comes in 5.4.2 (glass chips, the keycap tray, the plate from
    Blender);
  - the shelf brackets still come from Toy studio's decor (they go in 5.4.3).
