"""Shared by the model sheet and the animatic (5.3.1): a rigged character's .blend made ready to pose (the voxel proxies
dropped), its bones and face keys set by name, a soft studio with the room's warm key, and a camera. Characters stand
1 unit tall; a small square tile is TILE across, so a character is about two tiles tall beside a build."""
import math

import bpy
from mathutils import Euler, Vector

import kit

TILE = 0.5
TILE_COLOURS = ("#E5322E", "#F5841F", "#F4C51B", "#39AD4A", "#2A78DD", "#8A4CC8")


class Cast:
    def __init__(self):
        for o in list(bpy.data.objects):
            if o.name.startswith("I2L_"):
                bpy.data.objects.remove(o, do_unlink=True)
        self.rig = next(o for o in bpy.data.objects if o.type == "ARMATURE")
        self.keyed = [o for o in bpy.data.objects if o.type == "MESH" and o.data.shape_keys]
        self.pb = self.rig.pose.bones
        for b in self.pb:
            b.rotation_mode = "XYZ"

    def rest(self):
        for b in self.pb:
            b.rotation_euler = (0, 0, 0)
            b.location = (0, 0, 0)
        for o in self.keyed:
            for k in o.data.shape_keys.key_blocks[1:]:
                k.value = 0
        self.rig.location = (0, 0, 0)
        self.rig.rotation_euler = (0, 0, 0)
        self.rig.scale = (1, 1, 1)

    def turn(self, name, x=0.0, y=0.0, z=0.0):
        if name in self.pb:
            self.pb[name].rotation_euler = Euler((math.radians(x), math.radians(y), math.radians(z)))

    def each(self, prefix, **kw):
        for b in self.pb:
            if b.name.startswith(prefix):
                self.turn(b.name, **kw)

    def key(self, name, v):
        for o in self.keyed:
            k = o.data.shape_keys.key_blocks.get(name)
            if k:
                k.value = v

    def has(self, bone):
        return bone in self.pb

    def keyframe(self, f):
        for b in self.pb:
            b.keyframe_insert("rotation_euler", frame=f)
        self.rig.keyframe_insert("location", frame=f)
        self.rig.keyframe_insert("rotation_euler", frame=f)
        self.rig.keyframe_insert("scale", frame=f)
        for o in self.keyed:
            for k in o.data.shape_keys.key_blocks[1:]:
                k.keyframe_insert("value", frame=f)


def studio(floor="#E9D2AE"):
    sc = bpy.context.scene
    w = bpy.data.worlds.new("w")
    sc.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = kit.hexc("#F6EBDD")
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.9
    key = bpy.data.lights.new("key", "AREA")
    key.size = 3
    key.energy = 320
    key.color = (1.0, 0.92, 0.82)
    ko = bpy.data.objects.new("key", key)
    sc.collection.objects.link(ko)
    ko.location = (-3, -3, 4)
    ko.rotation_euler = (Vector((0, 0, 0.5)) - ko.location).to_track_quat("-Z", "Y").to_euler()
    rim = bpy.data.lights.new("rim", "AREA")
    rim.size = 2
    rim.energy = 180
    rim.color = (0.7, 0.85, 1.0)
    ro = bpy.data.objects.new("rim", rim)
    sc.collection.objects.link(ro)
    ro.location = (2.5, 3, 2.5)
    ro.rotation_euler = (Vector((0, 0, 0.6)) - ro.location).to_track_quat("-Z", "Y").to_euler()
    bpy.ops.mesh.primitive_plane_add(size=40)
    bpy.context.object.data.materials.append(kit.plastic("floor", floor, 0.8, 0, 0))
    for e in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try:
            sc.render.engine = e
            break
        except TypeError:
            continue
    sc.eevee.taa_render_samples = 32
    sc.view_settings.view_transform = "Standard"
    sc.render.image_settings.file_format = "PNG"


def camera(pos, target, lens=50):
    sc = bpy.context.scene
    co = sc.camera
    if co is None:
        co = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
        sc.collection.objects.link(co)
        sc.camera = co
    co.data.lens = lens
    co.location = pos
    co.rotation_euler = (Vector(target) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
    return co


def square(at, colour, name="tile", up=True):
    """A small square magnet tile, standing (up) or lying flat, its bottom edge's middle at `at`."""
    x, y, z = at
    s = TILE / 2
    pts = [(x - s, y, z), (x + s, y, z), (x + s, y, z + TILE), (x - s, y, z + TILE)] if up else [(x - s, y - s, z), (x + s, y - s, z), (x + s, y + s, z), (x - s, y + s, z)]
    return kit.tile_poly(pts, colour, name, size=TILE)


def house(at):
    """A little tile house (four walls, a pyramid roof): a build to stand beside."""
    x0, y0, z0 = at
    s = TILE
    walls = [((0, 0), (1, 0)), ((1, 0), (1, 1)), ((1, 1), (0, 1)), ((0, 1), (0, 0))]
    for (a, b), col in zip(walls, TILE_COLOURS):
        kit.tile_poly([(x0 + a[0] * s, y0 + a[1] * s, z0), (x0 + b[0] * s, y0 + b[1] * s, z0), (x0 + b[0] * s, y0 + b[1] * s, z0 + s), (x0 + a[0] * s, y0 + a[1] * s, z0 + s)], col, "house", size=s)
    apex = (x0 + s / 2, y0 + s / 2, z0 + s * 1.62)
    for (a, b), col in zip(walls, TILE_COLOURS[2:] + TILE_COLOURS[:2]):
        kit.tile_poly([(x0 + a[0] * s, y0 + a[1] * s, z0 + s), (x0 + b[0] * s, y0 + b[1] * s, z0 + s), apex], col, "roof", size=s)
