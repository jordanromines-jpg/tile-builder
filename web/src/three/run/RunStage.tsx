/* A truck run on the finish's stage (4.0c): the Pip truck driven by the recording, and the run's tiles posed from it
   (the Model draws them, through `tileDrive`). The run plays from `startedAt` (slower around its jumps and crashes,
   playback.ts); with motion reduced it
   shows its last moment at once. The stage draws every frame while the run plays, then rests. */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Engine, truckSound } from "../../sound/truck";
import type { TileDrive } from "../Model";
import { Truck } from "../truck/Truck";
import type { Player } from "./playback";

export interface RunPlay {
  player: Player;
  /** performance.now() when it began; a new value plays it again */
  startedAt: number;
  /** show the end at once (motion reduced) */
  still?: boolean;
  onEnd?: () => void;
}

declare global {
  interface Window {
    __run?: { t: number; done: boolean; length: number };
    /** for the contact sheets of runs (scripts/run-sheet.mjs): hold the run at this moment, in seconds */
    __runSeek?: number;
  }
}

/** Seconds into the run (at real speed) for the play's clock. */
export function runTime(play: RunPlay, now = performance.now()): number {
  if (typeof window !== "undefined" && window.__runSeek !== undefined) return Math.min(play.player.length, window.__runSeek);
  if (play.still) return play.player.length;
  return play.player.at((now - play.startedAt) / 1000);
}

/** What the Model needs to pose the run's tiles. */
export function tileDrive(play: RunPlay): TileDrive {
  return {
    tiles: play.player.moving,
    pose: (i) => {
      const at = play.player.tile(i, runTime(play));
      const c = play.player.start(i);
      return at && c ? { p: at.p, q: at.q, c } : null;
    },
  };
}

/** how far the view slides toward the truck, and how much closer it comes on a course bigger than BIG squares */
const FOLLOW = 0.6;
const CLOSER = 0.6;
const BIG = 6;
/** how quickly the view catches up (per second), and seconds to go back to where it began after the run */
const CATCH = 2.5;
const BACK_S = 1.2;

export function RunStage({ play, paint, size }: { play: RunPlay; paint: number; size: number }) {
  const invalidate = useThree((s) => s.invalidate);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const holder = useRef<THREE.Group>(null);
  // the view follows the truck gently while it runs, and goes back to where it began
  const view = useRef<{ pos: THREE.Vector3; aim: THREE.Vector3; shift: THREE.Vector3; zoom: number; endedAt: number } | null>(null);
  const ended = useRef(false);
  const end = useRef(play.onEnd);
  end.current = play.onEnd;
  useEffect(() => {
    ended.current = false;
    window.__run = { t: 0, done: false, length: play.player.length };
    invalidate();
  }, [play, invalidate]);
  const drive = useMemo(() => () => play.player.truck(runTime(play)), [play]);
  // the sounds: the engine while the truck goes, and each moment as the run passes it
  const engine = useMemo(() => new Engine(), []);
  const heard = useRef({ t: 0, at: [0, 0, 0] as readonly number[] });
  useEffect(() => {
    if (play.still || window.__runSeek !== undefined) return;
    view.current = { pos: camera.position.clone(), aim: controls?.target.clone() ?? new THREE.Vector3(), shift: new THREE.Vector3(), zoom: 1, endedAt: 0 };
    return () => {
      const v = view.current;
      if (v) camera.position.copy(v.pos);
      if (v && controls) controls.target.copy(v.aim);
      view.current = null;
    };
  }, [play, camera, controls]);
  useEffect(() => {
    heard.current = { t: 0, at: play.player.truck(0).pos };
    if (!play.still) engine.start();
    return () => engine.stop();
  }, [play, engine]);
  useFrame(() => {
    const t = runTime(play);
    const done = t >= play.player.length;
    window.__run = { t, done, length: play.player.length };
    if (!play.still) {
      const was = heard.current;
      const at = play.player.truck(t).pos;
      if (t > was.t) engine.speed(Math.hypot(at[0] - was.at[0], at[2] - was.at[2]) / (t - was.t));
      for (const e of play.player.events) {
        if (e.t <= was.t || e.t > t) continue;
        if (e.kind === "launch") truckSound.whoosh();
        else if (e.kind === "land") truckSound.thud(e.hit ?? 0.5);
        else if (e.kind === "break") truckSound.crunch();
      }
      heard.current = { t, at };
    }
    if (done && !ended.current) {
      ended.current = true;
      engine.stop();
      end.current?.();
    }
    const v = view.current;
    let easing = false;
    if (v && holder.current?.children[0]) {
      const now = performance.now();
      if (done && !v.endedAt) v.endedAt = now;
      const back = v.endedAt ? Math.min(1, (now - v.endedAt) / 1000 / BACK_S) : 0;
      const truck = holder.current.children[0].getWorldPosition(new THREE.Vector3());
      const want = truck.sub(v.aim).multiplyScalar(FOLLOW * (1 - back));
      want.y = 0;
      const wantZoom = 1 - (size > BIG ? 1 - CLOSER : 0) * (1 - back);
      const k = v.endedAt ? 1 : 1 - Math.exp(-CATCH / 60);
      v.shift.lerp(want, k);
      v.zoom += (wantZoom - v.zoom) * k;
      const aim = v.aim.clone().add(v.shift);
      camera.position.copy(v.pos.clone().sub(v.aim).multiplyScalar(v.zoom).add(aim));
      if (controls) {
        controls.target.copy(aim);
        controls.update();
      } else camera.lookAt(aim);
      easing = back < 1;
    }
    if (!done || easing || window.__runSeek !== undefined) invalidate();
  });
  return (
    <group ref={holder}>
      <Truck drive={drive} paint={paint} alive={!play.still} />
    </group>
  );
}
