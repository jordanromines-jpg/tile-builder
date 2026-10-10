"""A short of Pip and friends (5.3): six seconds at 24 fps, keyframed on the rigs. The dino waves, the axolotl hops
with its tile (a crouch before each hop, a stretch in the air, a squash on landing), the snail sways and its feelers
bob, the gills flutter, everyone blinks now and then, and the camera eases in. Rendered with EEVEE."""
import math

import bpy
from mathutils import Matrix, Quaternion, Vector

FPS, FRAMES = 24, 144


def _turn(rig, bone, q):
    pb = rig.pose.bones[bone]
    rest = pb.bone.matrix_local
    head = rest.translation
    pb.matrix = Matrix.Translation(head) @ q.to_matrix().to_4x4() @ Matrix.Translation(-head) @ rest
    bpy.context.view_layer.update()


def _aim_q(rig, bone, direction):
    pb = rig.pose.bones[bone]
    cur = (pb.bone.tail_local - pb.bone.head_local).normalized()
    return cur.rotation_difference(Vector(direction).normalized())


def key_bone(rig, bone, frame, q):
    _turn(rig, bone, q)
    pb = rig.pose.bones[bone]
    pb.keyframe_insert("rotation_quaternion", frame=frame)
    pb.keyframe_insert("location", frame=frame)


def blink(obj_names, start):
    for n in obj_names:
        lid = bpy.data.objects.get(n)
        if not lid:
            continue
        for f, a in ((start, 0.0), (start + 2, 1.15), (start + 4, 1.15), (start + 7, 0.0)):
            lid.rotation_euler.x = a
            lid.keyframe_insert("rotation_euler", index=0, frame=f)


def animate(rigs):
    sc = bpy.context.scene
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = 1, FRAMES
    dino, axo, snail = rigs["dino"], rigs["axolotl"], rigs["snail"]
    # the dino waves: up-and-out, side to side, from his shoulder; his head tips with it
    up_a, up_b = (-0.7, -0.25, 0.68), (-0.3, -0.3, 0.9)
    for i, f in enumerate(range(1, FRAMES + 1, 9)):
        key_bone(dino, "arm.R", f, _aim_q(dino, "arm.R", up_a if i % 2 else up_b))
        key_bone(dino, "head", f, Quaternion((0, 1, 0), 0.16 + (0.06 if i % 2 else -0.04)))
    # the axolotl: three hops, each a crouch, a stretch, a squash
    base_z, base_s = axo.location.z, axo.scale.copy()
    for start in (14, 62, 110):
        for df, z, sq in ((0, 0, 1.0), (4, 0, 0.86), (8, 0.2, 1.1), (12, 0.24, 1.04), (16, 0, 0.84), (20, 0, 1.04), (24, 0, 1.0)):
            axo.location.z = base_z + z
            axo.scale = (base_s.x / math.sqrt(sq), base_s.y / math.sqrt(sq), base_s.z * sq)
            axo.keyframe_insert("location", index=2, frame=start + df)
            axo.keyframe_insert("scale", frame=start + df)
    # its gills flutter, each a little after the last
    for b in [pb.name for pb in axo.pose.bones if pb.name.startswith("gill")]:
        k = int(b[-1])
        for f in range(1, FRAMES + 1, 6):
            key_bone(axo, b, f, Quaternion((1, 0, 0), 0.12 * math.sin((f + 5 * k) * 0.45)))
    # the snail sways its head; its feelers bob behind the beat
    for f in range(1, FRAMES + 1, 6):
        t = f / FPS
        key_bone(snail, "head", f, Quaternion((0, 1, 0), -0.2 + 0.1 * math.sin(t * 2.4)))
        for side, ph in (("feeler.L", 0.0), ("feeler.R", 0.9)):
            key_bone(snail, side, f, Quaternion((1, 0, 0), 0.22 * math.sin(t * 4.2 - ph)))
    # blinks, each one at its own moment
    for n in [o.name for o in bpy.data.objects if o.name.startswith("lid.")]:
        top = bpy.data.objects[n]
        while top.parent:
            top = top.parent
        if top.name.startswith("snail"):
            blink([n], 76)
        if top.name.startswith("dino"):
            blink([n], 40)
            blink([n], 118)
    # the camera eases in
    cam = sc.camera
    a, b = Vector((0.35, -6.6, 1.5)), Vector((0.3, -5.3, 1.28))
    target = Vector((0.05, 0.1, 0.62))
    for f, k in ((1, 0.0), (FRAMES, 1.0)):
        cam.location = a.lerp(b, k)
        cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
        cam.keyframe_insert("location", frame=f)
        cam.keyframe_insert("rotation_euler", frame=f)
        cam.data.dof.focus_distance = (target - cam.location).length - 0.25
        cam.data.dof.keyframe_insert("focus_distance", frame=f)


def eevee(path, w=1280, h=720):
    sc = bpy.context.scene
    for engine in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try:
            sc.render.engine = engine
            break
        except TypeError:
            continue
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.resolution_percentage = 100
    sc.eevee.taa_render_samples = 48
    try:
        sc.eevee.use_raytracing = True
        sc.eevee.use_shadows = True
    except AttributeError:
        pass
    sc.render.image_settings.file_format = "PNG"
    sc.render.filepath = path
    bpy.ops.render.render(animation=True)
