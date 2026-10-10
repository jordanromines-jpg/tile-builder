"""Eyes and a mouth as their own small meshes (5.3.6a, c). The painted eyes of the light models are only a few vertices
wide, so a squash of the surface barely blinks. Here each eye becomes a dark glossy dome with one catch-light, sat on
the face where the painted eye is (found from the colour map as face3.py does, then cast onto the surface), parented to
the head bone; its `blink` key squashes it shut. The mouth is a small dark arc under the eyes with a `smile` key (the
arc deeper) and an `open` key (a small "o"). All keys rest at 0. No lids, no brows (the subtraction rule).
blender -b <face.blend> -P eyes3.py -- <kind> <out.blend>"""
import math
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

KIND, OUT = sys.argv[sys.argv.index("--") + 1:][:2]
mesh = next(o for o in bpy.data.objects if o.type == "MESH" and not o.name.startswith("I2L_"))
rig = next(o for o in bpy.data.objects if o.type == "ARMATURE")
me = mesh.data
img = next(n.image for n in mesh.active_material.node_tree.nodes if n.type == "TEX_IMAGE")
w, h = img.size
px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
uv = me.uv_layers.active.data
lum = np.ones(len(me.vertices))
for poly in me.polygons:
    for li in poly.loop_indices:
        u, v = uv[li].uv
        c = px[min(h - 1, max(0, int(v * h))), min(w - 1, max(0, int(u * w)))]
        vi = me.loops[li].vertex_index
        lum[vi] = min(lum[vi], 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2])
co = np.array([x.co[:] for x in me.vertices])
z = co[:, 2]
front = co[:, 1] < np.median(co[z > 0.5, 1]) if KIND != "snail" else co[:, 1] < np.percentile(co[:, 1], 30)
eye = (lum < 0.12) & front & (z > (0.5 if KIND != "snail" else 0.6))
cut = np.median(co[eye, 0])
centres, radii = [], []
for sel in (eye & (co[:, 0] < cut), eye & (co[:, 0] >= cut)):
    g = co[sel]
    c = np.median(g, axis=0)
    centres.append(Vector(c))
    radii.append(float(np.clip(np.percentile(np.linalg.norm(g[:, [0, 2]] - c[[0, 2]], axis=1), 80), 0.018, 0.045)))
print("EYES centres", [tuple(round(x, 3) for x in c) for c in centres], "radii", [round(r, 3) for r in radii])

bm = bmesh.new()
bm.from_mesh(me)
bvh = BVHTree.FromBMesh(bm)
bm.free()


def on_surface(p):
    """The face's surface in front of p (a ray from the front, along +y), and its normal there."""
    hit = bvh.ray_cast(Vector((p.x, p.y - 1.0, p.z)), Vector((0, 1, 0)))
    if hit[0] is None:
        hit = bvh.find_nearest(p)
    return hit[0], hit[1]


def material(name, colour, rough, emit=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = colour
    b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = 1.0 if rough < 0.2 else 0.0
    if emit:
        b.inputs["Emission Color"].default_value = colour
        b.inputs["Emission Strength"].default_value = emit
    return m


dark = material("eye", (0.03, 0.02, 0.02, 1), 0.08)
glint = material("glint", (1, 1, 1, 1), 0.2, emit=2.0)
mouth_mat = material("mouth", (0.18, 0.06, 0.05, 1), 0.5)
head_bone = "head"


def parent_to_head(o):
    o.parent = rig
    o.parent_type = "BONE"
    o.parent_bone = head_bone
    bpy.context.view_layer.update()
    bone = rig.pose.bones[head_bone]
    # keep where it is in the world (bone parenting measures from the bone's tail)
    o.matrix_parent_inverse = (rig.matrix_world @ Matrix.Translation(bone.tail) @ bone.matrix.to_3x3().to_4x4()).inverted()


for side, (c, r) in zip(("L", "R"), zip(centres, radii)):
    p, n = on_surface(c)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=1, location=p)
    e = bpy.context.object
    e.name = f"eye.{side}"
    e.scale = (r * 1.05, r * 0.45, r * 1.25)
    e.rotation_euler = n.to_track_quat("Y", "Z").to_euler()
    e.data.materials.append(dark)
    bpy.ops.object.shade_smooth()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    e.shape_key_add(name="Basis", from_mix=False)
    k = e.shape_key_add(name="blink", from_mix=False)
    for d in k.data:
        d.co.z *= 0.06
    k.value = 0.0
    # the lid: the skin's own colour (sampled beside the eye), folded to a point at the eye's top at rest, so there is
    # no lid to see; on blink it closes over the whole painted eye (its white ring too)
    side_pt = c + Vector((0, 0, r * 2.6))
    hit = bvh.find_nearest(side_pt)
    fi = hit[2]
    li = me.polygons[fi].loop_indices[0]
    u_, v_ = uv[li].uv
    skin = px[min(h - 1, int(v_ * h)), min(w - 1, int(u_ * w))]
    # the colour map is brighter than the shaded skin around it: the lid a little darker, to sit in it
    lid_mat = material(f"lid.{side}", (float(skin[0]) * 0.62, float(skin[1]) * 0.62, float(skin[2]) * 0.62, 1), 0.42)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=1, location=p + n * (r * 0.12))
    lid = bpy.context.object
    lid.name = f"lid.{side}"
    lid.scale = (r * 1.75, r * 0.7, r * 1.85)
    lid.rotation_euler = n.to_track_quat("Y", "Z").to_euler()
    lid.data.materials.append(lid_mat)
    bpy.ops.object.shade_smooth()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    closed = [vv.co.copy() for vv in lid.data.vertices]
    top = Vector((0, 0, max(c_.z for c_ in closed)))
    for vv in lid.data.vertices:
        vv.co = top
    lid.shape_key_add(name="Basis", from_mix=False)
    lk = lid.shape_key_add(name="blink", from_mix=False)
    for i, c_ in enumerate(closed):
        lk.data[i].co = c_
    lk.value = 0.0
    parent_to_head(lid)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=r * 0.28, location=p + n * (r * 0.4) + Vector((-r * 0.2, 0, r * 0.3)))
    gl = bpy.context.object
    gl.name = f"glint.{side}"
    gl.data.materials.append(glint)
    gl.parent = e
    gl.matrix_parent_inverse = e.matrix_world.inverted()
    parent_to_head(e)

# the mouth: under the eyes' middle, a small arc on the surface
mid = (centres[0] + centres[1]) / 2
span = (centres[1] - centres[0]).length
# the snail's eyes found are on its stalk tips: its mouth goes on the head itself, lower down
# the mouth sits on the face's middle line (x = 0 after rig3 turned it to face -y), not between the eyes as found
if KIND == "dino":
    # the dino's mouth goes on its snout's front: the front-most point at mouth height, a little under it
    band = (co[:, 2] > 0.44) & (co[:, 2] < 0.58)
    tip = co[band][np.argmin(co[band][:, 1])]
    mp, mn = on_surface(Vector((tip[0], tip[1], tip[2] - 0.03)))
else:
    mp, mn = on_surface(Vector((mid.x, mid.y, 0.36)) if KIND == "snail" else mid - Vector((0, 0, max(radii) * 2.2)))
curve = bpy.data.curves.new("mouth", "CURVE")
curve.dimensions = "3D"
curve.bevel_depth = span * 0.035
curve.bevel_resolution = 3
sp = curve.splines.new("BEZIER")
sp.bezier_points.add(2)
wid = span * 0.16
# each point cast onto the face, so the arc lies on it and never pokes out past the snout
right = Vector((1, 0, 0))
for i, (x, dz) in enumerate(((-wid, 0.0), (0.0, -wid * 0.35), (wid, 0.0))):
    q, qn = on_surface(mp + right * x + Vector((0, 0, dz)))
    bp = sp.bezier_points[i]
    bp.co = q + qn * 0.003 - mp
    bp.handle_left_type = bp.handle_right_type = "AUTO"
mouth = bpy.data.objects.new("mouth", curve)
bpy.context.scene.collection.objects.link(mouth)
mouth.location = mp
mouth.data.materials.append(mouth_mat)
bpy.context.view_layer.objects.active = mouth
for o in bpy.context.selected_objects:
    o.select_set(False)
mouth.select_set(True)
bpy.ops.object.convert(target="MESH")
mouth = bpy.context.object
mouth.shape_key_add(name="Basis", from_mix=False)
smile = mouth.shape_key_add(name="smile", from_mix=False)
opn = mouth.shape_key_add(name="open", from_mix=False)
base = [v.co.copy() for v in mouth.data.vertices]
for i, b in enumerate(base):
    # the smile: the arc deeper at its middle; open: drawn round into a small "o"
    t = max(0.0, 1 - abs(b.x) / wid)
    smile.data[i].co = b + Vector((0, 0, -wid * 0.35 * t))
    ang = math.atan2(b.z + wid * 0.15, b.x)
    rr = wid * 0.45
    opn.data[i].co = Vector((math.cos(ang) * rr * (1 if b.x >= 0 else 1), b.y, -wid * 0.15 + math.sin(ang) * rr * 1.2))
smile.value = opn.value = 0.0
parent_to_head(mouth)
print("EYES mouth at", tuple(round(x, 3) for x in mp))
bpy.ops.wm.save_as_mainfile(filepath=OUT)
