/* Step dots (plan key 2o): one dot a step, countable, never a progress bar. Done steps are filled, this one is big and
   ringed. For 9–10, a tap on a dot jumps there (key 7e). */
import { S } from "../../strings";

export function StepDots({ count, current, onJump }: { count: number; current: number; onJump?: (i: number) => void }) {
  const dense = count > 24;
  return (
    <ol className="flex flex-wrap items-center gap-1.5" aria-label={S.kid.step(current + 1, count)}>
      {Array.from({ length: count }, (_, i) => {
        const done = i < current;
        const now = i === current;
        const dot = (
          <span
            className={`block rounded-full ${now ? "h-5 w-5 bg-accent ring-4 ring-accent-soft" : done ? "bg-ink-2" : "border-2 border-ink-3"} ${now ? "" : dense ? "h-2.5 w-2.5" : "h-3.5 w-3.5"}`}
          />
        );
        return (
          <li key={i} aria-current={now ? "step" : undefined}>
            {onJump ? (
              <button type="button" aria-label={S.kid.step(i + 1, count)} onClick={() => onJump(i)} className="grid min-h-8 min-w-8 place-items-center">
                {dot}
              </button>
            ) : (
              dot
            )}
          </li>
        );
      })}
    </ol>
  );
}
