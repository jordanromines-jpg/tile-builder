# Pip's design tools (5.3)

How Pip is modelled, rigged and brought into the app. Nothing here ships in the app except the exported model.

| Tool | What it's for | Where it lives |
|---|---|---|
| Blender 5.2 (`brew install --cask blender`) | Modelling, rigging, shape keys, Cycles renders, baking | `/Applications/Blender.app`, `blender` on the PATH |
| Blender MCP, Blender Lab's official one ([projects.blender.org/lab/blender_mcp](https://projects.blender.org/lab/blender_mcp)) | Drives a live Blender session from Claude Code: scene summaries, Python in Blender, screenshots, renders, the bundled API and manual | The "Blender" extension in the Claude app; in Blender, the `mcp` add-on 1.0.3 from the Blender Lab extensions repository (`https://lab.blender.org/`), which needs Preferences → System → Allow Online Access on to start (the link itself is `localhost:9876` only, while Blender is open) |
| BlenderMCP ([ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp) @ `7a0373e`) | The same job, with Poly Haven and model-generation extras | Installed as add-on `blender_mcp_addon` but **disabled**: it wants the same port as the official one, and the two speak different protocols. Its Claude server entry was removed |
| Rigify, glTF 2.0 exporter | Pip's skeleton; export with shape keys (Animation tab → Shape Keys) | Built into Blender, enabled |
| [fogleman/sdf](https://github.com/fogleman/sdf) @ `d58a6fc` | Soft shapes from signed distance functions, with smooth unions (`a.union(b, k=…)`), meshed by marching cubes | `design/pip/.venv` (see `requirements.txt`) |
| [glTF-Transform](https://github.com/donmccurdy/glTF-Transform) 4.5.1 | Shrinks the model for the web: `npx gltf-transform optimize in.glb out.glb --compress meshopt` (keeps shape keys and animation) | `web` devDependency |
| [gltfjsx](https://github.com/pmndrs/gltfjsx) 6.5.3 | Turns the model into a react-three-fiber component with named parts | `web` devDependency |
| [@pixiv/three-vrm-springbone](https://github.com/pixiv/three-vrm) 3.5.5, [wiggle](https://wiggle.three.tools) 0.0.17 | Springy secondary motion on bone chains (ears, tail, crest) | `web` dependencies (not imported yet, so not in the bundle) |
| [Theatre.js](https://www.theatrejs.com) 0.7.2 | A timeline editor for authoring Pip's moves; its JSON plays back with `@theatre/core` | `@theatre/core` dependency; `@theatre/studio` devDependency only (it is AGPL: never in the shipped app). `@theatre/r3f` is not used: it needs react-three-fiber 8, we are on 9 |

Set up the Python tools:

```
uv venv --python 3.12 design/pip/.venv
uv pip install --python design/pip/.venv/bin/python -r design/pip/requirements.txt
```

Render the chick concept: `blender -b -P design/pip/chick.py -- <out_dir> hero,front,side,back,hero-happy 256`.

## The concept pipeline (`concepts/`)

1. `bodies.py` (sdf, in `.venv`): each body as smooth-unioned SDFs, meshed to STL.
2. `build.py` with `kit.py` and `stage.py` (Blender, live through MCP or headless): skin, eyes and happy-arc eyes,
   a mouth wrapped onto the face, real tile pieces, a skeleton with heat weights, `blink` and `closed` shape keys;
   Cycles studio renders (`blender -b -P build.py -- dino <bodies> <out> hero,front,side,back,hero-happy 192`), or the
   app's GLB (`... dino <bodies> <out> glb`: colour and AO baked to vertex colours).
3. `npx gltf-transform optimize in.glb out.glb --compress meshopt --simplify false --texture-compress false`
   (about 1.2 MB to 240 KB).
4. `npx gltfjsx out.glb --types --keepnames`, then use `nodes.body.material` (the loader's own copy, which keeps the
   vertex colours), not the shared `materials.*`.
5. In three.js: Wiggle (`wiggle/spring`) for bone chains, three-vrm's `VRMSpringBoneJoint` for single bones, a
   Theatre.js sequence for timing. Theatre's types change `Object.entries`/`keys` globally: keep it behind a plain JS
   module with its own small `.d.ts`.

Gotchas: Blender 5 starts a new shape key at full value (set `value = 0`); the glTF exporter writes the *render*
colour attribute (set `render_color_index`).

## The characters made app-ready (5.3.5)
From a finished image-to-3D model (Pixal3D, about 950k faces with a 4K atlas) to a light rigged GLB of 190–300 KB.
1. `cleantex.py`: the atlas gutters' noise is filled from the nearest island texel.
2. `ready.py`: welded by position, loose bits under 1% of the faces dropped, the cleaned colour swapped in.
3. AssetFurnace's `blender_retopo_bake.py IN OUT 8000 2048 89 0.004 0 0.42 1.45`: QuadriFlow declined on all three
   (the generated meshes are not manifold), so it decimated to about 8k faces and baked the colour across by ray
   casting. Side by side with the hero renders, the look holds.
4. `specks.py`: the baked atlas's colour flecks on the body colour are filled from around them. With `dark=3000` (the
   snail only), dark marks too: its blotch on the foot was a bake miss. The dino's nostrils and every eye are kept.
5. `rig3.py`: each model is turned to face −y and stood 1 tall. Its bones are placed from the mesh itself (feet, hands at
   arm height, tail tip, gill tips, the snail's foot line and feeler stalks), bound through a watertight voxel proxy
   (AssetFurnace's `transfer_weights`), and checked by reach: an arm or gill must not reach the feet, a foot must not
   reach the head, a feeler must stay on its stalk.
6. `face3.py`: `blink` and `squint` keys, made by squashing the painted eye's patch (found from the colour map). They are
   weak at 8k faces: an eye is only a few vertices wide. Real blinks want eyes as their own small meshes (5.3.2).
7. `pose3.py`: an 8-pose sheet, then glTF with skin and keys. `clip3.py`: a 4 s proof clip. Then
   `npx gltf-transform optimize … --compress meshopt --texture-compress webp --texture-size 1024`. KTX2 inside glTF needs
   `toktx` (not installed); WebP is in three's loader.

`models/{dino,axolotl,snail}.glb` are the results.

## Faces as meshes (5.3.6)
`eyes3.py` (run on the face .blend, before `pose3.py`):
- **Eyes:** each painted eye gets a dark glossy dome with a catch-light, cast onto the face and parented to the head
  bone.
- **Lids:** a skin-coloured lid is folded to a point at rest (so there is no lid to see) and closes over the whole
  painted eye on `blink`.
- **Mouth:** a small arc, cast point by point onto the face, with `smile` and `open` keys.

`pose3.py` sets a key on every mesh that has it.

Still weak:
- the lids read a little paler than the skin;
- the snail's eyes painted on its head are not covered (only its stalk eyes);
- the wave barely shows, because the arms are stubs.
