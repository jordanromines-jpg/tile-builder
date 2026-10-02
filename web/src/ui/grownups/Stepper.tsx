/* The stepper (plan key 2q): − count +, 44 px buttons; a long press repeats; the arrow keys step; a screen reader
   hears it as a spin button with its value. */
import { useEffect, useRef } from "react";
import { Minus, Plus } from "../icons";

export const REPEAT_AFTER = 400;
export const REPEAT_EVERY = 80;

export function Stepper({ label, value, onChange, min = 0, max = 999 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const latest = useRef(value);
  latest.current = value;
  const timers = useRef<{ wait?: ReturnType<typeof setTimeout>; rep?: ReturnType<typeof setInterval> }>({});
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const bump = (d: number) => {
    const next = clamp(latest.current + d);
    if (next !== latest.current) {
      latest.current = next;
      onChange(next);
    }
  };
  const stop = () => {
    clearTimeout(timers.current.wait);
    clearInterval(timers.current.rep);
    timers.current = {};
  };
  useEffect(() => stop, []);
  const press = (d: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      bump(d);
      stop();
      timers.current.wait = setTimeout(() => {
        timers.current.rep = setInterval(() => bump(d), REPEAT_EVERY);
      }, REPEAT_AFTER);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    // the keyboard (Enter, Space) sends a click with no pointer
    onClick: (e: React.MouseEvent) => {
      if (e.detail === 0) bump(d);
    },
  });
  const btn = "grid h-11 w-11 place-items-center rounded-full border-2 border-line bg-surface-2 text-ink-1 disabled:opacity-40 touch-manipulation";
  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label={label}>
      <button type="button" aria-label={`Fewer ${label}`} className={btn} disabled={value <= min} {...press(-1)}>
        <Minus size={20} weight="bold" aria-hidden="true" />
      </button>
      <span
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            bump(1);
          } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            bump(-1);
          }
        }}
        className="min-w-[3ch] text-center font-display text-[22px] font-semibold tabular-nums"
      >
        {value}
      </span>
      <button type="button" aria-label={`More ${label}`} className={btn} disabled={value >= max} {...press(1)}>
        <Plus size={20} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
}
