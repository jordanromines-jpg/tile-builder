/* Drive the Pip truck on what you built (5.0d, M4): the truck drops onto the table in front of the build, facing it;
   Go pushes it along (the child's hand, as in the truck runs), Left and Right turn it, Stop lets it roll to a stop.
   It climbs what it can, and what it hits comes apart as the magnets let go. Put it back sets every tile back as it
   was built; leaving the drive does too. The engine hums with the truck's speed, and each magnet that lets go crunches. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { V3 } from "../../engine/geometry";
import type { Placed } from "../../engine/types";
import { Engine, truckSound } from "../../sound/truck";
import { S } from "../../strings";
import { ArrowArcLeft, ArrowArcRight, ArrowUUpLeft, Pause, Play, X } from "../../ui/icons";
import { KidButton } from "../../ui/kid/KidButton";
import type { Physics } from "./physics";

/** how long a tap on Left or Right turns the truck, ms */
const TURN_MS = 450;

/** Where the truck starts: on the table a square and a half in front of the build (the child's side, +z), facing it. */
export function startOf(polys: V3[][]): { at: V3; heading: [number, number] } {
  const all = polys.flat();
  if (!all.length) return { at: [0, 0, 2], heading: [0, -1] };
  const xs = all.map((v) => v[0]);
  const zs = all.map((v) => v[2]);
  return { at: [(Math.min(...xs) + Math.max(...xs)) / 2, 0, Math.max(...zs) + 1.5], heading: [0, -1] };
}

export function DriveBar({ physics, placed, polys, onBack, onDone }: { physics: Physics; placed: Placed[]; polys: V3[][]; onBack: (ids: number[]) => void; onDone: () => void }) {
  const [go, setGo] = useState(false);
  const [steer, setSteer] = useState(0);
  const start = useRef(startOf(polys));
  const turnOff = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    physics.drive(go ? 1 : 0, steer);
  }, [physics, go, steer]);

  // the truck on, its engine and crunches; off again (and the build put back) when the drive ends
  useEffect(() => {
    const s = start.current;
    physics.truckOn(s.at, s.heading);
    const engine = new Engine();
    engine.start();
    let last: Float32Array | null = null;
    let lastT = performance.now();
    physics.onBroke = () => truckSound.crunch();
    const was = physics.onPoses;
    physics.onPoses = () => {
      was?.();
      const p = physics.truck;
      const now = performance.now();
      if (p && last) engine.speed((Math.hypot(p[0] - last[0], p[2] - last[2]) / Math.max(1e-3, (now - lastT) / 1000)) * 5);
      last = p ? p.slice(0, 3) : null;
      lastT = now;
    };
    return () => {
      engine.stop();
      physics.onBroke = null;
      physics.onPoses = was;
      physics.truckOff();
    };
  }, [physics]);

  const putBack = useCallback(() => {
    setGo(false);
    setSteer(0);
    void physics.reset(placed).then((ids) => {
      onBack(ids);
      physics.truckOn(start.current.at, start.current.heading);
    });
  }, [physics, placed, onBack]);

  const turn = (k: number) => {
    setSteer(k);
    if (turnOff.current) clearTimeout(turnOff.current);
    turnOff.current = setTimeout(() => setSteer(0), TURN_MS);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <KidButton label={go ? S.make.stop : S.make.go} tone="accent" icon={go ? <Pause size={32} weight="bold" /> : <Play size={32} weight="bold" />} onPress={() => setGo((g) => !g)} />
      <KidButton label={S.make.left} icon={<ArrowArcLeft size={32} weight="bold" />} onPress={() => turn(1)} />
      <KidButton label={S.make.right} icon={<ArrowArcRight size={32} weight="bold" />} onPress={() => turn(-1)} />
      <KidButton label={S.make.putBack} icon={<ArrowUUpLeft size={32} weight="bold" />} onPress={putBack} />
      <KidButton
        label={S.make.stopDriving}
        icon={<X size={32} weight="bold" />}
        onPress={() => {
          setGo(false);
          void physics.reset(placed).then((ids) => {
            onBack(ids);
            onDone();
          });
        }}
      />
    </div>
  );
}
