/* Pip's body (PR 4.0b): the truck's body is the tile friend. His square orange face is the front; his eyes are the
   headlights (yellow lenses, purple pupils); his smile is the grille; his yellow triangle ears stand up from the roof;
   his purple triangle tail is the fin at the back; his green arms are the mirrors; his purple feet are the bumper. Every
   panel is a magnet-tile panel (a coloured frame round a clear face, three/tile.ts), so it reads as made of tiles.

   Returns geometries ready to merge by material: the opaque frames, the clear faces, and the two things that blink. */
import * as THREE from "three";
import type { Pt } from "../../engine/catalog";
import { FLAT, FRONT, LEFT, RIGHT, ball, merge, paint, panel, put, quatX, rod, type Palette, type Plane } from "./geo";

/** the z of the face's middle plane; a tile panel is 0.05 thick here */
const FACE_Z = 0.445;
/** the underside of the face and the tub: the body rides on a tube frame above the tyres (chassis.ts TUB_Y) */
const DECK = 0.5;
const FACE_H = 0.48;
const ROOF_Y = DECK + FACE_H - 0.025;
const SIDE_X = 0.285;
const SIDE_Y = DECK + 0.05;
const CAB_FRONT = 0.42;
const CAB_BACK = 0.025;
const BED_BACK = -0.45;
const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

/** a panel facing backward (toward -z), with its own x running to the truck's right */
const BACK = (z: number): Plane => ({ o: [0, 0, z], u: [-1, 0, 0], v: [0, 1, 0] });

export interface BodyParts {
  frame: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
  /** the headlight lenses and pupils, centred on the eyes' height so scaling y blinks them */
  lens: THREE.BufferGeometry;
  pupil: THREE.BufferGeometry;
  eyeY: number;
}

const FACE_TOP = DECK + FACE_H;
export const EYE = { y: FACE_TOP - 0.155, x: 0.12, r: 0.072 };
const CHEEK_Y = FACE_TOP - 0.27;

export function buildBody(pal: Palette): BodyParts {
  const frames: THREE.BufferGeometry[] = [];
  const glass: THREE.BufferGeometry[] = [];
  const add = (p: { frame: THREE.BufferGeometry; glass: THREE.BufferGeometry[] }) => {
    frames.push(p.frame);
    glass.push(...p.glass);
  };
  const o = pal.orange;
  const win = { pane: pal.tint, paneAlpha: 0.42, glassAlpha: 0.72 };

  // the face: Pip's square, the front of the truck (nearly solid, so he reads), and his ears on its top edge
  add(panel(rect(-0.31, DECK, 0.31, FACE_TOP), FRONT(FACE_Z), o, o, { glassAlpha: 1 }));
  add(panel([[0.31, FACE_TOP - 0.005], [0.14, FACE_TOP - 0.005], [0.31, FACE_TOP + 0.18]], FRONT(FACE_Z), pal.yellow, pal.yellow));
  add(panel([[-0.14, FACE_TOP - 0.005], [-0.31, FACE_TOP - 0.005], [-0.31, FACE_TOP + 0.18]], FRONT(FACE_Z), pal.yellow, pal.yellow));
  // the roof, and the cab's sides and back, with windows tinted blue
  add(panel(rect(-0.31, 0, 0.31, CAB_FRONT - CAB_BACK), { ...FLAT(ROOF_Y), o: [0, ROOF_Y, CAB_FRONT] }, o, o, { glassAlpha: 0.9 }));
  const sideH = ROOF_Y - 0.025 - SIDE_Y;
  for (const plane of [LEFT(SIDE_X, CAB_FRONT, SIDE_Y), RIGHT(-SIDE_X, CAB_BACK, SIDE_Y)]) {
    add(panel(rect(0, 0, CAB_FRONT - CAB_BACK, sideH), plane, o, o, { hole: rect(0.07, 0.065, 0.325, sideH - 0.065), ...win }));
  }
  add(panel(rect(-0.26, SIDE_Y, 0.26, SIDE_Y + sideH), BACK(0), o, o, { hole: rect(-0.185, SIDE_Y + 0.065, 0.185, SIDE_Y + sideH - 0.065), ...win }));
  // the bed behind the cab: low sides and a tailgate, open to show the shocks
  add(panel(rect(0, 0, -CAB_BACK - BED_BACK, 0.2), LEFT(SIDE_X, -CAB_BACK, SIDE_Y), o, o));
  add(panel(rect(0, 0, -CAB_BACK - BED_BACK, 0.2), RIGHT(-SIDE_X, BED_BACK, SIDE_Y), o, o));
  add(panel(rect(-0.26, DECK, 0.26, DECK + 0.21), BACK(BED_BACK + 0.025), o, o));
  // Pip's tail: a purple triangle fin standing at the back
  add(panel([[0, 0], [0.26, 0], [0.26, 0.4]], { o: [0, DECK, -0.19], u: [0, 0, -1], v: [0, 1, 0] }, pal.purple, pal.purple));
  // his feet: two purple squares for a bumper
  for (const x of [-0.17, 0.17]) add(panel(rect(x - 0.1, 0, x + 0.1, 0.2), { ...FLAT(0.375), o: [0, 0.375, 0.5] }, pal.purple, pal.purple));
  // his arms: green squares on stalks, the mirrors
  for (const s of [1, -1]) {
    add(panel(rect(s * 0.405 - 0.05, FACE_TOP - 0.2, s * 0.405 + 0.05, FACE_TOP - 0.11), FRONT(0.36), pal.green, pal.green, { s: 0.32 }));
    frames.push(paint(rod([s * 0.31, FACE_TOP - 0.155, 0.36], [s * 0.36, FACE_TOP - 0.155, 0.36], 0.012, 5), pal.green));
  }

  // his eyes, cheeks and smile on the face
  const lens: THREE.BufferGeometry[] = [];
  const pupil: THREE.BufferGeometry[] = [];
  const dome = new THREE.LatheGeometry([new THREE.Vector2(0, 0.034), new THREE.Vector2(0.034, 0.031), new THREE.Vector2(0.062, 0.018), new THREE.Vector2(EYE.r, 0)], 14);
  // the lenses are built about the eye's own height (y = 0), so a mesh placed at the eye height can scale y to blink
  const eyeAt = (g: THREE.BufferGeometry, x: number, lift: number) => put(g.clone(), [x, 0, FACE_Z + 0.025 + lift], quatX(Math.PI / 2));
  for (const s of [-1, 1]) {
    lens.push(paint(eyeAt(dome, s * EYE.x, 0), pal.yellow));
    pupil.push(paint(eyeAt(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 12), s * EYE.x, 0.038), pal.purple));
    // a blue bezel round each lens
    const ring = new THREE.TorusGeometry(EYE.r + 0.004, 0.011, 5, 16);
    frames.push(paint(put(ring, [s * EYE.x, EYE.y, FACE_Z + 0.027]), pal.blue));
    // a red cheek
    frames.push(paint(put(new THREE.CylinderGeometry(0.048, 0.05, 0.014, 14), [s * 0.215, CHEEK_Y, FACE_Z + 0.03], quatX(Math.PI / 2)), pal.red));
  }
  const smile = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.115, CHEEK_Y - 0.005, FACE_Z + 0.032), new THREE.Vector3(0, CHEEK_Y - 0.13, FACE_Z + 0.032), new THREE.Vector3(0.115, CHEEK_Y - 0.005, FACE_Z + 0.032)), 12, 0.017, 5);
  frames.push(paint(smile, pal.tyre));
  for (const s of [-1, 1]) frames.push(paint(ball([s * 0.115, CHEEK_Y - 0.005, FACE_Z + 0.032], 0.021, 6, 4), pal.tyre));

  return { frame: merge(frames), glass: merge(glass), lens: merge(lens), pupil: merge(pupil), eyeY: EYE.y };
}
