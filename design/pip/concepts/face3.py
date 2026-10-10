"""Face shapes for the rigged characters (5.3.5f). Their eyes are painted, not modelled: a dark glossy patch on the
dome. So a blink is the eye's patch of surface squashed to a line, and a happy squint is it pressed to a low arc; no
lids (the subtraction rule). The eyes are found from the colour map: the vertices whose colour is near-black, high on
the front of the head, in two clusters (left, right). Both keys rest at 0 (Blender 5 starts new keys at 1).
blender -b <rig.blend> -P face3.py -- <kind> <out.blend>"""
import sys

import bpy
import numpy as np
from mathutils import Vector

KIND, OUT = sys.argv[sys.argv.index("--") + 1:][:2]
mesh = next(o for o in bpy.data.objects if o.type == "MESH" and not o.name.startswith("I2L_"))
me = mesh.data
img = next(n.image for n in mesh.active_material.node_tree.nodes if n.type == "TEX_IMAGE")
w, h = img.size
px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
uv = me.uv_layers.active.data
lum = np.zeros(len(me.vertices))
for poly in me.polygons:
    for li in poly.loop_indices:
        u, v = uv[li].uv
        c = px[min(h - 1, max(0, int(v * h))), min(w - 1, max(0, int(u * w)))]
        lum[me.loops[li].vertex_index] = max(lum[me.loops[li].vertex_index], 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2])
co = np.array([x.co[:] for x in me.vertices])
z = co[:, 2]
front = co[:, 1] < np.median(co[z > 0.5, 1]) if KIND != "snail" else co[:, 1] < np.percentile(co[:, 1], 30)
high = z > (0.5 if KIND != "snail" else 0.6)
eye = (lum < 0.12) & front & high
if eye.sum() < 6:
    raise SystemExit(f"FACE: found only {int(eye.sum())} eye vertices")
xs = co[eye, 0]
cut = np.median(xs)
groups = [np.flatnonzero(eye & (co[:, 0] < cut)), np.flatnonzero(eye & (co[:, 0] >= cut))]
print("FACE eyes:", [len(g) for g in groups])
if not mesh.data.shape_keys:
    mesh.shape_key_add(name="Basis", from_mix=False)


def key(name, squash, lift):
    k = mesh.shape_key_add(name=name, from_mix=False)
    for g in groups:
        c = np.median(co[g], axis=0)
        # the patch and a soft ring round it (so the squash doesn't tear the surface). The radius is robust and capped:
        # one stray dark vertex (a plate's shadow, a nostril) must not make the whole head the eye
        d = np.linalg.norm(co[:, [0, 2]] - c[[0, 2]], axis=1)
        r = float(np.clip(np.percentile(np.linalg.norm(co[g][:, [0, 2]] - c[[0, 2]], axis=1), 80), 0.015, 0.05))
        ring = np.flatnonzero((d < r * 1.6) & (np.abs(co[:, 1] - c[1]) < r * 2))
        for i in ring:
            f = 1.0 if d[i] <= r else max(0.0, 1 - (d[i] - r) / (0.6 * r))
            p = co[i]
            nz = c[2] + (p[2] - c[2]) * squash + lift
            k.data[i].co = Vector((p[0], p[1], p[2] + f * (nz - p[2])))
    k.value = 0.0


key("blink", 0.08, 0.0)
key("squint", 0.4, 0.008)
print("FACE radius cap 0.05; keys:", [k.name for k in mesh.data.shape_keys.key_blocks])
bpy.ops.wm.save_as_mainfile(filepath=OUT)
