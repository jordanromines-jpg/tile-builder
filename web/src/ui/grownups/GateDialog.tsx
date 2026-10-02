/* The grown-ups gate (plan key 2r, D21). First "Hold to open": a 3-second press with a ring that fills; letting go early
   starts again. Then a sum in words with a number pad. A right answer opens the door; three wrong answers close it. */
import { useEffect, useRef, useState } from "react";
import { HOLD_MS, makeSum, TRIES, type Sum } from "./gate";
import { Button } from "./Button";
import { Lock } from "../icons";

export function GateDialog({ onOpen, onLeave, rand }: { onOpen: () => void; onLeave: () => void; rand?: () => number }) {
  const [stage, setStage] = useState<"hold" | "sum">("hold");
  const [progress, setProgress] = useState(0);
  const [sum] = useState<Sum>(() => makeSum(rand));
  const [typed, setTyped] = useState("");
  const [left, setLeft] = useState(TRIES);
  const [wrong, setWrong] = useState(false);
  const started = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const done = useRef<ReturnType<typeof setTimeout> | null>(null);

  const release = () => {
    started.current = null;
    if (frame.current) cancelAnimationFrame(frame.current);
    if (done.current) clearTimeout(done.current);
    setProgress(0);
  };
  const begin = () => {
    if (started.current !== null) return;
    started.current = performance.now();
    const tick = () => {
      if (started.current === null) return;
      setProgress(Math.min(1, (performance.now() - started.current) / HOLD_MS));
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    done.current = setTimeout(() => {
      started.current = null;
      if (frame.current) cancelAnimationFrame(frame.current);
      setStage("sum");
    }, HOLD_MS);
  };
  useEffect(() => release, []);

  const check = () => {
    if (Number(typed) === sum.answer) {
      onOpen();
      return;
    }
    const n = left - 1;
    setLeft(n);
    setTyped("");
    setWrong(true);
    if (n <= 0) onLeave();
  };

  const C = 2 * Math.PI * 44;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="gate-title" className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-lg border border-line bg-surface-2 p-6 text-center">
      <h1 id="gate-title" className="font-display text-[length:var(--fs-parent-title)] font-semibold">
        For grown-ups
      </h1>
      {stage === "hold" ? (
        <>
          <p className="text-ink-2">Press and hold the lock for three seconds.</p>
          <button
            type="button"
            aria-label="Hold to open"
            onPointerDown={(e) => {
              e.preventDefault();
              begin();
            }}
            onPointerUp={release}
            onPointerLeave={release}
            onPointerCancel={release}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                begin();
              }
            }}
            onKeyUp={release}
            onContextMenu={(e) => e.preventDefault()}
            className="relative grid h-32 w-32 touch-none select-none place-items-center rounded-full"
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
              <circle cx={50} cy={50} r={44} fill="none" stroke="var(--line)" strokeWidth={8} />
              <circle cx={50} cy={50} r={44} fill="none" stroke="var(--accent)" strokeWidth={8} strokeDasharray={C} strokeDashoffset={C * (1 - progress)} strokeLinecap="round" />
            </svg>
            <Lock size={44} weight="bold" aria-hidden="true" />
          </button>
          <span className="sr-only" aria-live="polite">
            {progress > 0 ? "Keep holding" : ""}
          </span>
        </>
      ) : (
        <>
          <p className="font-display text-[22px] font-semibold" id="gate-sum">
            What is {sum.words}
          </p>
          <output aria-live="polite" aria-labelledby="gate-sum" className="min-h-14 w-40 rounded-md border-2 border-line bg-surface text-center font-display text-[32px] font-semibold tabular-nums">
            {typed}
          </output>
          {wrong && (
            <p role="alert" className="font-bold text-wait-ink">
              Not quite. {left} {left === 1 ? "try" : "tries"} left.
            </p>
          )}
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Number pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <Button key={d} className="h-14 w-16 text-[22px]" onClick={() => setTyped((t) => (t + d).slice(0, 3))}>
                {d}
              </Button>
            ))}
            <Button className="h-14 w-16" aria-label="Delete" onClick={() => setTyped((t) => t.slice(0, -1))}>
              ⌫
            </Button>
            <Button className="h-14 w-16 text-[22px]" onClick={() => setTyped((t) => (t + "0").slice(0, 3))}>
              0
            </Button>
            <Button kind="lit" className="h-14 w-16" disabled={!typed} onClick={check}>
              OK
            </Button>
          </div>
        </>
      )}
      <Button kind="quiet" onClick={onLeave}>
        Back to the shelf
      </Button>
    </div>
  );
}
