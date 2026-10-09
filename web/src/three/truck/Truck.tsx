/* The Pip truck in a react-three-fiber scene (PR 4.0b). `pose` places it (spec.ts TruckPose); Pip's eyes blink now and
   then, as his idle life does (app.css friend-blink), unless motion is reduced. In a canvas that draws on demand the
   caller keeps frames coming while the truck should be alive. */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { useTier } from "../quality";
import { palette } from "./geo";
import { buildTruck } from "./rig";
import { restPose, type TruckPose } from "./spec";

/** the same cycle as Pip's blink in the app: shut for a moment about every four and a half seconds */
const CYCLE = 4.6;

export function blinkOpen(t: number): number {
  const k = (t % CYCLE) / CYCLE;
  if (k < 0.95 || k > 0.99) return 1;
  return 1 - Math.sin(((k - 0.95) / 0.04) * Math.PI);
}

export interface TruckProps {
  pose?: TruckPose;
  /** a theme change bumps this so the colours are read again */
  paint?: number;
  /** blink and glow; off under reduced motion */
  alive?: boolean;
  /** asked for a pose every frame (seconds since the scene began); a pose placed with it wins over `pose` */
  drive?: (t: number) => TruckPose | null;
}

export function Truck({ pose, paint = 0, alive = true, drive }: TruckProps) {
  const tier = useTier();
  const invalidate = useThree((s) => s.invalidate);
  // paint is a dependency on purpose: a theme change reads the colours again
  const rig = useMemo(() => buildTruck(palette()), [paint]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => rig.dispose(), [rig]);
  useEffect(() => {
    rig.setPose(pose ?? restPose());
    invalidate();
  }, [rig, pose, invalidate]);
  useEffect(() => {
    rig.setGlow(tier === "high" ? 1 : tier === "mid" ? 0.5 : 0);
    invalidate();
  }, [rig, tier, invalidate]);
  useFrame(({ clock }) => {
    const driven = drive?.(clock.elapsedTime);
    if (driven) rig.setPose(driven);
    if (alive) rig.setBlink(blinkOpen(clock.elapsedTime));
  });
  return <primitive object={rig.root} />;
}
