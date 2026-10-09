/* Pip, the tile friend (3.1, gate G1: Jordan approved the sheet and the name; 3.9: more poses, and he helps). In build
   mode Guide.tsx moves him; on the finish screen Pip cheers, big. A little movement when the pose changes, and (3.9,
   Jordan: "animate this guy") always a little alive: a blink, a breath, an ear and the tail now and then. All DOM, so
   the 3D view never draws for him; none with motion reduced. Decoration only (aria-hidden): the screens say
   everything in words. Looks style it through `ts-pip`. */
import { useEffect, useState } from "react";
import { useStill } from "../ui/motion";
import { Friend, type FriendPose } from "./Friend";

/** the poses that start with a little bob */
const BOBS: FriendPose[] = ["point", "hold", "clap", "wave"];

export interface PipProps {
  pose: FriendPose;
  size: number;
  flip?: boolean;
  /** blinking and breathing (off on the rest screen) */
  alive?: boolean;
  gaze?: -1 | 0 | 1;
  className?: string;
}

export function Pip({ pose, size, flip = false, alive = true, gaze = 0, className = "" }: PipProps) {
  const still = useStill();
  // a new key each time the pose changes restarts its little movement
  const [n, setN] = useState(0);
  useEffect(() => setN((k) => k + 1), [pose]);
  const move = still ? "" : pose === "cheer" ? "pip-hop" : BOBS.includes(pose) ? "pip-bob" : "";
  return (
    <span aria-hidden="true" className={`ts-pip pointer-events-none inline-block ${className}`} style={{ width: size, height: size, transform: flip ? "scaleX(-1)" : undefined }}>
      <span key={n} className={`block h-full w-full ${move}`}>
        <Friend pose={pose} size={size} gaze={flip ? ((-gaze) as -1 | 0 | 1) : gaze} className={alive && !still ? "friend-alive" : undefined} />
      </span>
    </span>
  );
}
