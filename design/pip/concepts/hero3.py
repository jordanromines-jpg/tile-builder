"""Pip and friends, finished (5.3): the three image-to-3D models (Pixal3D, from the mflux concepts), smoothed and
given a satin vinyl finish, standing on a Poly Haven wood table under a Poly Haven photo-studio HDRI with a warm key
and coloured rims, beside a little house of real magnet tiles. Stills in Cycles; an eight-second fly-around in EEVEE
with a little life (a hop, a sway, a glide).
blender -b -P hero3.py -- <glb_dir> <polyhaven_dir> <out_dir> <stills|short> [samples]"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit  # noqa: E402

args = sys.argv[sys.argv.index("--") + 1:]
G, PH, OUT, MODE = args[0], args[1], args[2], args[3]
SAMPLES = int(args[4]) if len(args) > 4 else 192

# name: (file, height, where, turn)
CAST = {
    "snail": ("snailB-77.glb", 0.72, (-1.4, -0.15), -0.45),
    "dino": ("dino-11.glb", 1.05, (0.05, 0.05), 0.12),
    "axolotl": ("axolotl-11.glb", 0.98, (1.35, -0.15), -0.35),
}

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene


def bounds(objs):
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    return Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))), Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))


def finish(o, clean):
    """Smooth the generated surface and give it a satin vinyl finish (its painted colours kept, from the cleaned
    texture when cleantex.py has made one)."""
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    if o.data.has_custom_normals:
        bpy.ops.mesh.customdata_custom_splitnormals_clear()
    # the generated mesh is split along every UV seam; weld it, or smoothing opens the seams into cracks
    bm = bmesh.new()
    bm.from_mesh(o.data)
    n = len(bm.verts)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    print("weld", o.name, n, "->", len(bm.verts))
    bm.to_mesh(o.data)
    bm.free()
    for p in o.data.polygons:
        p.use_smooth = True
    sm = o.modifiers.new("soften", "CORRECTIVE_SMOOTH")
    sm.iterations = 4
    sm.use_only_smooth = True
    for slot in o.material_slots:
        m = slot.material
        if not m or not m.use_nodes:
            continue
        b = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if not b:
            continue
        if os.path.exists(clean):
            for link in b.inputs["Base Color"].links:
                if link.from_node.type == "TEX_IMAGE":
                    link.from_node.image = bpy.data.images.load(clean, check_existing=True)
        b.inputs["Roughness"].default_value = 0.42
        for link in list(b.inputs["Roughness"].links) + list(b.inputs["Metallic"].links):
            m.node_tree.links.remove(link)
        b.inputs["Metallic"].default_value = 0.0
        b.inputs["Coat Weight"].default_value = 0.4
        b.inputs["Coat Roughness"].default_value = 0.15
        b.inputs["Subsurface Weight"].default_value = 0.12
        b.inputs["Subsurface Scale"].default_value = 0.05
    o.select_set(False)


roots = {}
for name, (f, height, (x, y), turn) in CAST.items():
    before = set(sc.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(G, f))
    new = [o for o in sc.objects if o not in before]
    meshes = [o for o in new if o.type == "MESH"]
    lo, hi = bounds(meshes)
    root = bpy.data.objects.new(name, None)
    sc.collection.objects.link(root)
    for o in new:
        if o.parent is None:
            o.parent = root
    for o in meshes:
        finish(o, os.path.join(G, f[:-4] + "-clean.png"))
    k = height / (hi.z - lo.z)
    root.scale = (k, k, k)
    root.rotation_euler = (0, 0, turn)
    # its feet on the table, its middle where it stands
    bpy.context.view_layer.update()
    lo2, hi2 = bounds(meshes)
    root.location = (x - (lo2.x + hi2.x) / 2, y - (lo2.y + hi2.y) / 2, -lo2.z)
    roots[name] = root

# the set: Poly Haven's wood table and photo studio
m = bpy.data.materials.new("wood"); m.use_nodes = True
nt = m.node_tree; b = nt.nodes["Principled BSDF"]
tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (2.2, 2.2, 2.2)
nt.links.new(tc.outputs["UV"], mp.inputs["Vector"])
for nm_, inp, non in (("diff", "Base Color", False), ("rough", "Roughness", True), ("nor_gl", None, True)):
    im = nt.nodes.new("ShaderNodeTexImage")
    im.image = bpy.data.images.load(os.path.join(PH, f"wood_table_001_{nm_}_2k.jpg"))
    if non:
        im.image.colorspace_settings.name = "Non-Color"
    nt.links.new(mp.outputs["Vector"], im.inputs["Vector"])
    if inp == "Roughness":
        rr = nt.nodes.new("ShaderNodeMapRange"); rr.inputs["To Min"].default_value = 0.35; rr.inputs["To Max"].default_value = 0.7
        nt.links.new(im.outputs["Color"], rr.inputs["Value"]); nt.links.new(rr.outputs["Result"], b.inputs[inp])
    elif inp:
        nt.links.new(im.outputs["Color"], b.inputs[inp])
    else:
        nmap = nt.nodes.new("ShaderNodeNormalMap"); nmap.inputs["Strength"].default_value = 0.5
        nt.links.new(im.outputs["Color"], nmap.inputs["Color"]); nt.links.new(nmap.outputs["Normal"], b.inputs["Normal"])
bpy.ops.mesh.primitive_plane_add(size=12)
bpy.context.object.data.materials.append(m)

w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
env = w.node_tree.nodes.new("ShaderNodeTexEnvironment")
env.image = bpy.data.images.load(os.path.join(PH, "brown_photostudio_02_2k.hdr"))
mapn = w.node_tree.nodes.new("ShaderNodeMapping"); mapn.inputs["Rotation"].default_value = (0, 0, math.radians(200))
tcw = w.node_tree.nodes.new("ShaderNodeTexCoord")
w.node_tree.links.new(tcw.outputs["Generated"], mapn.inputs["Vector"]); w.node_tree.links.new(mapn.outputs["Vector"], env.inputs["Vector"])
w.node_tree.links.new(env.outputs["Color"], w.node_tree.nodes["Background"].inputs["Color"])
w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.8


def area(name, loc, size, energy, colour, target=(0, 0, 0.5)):
    d = bpy.data.lights.new(name, "AREA"); d.size = size; d.energy = energy; d.color = kit.hexc(colour)[:3]
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()


area("key", (-3.0, -3.6, 3.2), 3.0, 380, "#FFE7CC")
area("fill", (3.6, -2.8, 1.4), 3.5, 90, "#CFE0FF")
area("rimL", (-2.6, 2.8, 2.4), 1.6, 420, "#FFC88E")
area("rimR", (2.8, 2.6, 2.2), 1.6, 460, "#A8D4FF")

# a little house of real magnet tiles behind them
s = 0.42
x0, y0 = -0.75, 0.9
walls = [((0, 0), (1, 0)), ((1, 0), (1, 1)), ((1, 1), (0, 1)), ((0, 1), (0, 0))]
for (a, bb), col in zip(walls, ("#E5322E", "#2A78DD", "#F4C51B", "#39AD4A")):
    kit.tile_poly([(x0 + a[0] * s, y0 + a[1] * s, 0), (x0 + bb[0] * s, y0 + bb[1] * s, 0), (x0 + bb[0] * s, y0 + bb[1] * s, s), (x0 + a[0] * s, y0 + a[1] * s, s)], col, "house", size=s)
apex = (x0 + s / 2, y0 + s / 2, s * 1.62)
for (a, bb), col in zip(walls, ("#F5841F", "#8A4CC8", "#F5841F", "#8A4CC8")):
    kit.tile_poly([(x0 + a[0] * s, y0 + a[1] * s, s), (x0 + bb[0] * s, y0 + bb[1] * s, s), apex], col, "roof", size=s)

cam = bpy.data.cameras.new("cam")
co = bpy.data.objects.new("cam", cam); sc.collection.objects.link(co); sc.camera = co
cam.dof.use_dof = True
cam.dof.aperture_blades = 7
sc.view_settings.view_transform = "AgX"
try:
    sc.view_settings.look = "AgX - Punchy"
except TypeError:
    pass


def aim(pos, target, lens, fstop):
    cam.lens = lens
    co.location = pos
    co.rotation_euler = (Vector(target) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
    cam.dof.focus_distance = (Vector(target) - Vector(pos)).length
    cam.dof.aperture_fstop = fstop


if MODE == "stills":
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    sc.cycles.device = "GPU"; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
    shots = {
        "group": ((0.1, -5.4, 1.35), (0.0, 0.0, 0.5), 45, 2.8, (1920, 1080)),
        "snail": ((-0.75, -2.55, 0.62), (-1.25, -0.25, 0.3), 55, 2.4, (1200, 1500)),
        "dino": ((0.4, -2.7, 0.95), (0.05, 0.05, 0.6), 70, 2.0, (1200, 1500)),
        "axolotl": ((2.2, -2.5, 0.85), (1.35, -0.15, 0.55), 70, 2.0, (1200, 1500)),
    }
    for n, (pos, tgt, lens, f, res) in shots.items():
        aim(pos, tgt, lens, f)
        sc.render.resolution_x, sc.render.resolution_y = res
        sc.render.filepath = os.path.join(OUT, f"final-{n}.png")
        bpy.ops.render.render(write_still=True)
else:
    FR = 192
    sc.render.fps = 24
    sc.frame_start, sc.frame_end = 1, FR
    # the camera flies a slow arc round the front, closing in a little
    for f in range(1, FR + 1, 8):
        t = (f - 1) / (FR - 1)
        a = math.radians(-34 + 68 * t)
        r = 5.6 - 0.7 * t
        aim((r * math.sin(a), -r * math.cos(a), 1.45 - 0.2 * t), (0.0, 0.0, 0.5), 45, 3.2)
        co.keyframe_insert("location", frame=f)
        co.keyframe_insert("rotation_euler", frame=f)
        cam.dof.keyframe_insert("focus_distance", frame=f)
    # a little life: the axolotl hops, the dino sways, the snail glides
    ax, dn, sn = roots["axolotl"], roots["dino"], roots["snail"]
    z0, s0 = ax.location.z, ax.scale.copy()
    for start in (30, 100, 160):
        for df, z, q in ((0, 0, 1.0), (4, 0, 0.9), (9, 0.22, 1.08), (14, 0.25, 1.03), (19, 0, 0.88), (23, 0, 1.04), (27, 0, 1.0)):
            ax.location.z = z0 + z
            ax.scale = (s0.x / math.sqrt(q), s0.y / math.sqrt(q), s0.z * q)
            ax.keyframe_insert("location", index=2, frame=start + df)
            ax.keyframe_insert("scale", frame=start + df)
    r0 = dn.rotation_euler.z
    for f in range(1, FR + 1, 12):
        dn.rotation_euler.z = r0 + 0.12 * math.sin(f / 12)
        dn.rotation_euler.y = 0.04 * math.sin(f / 9)
        dn.keyframe_insert("rotation_euler", frame=f)
    p0 = sn.location.copy()
    for f, k in ((1, 0.0), (FR, 1.0)):
        sn.location = p0 + Vector((0.25, -0.1, 0)) * k
        sn.keyframe_insert("location", frame=f)
    sc.render.engine = "BLENDER_EEVEE"
    sc.eevee.taa_render_samples = 48
    sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
    sc.render.image_settings.file_format = "PNG"
    sc.render.filepath = os.path.join(OUT, "fly", "f")
    bpy.ops.render.render(animation=True)
