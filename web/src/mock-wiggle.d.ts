// Wiggle ships no types: the spring bone the mock uses.
declare module "wiggle/spring" {
  import type { Bone } from "three";
  export class WiggleBone {
    constructor(bone: Bone, options?: { stiffness?: number; damping?: number });
    update(dt?: number): void;
    reset(): void;
    dispose(): void;
  }
}
