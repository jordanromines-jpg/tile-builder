/* A truck run on the finish's stage (4.0c): the Pip truck driven by the recording, and the run's tiles posed from it
   (the Model draws them, through `tileDrive`). The run plays from `startedAt` (slower around its jumps and crashes,
   playback.ts); with motion reduced it
   shows its last moment at once. The stage draws every frame while the run plays, then rests. */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Engine, truckSound } from "../../sound/truck";
import type { TileDrive } from "../Model";
import { Truck } from "../truck/Truck";
import type { Player } from "./playback";

/** How a run moves the view (the camera rig applies it on top of its own view): slid by `shift`, brought `zoom` closer. */
export interface Follow {
  shift: THREE.Vector3;
  zoom: number;
}

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
const FOLLOW = 0.85;
const CLOSER = 0.75;
const BIG = 6;
/** how quickly the view catches up (per second), and seconds to go back to where it began after the run */
const CATCH = 4;
const BACK_S = 1.2;

export function RunStage({ play, paint, size, follow, aim, offset }: { play: RunPlay; paint: number; size: number; follow: Follow; aim: THREE.Vector3; offset: THREE.Vector3 }) {
  const invalidate = useThree((s) => s.invalidate);
  const ended = useRef(false);
  // the view follows the truck gently while it runs, and goes back to where it began after (through the rig)
  const endedAt = useRef(0);
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
    endedAt.current = 0;
    return () => {
      follow.shift.set(0, 0, 0);
      follow.zoom = 1;
    };
  }, [play, follow]);
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
    let easing = false;
    if (!play.still) {
      const now = performance.now();
      if (done && !endedAt.current) endedAt.current = now;
      const back = endedAt.current ? Math.min(1, (now - endedAt.current) / 1000 / BACK_S) : 0;
      // the truck in the turntable's frame (the stage is offset by the course's middle; a finish doesn't turn it)
      const at = play.player.truck(t).pos;
      const want = new THREE.Vector3(at[0] - offset.x - aim.x, 0, at[2] - offset.z - aim.z).multiplyScalar(FOLLOW * (1 - back));
      const wantZoom = 1 - (size > BIG ? 1 - CLOSER : 0) * (1 - back);
      // (a held moment, for the contact sheets, shows the view settled there)
      const k = endedAt.current || window.__runSeek !== undefined ? 1 : 1 - Math.exp(-CATCH / 60);
      follow.shift.lerp(want, k);
      follow.zoom += (wantZoom - follow.zoom) * k;
      easing = back < 1;
    }
    if (!done || easing || window.__runSeek !== undefined) invalidate();
  });
  return <Truck drive={drive} paint={paint} alive={!play.still} />;
}
