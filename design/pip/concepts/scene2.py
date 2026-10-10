"""Pip and friends as collectible vinyl toys (5.3, "take this from a 2 to a 10"): one art direction, done fully.
Semi-gloss vinyl with light glowing through it and clean, saturated colour; a product-campaign set (a warm wooden
table, a big out-of-focus magnet-tile castle and soft bokeh lights behind); a warm key, cool fill and coloured rims;
poses with weight and attitude. Faces follow the character-appeal skill: wide-set dark glossy eyes, small mouths.
Built live through Blender MCP; rendered headless: blender -b scene.blend -P scene2.py -- <out> <shots> <samples>"""
import importlib
import math
import os
import random
import sys

import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build  # noqa: E402
import hero  # noqa: E402
import kit  # noqa: E402
import stage  # noqa: E402

for m in (kit, stage, build, hero):
    importlib.reload(m)

# clean, saturated toy colours: (shadow side, lit side, belly)
PALETTE = {
    "snail": ("#139A5E", "#62DE96", None),
    "dino": ("#1A63D6", "#4FA6FF", "#FFF0D2"),
    "axolotl": ("#E2457F", "#FF8DBB", "#FFE6EF"),
}
PLACES = {"snail": ((-1.3, -0.35, 0), 0.62), "dino": ((0.0, -0.05, 0), 0.08), "axolotl": ((1.3, -0.2, 0), -0.5)}


def vinyl(body, name):
    """The skin becomes soft-touch vinyl: a satin clear coat, light glowing through the thin parts, no fuzz."""
    low, high, belly = PALETTE[name]
    m = body.data.materials[0]
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.34
    b.inputs["Coat Weight"].default_value = 0.45
    b.inputs["Coat Roughness"].default_value = 0.16
    b.inputs["Sheen Weight"].default_value = 0.0
    b.inputs["Subsurface Weight"].default_value = 0.32
    b.inputs["Subsurface Scale"].default_value = 0.09
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.6, 0.4)
    for n in nt.nodes:
        if n.type == "VALTORGB":
            n.color_ramp.elements[0].color = kit.hexc(low)
            n.color_ramp.elements[-1].color = kit.hexc(high)
            for e in list(n.color_ramp.elements)[1:-1]:
                n.color_ramp.elements.remove(e)
        if n.type == "MIX" and n.data_type == "RGBA" and belly and tuple(n.inputs["B"].default_value)[:3] != tuple(kit.hexc("#FF8A96"))[:3]:
            # the belly (the blush mixes keep their own colour)
            if n.inputs["B"].default_value[0] > 0.8 and n.inputs["B"].default_value[1] > 0.7:
                n.inputs["B"].default_value = kit.hexc(belly)
        if n.type == "BUMP":
            n.inputs["Strength"].default_value = 0.0


def eyes_vinyl():
    """Toy eyes: deep glossy near-black domes (painted vinyl), the two catch-lights kept."""
    for m in bpy.data.materials:
        if m.name.startswith("eye") and m.use_nodes:
            b = m.node_tree.nodes.get("Principled BSDF")
            if not b:
                continue
            for link in list(b.inputs["Base Color"].links):
                m.node_tree.links.remove(link)
            b.inputs["Base Color"].default_value = kit.hexc("#1B110C")
            b.inputs["Roughness"].default_value = 0.05
            b.inputs["Coat Weight"].default_value = 1.0
            b.inputs["Coat Roughness"].default_value = 0.0


def castle(at, s=0.9):
    """A big magnet-tile castle behind them (out of focus): two towers with pyramid roofs and a wall between."""
    x0, y0, z0 = at
    cols = ("#E5322E", "#F4C51B", "#2A78DD", "#39AD4A", "#8A4CC8", "#F5841F")
    k = 0

    def ring(cx, cy, levels):
        nonlocal k
        sides = [((0, 0), (1, 0)), ((1, 0), (1, 1)), ((1, 1), (0, 1)), ((0, 1), (0, 0))]
        for lv in range(levels):
            z = z0 + lv * s
            for a, b in sides:
                p = [(cx + a[0] * s, cy + a[1] * s, z), (cx + b[0] * s, cy + b[1] * s, z), (cx + b[0] * s, cy + b[1] * s, z + s), (cx + a[0] * s, cy + a[1] * s, z + s)]
                kit.tile_poly(p, cols[k % len(cols)], "castle", size=s)
                k += 1
        apex = (cx + s / 2, cy + s / 2, z0 + levels * s + s * 0.75)
        for a, b in sides:
            kit.tile_poly([(cx + a[0] * s, cy + a[1] * s, z0 + levels * s), (cx + b[0] * s, cy + b[1] * s, z0 + levels * s), apex], cols[k % len(cols)], "castle", size=s)
            k += 1
    ring(x0, y0, 3)
    ring(x0 + 3 * s, y0, 2)
    for i in range(2):
        p = [(x0 + s * (1 + i), y0, z0), (x0 + s * (2 + i), y0, z0), (x0 + s * (2 + i), y0, z0 + s), (x0 + s * (1 + i), y0, z0 + s)]
        kit.tile_poly(p, cols[(k + i) % len(cols)], "castle", size=s)


def bokeh(n=34, seed=3):
    """Little warm lights far behind: out of focus they become soft discs (fairy lights in the playroom)."""
    rnd = random.Random(seed)
    for i in range(n):
        x = rnd.uniform(-6, 6)
        z = rnd.uniform(1.2, 4.2)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.05, location=(x, 7.5 + rnd.uniform(-0.5, 0.5), z))
        o = bpy.context.view_layer.objects.active
        o.name = "set.bokeh"
        col = rnd.choice(("#FFD9A0", "#FFE7C2", "#FFC9D9", "#CFE6FF"))
        o.data.materials.append(kit.emission(f"bokeh{i}", col, rnd.uniform(18, 40)))


def lights():
    w = bpy.data.worlds.new("hdri2"); bpy.context.scene.world = w; w.use_nodes = True
    env = w.node_tree.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(hero.HDRI)
    w.node_tree.links.new(env.outputs["Color"], w.node_tree.nodes["Background"].inputs["Color"])
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.35

    def area(name, loc, size, energy, colour, target=(0, 0, 0.6)):
        d = bpy.data.lights.new(name, "AREA"); d.size = size; d.energy = energy; d.color = kit.hexc(colour)[:3]
        o = kit.link(bpy.data.objects.new("set." + name, d)); o.location = loc
        o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    area("key", (-3.2, -3.8, 3.4), 3.0, 520, "#FFE6C8")          # warm, big, soft, from the front left
    area("fill", (3.8, -3.0, 1.4), 4.0, 120, "#BFD6FF")          # cool, low, from the right
    area("rimL", (-2.6, 3.0, 2.6), 1.6, 520, "#FFC48A")          # warm rim behind the left
    area("rimR", (2.8, 2.6, 2.4), 1.6, 560, "#9FD0FF")           # cool rim behind the right
    area("top", (0, 0.5, 5.0), 5.0, 160, "#FFF4E8")             # a soft top light for the heads


def set_dressing():
    bpy.ops.mesh.primitive_plane_add(size=18)
    t = bpy.context.view_layer.objects.active
    t.name = "set.table"
    t.data.materials.append(hero.wood_material())
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 9, 0), rotation=(math.pi / 2, 0, 0))
    wall = bpy.context.view_layer.objects.active
    wall.name = "set.wall"
    wall.data.materials.append(kit.plastic("wall2", "#E9D2B4", 0.95, 0, 0))
    castle((-2.2, 3.4, 0))
    hero.tile_house((-0.62, 0.55, 0), 0.46)
    bokeh()
    lights()


def build_scene(D):
    kit.clear_scene()
    rigs = {}
    for name, fn in (("snail", build.snail), ("dino", build.dino), ("axolotl", build.axolotl)):
        body, rig = fn(D)
        body.name, rig.name = f"{name}.body", f"{name}.rig"
        (x, y, z), turn = PLACES[name]
        rig.location, rig.rotation_euler = (x, y, z), (0, 0, turn)
        vinyl(body, name)
        rigs[name] = rig
    eyes_vinyl()
    set_dressing()
    return rigs


def pose(rigs):
    """Weight and attitude: the dino waves, leaning into it; the snail stretches up, curious; the axolotl cheers."""
    def turn(rig, bone, q):
        pb = rig.pose.bones[bone]
        rest = pb.bone.matrix_local
        h = rest.translation
        pb.matrix = Matrix.Translation(h) @ q.to_matrix().to_4x4() @ Matrix.Translation(-h) @ rest
        bpy.context.view_layer.update()

    def aim(rig, bone, d):
        pb = rig.pose.bones[bone]
        cur = (pb.bone.tail_local - pb.bone.head_local).normalized()
        turn(rig, bone, cur.rotation_difference(Vector(d).normalized()))
    from mathutils import Quaternion
    aim(rigs["dino"], "arm.R", (-0.55, -0.3, 0.78))
    turn(rigs["dino"], "chest", Quaternion((0, 1, 0), 0.07))
    turn(rigs["dino"], "head", Quaternion((0, 1, 0), 0.14))
    turn(rigs["snail"], "neck", Quaternion((1, 0, 0), -0.12))
    turn(rigs["snail"], "head", Quaternion((0, 1, 0), -0.18))
    aim(rigs["axolotl"], "arm.L", (0.5, -0.3, 0.8))
    aim(rigs["axolotl"], "arm.R", (-0.5, -0.3, 0.8))
    turn(rigs["axolotl"], "head", Quaternion((0, 1, 0), -0.1))
    # the axolotl's happy eyes
    for o in bpy.data.objects:
        top = o
        while top.parent:
            top = top.parent
        ax = top.name.startswith("axolotl")
        if o.name.startswith(("eye.", "glint")) and ax:
            o.hide_render = o.hide_viewport = True
        if o.name.startswith("happy."):
            o.hide_render = o.hide_viewport = not ax


SHOTS = {
    "group": ((0.1, -5.9, 1.25), (0.0, -0.1, 0.62), 50, 2.4, (1920, 1080)),
    "snail": ((-2.15, -3.2, 0.9), (-1.2, -0.45, 0.62), 85, 1.8, (1200, 1500)),
    "dino": ((0.35, -3.1, 1.1), (0.0, -0.1, 0.8), 85, 1.8, (1200, 1500)),
    "axolotl": ((2.3, -3.0, 0.95), (1.3, -0.25, 0.68), 85, 1.8, (1200, 1500)),
}


def camera(kind):
    cam = bpy.data.cameras.get("cam") or bpy.data.cameras.new("cam")
    o = bpy.data.objects.get("cam") or kit.link(bpy.data.objects.new("cam", cam))
    bpy.context.scene.camera = o
    pos, target, lens, fstop, res = SHOTS[kind]
    cam.lens = lens
    o.location = pos
    o.rotation_euler = (Vector(target) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
    cam.dof.use_dof = True
    cam.dof.focus_distance = (Vector(target) - Vector(pos)).length - 0.25
    cam.dof.aperture_fstop = fstop
    cam.dof.aperture_blades = 7
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = res
    return o


if __name__ == "__main__" and "--" in sys.argv:
    args = sys.argv[sys.argv.index("--") + 1:]
    OUT, shots, samples = args[0], args[1].split(","), int(args[2]) if len(args) > 2 else 256
    hero.render_setup(samples)
    for s in shots:
        camera(s)
        stage.render(os.path.join(OUT, f"toy-{s}.png"))
