"""Skeletons for the light characters (5.3.5e). Each model is turned to face -y and set 1 unit tall on the ground, then
its bones are placed from the mesh itself: the feet from the lowest vertices each side, the hands from the widest
points at arm height, the tail from the furthest point behind, the gills from the head's widest points, the snail's
body along its foot and its feelers from its highest points. It is bound through a watertight voxel proxy
(AssetFurnace's transfer_weights: heat weights need a closed surface, which a generated mesh never is), and checked:
an arm or a gill must not reach the feet, a foot must not reach the head. Saves a .blend for the next steps.
blender -b -P rig3.py -- <light.glb> <dino|axolotl|snail> <out.blend> <assetfurnace_scripts_dir>"""
import math
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector

IN, KIND, OUT, AF = sys.argv[sys.argv.index("--") + 1:][:4]
sys.path.insert(0, AF)
from blender_rebind_weights import transfer_weights  # noqa: E402

# the turn that makes each face -y (read from top views, design/pip/out-5.3)
YAW = {"dino": 36.0, "axolotl": 0.0, "snail": -35.6}

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=IN)
mesh = next(o for o in bpy.context.scene.objects if o.type == "MESH")
mesh.parent = None
bpy.context.view_layer.update()
v = np.array([mesh.matrix_world @ x.co for x in mesh.data.vertices])
lo, hi = v.min(0), v.max(0)
k = 1 / (hi[2] - lo[2])
T = Matrix.Rotation(math.radians(YAW[KIND]), 4, "Z") @ Matrix.Scale(k, 4) @ Matrix.Translation(Vector((-(lo[0] + hi[0]) / 2, -(lo[1] + hi[1]) / 2, -lo[2])))
mesh.data.transform(T @ mesh.matrix_world)
mesh.matrix_world = Matrix.Identity(4)
P = np.array([x.co[:] for x in mesh.data.vertices])
P[:, 2] -= P[:, 2].min()
for x, p in zip(mesh.data.vertices, P):
    x.co = p


def centre(sel):
    return Vector(P[sel].mean(0))


def far(sel, axis, sign):
    i = np.flatnonzero(sel)
    j = i[np.argmax(sign * P[i, axis])]
    return Vector(P[j])


z = P[:, 2]
bones = {}  # name: (head, tail, parent)
mid_x = np.median(P[:, 0])
if KIND in ("dino", "axolotl"):
    feet = z < 0.06
    footL, footR = centre(feet & (P[:, 0] < mid_x)), centre(feet & (P[:, 0] >= mid_x))
    hips = Vector((0, (footL.y + footR.y) / 2 + 0.02, 0.24))
    chest = Vector((0, hips.y - 0.02, 0.42))
    neck = Vector((0, chest.y, 0.5))
    top = Vector((0, centre(z > 0.85).y, 0.98))
    bones["root"] = (Vector((0, hips.y, 0)), Vector((0, hips.y, 0.1)), None)
    bones["hips"] = (Vector((0, hips.y, 0.12)), hips, "root")
    bones["chest"] = (hips, chest, "hips")
    bones["head"] = (neck, top, "chest")
    for side, f, s in (("L", footL, -1), ("R", footR, 1)):
        bones[f"leg.{side}"] = (Vector((f.x * 0.9, hips.y, 0.2)), Vector((f.x, f.y, 0.03)), "hips")
        band = (z > 0.26) & (z < 0.42) & (P[:, 1] < chest.y + 0.12)
        hand = far(band, 0, s)
        bones[f"arm.{side}"] = (Vector((hand.x * 0.55, chest.y - 0.02, 0.4)), hand, "chest")
    back = (z > 0.06) & (z < 0.42) & (P[:, 1] > hips.y + 0.1)
    if back.sum() > 50:
        tip = far(back, 1, 1)
        base = Vector((0, hips.y + 0.1, 0.2))
        prev = "hips"
        for i in range(3):
            a, b = base.lerp(tip, i / 3), base.lerp(tip, (i + 1) / 3)
            bones[f"tail.{i}"] = (a, b, prev)
            prev = f"tail.{i}"
    if KIND == "axolotl":
        head = z > 0.6
        for side, s in (("L", -1), ("R", 1)):
            tip = far(head, 0, s)
            bones[f"gill.{side}"] = (Vector((tip.x * 0.55, tip.y, tip.z * 0.98)), tip, "head")
else:  # the snail: a body along the foot, a neck up to the head, two feelers; the shell rides the body
    foot = z < 0.12
    front, back = far(foot, 1, -1), far(foot, 1, 1)
    bones["root"] = (Vector((0, 0, 0)), Vector((0, 0, 0.1)), None)
    prev = "root"
    for i in range(3):
        a = back.lerp(front, i / 3) + Vector((0, 0, 0.08))
        b = back.lerp(front, (i + 1) / 3) + Vector((0, 0, 0.08))
        a.x = b.x = 0
        bones[f"body.{i}"] = (a, b, prev)
        prev = f"body.{i}"
    headpts = (P[:, 1] < front.y + 0.35) & (z > 0.25) & (z < 0.55)
    hc = centre(headpts)
    bones["neck"] = (bones["body.2"][1], Vector((0, hc.y, hc.z)), "body.2")
    bones["head"] = (Vector((0, hc.y, hc.z)), Vector((0, hc.y - 0.05, hc.z + 0.12)), "neck")
    stalks = (P[:, 1] < front.y + 0.4) & (z > 0.62)
    for side, sel in (("L", stalks & (P[:, 0] < np.median(P[stalks, 0]))), ("R", stalks & (P[:, 0] >= np.median(P[stalks, 0])))):
        # from the stalk's own foot, so the feeler moves the stalk and not the face below it
        tip, foot_ = far(sel, 2, 1), far(sel, 2, -1)
        bones[f"feeler.{side}"] = (foot_, tip, "head")
    shell = (P[:, 1] > front.y + 0.35) & (z > 0.3)
    sc = centre(shell)
    bones["shell"] = (Vector((0, sc.y, 0.25)), Vector((0, sc.y, sc.z)), "body.1")

arm = bpy.data.armatures.new(f"{KIND}.rig")
rig = bpy.data.objects.new(f"{KIND}.rig", arm)
bpy.context.scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode="EDIT")
for name, (h, t, parent) in bones.items():
    b = arm.edit_bones.new(name)
    b.head, b.tail = h, t
    if (t - h).length < 1e-3:
        b.tail = h + Vector((0, 0, 0.02))
for name, (_, _, parent) in bones.items():
    if parent:
        arm.edit_bones[name].parent = arm.edit_bones[parent]
bpy.ops.object.mode_set(mode="OBJECT")
mesh.parent = rig
mod = mesh.modifiers.new("rig", "ARMATURE")
mod.object = rig
bpy.ops.object.select_all(action="DESELECT")
report = transfer_weights(bpy, mesh, rig)
print("RIG transfer:", {k2: report[k2] for k2 in list(report)[:6]})


def reach(prefix):
    """The lowest and highest the bones named `prefix` move, by their vertices weighted over 0.3."""
    zs = []
    for g in mesh.vertex_groups:
        if g.name.startswith(prefix):
            for x in mesh.data.vertices:
                for e in x.groups:
                    if e.group == g.index and e.weight > 0.3:
                        zs.append(x.co.z)
    return (min(zs), max(zs)) if zs else None


problems = []
for prefix, rule in (("arm", lambda r: r[0] > 0.12), ("gill", lambda r: r[0] > 0.4), ("leg", lambda r: r[1] < 0.5), ("feeler", lambda r: r[0] > 0.4), ("tail", lambda r: r[1] < 0.6)):
    r = reach(prefix)
    if r is not None:
        print(f"RIG reach {prefix}: z {r[0]:.2f}..{r[1]:.2f}")
        if not rule(r):
            problems.append(f"{prefix} reaches z {r[0]:.2f}..{r[1]:.2f}")
empty = [g.name for g in mesh.vertex_groups if not any(e.group == g.index for x in mesh.data.vertices for e in x.groups)]
if empty:
    problems.append(f"bones with no vertices: {empty}")
print("RIG bones:", len(bones), "| problems:", problems or "none")
bpy.ops.wm.save_as_mainfile(filepath=OUT)
if problems:
    raise SystemExit("RIG FAILED: " + "; ".join(problems))
