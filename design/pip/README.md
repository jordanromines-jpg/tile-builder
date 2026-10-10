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
