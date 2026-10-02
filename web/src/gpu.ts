/* Whether this device draws 3D on a real GPU. Without one (a software renderer such as SwiftShader or llvmpipe: old
   devices, virtual machines, the test runner) the build stage is drawn lighter: plain plastic, no reflections or
   contact shadows, at 0.75x (TileMesh.tsx, Stage.tsx, Viewer.tsx). Asked once. */
let soft: boolean | undefined;

export function softwareGL(): boolean {
  if (soft !== undefined) return soft;
  soft = true;
  try {
    const gl = document.createElement("canvas").getContext("webgl") as WebGLRenderingContext | null;
    if (gl) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const name = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
      soft = /swiftshader|llvmpipe|software|softpipe/i.test(name);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    soft = true;
  }
  return soft;
}

/** The picture maker draws the full look whatever renders it: time does not matter there, the pictures do. */
export function drawFullLook(): void {
  soft = false;
}
