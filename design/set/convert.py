"""The set's assets for the app (5.4.0b): each room HDRI at 1K (high tier) and 512 (mid tier), and Poly Haven's
wood_table_001 maps at 1K as KTX2 with mipmaps (basisu: colour
ETC1S; normal UASTC and roughness linear ETC1S, both with RDO at quality 60). Each room is printed against the 3 MB budget.
blender -b -P convert.py -- <out_dir> <wood_dir> <hdri.hdr> [<hdri.hdr> ...]
(the wood dir holds wood_table_001_{diff,nor_gl,rough}_2k.jpg)"""
import os
import subprocess
import sys

import bpy

args = sys.argv[sys.argv.index("--") + 1:]
OUT, WOOD, ROOMS = args[0], args[1], args[2:]
BUDGET = 3_000_000
os.makedirs(OUT, exist_ok=True)


def save(im, path, fmt, size, non_colour=False):
    """Scaled and saved as raw pixels. The colour space is set first: setting it reloads the image, which would undo
    the scale; and image.save writes the pixels as they are (save_render would put them through the view transform)."""
    if non_colour:
        im.colorspace_settings.name = "Non-Color"
    w, h = im.size
    im.scale(size, max(1, round(h * size / w)))
    im.filepath_raw = path
    im.file_format = fmt
    im.save()
    return os.path.getsize(path)


wood = 0
for name, size, flags in (("diff", 1024, []), ("nor_gl", 1024, ["-uastc", "-normal_map", "-quality", "60"]), ("rough", 512, ["-linear", "-quality", "60"])):
    im = bpy.data.images.load(os.path.join(WOOD, f"wood_table_001_{name}_2k.jpg"))
    png = os.path.join(OUT, f"wood_{name}.png")
    save(im, png, "PNG", size, name != "diff")
    ktx = os.path.join(OUT, f"wood_{name}.ktx2")
    subprocess.run(["basisu", "-ktx2", "-mipmap", "-y_flip", *flags, png, "-output_file", ktx], check=True, capture_output=True)
    os.remove(png)
    n = os.path.getsize(ktx)
    print(f"wood_{name}.ktx2 {n / 1e3:.0f} KB")
    wood += n
    if name == "diff":
        # a pale honey maple from the same wood (the 2D boards' shelves are light): its lightness kept, so the grain
        # stays, under one warm tint
        px = list(im.pixels)
        tint = (0.98, 0.84, 0.64)
        for i in range(0, len(px), 4):
            v = 0.5 + 1.1 * (0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2])
            for c in range(3):
                px[i + c] = min(1.0, tint[c] * v)
        im.pixels[:] = px
        im.filepath_raw = png
        im.save()
        light = os.path.join(OUT, "wood_diff_light.ktx2")
        subprocess.run(["basisu", "-ktx2", "-mipmap", "-y_flip", png, "-output_file", light], check=True, capture_output=True)
        os.remove(png)
        print(f"wood_diff_light.ktx2 {os.path.getsize(light) / 1e3:.0f} KB (a choice, not added to the budget)")

for path in ROOMS:
    room = os.path.basename(path).split("_1k")[0].split("_2k")[0]
    total = wood
    for size, tag in ((1024, "1k"), (512, "512")):
        im = bpy.data.images.load(path)
        n = save(im, os.path.join(OUT, f"{room}_{tag}.hdr"), "HDR", size)
        total += n
        print(f"{room}_{tag}.hdr {n / 1e6:.2f} MB")
    print(f"ROOM {room}: {total / 1e6:.2f} MB with the wood ({'within' if total <= BUDGET else 'OVER'} the 3 MB budget)")
