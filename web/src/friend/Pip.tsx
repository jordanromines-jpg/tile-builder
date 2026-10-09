/* Pip, the tile friend (3.1, gate G1: Jordan approved the sheet and the name). Pip sits on the edge of the step panel in
   build mode and points at this step's tiles when a step begins, then rests; on the finish screen Pip cheers, big.
   A few gentle movements when the pose changes, never a loop that runs on (it would keep the iPad drawing); none with
   reduced motion. Decoration only (aria-hidden): the screens say everything in words. Looks style it through `ts-pip`. */
import { useEffect, useState } from "react";
import { useStill } from "../ui/motion";
import { Friend, type FriendPose } from "./Friend";

export function Pip({ pose, size, flip = false, className = "" }: { pose: FriendPose; size: number; flip?: boolean; className?: string }) {
  const still = useStill();
  // a new key each time the pose changes restarts its little movement
  const [n, setN] = useState(0);
  useEffect(() => setN((k) => k + 1), [pose]);
  const move = still ? "" : pose === "cheer" ? "pip-hop" : "pip-bob";
  return (
    <span aria-hidden="true" className={`ts-pip pointer-events-none inline-block ${className}`} style={{ width: size, height: size, transform: flip ? "scaleX(-1)" : undefined }}>
      <span key={n} className={`block h-full w-full ${move}`}>
        <Friend pose={pose} size={size} />
      </span>
    </span>
  );
}

/** Build mode's pose: pointing at the tiles for a moment when a step begins, then idle. */
export function useStepPose(step: number): FriendPose {
  const [pose, setPose] = useState<FriendPose>("point");
  useEffect(() => {
    setPose("point");
    const t = setTimeout(() => setPose("idle"), 2600);
    return () => clearTimeout(t);
  }, [step]);
  return pose;
}
