/* The end's celebration, the part you tap (sprint 2, change 9; 4.2c): a clear layer over the finished model. A tap
   anywhere skips the celebration; it ends by itself after CONFETTI_MS, counted from the first frame on screen, not from
   mounting (a slow first draw must not eat the shower). The tiles themselves fall in 3D (three/FallingTiles.tsx). */
import { useEffect, useRef } from "react";
import { CONFETTI_MS } from "../../three/fallSim";
import { S } from "../../strings";

/** `onDone`: the celebration ran its course; `onSkip`: a tap ended it early. `still`: motion is reduced, nothing falls, and the celebration is short. */
export function TapToSkip({ onDone, onSkip, still }: { onDone: () => void; onSkip: () => void; still: boolean }) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const raf = requestAnimationFrame(() => {
      t = setTimeout(() => done.current(), still ? 1200 : CONFETTI_MS);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (t) clearTimeout(t);
    };
  }, [still]);
  return <button type="button" aria-label={S.done.party} onClick={onSkip} className="kid absolute inset-0" />;
}
