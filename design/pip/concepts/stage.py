"""The studio, cameras and renders for Pip's concepts (5.3), and the bake + glTF export the app uses. Split from
kit.py (the 500-line rule)."""
import bpy
from mathutils import Vector

from kit import activate, emission, hexc, link, node_mat, smooth


# ---------- studio ----------
DOME = 1.05


def studio(bg="#FBEFDD"):
    m, nt, bs = node_mat("backdrop")
    bs.inputs["Base Color"].default_value = hexc(bg)
    bs.inputs["Roughness"].default_value = 0.9
    bs.inputs["Emission Color"].default_value = hexc(bg)
    bs.inputs["Emission Strength"].default_value = 0.3
    N, Lk = nt.nodes, nt.links
    tc = N.new("ShaderNodeTexCoord")
    ln = N.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"; Lk.new(tc.outputs["Object"], ln.inputs[0])
    mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 2.2; mr.inputs["From Max"].default_value = 7.0
    Lk.new(ln.outputs["Value"], mr.inputs["Value"])
    far = N.new("ShaderNodeEmission"); far.inputs["Color"].default_value = hexc(bg); far.inputs["Strength"].default_value = DOME
    mx = N.new("ShaderNodeMixShader")
    Lk.new(mr.outputs["Result"], mx.inputs[0]); Lk.new(bs.outputs[0], mx.inputs[1]); Lk.new(far.outputs[0], mx.inputs[2])
    Lk.new(mx.outputs[0], N["Material Output"].inputs[0])
    bpy.ops.mesh.primitive_plane_add(size=80)
    floor = bpy.context.view_layer.objects.active
    floor.name = "studio.floor"
    floor.data.materials.append(m)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=36)
    dome = bpy.context.view_layer.objects.active
    dome.name = "studio.dome"
    dome.data.materials.append(emission("dome", bg, DOME))
    smooth(dome)
    for attr in ("visible_diffuse", "visible_glossy", "visible_shadow", "visible_transmission", "visible_volume_scatter"):
        setattr(dome, attr, False)

    def area(name, loc, size, energy, colour="#FFFFFF", target=(0, 0, 0.55)):
        d = bpy.data.lights.new(name, "AREA"); d.size = size; d.energy = energy; d.color = hexc(colour)[:3]
        o = link(bpy.data.objects.new("studio." + name, d)); o.location = loc
        o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    area("key", (-2.2, -3.0, 3.2), 3.0, 115, "#FFF4E6")
    area("fill", (3.0, -2.2, 1.4), 3.5, 45, "#E8F0FF")
    area("rim", (1.2, 2.6, 2.6), 1.6, 150, "#FFFFFF")
    area("glint", (-0.6, -3.5, 1.6), 0.6, 30, "#FFFFFF")
    w = bpy.data.worlds.new("w"); bpy.context.scene.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = hexc("#F3E3CF")
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.22


VIEWS = {"hero": (-1.55, -3.3, 1.35), "front": (0, -3.6, 1.05), "side": (-3.6, 0, 1.05), "back": (1.4, 3.3, 1.2)}


def camera(view, target=(0, 0, 0.55), lens=70, dist=1.0):
    cam = bpy.data.cameras.get("cam") or bpy.data.cameras.new("cam")
    cam.lens = lens
    o = bpy.data.objects.get("cam") or link(bpy.data.objects.new("cam", cam))
    bpy.context.scene.camera = o
    pos = Vector(target) + (Vector(VIEWS[view]) - Vector(target)) * dist
    o.location = pos
    o.rotation_euler = (Vector(target) - pos).to_track_quat("-Z", "Y").to_euler()
    cam.dof.use_dof = True
    cam.dof.focus_distance = (Vector(target) - pos).length - 0.4
    cam.dof.aperture_fstop = 4.0
    return o


def render_setup(samples=160, res=1200):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    sc.cycles.device = "GPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.render.resolution_x = res
    sc.render.resolution_y = res
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = -0.45


def render(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


# ---------- for the app ----------
def bake_vertex_colours(body, ao_strength=0.55):
    """Bakes the skin's colour and its soft shadowing (AO) into the body's vertex colours, so the iPad gets the
    painted gradient, belly and blush and the contact shading without the node tree."""
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 64
    me = body.data
    for nm in ("albedo", "ao"):
        if nm not in me.color_attributes:
            me.color_attributes.new(nm, "FLOAT_COLOR", "POINT")
    activate(body)
    me.color_attributes.active_color = me.color_attributes["albedo"]
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"}, target="VERTEX_COLORS")
    me.color_attributes.active_color = me.color_attributes["ao"]
    bpy.ops.object.bake(type="AO", target="VERTEX_COLORS")
    if "Col" not in me.color_attributes:
        me.color_attributes.new("Col", "BYTE_COLOR", "POINT")
    alb, ao, out = me.color_attributes["albedo"].data, me.color_attributes["ao"].data, me.color_attributes["Col"].data
    for i in range(len(out)):
        a = ao[i].color[0]
        k = 1 - ao_strength + ao_strength * a
        c = alb[i].color
        out[i].color = (c[0] * k, c[1] * k, c[2] * k, 1.0)
    for nm in ("albedo", "ao"):
        me.color_attributes.remove(me.color_attributes[nm])
    me.color_attributes.active_color = me.color_attributes["Col"]
    # (the glTF exporter writes the *render* colour attribute: without this it writes plain white)
    me.color_attributes.render_color_index = me.color_attributes.active_color_index
    # the app's material: the baked colour, the same softness
    m, nt, b = node_mat(body.name + ".app")
    ca = nt.nodes.new("ShaderNodeVertexColor"); ca.layer_name = "Col"
    nt.links.new(ca.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.6
    b.inputs["Sheen Weight"].default_value = 0.5
    b.inputs["Sheen Roughness"].default_value = 0.45
    return m


def export_glb(path, objects):
    for o in bpy.context.view_layer.objects:
        o.select_set(o in objects)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_apply=False,
        export_morph=True, export_skins=True, export_animations=True, export_vertex_color="ACTIVE",
        export_yup=True,
    )
