# Pip's design tools (5.3)

How Pip is modelled, rigged and brought into the app. Nothing here ships in the app except the exported model.

| Tool | What it's for | Where it lives |
|---|---|---|
| Blender 5.2 (`brew install --cask blender`) | Modelling, rigging, shape keys, Cycles renders, baking | `/Applications/Blender.app`, `blender` on the PATH |
| BlenderMCP ([ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp) @ `7a0373e`) | Drives a live Blender session from Claude Code (viewport screenshots, code in Blender) | Add-on `blender_mcp_addon` in Blender; MCP server `blender` in this project's local Claude config, telemetry off (`DISABLE_TELEMETRY=true`). Listens on `localhost:9876` only while Blender is open |
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
