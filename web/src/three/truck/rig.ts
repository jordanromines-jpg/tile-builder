/* The truck as three.js objects (PR 4.0b), without React so a test can count what it costs. Ten meshes: the body and
   chassis frame; the clear faces; the eye lenses and pupils (they blink); and the moving parts as instances: four
   tyres, four rims, two axles, eight shocks, eight link bars and two driveshafts. `setPose` places them all. */
import * as THREE from "three";
import { faceBump } from "../textures";
import { lite } from "../TileMesh";
import { buildBody, EYE } from "./body";
import { buildAxle, buildChassis, buildDriveshaft, buildLinkBar, buildShock, SHOCK_LENGTH } from "./chassis";
import { merge, palette, quatX, quatY, quatZ, UP, v3, type Palette } from "./geo";
import { AXLE_Z, DRIVE, LINKS, REST_COMPRESS, restPose, SHOCKS, TRUCK, wheelHeight, WHEEL_XZ, type TruckPose } from "./spec";
import { buildRim, buildTyre } from "./wheels";

export interface TruckRig {
  root: THREE.Group;
  setPose(pose: TruckPose): void;
  /** 1 is open, 0 is shut */
  setBlink(open: number): void;
  /** the glow of the headlights, 0 to 1 */
  setGlow(glow: number): void;
  dispose(): void;
}

const Z = new THREE.Vector3(0, 0, 1);

function materials(pal: Palette) {
  const plain = lite();
  const frame = plain
    ? new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4 })
    : new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.18 });
  const bump = plain ? null : faceBump();
  const glass = plain
    ? new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, roughness: 0.3, side: THREE.DoubleSide, depthWrite: false, forceSinglePass: true })
    : new THREE.MeshPhysicalMaterial({ vertexColors: true, transparent: true, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide, depthWrite: false, forceSinglePass: true, ...(bump ? { bumpMap: bump, bumpScale: 0.9 } : {}) });
  const rubber = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62 });
  const rim = frame.clone();
  rim.side = THREE.DoubleSide;
  const lens = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.15, emissive: pal.yellow, emissiveIntensity: 0.4 });
  const pupil = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3 });
  return { frame, glass, rubber, rim, lens, pupil };
}

function instanced(geo: THREE.BufferGeometry, mat: THREE.Material, n: number): THREE.InstancedMesh {
  const m = new THREE.InstancedMesh(geo, mat, n);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  return m;
}

export function buildTruck(pal: Palette = palette()): TruckRig {
  const mats = materials(pal);
  const body = buildBody(pal);
  const root = new THREE.Group();
  root.name = "pip-truck";
  const holder = new THREE.Group();
  root.add(holder);

  const frame = new THREE.Mesh(merge([body.frame, buildChassis(pal)]), mats.frame);
  frame.castShadow = true;
  const glass = new THREE.Mesh(body.glass, mats.glass);
  glass.renderOrder = 1;
  const lens = new THREE.Mesh(body.lens, mats.lens);
  const pupil = new THREE.Mesh(body.pupil, mats.pupil);
  lens.position.y = pupil.position.y = EYE.y;
  const tyres = instanced(buildTyre(pal), mats.rubber, 4);
  const rims = instanced(buildRim(pal), mats.rim, 4);
  const axles = instanced(buildAxle(pal), mats.frame, 2);
  const shocks = instanced(buildShock(pal, SHOCK_LENGTH), mats.frame, SHOCKS.length);
  const links = instanced(buildLinkBar(pal), mats.frame, LINKS.length);
  const shafts = instanced(buildDriveshaft(pal), mats.frame, 2);
  tyres.castShadow = true;
  holder.add(frame, glass, lens, pupil, tyres, rims, axles, shocks, links, shafts);

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const one = new THREE.Vector3(1, 1, 1);
  const ay: THREE.Matrix4[] = [new THREE.Matrix4(), new THREE.Matrix4()];

  function setPose(pose: TruckPose) {
    holder.position.set(...pose.pos);
    holder.quaternion.set(...pose.quat);
    // wheels: lift by the spring, steer, spin; the right-hand ones are turned round so the dish faces out
    pose.wheels.forEach((w, i) => {
      const [x, z] = WHEEL_XZ[i];
      q.copy(quatY(w.steer)).multiply(quatX(w.spin));
      if (x < 0) q.multiply(quatY(Math.PI));
      m.compose(new THREE.Vector3(x, wheelHeight(w.compress), z), q, one);
      tyres.setMatrixAt(i, m);
      rims.setMatrixAt(i, m);
    });
    // axles: a solid axle sits at the mean of its wheels and rolls with the difference
    for (const a of [0, 1]) {
      const l = pose.wheels[a * 2];
      const r = pose.wheels[a * 2 + 1];
      const yl = wheelHeight(l.compress);
      const yr = wheelHeight(r.compress);
      ay[a].compose(new THREE.Vector3(0, (yl + yr) / 2, AXLE_Z[a]), quatZ(Math.atan2(yl - yr, TRUCK.track)), one);
      m.copy(ay[a]);
      if (a === 1) m.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
      axles.setMatrixAt(a, m);
    }
    SHOCKS.forEach((s, i) => {
      const foot = v3(s.foot).applyMatrix4(ay[s.axle]);
      const d = v3(s.top).sub(foot);
      const len = d.length();
      m.compose(foot, q.setFromUnitVectors(UP, d.divideScalar(len)), new THREE.Vector3(1, len / SHOCK_LENGTH, 1));
      shocks.setMatrixAt(i, m);
    });
    LINKS.forEach((l, i) => {
      const foot = v3(l.foot).applyMatrix4(ay[l.axle]);
      const d = v3(l.chassis).sub(foot);
      const len = d.length();
      m.compose(foot, q.setFromUnitVectors(UP, d.divideScalar(len)), new THREE.Vector3(1, len, 1));
      links.setMatrixAt(i, m);
    });
    for (const a of [0, 1]) {
      const from = v3(DRIVE.transfer).add(new THREE.Vector3(0, 0, AXLE_Z[a] > 0 ? 0.05 : -0.05));
      const to = v3(DRIVE.diff).applyMatrix4(ay[a]);
      const d = to.clone().sub(from);
      const len = d.length();
      const spin = (pose.wheels[a * 2].spin + pose.wheels[a * 2 + 1].spin) / 2;
      q.setFromUnitVectors(Z, d.divideScalar(len)).multiply(quatZ(spin));
      m.compose(from, q, new THREE.Vector3(1, 1, len));
      shafts.setMatrixAt(a, m);
    }
    for (const im of [tyres, rims, axles, shocks, links, shafts]) im.instanceMatrix.needsUpdate = true;
  }

  const base = mats.lens.emissiveIntensity;
  setPose(restPose());
  void REST_COMPRESS;
  return {
    root,
    setPose,
    setBlink(open) {
      lens.scale.y = pupil.scale.y = Math.max(0.06, open);
    },
    setGlow(glow) {
      mats.lens.emissiveIntensity = base + glow * 0.9;
    },
    dispose() {
      holder.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) mesh.geometry.dispose();
      });
      Object.values(mats).forEach((x) => x.dispose());
    },
  };
}
