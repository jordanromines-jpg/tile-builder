/* Watch it build (4.1): the hook behind it. The watch has its own place (D2) and moves on by a timer at the chosen
   speed; it never saves the child's step (Build.tsx does that, only on Build from here). The speed is remembered on
   this iPad in the settings store. */
import { useCallback, useEffect, useRef, useState } from "react";
import { saveSettings } from "../../store/db";
import { useSettings } from "../../store/hooks";
import { WATCH_SECONDS, type WatchSpeed } from "./speeds";

export interface WatchApi {
  /** the watch bar is up */
  open: boolean;
  playing: boolean;
  /** the step being watched */
  at: number;
  speed: WatchSpeed;
  start: (from: number) => void;
  close: () => void;
  play: () => void;
  pause: () => void;
  setSpeed: (s: WatchSpeed) => void;
}

/** `onStep(n)` runs as the watch moves on to step n; `onEnd` when the last step has had its time. */
export function useWatch(onStep: (n: number) => void, onEnd: () => void, last: number): WatchApi {
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(0);
  // the speed shows at once; the store catches up (and gives it back after a reload)
  const [picked, setPicked] = useState<WatchSpeed | null>(null);
  const speed = picked ?? settings?.watchSpeed ?? "medium";
  const step = useRef(onStep);
  step.current = onStep;
  const end = useRef(onEnd);
  end.current = onEnd;

  // not before the stored speed has been read, or a Fast iPad would begin at Medium
  const ready = settings !== undefined;
  useEffect(() => {
    if (!open || !playing || !ready) return;
    const t = setTimeout(() => {
      if (at >= last) {
        end.current();
        return;
      }
      setAt(at + 1);
      step.current(at + 1);
    }, WATCH_SECONDS[speed] * 1000);
    return () => clearTimeout(t);
  }, [open, playing, ready, at, speed, last]);

  const start = useCallback((from: number) => {
    setAt(from);
    setOpen(true);
    setPlaying(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    setPlaying(false);
  }, []);
  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);
  const setSpeed = useCallback((s: WatchSpeed) => {
    setPicked(s);
    void saveSettings({ watchSpeed: s });
  }, []);

  return { open, playing, at, speed, start, close, play, pause, setSpeed };
}
