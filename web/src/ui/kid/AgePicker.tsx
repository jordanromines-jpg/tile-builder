/* The age picker (D19): three big pictures, 3–5, 6–8 and 9–10, drawn as stacks of one, two and three tiles. The
   choice is remembered on the iPad and only sets which shelf comes first. */
import { S } from "../../strings";
import { TilePicture } from "../TileChip";
import { AGES, type Age } from "./AgeContext";
import { say } from "../../speech/say";

const COLOURS = ["yellow", "green", "blue"] as const;

function Stack({ n }: { n: number }) {
  return (
    <span className="flex flex-col-reverse items-center" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="-mt-1">
          <TilePicture shape="square" colour={COLOURS[i]} px={30} />
        </span>
      ))}
    </span>
  );
}

export function AgePicker({ value, onChange }: { value: Age | null; onChange: (a: Age) => void }) {
  return (
    <div role="group" aria-label={S.kid.pickAge} className="flex flex-wrap gap-3">
      {AGES.map((a, i) => (
        <button
          key={a}
          type="button"
          aria-pressed={value === a}
          aria-label={S.kid.ages[a]}
          onClick={() => {
            say(S.kid.ages[a]);
            onChange(a);
          }}
          className="kid flex min-h-[88px] min-w-[120px] items-end justify-center gap-3 rounded-lg border-2 border-line bg-surface-2 px-4 py-2 font-display font-semibold text-ink-1 transition-transform duration-100 active:scale-95 aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:ring-4 aria-pressed:ring-focus"
          style={{ fontSize: "var(--fs-kid-label-b)" }}
        >
          <Stack n={i + 1} />
          <span aria-hidden="true">{S.kid.agesShort[a]}</span>
        </button>
      ))}
    </div>
  );
}
