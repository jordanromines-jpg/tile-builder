"""Cleans an image-to-3D model's colour texture (5.3). Pixal3D fills the gaps between UV islands with coloured noise,
and texture filtering pulls it across every seam (dark crackle and speckle on the render). This draws the islands'
mask from the mesh's UVs, pulls it in by a couple of texels, and fills everything outside it from the nearest clean
texel. Two halves, because Blender's Python has no scipy:
  blender -b -P cleantex.py -- <model.glb> <work_prefix>      writes <prefix>-uv.npy and <prefix>-tex.png
  python cleantex.py <work_prefix>                            writes <prefix>-clean.png (needs pillow, scipy)"""
import sys

if "bpy" in sys.modules or "--" in sys.argv:
    import bpy
    import numpy as np

    glb, prefix = sys.argv[sys.argv.index("--") + 1:][:2]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb)
    tris = []
    for o in bpy.context.scene.objects:
        if o.type != "MESH":
            continue
        me = o.data
        me.calc_loop_triangles()
        uv = np.zeros(len(me.loops) * 2, dtype=np.float32)
        me.uv_layers.active.data.foreach_get("uv", uv)
        uv = uv.reshape(-1, 2)
        loops = np.zeros(len(me.loop_triangles) * 3, dtype=np.int32)
        me.loop_triangles.foreach_get("loops", loops)
        tris.append(uv[loops].reshape(-1, 3, 2))
    np.save(prefix + "-uv.npy", np.concatenate(tris))
    m = next(o for o in bpy.context.scene.objects if o.type == "MESH").active_material
    tex = next(n for n in m.node_tree.nodes if n.type == "TEX_IMAGE" and any(l.to_socket.name == "Base Color" for l in n.outputs["Color"].links))
    tex.image.filepath_raw = prefix + "-tex.png"
    tex.image.file_format = "PNG"
    tex.image.save()
else:
    import numpy as np
    from PIL import Image, ImageDraw
    from scipy import ndimage

    prefix = sys.argv[1]
    im = np.asarray(Image.open(prefix + "-tex.png").convert("RGB"))
    h, w = im.shape[:2]
    tris = np.load(prefix + "-uv.npy")
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    # UV v runs up; image rows run down
    px = np.stack([tris[..., 0] * w, (1 - tris[..., 1]) * h], -1)
    for t in px:
        d.polygon([tuple(p) for p in t], fill=255)
    inside = ndimage.binary_erosion(np.asarray(mask) > 0, iterations=2)
    _, (iy, ix) = ndimage.distance_transform_edt(~inside, return_indices=True)
    out = im[iy, ix]
    # a gentle median takes the last speckle out of the painted colour
    out = np.stack([ndimage.median_filter(out[..., c], size=3) for c in range(3)], -1)
    Image.fromarray(out).save(prefix + "-clean.png")
    print("clean", prefix, f"{inside.mean():.0%} of the atlas is islands")
